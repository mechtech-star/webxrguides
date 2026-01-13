import { Signal } from '@preact/signals-core';
import { EventHandlersProperties } from '../events.js';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { Component } from './component.js';
import { OrderInfo } from '../order.js';
import { AdditionalTextDefaults, Font, InstancedText } from '../text/index.js';
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js';
import { RenderContext } from '../context.js';
import { Matrix4, Vector2Tuple } from 'three';
import { CaretTransformation } from '../caret.js';
import { SelectionTransformation } from '../selection.js';
export type TextOutProperties = BaseOutProperties & AdditionalTextDefaults & {
    text?: unknown;
};
export type TextProperties = InProperties<TextOutProperties>;
export declare const textDefaults: {
    verticalAlign: keyof typeof import("../utils.js").alignmentYMap;
    scrollbarWidth: number;
    visibility: Required<import("../utils.js").VisibilityProperties>["visibility"];
    opacity: number | `${number}%`;
    depthTest: boolean;
    renderOrder: number;
    fontSize: Required<import("../text/layout.js").GlyphProperties>["fontSize"];
    letterSpacing: Required<import("../text/layout.js").GlyphProperties>["letterSpacing"];
    lineHeight: Required<import("../text/layout.js").GlyphProperties>["lineHeight"];
    wordBreak: Required<import("../text/layout.js").GlyphProperties>["wordBreak"];
    textAlign: keyof typeof import("../utils.js").alignmentXMap | "justify";
    fontWeight: import("../index.js").FontWeight;
    caretWidth: number;
    receiveShadow: boolean;
    castShadow: boolean;
    panelMaterialClass: NonNullable<import("../panel/instanced-panel-group.js").PanelGroupProperties["panelMaterialClass"]>;
    pixelSize: number;
    anchorX: keyof typeof import("../utils.js").alignmentXMap;
    anchorY: keyof typeof import("../utils.js").alignmentYMap;
    tabSize: number;
    whiteSpace: import("../text/layout.js").WhiteSpace;
};
export declare class Text<OutProperties extends TextOutProperties = TextOutProperties> extends Component<OutProperties> {
    readonly backgroundOrderInfo: Signal<OrderInfo | undefined>;
    readonly backgroundGroupDeps: ReturnType<typeof computedPanelGroupDependencies>;
    readonly fontSignal: Signal<Font | undefined>;
    readonly globalTextMatrix: Signal<Matrix4 | undefined>;
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        dynamicHandlers?: Signal<EventHandlersProperties | undefined>;
        selectionRange?: Signal<Vector2Tuple | undefined>;
        selectionTransformations?: Signal<Array<SelectionTransformation>>;
        caretTransformation?: Signal<CaretTransformation | undefined>;
        instancedTextRef?: {
            current?: InstancedText;
        };
        hasFocus?: Signal<boolean>;
        defaults?: WithSignal<OutProperties>;
        isPlaceholder?: Signal<boolean>;
    });
    add(): this;
}
