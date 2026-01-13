import { Signal } from '@preact/signals-core';
import { Matrix4, Vector2Tuple } from 'three';
import { ClippingRect } from '../../clipping.js';
import { alignmentXMap, alignmentYMap } from '../../utils.js';
import { InstancedGlyphGroup } from './instanced-glyph-group.js';
import { GlyphLayout } from '../layout.js';
import { SelectionTransformation } from '../../selection.js';
import { CaretTransformation } from '../../caret.js';
import { BaseOutProperties, Properties } from '../../properties/index.js';
import { Text } from '../../components/text.js';
export type TextAlignProperties = {
    textAlign?: keyof typeof alignmentXMap | 'justify';
};
export declare const additionalTextDefaults: {
    verticalAlign: keyof typeof alignmentYMap;
};
export type AdditionalTextDefaults = typeof additionalTextDefaults;
export declare function createInstancedText(text: Text, parentClippingRect: Signal<ClippingRect | undefined> | undefined, selectionRange: Signal<Vector2Tuple | undefined> | undefined, selectionTransformations: Signal<Array<SelectionTransformation>> | undefined, caretTransformation: Signal<CaretTransformation | undefined> | undefined, instancedTextRef: {
    current?: InstancedText;
} | undefined): import("@preact/signals-core").ReadonlySignal<import("../../flex/node.js").CustomLayouting | undefined>;
export declare class InstancedText {
    private group;
    private properties;
    private layoutSignal;
    private matrix;
    private parentClippingRect;
    private selectionRange;
    private selectionTransformations;
    private caretTransformation;
    private glyphLines;
    private lastLayout;
    private unsubscribeInitialList;
    private unsubscribeShowList;
    constructor(group: InstancedGlyphGroup, properties: Properties<AdditionalTextDefaults & BaseOutProperties>, layoutSignal: Signal<GlyphLayout | undefined>, matrix: Signal<Matrix4 | undefined>, isVisible: Signal<boolean>, parentClippingRect: Signal<ClippingRect | undefined> | undefined, selectionRange: Signal<Vector2Tuple | undefined> | undefined, selectionTransformations: Signal<Array<SelectionTransformation>> | undefined, caretTransformation: Signal<CaretTransformation | undefined> | undefined);
    getCharIndex(x: number, y: number, position: 'between' | 'on'): number;
    private updateSelectionBoxes;
    private computeSelectionTransformation;
    private getGlyphLineAndX;
    private getGlyphX;
    private show;
    private hide;
    destroy(): void;
}
