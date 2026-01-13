import { computed, signal } from '@preact/signals-core';
import { abortableEffect } from '../utils.js';
import { Text, textDefaults } from './text.js';
import { setupCaret } from '../caret.js';
import { createSelection } from '../selection.js';
const cancelSet = new Set();
function cancelBlur(event) {
    cancelSet.add(event);
}
export const canvasInputProps = {
    onPointerDown: (e) => {
        if (!(document.activeElement instanceof HTMLElement)) {
            return;
        }
        if (!cancelSet.has(e.nativeEvent)) {
            return;
        }
        cancelSet.delete(e.nativeEvent);
        e.preventDefault();
    },
};
export const inputDefaults = {
    ...textDefaults,
    type: 'text',
    disabled: false,
    tabIndex: 0,
    autocomplete: '',
    whiteSpace: 'pre',
};
export class Input extends Text {
    element;
    selectionRange;
    hasFocus;
    uncontrolledSignal = signal(undefined);
    currentSignal = computed(() => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue ?? '');
    constructor(inputProperties, initialClasses, config) {
        const caretColor = signal(undefined);
        const selectionHandlers = signal(undefined);
        const selectionTransformations = signal([]);
        const caretTransformation = signal(undefined);
        const instancedTextRef = {};
        const selectionRange = signal(undefined);
        const hasFocus = signal(false);
        super(inputProperties, initialClasses, {
            defaults: inputDefaults,
            dynamicHandlers: selectionHandlers,
            selectionRange,
            selectionTransformations,
            caretTransformation,
            instancedTextRef,
            hasFocus,
            isPlaceholder: computed(() => this.currentSignal.value.length === 0),
            ...config,
            defaultOverrides: {
                cursor: 'text',
                ...{
                    text: computed(() => this.currentSignal.value.length === 0
                        ? this.properties.value.placeholder
                        : this.properties.value.type === 'password'
                            ? '*'.repeat(this.currentSignal.value.length ?? 0)
                            : this.currentSignal.value),
                },
                caretColor,
                ...config?.defaultOverrides,
            },
        });
        this.selectionRange = selectionRange;
        this.hasFocus = hasFocus;
        abortableEffect(() => void (caretColor.value = this.properties.value.color), this.abortSignal);
        setupSelectionHandlers(selectionHandlers, this.properties, this.currentSignal, this, instancedTextRef, this.focus.bind(this), this.abortSignal);
        const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value);
        this.element = createHtmlInputElement(selectionRange, (newValue) => {
            if (this.properties.peek().value == null) {
                this.uncontrolledSignal.value = newValue;
            }
            this.properties.peek().onValueChange?.(newValue);
        }, config?.multiline ?? false);
        setupCaret(this.properties, this.globalTextMatrix, caretTransformation, this.isVisible, this.backgroundOrderInfo, this.backgroundGroupDeps, parentClippingRect, this.root, this.abortSignal);
        createSelection(this.properties, this.root, this.globalTextMatrix, selectionTransformations, this.isVisible, this.backgroundOrderInfo, this.backgroundGroupDeps, parentClippingRect, this.abortSignal);
        setupHtmlInputElement(this.properties, this.element, this.currentSignal, this.abortSignal);
        setupUpdateHasFocus(this.element, this.hasFocus, (hasFocus) => {
            this.properties.peek().onFocusChange?.(hasFocus);
        }, this.abortSignal);
    }
    focus(start, end, direction) {
        if (!this.hasFocus.peek()) {
            this.element.focus();
        }
        if (start != null && end != null) {
            this.element.setSelectionRange(start, end, direction);
        }
        this.selectionRange.value = [this.element.selectionStart ?? 0, this.element.selectionEnd ?? 0];
    }
}
const segmenter = typeof Intl === 'undefined' ? undefined : new Intl.Segmenter(undefined, { granularity: 'word' });
export function setupSelectionHandlers(target, properties, text, component, instancedTextRef, focus, abortSignal) {
    abortableEffect(() => {
        if (properties.value.disabled) {
            target.value = undefined;
            return;
        }
        let dragState;
        const onPointerFinish = (e) => {
            if (dragState == null || dragState.pointerId != e.pointerId) {
                return;
            }
            e.stopImmediatePropagation?.();
            dragState = undefined;
        };
        target.value = {
            onPointerDown: (e) => {
                if (dragState != null || e.uv == null || instancedTextRef.current == null) {
                    return;
                }
                cancelBlur(e.nativeEvent);
                e.stopImmediatePropagation?.();
                if ('setPointerCapture' in e.object && typeof e.object.setPointerCapture === 'function') {
                    e.object.setPointerCapture(e.pointerId);
                }
                const startCharIndex = uvToCharIndex(component, e.uv, instancedTextRef.current, 'between');
                dragState = {
                    pointerId: e.pointerId,
                    startCharIndex,
                };
                setTimeout(() => focus(startCharIndex, startCharIndex));
            },
            onDblClick: (e) => {
                if (segmenter == null || e.uv == null || instancedTextRef.current == null) {
                    return;
                }
                e.stopImmediatePropagation?.();
                if (properties.peek().type === 'password') {
                    setTimeout(() => focus(0, text.peek().length, 'none'));
                    return;
                }
                const charIndex = uvToCharIndex(component, e.uv, instancedTextRef.current, 'on');
                const segments = segmenter.segment(text.peek());
                let segmentLengthSum = 0;
                for (const { segment } of segments) {
                    const segmentLength = segment.length;
                    if (charIndex < segmentLengthSum + segmentLength) {
                        setTimeout(() => focus(segmentLengthSum, segmentLengthSum + segmentLength, 'none'));
                        break;
                    }
                    segmentLengthSum += segmentLength;
                }
            },
            onPointerUp: onPointerFinish,
            onPointerLeave: onPointerFinish,
            onPointerCancel: onPointerFinish,
            onPointerMove: (e) => {
                if (dragState == null ||
                    dragState?.pointerId != e.pointerId ||
                    e.uv == null ||
                    instancedTextRef.current == null) {
                    return;
                }
                e.stopImmediatePropagation?.();
                const charIndex = uvToCharIndex(component, e.uv, instancedTextRef.current, 'between');
                const start = Math.min(dragState.startCharIndex, charIndex);
                const end = Math.max(dragState.startCharIndex, charIndex);
                const direction = dragState.startCharIndex < charIndex ? 'forward' : 'backward';
                setTimeout(() => focus(start, end, direction));
            },
        };
    }, abortSignal);
}
export function createHtmlInputElement(selectionRange, onChange, multiline) {
    const element = document.createElement(multiline ? 'textarea' : 'input');
    const style = element.style;
    style.setProperty('position', 'absolute');
    style.setProperty('left', '-1000vw');
    style.setProperty('top', '0');
    style.setProperty('pointerEvents', 'none');
    style.setProperty('opacity', '0');
    element.addEventListener('input', () => {
        onChange?.(element.value);
        updateSelection();
    });
    const updateSelection = () => {
        const { selectionStart, selectionEnd } = element;
        if (selectionStart == null || selectionEnd == null) {
            selectionRange.value = undefined;
            return;
        }
        const current = selectionRange.peek();
        if (current != null && current[0] === selectionStart && current[1] === selectionEnd) {
            return;
        }
        selectionRange.value = [selectionStart, selectionEnd];
    };
    element.addEventListener('keydown', updateSelection);
    element.addEventListener('keyup', updateSelection);
    element.addEventListener('blur', () => (selectionRange.value = undefined));
    return element;
}
function setupHtmlInputElement(properties, element, value, abortSignal) {
    document.body.appendChild(element);
    abortSignal.addEventListener('abort', () => element.remove());
    abortableEffect(() => void (element.value = value.value), abortSignal);
    abortableEffect(() => void (element.disabled = properties.value.disabled), abortSignal);
    abortableEffect(() => void (element.tabIndex = properties.value.tabIndex), abortSignal);
    abortableEffect(() => void (element.autocomplete = properties.value.autocomplete), abortSignal);
    abortableEffect(() => element.setAttribute('type', properties.value.type), abortSignal);
}
function setupUpdateHasFocus(element, hasFocusSignal, onFocusChange, abortSignal) {
    if (abortSignal.aborted) {
        return;
    }
    hasFocusSignal.value = document.activeElement === element;
    const listener = () => {
        const hasFocus = document.activeElement === element;
        if (hasFocus == hasFocusSignal.value) {
            return;
        }
        hasFocusSignal.value = hasFocus;
        onFocusChange(hasFocus);
    };
    element.addEventListener('focus', listener);
    element.addEventListener('blur', listener);
    abortSignal.addEventListener('abort', () => {
        element.removeEventListener('focus', listener);
        element.removeEventListener('blur', listener);
    });
}
function uvToCharIndex({ size: s, borderInset: b, paddingInset: p }, uv, instancedText, position) {
    const size = s.peek();
    const borderInset = b.peek();
    const paddingInset = p.peek();
    if (size == null || borderInset == null || paddingInset == null) {
        return 0;
    }
    const [width, height] = size;
    const [bTop, , , bLeft] = borderInset;
    const [pTop, , , pLeft] = paddingInset;
    const x = uv.x * width - bLeft - pLeft;
    const y = (uv.y - 1) * height + bTop + pTop;
    return instancedText.getCharIndex(x, y, position);
}
