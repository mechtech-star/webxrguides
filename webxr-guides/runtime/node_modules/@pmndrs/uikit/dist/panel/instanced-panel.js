import { computed, signal } from '@preact/signals-core';
import { Matrix4 } from 'three';
import { defaultClippingData } from '../clipping.js';
import { abortableEffect } from '../utils.js';
export function setupInstancedPanel(properties, root, orderInfo, panelGroupDependencies, panelMatrix, size, borderInset, clippingRect, isVisible, materialConfig, abortSignal) {
    abortableEffect(() => {
        if (orderInfo.value == null) {
            return;
        }
        const innerAbortController = new AbortController();
        const group = root.value.panelGroupManager.getGroup(orderInfo.value, panelGroupDependencies.value);
        new InstancedPanel(properties, group, orderInfo.value.patchIndex, panelMatrix, size, borderInset, clippingRect, isVisible, materialConfig, innerAbortController.signal);
        return () => innerAbortController.abort();
    }, abortSignal);
}
const matrixHelper = new Matrix4();
export function computedPanelMatrix(properties, matrixSignal, sizeSignal, offsetSignal) {
    return computed(() => {
        const size = sizeSignal.value;
        const matrix = matrixSignal.value;
        if (size == null || matrix == null) {
            return undefined;
        }
        const [width, height] = size;
        const pixelSize = properties.value.pixelSize;
        const result = new Matrix4();
        result.makeScale(width * pixelSize, height * pixelSize, 1);
        if (offsetSignal != null) {
            const [x, y] = offsetSignal.value;
            result.premultiply(matrixHelper.makeTranslation(x * pixelSize, y * pixelSize, 0));
        }
        return result.premultiply(matrix);
    });
}
export class InstancedPanel {
    group;
    minorIndex;
    matrix;
    size;
    borderInset;
    clippingRect;
    materialConfig;
    indexInBucket;
    bucket;
    insertedIntoGroup = false;
    active = signal(false);
    abortController;
    constructor(properties, group, minorIndex, matrix, size, borderInset, clippingRect, isVisible, materialConfig, abortSignal) {
        this.group = group;
        this.minorIndex = minorIndex;
        this.matrix = matrix;
        this.size = size;
        this.borderInset = borderInset;
        this.clippingRect = clippingRect;
        this.materialConfig = materialConfig;
        const setters = materialConfig.setters;
        abortableEffect(() => {
            if (!isVisible.value || !this.active.value) {
                return;
            }
            return properties.subscribePropertyKeys((key) => {
                if (!materialConfig.hasProperty(key)) {
                    return;
                }
                abortableEffect(() => {
                    const index = this.getIndexInBuffer();
                    if (index == null) {
                        return;
                    }
                    const { instanceData, instanceDataOnUpdate: instanceDataAddUpdateRange, root } = this.group;
                    setters[key](instanceData.array, instanceData.itemSize * index, properties.value[key], size, properties.signal.opacity, instanceDataAddUpdateRange);
                    root.requestRender?.();
                }, abortSignal);
            });
        }, abortSignal);
        const isPanelVisible = materialConfig.computedIsVisibile(properties, borderInset, size, isVisible);
        abortableEffect(() => {
            if (isPanelVisible.value) {
                this.requestShow();
                return;
            }
            this.hide();
        }, abortSignal);
        abortSignal.addEventListener('abort', () => this.hide());
    }
    setIndexInBucket(index) {
        this.indexInBucket = index;
    }
    getIndexInBuffer() {
        if (this.bucket == null || this.indexInBucket == null) {
            return undefined;
        }
        return this.bucket.offset + this.indexInBucket;
    }
    activate(bucket, index) {
        this.bucket = bucket;
        this.indexInBucket = index;
        this.active.value = true;
        this.abortController = new AbortController();
        abortableEffect(() => {
            if (this.matrix.value == null) {
                return;
            }
            const index = this.getIndexInBuffer();
            if (index == null) {
                return;
            }
            const arrayIndex = index * 16;
            const { instanceMatrix, root } = this.group;
            this.matrix.value.toArray(instanceMatrix.array, arrayIndex);
            instanceMatrix.addUpdateRange(arrayIndex, 16);
            instanceMatrix.needsUpdate = true;
            root.requestRender?.();
        }, this.abortController.signal);
        abortableEffect(() => {
            const index = this.getIndexInBuffer();
            if (index == null || this.size.value == null) {
                return;
            }
            const [width, height] = this.size.value;
            const { instanceData, root } = this.group;
            const { array } = instanceData;
            const bufferIndex = index * 16 + 14;
            array[bufferIndex] = width;
            array[bufferIndex + 1] = height;
            instanceData.addUpdateRange(bufferIndex, 2);
            instanceData.needsUpdate = true;
            root.requestRender?.();
        }, this.abortController.signal);
        abortableEffect(() => {
            const index = this.getIndexInBuffer();
            if (index == null || this.borderInset.value == null) {
                return;
            }
            const { instanceData, root } = this.group;
            const offset = index * 16 + 0;
            instanceData.array.set(this.borderInset.value, offset);
            instanceData.addUpdateRange(offset, 4);
            instanceData.needsUpdate = true;
            root.requestRender?.();
        }, this.abortController.signal),
            abortableEffect(() => {
                const index = this.getIndexInBuffer();
                if (index == null) {
                    return;
                }
                const { instanceClipping, root } = this.group;
                const offset = index * 16;
                const clipping = this.clippingRect?.value;
                if (clipping != null) {
                    clipping.toArray(instanceClipping.array, offset);
                }
                else {
                    instanceClipping.array.set(defaultClippingData, offset);
                }
                instanceClipping.addUpdateRange(offset, 16);
                instanceClipping.needsUpdate = true;
                root.requestRender?.();
            }, this.abortController.signal);
    }
    requestShow() {
        if (this.insertedIntoGroup) {
            return;
        }
        this.insertedIntoGroup = true;
        this.group.insert(this.minorIndex, this);
    }
    hide() {
        if (!this.insertedIntoGroup) {
            return;
        }
        this.active.value = false;
        this.group.delete(this.minorIndex, this.indexInBucket, this);
        this.insertedIntoGroup = false;
        this.bucket = undefined;
        this.indexInBucket = undefined;
        this.abortController?.abort();
        this.abortController = undefined;
    }
}
