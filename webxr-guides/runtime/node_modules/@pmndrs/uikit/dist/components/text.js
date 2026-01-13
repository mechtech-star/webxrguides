import { computed, signal } from '@preact/signals-core';
import { Component } from './component.js';
import { ElementType, setupOrderInfo } from '../order.js';
import { additionalTextDefaults, computedFont, computedFontFamilies, computedGylphGroupDependencies, createInstancedText, } from '../text/index.js';
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js';
import { setupInstancedPanel } from '../panel/instanced-panel.js';
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js';
import { abortableEffect } from '../utils.js';
import { componentDefaults } from '../properties/defaults.js';
import { Matrix4, Quaternion, Vector3 } from 'three';
export const textDefaults = { ...componentDefaults, ...additionalTextDefaults };
const IdentityMatrix = new Matrix4();
const IdentityQuaternion = new Quaternion();
const IdentityScale = new Vector3(1, 1, 1);
const positionHelper = new Vector3();
export class Text extends Component {
    backgroundOrderInfo = signal(undefined);
    backgroundGroupDeps;
    fontSignal;
    globalTextMatrix;
    constructor(inputProperties, initialClasses, config) {
        super(inputProperties, initialClasses, {
            defaults: textDefaults,
            hasNonUikitChildren: false,
            ...config,
        });
        this.material.visible = false;
        const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value);
        this.backgroundGroupDeps = computedPanelGroupDependencies(this.properties);
        this.globalTextMatrix = computed(() => {
            if (this.paddingInset.value == null || this.borderInset.value == null) {
                return IdentityMatrix;
            }
            const [pTop, pRight, pBottom, pLeft] = this.paddingInset.value;
            const [bTop, bRight, bBottom, bLeft] = this.borderInset.value;
            const topInset = pTop + bTop;
            const rightInset = pRight + bRight;
            const bottomInset = pBottom + bBottom;
            const leftInset = pLeft + bLeft;
            const pixelSize = this.properties.value.pixelSize;
            positionHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0);
            return new Matrix4()
                .compose(positionHelper, IdentityQuaternion, IdentityScale)
                .premultiply(this.globalMatrix.value ?? IdentityMatrix);
        });
        setupOrderInfo(this.backgroundOrderInfo, this.properties, 'zIndex', ElementType.Panel, this.backgroundGroupDeps, computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)), this.abortSignal);
        const fontFamilies = computedFontFamilies(this.properties, this.parentContainer);
        this.fontSignal = computedFont(this.properties, fontFamilies);
        setupOrderInfo(this.orderInfo, this.properties, 'zIndex', ElementType.Text, computedGylphGroupDependencies(this.fontSignal), this.backgroundOrderInfo, this.abortSignal);
        setupInstancedPanel(this.properties, this.root, this.backgroundOrderInfo, this.backgroundGroupDeps, this.globalPanelMatrix, this.size, this.borderInset, parentClippingRect, this.isVisible, getDefaultPanelMaterialConfig(), this.abortSignal);
        const customLayouting = createInstancedText(this, parentClippingRect, config?.selectionRange, config?.selectionTransformations, config?.caretTransformation, config?.instancedTextRef);
        abortableEffect(() => this.node.setCustomLayouting(customLayouting.value), this.abortSignal);
    }
    add() {
        throw new Error(`the text component can not have any children`);
    }
}
