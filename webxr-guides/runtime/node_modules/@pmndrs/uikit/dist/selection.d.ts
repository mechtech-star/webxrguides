import { ReadonlySignal, Signal } from '@preact/signals-core';
import { PanelProperties } from './panel/instanced-panel.js';
import { Matrix4, Vector2Tuple } from 'three';
import { ClippingRect } from './clipping.js';
import { OrderInfo } from './order.js';
import { ColorRepresentation } from './utils.js';
import { PanelGroupProperties } from './panel/index.js';
import { Properties } from './properties/index.js';
import { RootContext } from './context.js';
export type SelectionTransformation = {
    size: Vector2Tuple;
    position: Vector2Tuple;
};
export type SelectionBorderSizeProperties = {
    selectionBorderRightWidth?: number;
    selectionBorderTopWidth?: number;
    selectionBorderLeftWidth?: number;
    selectionBorderBottomWidth?: number;
};
export type SelectionProperties = {
    selectionColor?: ColorRepresentation;
} & SelectionBorderSizeProperties & {
    [Key in Exclude<keyof PanelProperties, 'opacity'> as `selection${Capitalize<Key>}`]?: PanelProperties[Key];
};
export declare function createSelection(properties: Properties, root: Signal<RootContext>, globalMatrix: Signal<Matrix4 | undefined>, selectionTransformations: Signal<Array<SelectionTransformation>>, isVisible: Signal<boolean>, prevOrderInfo: Signal<OrderInfo | undefined>, prevPanelDeps: ReadonlySignal<Required<PanelGroupProperties>>, parentClippingRect: Signal<ClippingRect | undefined> | undefined, abortSignal: AbortSignal): void;
