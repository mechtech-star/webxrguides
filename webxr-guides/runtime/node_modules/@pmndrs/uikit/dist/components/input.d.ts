import { ReadonlySignal, Signal } from '@preact/signals-core';
import { EventHandlersProperties } from '../events.js';
import { Component } from './component.js';
import { Vector2Tuple } from 'three';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { InstancedText } from '../text/index.js';
import { Text, TextOutProperties } from './text.js';
import { RenderContext } from '../context.js';
import { ReadonlyProperties } from '@pmndrs/uikit-pub-sub';
export declare const canvasInputProps: {
    onPointerDown: (e: {
        nativeEvent: any;
        preventDefault: () => void;
    }) => void;
};
export type InputType = 'text' | 'password' | 'number';
export type InputOutProperties = Omit<TextOutProperties, 'text'> & {
    placeholder?: string;
    defaultValue?: string;
    value?: string;
    disabled: boolean;
    tabIndex: number;
    autocomplete: string;
    type: InputType;
    onValueChange?: (value: string) => void;
    onFocusChange?: (focus: boolean) => void;
} & Omit<Partial<HTMLInputElement>, 'width' | 'height' | 'value' | 'disabled' | 'type' | 'focus' | 'active' | 'checked' | 'defaultChecked' | 'size' | 'classList'>;
export type InputProperties = Omit<InProperties<InputOutProperties>, 'text'>;
export declare const inputDefaults: InputOutProperties;
export declare class Input<OutProperties extends InputOutProperties = InputOutProperties> extends Text<OutProperties> {
    readonly element: HTMLInputElement | HTMLTextAreaElement;
    readonly selectionRange: Signal<Vector2Tuple | undefined>;
    readonly hasFocus: Signal<boolean>;
    readonly uncontrolledSignal: Signal<string | undefined>;
    readonly currentSignal: ReadonlySignal<string>;
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        multiline?: boolean;
        defaults?: WithSignal<OutProperties>;
    });
    focus(start?: number, end?: number, direction?: 'forward' | 'backward' | 'none'): void;
}
export declare function setupSelectionHandlers(target: Signal<EventHandlersProperties | undefined>, properties: ReadonlyProperties<InputOutProperties>, text: ReadonlySignal<string>, component: Component, instancedTextRef: {
    current?: InstancedText;
}, focus: (start?: number, end?: number, direction?: 'forward' | 'backward' | 'none') => void, abortSignal: AbortSignal): void;
export declare function createHtmlInputElement(selectionRange: Signal<Vector2Tuple | undefined>, onChange: (value: string) => void, multiline: boolean): HTMLInputElement | HTMLTextAreaElement;
