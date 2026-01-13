import { computed, signal } from '@preact/signals-core';
import { Vector2 } from 'three';
import { computedClippingRect } from '../clipping.js';
import { ElementType, setupOrderInfo } from '../order.js';
import { setupInstancedPanel } from '../panel/instanced-panel.js';
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js';
import { computedAnyAncestorScrollable, computedGlobalScrollMatrix, setupScroll, setupScrollbars, setupScrollHandlers, } from '../scroll.js';
import { computedFontFamilies } from '../text/font.js';
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js';
import { Component } from './component.js';
export class Container extends Component {
    downPointerMap = new Map();
    scrollVelocity = new Vector2();
    anyAncestorScrollable;
    clippingRect;
    childrenMatrix;
    fontFamilies;
    scrollPosition = signal([0, 0]);
    constructor(inputProperties, initialClasses, config) {
        const scrollHandlers = signal(undefined);
        super(inputProperties, initialClasses, {
            hasNonUikitChildren: false,
            dynamicHandlers: scrollHandlers,
            ...config,
        });
        this.material.visible = false;
        setupScrollHandlers(scrollHandlers, this, this.abortSignal);
        this.childrenMatrix = computedGlobalScrollMatrix(this.properties, this.scrollPosition, this.globalMatrix);
        const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value);
        this.fontFamilies = computedFontFamilies(this.properties, this.parentContainer);
        this.clippingRect = computedClippingRect(this.globalMatrix, this, this.properties.signal.pixelSize, parentClippingRect);
        this.anyAncestorScrollable = computedAnyAncestorScrollable(this.parentContainer);
        const panelGroupDeps = computedPanelGroupDependencies(this.properties);
        setupOrderInfo(this.orderInfo, this.properties, 'zIndex', ElementType.Panel, panelGroupDeps, computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)), this.abortSignal);
        setupInstancedPanel(this.properties, this.root, this.orderInfo, panelGroupDeps, this.globalPanelMatrix, this.size, this.borderInset, parentClippingRect, this.isVisible, getDefaultPanelMaterialConfig(), this.abortSignal);
        //scrolling:
        setupScroll(this);
        setupScrollbars(this, parentClippingRect, this.orderInfo, panelGroupDeps);
    }
}
