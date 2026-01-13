import { WebGLRenderer } from 'three';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { RenderContext } from '../context.js';
import { Container } from './container.js';
export type FullscreenProperties = InProperties<FullscreenOutProperties>;
export type FullscreenOutProperties = BaseOutProperties & {
    distanceToCamera?: number;
};
export declare class Fullscreen<OutProperties extends FullscreenOutProperties = FullscreenOutProperties> extends Container<OutProperties> {
    private renderer;
    private readonly sizeX;
    private readonly sizeY;
    private readonly transformTranslateZ;
    private readonly pixelSize;
    constructor(renderer: WebGLRenderer, properties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        defaults?: WithSignal<OutProperties>;
    });
    update(delta: number): void;
}
