import { Signal } from '@preact/signals-core';
import { Matrix4 } from 'three';
import { alignmentXMap, alignmentYMap } from './utils.js';
import { Component } from './components/component.js';
export type TransformProperties = {
    transformTranslateX?: string | number;
    transformTranslateY?: string | number;
    transformTranslateZ?: number;
    transformRotateX?: number;
    transformRotateY?: number;
    transformRotateZ?: number;
    transformScaleX?: string | number;
    transformScaleY?: string | number;
    transformScaleZ?: string | number;
    transformOriginX?: keyof typeof alignmentXMap;
    transformOriginY?: keyof typeof alignmentYMap;
};
export declare function computedTransformMatrix({ relativeCenter, size, properties, root, }: Component): Signal<Matrix4 | undefined>;
