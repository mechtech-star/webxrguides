import { ImageOutProperties, Image } from './image.js';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { RenderContext } from '../context.js';
export type VideoSrc = HTMLVideoElement['src'] | HTMLVideoElement['srcObject'] | HTMLVideoElement;
export type VideoOutProperties = ImageOutProperties<VideoSrc> & Omit<Partial<HTMLVideoElement>, 'width' | 'height' | 'src' | 'srcObject' | 'playsInline' | 'focus' | 'active' | 'classList'>;
export type VideoProperties = InProperties<VideoOutProperties>;
export declare class Video<OutProperties extends VideoOutProperties = VideoOutProperties> extends Image<OutProperties> {
    readonly element: import("@preact/signals-core").Signal<HTMLVideoElement | undefined>;
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        defaults?: WithSignal<OutProperties>;
    });
}
export declare function updateVideoElementSrc(element: HTMLVideoElement, src: Exclude<VideoSrc, HTMLVideoElement> | undefined): void;
