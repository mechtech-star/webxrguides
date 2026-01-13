import { ReadonlySignal, Signal } from '@preact/signals-core';
import { Matrix4, Vector2Tuple } from 'three';
import { ColorRepresentation } from './utils.js';
import { ClippingRect } from './clipping.js';
import { PanelProperties } from './panel/instanced-panel.js';
import { OrderInfo } from './order.js';
import { PanelGroupProperties } from './panel/instanced-panel-group.js';
import { EventHandlersProperties } from './events.js';
import { Properties } from './properties/index.js';
import { Container } from './components/container.js';
export type ScrollEventHandlers = Pick<EventHandlersProperties, 'onPointerDown' | 'onPointerUp' | 'onPointerMove' | 'onWheel' | 'onPointerLeave' | 'onPointerCancel'>;
export declare function computedGlobalScrollMatrix(properties: Properties, scrollPosition: Signal<Vector2Tuple>, globalMatrix: Signal<Matrix4 | undefined>): ReadonlySignal<Matrix4 | undefined>;
export declare function computedAnyAncestorScrollable(parentSignal: Signal<Container | undefined>): ReadonlySignal<readonly [boolean, boolean]>;
export declare function setupScrollHandlers(target: Signal<ScrollEventHandlers | undefined>, container: Container, abortSignal: AbortSignal): void;
export declare function setupScroll(container: Container): void;
/**
 * true = positivie
 * false = negative
 */
export type Sign = boolean;
type ScrollbarWidthProperties = {
    scrollbarWidth?: number;
};
type ScrollbarBorderSizeProperties = {
    scrollbarBorderRightWidth?: number;
    scrollbarBorderTopWidth?: number;
    scrollbarBorderLeftWidth?: number;
    scrollbarBorderBottomWidth?: number;
};
export type ScrollbarProperties = {
    scrollbarColor?: ColorRepresentation;
    scrollbarZIndex?: number;
} & ScrollbarWidthProperties & ScrollbarBorderSizeProperties & {
    [Key in Exclude<keyof PanelProperties, 'opacity'> as `scrollbar${Capitalize<Key>}`]?: PanelProperties[Key];
};
export declare function setupScrollbars(container: Container, parentClippingRect: Signal<ClippingRect | undefined>, prevOrderInfo: Signal<OrderInfo | undefined>, prevPanelDeps: ReadonlySignal<Required<PanelGroupProperties>>): void;
export {};
