import { Content, ContentOutProperties } from './content.js';
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js';
import { RenderContext } from '../context.js';
export type SvgOutProperties = ContentOutProperties & {
    keepAspectRatio?: boolean;
    src?: string;
    content?: string;
};
export type SvgProperties = InProperties<SvgOutProperties>;
export declare class Svg<OutProperties extends SvgOutProperties = SvgOutProperties> extends Content<OutProperties> {
    constructor(inputProperties?: InProperties<OutProperties>, initialClasses?: Array<InProperties<BaseOutProperties> | string>, config?: {
        renderContext?: RenderContext;
        defaultOverrides?: InProperties<OutProperties>;
        defaults?: WithSignal<OutProperties>;
    });
}
