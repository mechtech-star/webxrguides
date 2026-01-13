import { Signal } from '@preact/signals-core';
import { Plane, Vector3 } from 'three';
import { Component } from './component.js';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { alignmentZMap } from '../utils.js';
import { RenderContext } from '../context.js';
export declare const contentDefaults: {
    depthAlign: keyof typeof alignmentZMap;
    keepAspectRatio: boolean;
    scrollbarWidth: number;
    visibility: Required<import("../utils.js").VisibilityProperties>["visibility"];
    opacity: number | `${number}%`;
    depthTest: boolean;
    renderOrder: number;
    fontSize: Required<import("../text/layout.js").GlyphProperties>["fontSize"];
    letterSpacing: Required<import("../text/layout.js").GlyphProperties>["letterSpacing"];
    lineHeight: Required<import("../text/layout.js").GlyphProperties>["lineHeight"];
    wordBreak: Required<import("../text/layout.js").GlyphProperties>["wordBreak"];
    verticalAlign: keyof typeof import("../utils.js").alignmentYMap;
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
export type ContentOutProperties = typeof contentDefaults & BaseOutProperties;
export type ContentProperties = InProperties<ContentOutProperties>;
export type BoundingBox = {
    size: Vector3;
    center: Vector3;
};
export declare class Content<OutProperties extends ContentOutProperties = ContentOutProperties> extends Component<OutProperties> {
    private readonly config?;
    readonly boundingBox: Signal<BoundingBox | undefined>;
    readonly clippingPlanes: Array<Plane>;
    private readonly childrenMatrix;
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        remeasureOnChildrenChange?: boolean;
        depthWriteDefault?: boolean;
        supportFillProperty?: boolean;
        boundingBox?: Signal<BoundingBox | undefined>;
        defaultOverrides?: InProperties<OutProperties>;
        renderContext?: RenderContext;
        defaults?: WithSignal<OutProperties>;
    } | undefined);
    private childUpdateWorldMatrix;
    private timeoutRef?;
    private debounceNotifyAncestorsChanged;
    notifyAncestorsChanged(): void;
    updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void;
    dispose(): void;
}
