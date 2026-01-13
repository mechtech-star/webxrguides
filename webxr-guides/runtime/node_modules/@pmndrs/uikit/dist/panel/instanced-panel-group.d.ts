import { InstancedBufferAttribute, MeshPhongMaterial, MeshPhysicalMaterial } from 'three';
import { MaterialClass } from './panel-material.js';
import { InstancedPanel } from './instanced-panel.js';
import { OrderInfo } from '../order.js';
import { Properties } from '../properties/index.js';
import { RootContext } from '../context.js';
import type { Component } from '../components/component.js';
export type ShadowProperties = {
    receiveShadow?: boolean;
    castShadow?: boolean;
};
export type RenderProperties = {
    depthWrite?: boolean;
    depthTest?: boolean;
    renderOrder?: number;
};
export declare class PlasticMaterial extends MeshPhongMaterial {
    constructor();
}
export declare class GlassMaterial extends MeshPhysicalMaterial {
    constructor();
}
export declare class MetalMaterial extends MeshPhysicalMaterial {
    constructor();
}
declare const materialClasses: {
    glass: typeof GlassMaterial;
    metal: typeof MetalMaterial;
    plastic: typeof PlasticMaterial;
};
export declare function resolvePanelMaterialClassProperty(input: NonNullable<PanelGroupProperties['panelMaterialClass']>): MaterialClass;
export type PanelGroupProperties = {
    panelMaterialClass?: MaterialClass | keyof typeof materialClasses;
} & ShadowProperties & RenderProperties;
export declare function computedPanelGroupDependencies(properties: Properties): import("@preact/signals-core").ReadonlySignal<Required<PanelGroupProperties>>;
export declare class PanelGroupManager {
    private readonly root;
    private readonly object;
    private map;
    constructor(root: Omit<RootContext, 'glyphGroupManager' | 'panelGroupManager'>, object: Component);
    init(abortSignal: AbortSignal): void;
    private traverse;
    getGroup({ majorIndex, minorIndex }: OrderInfo, properties: Required<PanelGroupProperties>): InstancedPanelGroup;
}
export declare class InstancedPanelGroup {
    private readonly object;
    readonly root: Omit<RootContext, 'glyphGroupManager' | 'panelGroupManager'>;
    private readonly orderInfo;
    private readonly panelGroupProperties;
    private mesh?;
    instanceMatrix: InstancedBufferAttribute;
    instanceData: InstancedBufferAttribute;
    instanceClipping: InstancedBufferAttribute;
    private readonly instanceMaterial;
    private buckets;
    private elementCount;
    private bufferElementSize;
    instanceDataOnUpdate: InstancedBufferAttribute['addUpdateRange'];
    private nextUpdateTime;
    private nextUpdateTimeoutRef;
    private activateElement;
    private setElementIndex;
    private bufferCopyWithin;
    private clearBufferAt;
    constructor(object: Component, root: Omit<RootContext, 'glyphGroupManager' | 'panelGroupManager'>, orderInfo: OrderInfo, panelGroupProperties: Required<PanelGroupProperties>);
    private updateCount;
    private requestUpdate;
    private requestUpdateNextFrame;
    insert(bucketIndex: number, panel: InstancedPanel): void;
    delete(bucketIndex: number, elementIndex: number | undefined, panel: InstancedPanel): void;
    onFrame(): void;
    private update;
    private resize;
    destroy(): void;
}
export {};
