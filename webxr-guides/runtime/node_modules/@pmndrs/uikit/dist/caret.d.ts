import { ReadonlySignal, Signal } from '@preact/signals-core';
import { Matrix4, Vector2Tuple } from 'three';
import { ClippingRect } from './clipping.js';
import { OrderInfo } from './order.js';
import { PanelProperties } from './panel/instanced-panel.js';
import { ColorRepresentation } from './utils.js';
import { PanelGroupProperties } from './panel/index.js';
import { Properties } from './properties/index.js';
import { RootContext } from './context.js';
export type CaretTransformation = {
    position: Vector2Tuple;
    height: number;
};
type CaretWidthProperties = {
    caretWidth?: number;
};
type CaretBorderSizeProperties = {
    caretBorderRightWidth?: number;
    caretBorderTopWidth?: number;
    caretBorderLeftWidth?: number;
    caretBorderBottomWidth?: number;
};
export type CaretProperties = {
    caretColor?: ColorRepresentation;
} & CaretWidthProperties & CaretBorderSizeProperties & {
    [Key in Exclude<keyof PanelProperties, 'opacity'> as `caret${Capitalize<Key>}`]?: PanelProperties[Key];
};
export declare function setupCaret(properties: Properties, globalMatrix: Signal<Matrix4 | undefined>, caretTransformation: Signal<CaretTransformation | undefined>, isVisible: Signal<boolean>, parentOrderInfo: Signal<OrderInfo | undefined>, parentGroupDeps: ReadonlySignal<Required<PanelGroupProperties>>, parentClippingRect: Signal<ClippingRect | undefined> | undefined, root: Signal<RootContext>, abortSignal: AbortSignal): void;
export {};
