import { computed, signal } from '@preact/signals-core';
import { Box2, Matrix4, Vector2, Vector3 } from 'three';
import { abortableEffect, computedBorderInset } from './utils.js';
import { clamp } from 'three/src/math/MathUtils.js';
import { computedPanelMatrix, setupInstancedPanel } from './panel/instanced-panel.js';
import { ElementType, setupOrderInfo } from './order.js';
import { createPanelMaterialConfig } from './panel/panel-material.js';
const distanceHelper = new Vector3();
const localPointHelper = new Vector3();
export function computedGlobalScrollMatrix(properties, scrollPosition, globalMatrix) {
    return computed(() => {
        const global = globalMatrix.value;
        if (global == null) {
            return undefined;
        }
        const [scrollX, scrollY] = scrollPosition.value;
        const pixelSize = properties.value.pixelSize;
        return new Matrix4().makeTranslation(-scrollX * pixelSize, scrollY * pixelSize, 0).premultiply(global);
    });
}
export function computedAnyAncestorScrollable(parentSignal) {
    return computed(() => {
        const parent = parentSignal.value;
        const [ancestorX, ancestorY] = parent?.anyAncestorScrollable?.value ?? [false, false];
        const [x, y] = parent?.scrollable.value ?? [false, false];
        return [ancestorX || x, ancestorY || y];
    });
}
export function setupScrollHandlers(target, container, abortSignal) {
    const isScrollable = computed(() => container.scrollable.value.some((scrollable) => scrollable) ?? false);
    abortableEffect(() => {
        if (!isScrollable.value) {
            target.value = undefined;
            return;
        }
        const onPointerFinish = (event) => {
            if ('releasePointerCapture' in container && typeof container.releasePointerCapture === 'function') {
                container.releasePointerCapture(event.pointerId);
            }
            if (event.pointerId == null ||
                !container.downPointerMap.delete(event.pointerId) ||
                container.scrollPosition.value == null) {
                return;
            }
            event.stopImmediatePropagation?.();
            if (container.downPointerMap.size > 0) {
                return;
            }
            //only request a render if the last pointer that was dragging stopped dragging and this panel is actually scrollable
            container.root.peek().requestRender?.();
        };
        target.value = {
            onPointerDown: (event) => {
                event.stopImmediatePropagation?.();
                const localPoint = container.worldToLocal(event.point.clone());
                const ponterIsMouse = event.nativeEvent != null &&
                    typeof event.nativeEvent === 'object' &&
                    'pointerType' in event.nativeEvent &&
                    event.nativeEvent.pointerType === 'mouse';
                const scrollbarAxisIndex = ponterIsMouse
                    ? getIntersectedScrollbarIndex(localPoint, container.properties.peek().scrollbarWidth, container.size.peek(), container.maxScrollPosition.peek(), container.borderInset.peek(), container.scrollPosition.peek())
                    : undefined;
                if (event.pointerId == null || (ponterIsMouse && scrollbarAxisIndex == null)) {
                    return;
                }
                if ('setPointerCapture' in event.object && typeof event.object.setPointerCapture === 'function') {
                    event.object.setPointerCapture(event.pointerId);
                }
                container.downPointerMap.set(event.pointerId, scrollbarAxisIndex != null
                    ? {
                        type: 'scroll-bar',
                        localPoint,
                        axisIndex: scrollbarAxisIndex,
                    }
                    : {
                        type: 'scroll-panel',
                        timestamp: performance.now(),
                        localPoint,
                    });
            },
            onPointerUp: onPointerFinish,
            onPointerLeave: onPointerFinish,
            onPointerCancel: onPointerFinish,
            onPointerMove: (event) => {
                if (event.pointerId == null) {
                    return;
                }
                const prevInteraction = container.downPointerMap.get(event.pointerId);
                if (prevInteraction == null) {
                    return;
                }
                event.stopImmediatePropagation?.();
                container.worldToLocal(localPointHelper.copy(event.point));
                distanceHelper.copy(localPointHelper).sub(prevInteraction.localPoint);
                distanceHelper.x *= container.size.peek()?.[0] ?? 0;
                distanceHelper.y *= container.size.peek()?.[1] ?? 0;
                prevInteraction.localPoint.copy(localPointHelper);
                if (prevInteraction.type === 'scroll-bar') {
                    const size = container.size.peek();
                    if (size == null) {
                        return;
                    }
                    //convert distanceHelper to (drag delta) * maxScrollPosition
                    toScrollbarScrollDistance(distanceHelper, prevInteraction.axisIndex, size, container.borderInset.peek(), container.maxScrollPosition.peek(), container.properties.peek().scrollbarWidth);
                    scroll(container, event, distanceHelper.x, -distanceHelper.y, undefined, false);
                    return;
                }
                const timestamp = performance.now();
                const deltaTime = timestamp - prevInteraction.timestamp;
                scroll(container, event, -distanceHelper.x, distanceHelper.y, deltaTime, true);
                prevInteraction.timestamp = timestamp;
            },
            onWheel: (event) => {
                const { nativeEvent } = event;
                if (nativeEvent == null ||
                    typeof nativeEvent != 'object' ||
                    !('deltaX' in nativeEvent) ||
                    typeof nativeEvent.deltaX != 'number' ||
                    !('deltaY' in nativeEvent) ||
                    typeof nativeEvent.deltaY != 'number') {
                    return;
                }
                scroll(container, event, nativeEvent.deltaX, nativeEvent.deltaY, undefined, false);
            },
        };
    }, abortSignal);
}
function scroll(container, event, deltaX, deltaY, deltaTime, enableRubberBand) {
    if (container.scrollPosition.value == null) {
        return;
    }
    const [wasScrolledX, wasScrolledY] = event == null ? [false, false] : getWasScrolled(event.nativeEvent);
    if (wasScrolledX) {
        deltaX = 0;
    }
    if (wasScrolledY) {
        deltaY = 0;
    }
    const [x, y] = container.scrollPosition.value;
    const [maxX, maxY] = container.maxScrollPosition.value;
    let [newX, newY] = container.scrollPosition.value;
    const [ancestorScrollableX, ancestorScrollableY] = container.anyAncestorScrollable?.value ?? [false, false];
    newX = computeScroll(x, maxX, deltaX, enableRubberBand && !ancestorScrollableX);
    newY = computeScroll(y, maxY, deltaY, enableRubberBand && !ancestorScrollableY);
    if (deltaTime != null && deltaTime > 0) {
        container.scrollVelocity.set(deltaX, deltaY).divideScalar(deltaTime);
    }
    if (event != null) {
        setWasScrolled(event.nativeEvent, wasScrolledX || Math.min(x, (maxX ?? 0) - x) > 5, wasScrolledY || Math.min(y, (maxY ?? 0) - y) > 5);
    }
    const preventScroll = container.properties.peek().onScroll?.(newX, newY, container.scrollPosition, event);
    if (preventScroll === false || (x === newX && y === newY)) {
        return;
    }
    container.scrollPosition.value = [newX, newY];
}
export function setupScroll(container) {
    const onFrame = (delta) => {
        if (container.downPointerMap.size > 0 || container.scrollPosition.value == null) {
            return;
        }
        let deltaX = 0;
        let deltaY = 0;
        const [x, y] = container.scrollPosition.value;
        const [maxX, maxY] = container.maxScrollPosition.value;
        const outsideDistanceX = outsideDistance(x, 0, maxX ?? 0);
        const outsideDistanceY = outsideDistance(y, 0, maxY ?? 0);
        if (Math.abs(outsideDistanceX) > 1 || Math.abs(outsideDistanceY) > 1) {
            container.root.peek().requestFrame?.();
        }
        deltaX += outsideDistanceX * -0.3;
        deltaY += outsideDistanceY * -0.3;
        deltaX += container.scrollVelocity.x * delta;
        deltaY += container.scrollVelocity.y * delta;
        container.scrollVelocity.multiplyScalar(0.9); //damping scroll factor
        if (Math.abs(container.scrollVelocity.x) < 0.01 /** 10 px per second */) {
            container.scrollVelocity.x = 0;
        }
        else {
            container.root.peek().requestFrame?.();
        }
        if (Math.abs(container.scrollVelocity.y) < 0.01 /** 10 px per second */) {
            container.scrollVelocity.y = 0;
        }
        else {
            container.root.peek().requestFrame?.();
        }
        if (deltaX === 0 && deltaY === 0) {
            return;
        }
        scroll(container, undefined, deltaX, deltaY, undefined, true);
    };
    abortableEffect(() => {
        //this also needs to be executed when isScrollable is false since when the max scroll position is lower then the current scroll position, the onFrame callback will animate the scroll position back to 0
        container.root.value.onFrameSet.add(onFrame);
        return () => container.root.value.onFrameSet.delete(onFrame);
    }, container.abortSignal);
}
const wasScrolledSymbol = Symbol('was-scrolled');
function getWasScrolled(event) {
    return event[wasScrolledSymbol] ?? [false, false];
}
function setWasScrolled(event, x, y) {
    event[wasScrolledSymbol] = [x, y];
}
function computeScroll(position, maxPosition, delta, enableRubberBand) {
    if (delta === 0) {
        return position;
    }
    const outside = outsideDistance(position, 0, maxPosition ?? 0);
    if (sign(delta) === sign(outside)) {
        delta *= Math.max(0, 1 - Math.abs(outside) / 100);
    }
    let newPosition = position + delta;
    if (enableRubberBand && maxPosition != null) {
        return newPosition;
    }
    return clamp(newPosition, 0, maxPosition ?? 0);
}
function sign(value) {
    return value >= 0;
}
function outsideDistance(value, min, max) {
    if (value < min) {
        return value - min;
    }
    if (value > max) {
        return value - max;
    }
    return 0;
}
const scrollbarBorderPropertyKeys = [
    'scrollbarBorderLeftWidth',
    'scrollbarBorderRightWidth',
    'scrollbarBorderTopWidth',
    'scrollbarBorderBottomWidth',
];
export function setupScrollbars(container, parentClippingRect, prevOrderInfo, prevPanelDeps) {
    const scrollbarOrderInfo = signal(undefined);
    setupOrderInfo(scrollbarOrderInfo, container.properties, 'scrollbarZIndex', ElementType.Panel, prevPanelDeps, prevOrderInfo, container.abortSignal);
    const borderInset = computedBorderInset(container.properties, scrollbarBorderPropertyKeys);
    setupScrollbar(container, 0, parentClippingRect, scrollbarOrderInfo, prevPanelDeps, borderInset);
    setupScrollbar(container, 1, parentClippingRect, scrollbarOrderInfo, prevPanelDeps, borderInset);
}
let scrollbarMaterialConfig;
function getScrollbarMaterialConfig() {
    scrollbarMaterialConfig ??= createPanelMaterialConfig({
        backgroundColor: 'scrollbarColor',
        borderBottomLeftRadius: 'scrollbarBorderBottomLeftRadius',
        borderBottomRightRadius: 'scrollbarBorderBottomRightRadius',
        borderTopRightRadius: 'scrollbarBorderTopRightRadius',
        borderTopLeftRadius: 'scrollbarBorderTopLeftRadius',
        borderColor: 'scrollbarBorderColor',
        borderBend: 'scrollbarBorderBend',
    }, {
        backgroundColor: 0xffffff,
    });
    return scrollbarMaterialConfig;
}
function setupScrollbar(container, primaryIndex, parentClippingRect, orderInfo, groupDeps, borderSize) {
    const scrollbarTransformation = computed(() => computeScrollbarTransformation(primaryIndex, container.properties.value.scrollbarWidth, container.size.value, container.maxScrollPosition.value, container.borderInset.value, container.scrollPosition.value));
    const scrollbarPosition = computed(() => (scrollbarTransformation.value?.slice(0, 2) ?? [0, 0]));
    const scrollbarSize = computed(() => (scrollbarTransformation.value?.slice(2, 4) ?? [0, 0]));
    const panelMatrix = computedPanelMatrix(container.properties, container.globalMatrix, scrollbarSize, scrollbarPosition);
    setupInstancedPanel(container.properties, container.root, orderInfo, groupDeps, panelMatrix, scrollbarSize, borderSize, parentClippingRect, container.isVisible, getScrollbarMaterialConfig(), container.abortSignal);
}
function computeScrollbarTransformation(primaryAxisIndex, secondaryScrollbarSize, size, maxScrollPosition, borderInset, scrollPosition) {
    if (size == null || borderInset == null || scrollPosition == null) {
        return undefined;
    }
    const primaryMaxScrollPosition = maxScrollPosition[primaryAxisIndex];
    if (primaryMaxScrollPosition == null) {
        return undefined;
    }
    const result = [0, 0, 0, 0];
    const endInsetIndex = 1 - primaryAxisIndex;
    const primarySizeWithoutBorder = size[primaryAxisIndex] - borderInset[endInsetIndex] - borderInset[endInsetIndex + 2];
    const primaryScrollbarSize = computePrimaryScrollbarSize(primarySizeWithoutBorder, primaryMaxScrollPosition, secondaryScrollbarSize);
    const primaryMaxScrollbarPosition = primarySizeWithoutBorder - primaryScrollbarSize;
    const primaryScrollPosition = scrollPosition[primaryAxisIndex];
    //position
    const invertedIndex = 1 - primaryAxisIndex;
    result[primaryAxisIndex] =
        size[primaryAxisIndex] * 0.5 -
            primaryScrollbarSize * 0.5 -
            borderInset[(primaryAxisIndex + 3) % 4] -
            primaryMaxScrollbarPosition * clamp(primaryScrollPosition / primaryMaxScrollPosition, 0, 1);
    result[invertedIndex] = size[invertedIndex] * 0.5 - secondaryScrollbarSize * 0.5 - borderInset[invertedIndex + 1];
    if (primaryAxisIndex === 0) {
        result[0] *= -1;
        result[1] *= -1;
    }
    //size
    result[primaryAxisIndex + 2] = primaryScrollbarSize;
    result[endInsetIndex + 2] = secondaryScrollbarSize;
    return result;
}
function computePrimaryScrollbarSize(primarySizeWithoutBorder, primaryMaxScrollPosition, secondaryScrollbarSize) {
    return Math.max(secondaryScrollbarSize, (primarySizeWithoutBorder * primarySizeWithoutBorder) / (primaryMaxScrollPosition + primarySizeWithoutBorder));
}
/**
 * @param target contains the delta movement in pixels and will receive the delta scroll distance in pixels
 */
function toScrollbarScrollDistance(target, primaryAxisIndex, size, borderInset, maxScrollPosition, secondaryScrollbarSize) {
    const primaryMaxScrollPosition = maxScrollPosition[primaryAxisIndex];
    if (size == null || borderInset == null || primaryMaxScrollPosition == null) {
        return;
    }
    const delta = target.getComponent(primaryAxisIndex);
    const primarySizeWithoutBorder = size[primaryAxisIndex] - borderInset[1 - primaryAxisIndex] - borderInset[1 - primaryAxisIndex + 2];
    const primaryScrollbarSize = computePrimaryScrollbarSize(primarySizeWithoutBorder, primaryMaxScrollPosition, secondaryScrollbarSize);
    const primaryMaxScrollbarPosition = primarySizeWithoutBorder - primaryScrollbarSize;
    target.setComponent(primaryAxisIndex, (delta / primaryMaxScrollbarPosition) * primaryMaxScrollPosition);
    target.setComponent(1 - primaryAxisIndex, 0);
    target.z = 0;
}
const box2Helper = new Box2();
const point2Helper = new Vector2();
function getIntersectedScrollbarIndex(point, secondaryScrollbarSize, size, maxScrollPosition, borderInset, scrollPosition) {
    if (size == null) {
        return undefined;
    }
    point2Helper.copy(point);
    point2Helper.x *= size[0];
    point2Helper.y *= size[1];
    for (let i = 0; i < 2; i++) {
        if (intersectsScrollbar(point2Helper, i, secondaryScrollbarSize, size, maxScrollPosition, borderInset, scrollPosition)) {
            return i;
        }
    }
    return undefined;
}
const centerHelper = new Vector2();
const sizeHelper = new Vector2();
function intersectsScrollbar(point, axisIndex, secondaryScrollbarSize, size, maxScrollPosition, borderInset, scrollPosition) {
    const result = computeScrollbarTransformation(axisIndex, secondaryScrollbarSize, size, maxScrollPosition, borderInset, scrollPosition);
    if (result == null) {
        return false;
    }
    box2Helper.setFromCenterAndSize(centerHelper.fromArray(result, 0), sizeHelper.fromArray(result, 2));
    return box2Helper.containsPoint(point);
}
