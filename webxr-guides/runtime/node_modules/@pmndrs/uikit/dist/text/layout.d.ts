import { Font } from './font.js';
import { Signal } from '@preact/signals-core';
import { Properties } from '../properties/index.js';
import { CustomLayouting } from '../flex/index.js';
import { TextOutProperties } from '../components/text.js';
export type GlyphLayoutLine = {
    charIndexOffset: number;
    charLength: number;
    nonWhitespaceCharLength: number;
    nonWhitespaceWidth: number;
    whitespacesBetween: number;
};
export type GlyphLayout = {
    lines: Array<GlyphLayoutLine>;
    availableWidth: number;
    availableHeight: number;
} & GlyphOutProperties;
export type GlyphProperties = Partial<{
    letterSpacing: number | string;
    lineHeight: number | string;
    fontSize: number | string;
    wordBreak: WordBreak;
    whiteSpace: WhiteSpace;
    tabSize: number;
}>;
export type WhiteSpace = 'normal' | 'collapse' | 'pre' | 'pre-line';
export type WordBreak = keyof typeof wrappers;
export type GlyphOutProperties = {
    text: string;
    font: Font;
    letterSpacing: number;
    lineHeight: number;
    fontSize: number;
    wordBreak: WordBreak;
};
export declare function computedCustomLayouting(properties: Properties<TextOutProperties>, fontSignal: Signal<Font | undefined>, propertiesRef: {
    current: GlyphOutProperties | undefined;
}): import("@preact/signals-core").ReadonlySignal<CustomLayouting | undefined>;
declare const wrappers: {
    'keep-all': import("./index.js").GlyphWrapper;
    'break-all': import("./index.js").GlyphWrapper;
    'break-word': import("./index.js").GlyphWrapper;
};
export declare function measureGlyphLayout(properties: GlyphOutProperties, availableWidth?: number): {
    width: number;
    height: number;
};
export declare function buildGlyphLayout(properties: GlyphOutProperties, availableWidth: number, availableHeight: number): GlyphLayout;
export {};
