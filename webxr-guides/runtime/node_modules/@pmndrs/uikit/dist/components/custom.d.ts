import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { Component } from './component.js';
import { Material } from 'three';
import { RenderContext } from '../context.js';
export type CustomProperties = InProperties<BaseOutProperties>;
export type CustomOutProperties = BaseOutProperties;
export declare class Custom<OutProperties extends BaseOutProperties = BaseOutProperties> extends Component<OutProperties> {
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        material?: Material;
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        defaults?: WithSignal<OutProperties>;
    });
}
