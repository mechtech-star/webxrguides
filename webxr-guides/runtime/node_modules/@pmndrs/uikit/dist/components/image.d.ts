import { Signal } from '@preact/signals-core';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { Component } from './component.js';
import { Texture } from 'three';
import { RenderContext } from '../context.js';
export type ImageFit = 'cover' | 'fill';
export declare const imageDefaults: {
    objectFit: ImageFit;
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
export type ImageOutProperties<Src> = BaseOutProperties & {
    src?: Src;
} & typeof imageDefaults;
export type ImageProperties = InProperties<ImageOutProperties<string | Texture>>;
export declare class Image<OutProperties extends ImageOutProperties<unknown> = ImageOutProperties<string | Texture>> extends Component<OutProperties> {
    readonly texture: Signal<Texture | undefined>;
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        loadTexture?: boolean;
        defaults?: WithSignal<OutProperties>;
    });
    add(): this;
}
