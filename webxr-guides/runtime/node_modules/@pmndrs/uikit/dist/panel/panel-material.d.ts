import { Material, MeshDepthMaterial, MeshDistanceMaterial, TypedArray, Vector2Tuple, WebGLProgramParametersWithUniforms, WebGLRenderer } from 'three';
import { Constructor } from './utils.js';
import { Signal } from '@preact/signals-core';
import type { ColorRepresentation, Fix_TS_56_Float32Array } from '../utils.js';
import { Properties } from '../properties/index.js';
import { Inset } from '../flex/index.js';
export type MaterialClass = {
    new (...args: Array<any>): Material;
};
type InstanceOf<T> = T extends {
    new (): infer K;
} ? K : never;
declare const defaultDefaults: {
    backgroundColor: ColorRepresentation;
    borderColor: ColorRepresentation;
    borderBottomLeftRadius: number | string;
    borderTopLeftRadius: number | string;
    borderBottomRightRadius: number | string;
    borderTopRightRadius: number | string;
    borderBend: number;
};
export type PanelMaterialConfig = ReturnType<typeof createPanelMaterialConfig>;
export declare function getDefaultPanelMaterialConfig(): {
    hasProperty: (key: string) => boolean;
    defaultData: Fix_TS_56_Float32Array;
    setters: {
        [x: string]: (data: TypedArray, offset: number, value: unknown, size: Signal<Vector2Tuple | undefined>, opacity: Signal<number | `${number}%`>, onUpdate: ((start: number, count: number) => void) | undefined) => void;
    };
    computedIsVisibile: (properties: Properties, borderInset: Signal<Inset | undefined>, size: Signal<Vector2Tuple | undefined>, isVisible: Signal<boolean>) => import("@preact/signals-core").ReadonlySignal<boolean>;
};
export declare function createPanelMaterialConfig(keys: {
    [Key in keyof typeof materialSetters]?: string;
}, providedDefaults?: {
    [Key in Exclude<keyof typeof defaultDefaults, 'borderBottomLeftRadius' | 'borderTopLeftRadius' | 'borderBottomRightRadius' | 'borderTopRightRadius'>]?: (typeof defaultDefaults)[Key];
}): {
    hasProperty: (key: string) => boolean;
    defaultData: Fix_TS_56_Float32Array;
    setters: {
        [x: string]: (data: TypedArray, offset: number, value: unknown, size: Signal<Vector2Tuple | undefined>, opacity: Signal<number | `${number}%`>, onUpdate: ((start: number, count: number) => void) | undefined) => void;
    };
    computedIsVisibile: (properties: Properties, borderInset: Signal<Inset | undefined>, size: Signal<Vector2Tuple | undefined>, isVisible: Signal<boolean>) => import("@preact/signals-core").ReadonlySignal<boolean>;
};
declare const materialSetters: {
    readonly backgroundColor: (d: TypedArray, o: number, p: ColorRepresentation, _: Signal<Vector2Tuple | undefined>, op: Signal<number | `${number}%`>, u: ((start: number, count: number) => void) | undefined) => void;
    readonly borderBottomLeftRadius: (d: TypedArray, o: number, p: number | string, { value: s }: Signal<Vector2Tuple | undefined>, _: Signal<number | `${number}%`>, u: ((start: number, count: number) => void) | undefined) => void;
    readonly borderBottomRightRadius: (d: TypedArray, o: number, p: number | string, { value: s }: Signal<Vector2Tuple | undefined>, _: Signal<number | `${number}%`>, u: ((start: number, count: number) => void) | undefined) => false | void;
    readonly borderTopRightRadius: (d: TypedArray, o: number, p: number | string, { value: s }: Signal<Vector2Tuple | undefined>, _: Signal<number | `${number}%`>, u: ((start: number, count: number) => void) | undefined) => false | void;
    readonly borderTopLeftRadius: (d: TypedArray, o: number, p: number | string, { value: s }: Signal<Vector2Tuple | undefined>, _: Signal<number | `${number}%`>, u: ((start: number, count: number) => void) | undefined) => false | void;
    readonly borderColor: (d: TypedArray, o: number, p: ColorRepresentation, _: Signal<Vector2Tuple | undefined>, op: Signal<number | `${number}%`>, u: ((start: number, count: number) => void) | undefined) => void;
    readonly borderBend: (d: TypedArray, o: number, p: number | `${number}%`, _: Signal<Vector2Tuple | undefined>, op: Signal<number | `${number}%`>, u: ((start: number, count: number) => void) | undefined) => void;
};
export declare function writeColor(target: Array<number> | TypedArray, offset: number, color: ColorRepresentation, opacity: number, onUpdate?: ((start: number, count: number) => void) | undefined): void;
export type PanelMaterial = InstanceOf<ReturnType<typeof createPanelMaterial>>;
export type PanelMaterialInfo = {
    type: 'instanced';
} | {
    type: 'normal';
    data: Float32Array;
};
export declare function createPanelMaterial<T extends Constructor<Material>>(MaterialClass: T, info: PanelMaterialInfo): Material;
export declare class PanelDistanceMaterial extends MeshDistanceMaterial {
    private info;
    constructor(info: PanelMaterialInfo);
    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void;
}
export declare class PanelDepthMaterial extends MeshDepthMaterial {
    private info;
    constructor(info: PanelMaterialInfo);
    onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void;
}
export declare const instancedPanelDepthMaterial: PanelDepthMaterial;
export declare const instancedPanelDistanceMaterial: PanelDistanceMaterial;
export declare function compilePanelMaterial(parameters: WebGLProgramParametersWithUniforms, instanced: boolean): void;
export {};
