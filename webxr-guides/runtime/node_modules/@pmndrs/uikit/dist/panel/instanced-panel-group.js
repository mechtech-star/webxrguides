import { InstancedBufferAttribute, DynamicDrawUsage, MeshPhongMaterial, MeshPhysicalMaterial, } from 'three';
import { addToSortedBuckets, removeFromSortedBuckets, updateSortedBucketsAllocation, resizeSortedBucketsSpace, } from '../allocation/sorted-buckets.js';
import { createPanelMaterial } from './panel-material.js';
import { InstancedPanelMesh } from './instanced-panel-mesh.js';
import { ElementType, setupRenderOrder } from '../order.js';
import { computed } from '@preact/signals-core';
export class PlasticMaterial extends MeshPhongMaterial {
    constructor() {
        super({
            specular: '#111',
            shininess: 100,
        });
    }
}
export class GlassMaterial extends MeshPhysicalMaterial {
    constructor() {
        super({
            roughness: 0.1,
            reflectivity: 0.5,
            iridescence: 0.001,
            thickness: 0.05,
            metalness: 0.3,
            ior: 2,
        });
    }
}
export class MetalMaterial extends MeshPhysicalMaterial {
    constructor() {
        super({
            iridescence: 0.001,
            metalness: 0.8,
            roughness: 0.1,
        });
    }
}
const materialClasses = {
    glass: GlassMaterial,
    metal: MetalMaterial,
    plastic: PlasticMaterial,
};
export function resolvePanelMaterialClassProperty(input) {
    if (typeof input != 'string') {
        return input;
    }
    return materialClasses[input];
}
export function computedPanelGroupDependencies(properties) {
    return computed(() => {
        return {
            panelMaterialClass: resolvePanelMaterialClassProperty(properties.value.panelMaterialClass),
            castShadow: properties.value.castShadow,
            receiveShadow: properties.value.receiveShadow,
            depthWrite: properties.value.depthWrite ?? false,
            depthTest: properties.value.depthTest,
            renderOrder: properties.value.renderOrder,
        };
    });
}
export class PanelGroupManager {
    root;
    object;
    map = new Map();
    constructor(root, object) {
        this.root = root;
        this.object = object;
    }
    init(abortSignal) {
        const onFrame = () => this.traverse((group) => group.onFrame());
        this.root.onFrameSet.add(onFrame);
        abortSignal.addEventListener('abort', () => {
            this.root.onFrameSet.delete(onFrame);
            this.traverse((group) => group.destroy());
        });
    }
    traverse(fn) {
        for (const groups of this.map.values()) {
            for (const group of groups.values()) {
                fn(group);
            }
        }
    }
    getGroup({ majorIndex, minorIndex }, properties) {
        const materialClass = resolvePanelMaterialClassProperty(properties.panelMaterialClass);
        let groups = this.map.get(materialClass);
        if (groups == null) {
            this.map.set(materialClass, (groups = new Map()));
        }
        const key = [
            majorIndex,
            minorIndex,
            properties.renderOrder,
            properties.depthTest,
            properties.depthWrite,
            properties.receiveShadow,
            properties.castShadow,
        ].join(',');
        let panelGroup = groups.get(key);
        if (panelGroup == null) {
            groups.set(key, (panelGroup = new InstancedPanelGroup(this.object, this.root, {
                elementType: ElementType.Panel,
                minorIndex,
                majorIndex,
                patchIndex: 0,
            }, properties)));
        }
        return panelGroup;
    }
}
const nextFrame = Symbol('nextFrame');
export class InstancedPanelGroup {
    object;
    root;
    orderInfo;
    panelGroupProperties;
    mesh;
    instanceMatrix;
    instanceData;
    instanceClipping;
    instanceMaterial;
    buckets = [];
    elementCount = 0;
    bufferElementSize = 0;
    instanceDataOnUpdate;
    nextUpdateTime;
    nextUpdateTimeoutRef;
    activateElement = (element, bucket, indexInBucket) => {
        const index = bucket.offset + indexInBucket;
        this.instanceData.set(element.materialConfig.defaultData, 16 * index);
        this.instanceData.addUpdateRange(16 * index, 16);
        this.instanceData.needsUpdate = true;
        element.activate(bucket, indexInBucket);
    };
    setElementIndex = (element, index) => {
        element.setIndexInBucket(index);
    };
    bufferCopyWithin = (targetIndex, startIndex, endIndex) => {
        copyWithinAttribute(this.instanceMatrix, targetIndex, startIndex, endIndex);
        copyWithinAttribute(this.instanceData, targetIndex, startIndex, endIndex);
        copyWithinAttribute(this.instanceClipping, targetIndex, startIndex, endIndex);
    };
    clearBufferAt = (index) => {
        //hiding the element by writing a 0 matrix (0 scale ...)
        const bufferOffset = index * 16;
        this.instanceMatrix.array.fill(0, bufferOffset, bufferOffset + 16);
        this.instanceMatrix.addUpdateRange(bufferOffset, 16);
        this.instanceMatrix.needsUpdate = true;
    };
    constructor(object, root, orderInfo, panelGroupProperties) {
        this.object = object;
        this.root = root;
        this.orderInfo = orderInfo;
        this.panelGroupProperties = panelGroupProperties;
        const materialClass = resolvePanelMaterialClassProperty(panelGroupProperties.panelMaterialClass);
        this.instanceMaterial = createPanelMaterial(materialClass, { type: 'instanced' });
        this.instanceMaterial.depthTest = panelGroupProperties.depthTest;
        this.instanceMaterial.depthWrite = panelGroupProperties.depthWrite;
    }
    updateCount() {
        const lastBucket = this.buckets[this.buckets.length - 1];
        const count = lastBucket.offset + lastBucket.elements.length;
        if (this.mesh == null) {
            return;
        }
        this.mesh.count = count;
        this.mesh.visible = count > 0;
        this.root.requestRender?.();
    }
    requestUpdate(time) {
        if (this.nextUpdateTime == nextFrame) {
            return;
        }
        const forTime = performance.now() + time;
        if (this.nextUpdateTime != null && this.nextUpdateTime < forTime) {
            return;
        }
        this.nextUpdateTime = forTime;
        clearTimeout(this.nextUpdateTimeoutRef);
        this.nextUpdateTimeoutRef = setTimeout(this.requestUpdateNextFrame.bind(this), time);
    }
    requestUpdateNextFrame() {
        this.nextUpdateTime = nextFrame;
        clearTimeout(this.nextUpdateTimeoutRef);
        this.nextUpdateTimeoutRef = undefined;
        this.root.requestFrame?.();
    }
    insert(bucketIndex, panel) {
        this.elementCount += 1;
        if (!addToSortedBuckets(this.buckets, bucketIndex, panel, this.activateElement)) {
            this.updateCount();
            return;
        }
        this.requestUpdateNextFrame();
    }
    delete(bucketIndex, elementIndex, panel) {
        this.elementCount -= 1;
        if (!removeFromSortedBuckets(this.buckets, bucketIndex, panel, elementIndex, this.activateElement, this.clearBufferAt, this.setElementIndex, this.bufferCopyWithin)) {
            //update count already requests a render
            this.updateCount();
            return;
        }
        this.root.requestRender?.();
        this.requestUpdate(1000); //request update in 1 second
    }
    onFrame() {
        if (this.nextUpdateTime != nextFrame) {
            return;
        }
        this.nextUpdateTime = undefined;
        this.update();
    }
    update() {
        if (this.elementCount === 0) {
            if (this.mesh != null) {
                this.mesh.visible = false;
            }
            return;
        }
        //buffer is resized to have space for 150% of the actually needed elements
        if (this.elementCount > this.bufferElementSize) {
            //buffer is to small to host the current elements
            this.resize();
            //we need to execute updateSortedBucketsAllocation after resize so that updateSortedBucketsAllocation has enough space to arrange all the elements
            updateSortedBucketsAllocation(this.buckets, this.activateElement, this.bufferCopyWithin);
        }
        else if (this.elementCount <= this.bufferElementSize / 3) {
            //we need to execute updateSortedBucketsAllocation first, so we still have access to the elements in the space that will be removed by the resize
            //TODO: this could be improved since now we are re-arraging in place and then copying. we could rearrange while copying. Not sure if faster though?
            updateSortedBucketsAllocation(this.buckets, this.activateElement, this.bufferCopyWithin);
            //buffer is at least 300% bigger than the needed space
            this.resize();
        }
        else {
            updateSortedBucketsAllocation(this.buckets, this.activateElement, this.bufferCopyWithin);
        }
        this.mesh.count = this.elementCount;
        this.mesh.visible = true;
    }
    resize() {
        const oldBufferSize = this.bufferElementSize;
        this.bufferElementSize = Math.ceil(this.elementCount * 1.5);
        if (this.mesh != null) {
            this.mesh.dispose();
            this.object.remove(this.mesh);
        }
        resizeSortedBucketsSpace(this.buckets, oldBufferSize, this.bufferElementSize);
        const matrixArray = new Float32Array(this.bufferElementSize * 16);
        if (this.instanceMatrix != null) {
            matrixArray.set(this.instanceMatrix.array.subarray(0, matrixArray.length));
        }
        this.instanceMatrix = new InstancedBufferAttribute(matrixArray, 16, false);
        this.instanceMatrix.setUsage(DynamicDrawUsage);
        const dataArray = new Float32Array(this.bufferElementSize * 16);
        if (this.instanceData != null) {
            dataArray.set(this.instanceData.array.subarray(0, dataArray.length));
        }
        this.instanceData = new InstancedBufferAttribute(dataArray, 16, false);
        this.instanceDataOnUpdate = (start, count) => {
            this.instanceData.addUpdateRange(start, count);
            this.instanceData.needsUpdate = true;
        };
        this.instanceData.setUsage(DynamicDrawUsage);
        const clippingArray = new Float32Array(this.bufferElementSize * 16);
        if (this.instanceClipping != null) {
            clippingArray.set(this.instanceClipping.array.subarray(0, clippingArray.length));
        }
        this.instanceClipping = new InstancedBufferAttribute(clippingArray, 16, false);
        this.instanceClipping.setUsage(DynamicDrawUsage);
        this.mesh = new InstancedPanelMesh(this.root, this.instanceMatrix, this.instanceData, this.instanceClipping);
        this.mesh.renderOrder = this.panelGroupProperties.renderOrder;
        setupRenderOrder(this.mesh, { peek: () => this.root }, { value: this.orderInfo });
        this.mesh.material = this.instanceMaterial;
        this.mesh.receiveShadow = this.panelGroupProperties.receiveShadow;
        this.mesh.castShadow = this.panelGroupProperties.castShadow;
        this.object.addUnsafe(this.mesh);
    }
    destroy() {
        clearTimeout(this.nextUpdateTimeoutRef);
        if (this.mesh == null) {
            return;
        }
        this.object.remove(this.mesh);
        this.mesh?.dispose();
        this.instanceMaterial.dispose();
    }
}
function copyWithinAttribute(attribute, targetIndex, startIndex, endIndex) {
    const itemSize = attribute.itemSize;
    const start = startIndex * itemSize;
    const end = endIndex * itemSize;
    const target = targetIndex * itemSize;
    attribute.array.copyWithin(target, start, end);
    const count = end - start;
    attribute.addUpdateRange(start, count);
    attribute.addUpdateRange(target, count);
    attribute.needsUpdate = true;
}
