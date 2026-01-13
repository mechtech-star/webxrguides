import { computed } from '@preact/signals-core';
import { PanelGroupManager } from './panel/instanced-panel-group.js';
import { abortableEffect, alignmentXMap, alignmentYMap } from './utils.js';
import { Matrix4 } from 'three';
import { GlyphGroupManager } from './text/render/instanced-glyph-group.js';
export function buildRootContext(component, renderContext) {
    const root = computed(() => component.parentContainer.value == null
        ? createRootContext(component, renderContext)
        : component.parentContainer.value.root.value);
    abortableEffect(() => {
        if (root.value.component != component) {
            return;
        }
        const abortController = new AbortController();
        root.value.glyphGroupManager.init(abortController.signal);
        root.value.panelGroupManager.init(abortController.signal);
        root.value.requestCalculateLayout = createDeferredRequestLayoutCalculation(root.value, component);
        const onFrame = () => void (root.value.reversePainterSortStableCache = undefined);
        root.value.onFrameSet.add(onFrame);
        abortController.signal.addEventListener('abort', () => root.value.onFrameSet.delete(onFrame));
        return () => abortController.abort();
    }, component.abortSignal);
    return root;
}
function createRootContext(component, renderContext) {
    const ctx = {
        isUpdateRunning: false,
        onFrameSet: new Set(),
        requestFrame: renderContext?.requestFrame,
        requestRender() {
            if (ctx.isUpdateRunning) {
                //request render unnecassary -> while render after updates ran
                return;
            }
            //not updating -> requesting a new frame so we will render after updating
            renderContext?.requestFrame();
        },
        onUpdateMatrixWorldSet: new Set(),
        requestCalculateLayout: () => { },
        component,
    };
    return Object.assign(ctx, {
        glyphGroupManager: new GlyphGroupManager(ctx, component),
        panelGroupManager: new PanelGroupManager(ctx, component),
    });
}
function createDeferredRequestLayoutCalculation(root, component) {
    let requested = true;
    const onFrame = () => {
        if (!requested) {
            return;
        }
        requested = false;
        component.node.calculateLayout();
    };
    root.onFrameSet.add(onFrame);
    component.abortSignal.addEventListener('abort', () => root.onFrameSet.delete(onFrame));
    return () => {
        requested = true;
        root.requestFrame?.();
    };
}
export function buildRootMatrix(properties, size) {
    if (size.value == null) {
        return undefined;
    }
    const [width, height] = size.value;
    const pixelSize = properties.value.pixelSize;
    return new Matrix4().makeTranslation(alignmentXMap[properties.value.anchorX] * width * pixelSize, alignmentYMap[properties.value.anchorY] * height * pixelSize, 0);
}
