import { Material, Mesh, MeshBasicMaterial, ShapeGeometry, Vector3 } from 'three';
import { Content } from './content.js';
import { computed, signal } from '@preact/signals-core';
import { abortableEffect, loadResourceWithParams } from '../utils.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
export class Svg extends Content {
    constructor(inputProperties, initialClasses, config) {
        const boundingBox = signal(undefined);
        super(inputProperties, initialClasses, {
            ...config,
            remeasureOnChildrenChange: false,
            depthWriteDefault: false,
            supportFillProperty: true,
            boundingBox,
        });
        const svgResult = signal(undefined);
        loadResourceWithParams(svgResult, loadSvg, disposeSvg, this.abortSignal, computed(() => ({
            src: this.properties.value.src,
            content: this.properties.value.content,
        })));
        abortableEffect(() => {
            const result = svgResult.value;
            boundingBox.value = result?.boundingBox;
            if (result == null || result.meshes.length === 0) {
                this.notifyAncestorsChanged();
                return;
            }
            super.add(...result.meshes);
            this.notifyAncestorsChanged();
            return () => {
                super.remove(...result.meshes);
            };
        }, this.abortSignal);
    }
}
const loader = new SVGLoader();
const svgCache = new Map();
async function loadSvg({ src, content, }) {
    if (src == null && content == null) {
        return undefined;
    }
    let result;
    if (src != null) {
        let promise = svgCache.get(src);
        if (promise == null) {
            svgCache.set(src, (promise = loader.loadAsync(src)));
        }
        result = (await promise);
    }
    else {
        result = loader.parse(content);
    }
    const meshes = [];
    for (const path of result.paths) {
        const shapes = SVGLoader.createShapes(path);
        const material = new MeshBasicMaterial({ color: path.color, toneMapped: false });
        for (const shape of shapes) {
            const mesh = new Mesh(new ShapeGeometry(shape), material);
            mesh.matrixAutoUpdate = false;
            mesh.scale.y = -1;
            mesh.updateMatrix();
            meshes.push(mesh);
        }
    }
    let boundingBox;
    const viewBoxNumbers = result.xml
        .getAttribute('viewBox')
        ?.split(/\s+/)
        .map((s) => Number.parseFloat(s))
        .filter((value) => !isNaN(value));
    if (viewBoxNumbers?.length === 4) {
        const [minX, minY, width, height] = viewBoxNumbers;
        boundingBox = {
            center: new Vector3(width / 2 + minX, -height / 2 - minY, 0),
            size: new Vector3(width, height, 0.00001),
        };
    }
    return { meshes, boundingBox };
}
function disposeSvg(result) {
    result?.meshes.forEach((mesh) => {
        if (mesh.material instanceof Material) {
            mesh.material.dispose();
        }
        mesh.geometry.dispose();
    });
}
