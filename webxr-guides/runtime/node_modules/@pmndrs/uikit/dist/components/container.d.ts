import { Signal } from '@preact/signals-core';
import { Matrix4, Vector2Tuple, Vector3, Vector2 } from 'three';
import { ClippingRect } from '../clipping.js';
import { FontFamilies } from '../text/font.js';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { RenderContext } from '../context.js';
import { Component } from './component.js';
export type ContainerProperties = InProperties<BaseOutProperties>;
export type ContainerOutProperties = BaseOutProperties;
export declare class Container<OutProperties extends BaseOutProperties = BaseOutProperties> extends Component<OutProperties> {
    readonly downPointerMap: Map<number, {
        type: "scroll-bar";
        localPoint: Vector3;
        axisIndex: number;
    } | {
        type: "scroll-panel";
        localPoint: Vector3;
        timestamp: number;
    }>;
    readonly scrollVelocity: Vector2;
    readonly anyAncestorScrollable: Signal<readonly [boolean, boolean]>;
    readonly clippingRect: Signal<ClippingRect | undefined>;
    readonly childrenMatrix: Signal<Matrix4 | undefined>;
    readonly fontFamilies: Signal<FontFamilies | undefined>;
    readonly scrollPosition: Signal<Vector2Tuple>;
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        defaults?: WithSignal<OutProperties>;
    });
}
