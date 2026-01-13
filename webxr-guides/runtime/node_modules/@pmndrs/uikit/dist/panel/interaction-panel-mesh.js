import { Matrix4, Plane, Sphere, Vector2, Vector3 } from 'three';
import { clamp } from 'three/src/math/MathUtils.js';
import { abortableEffect, computeWorldToGlobalMatrix } from '../utils.js';
const planeHelper = new Plane();
const vectorHelper = new Vector3();
const sphereHelper = new Sphere();
const matrixHelper = new Matrix4();
const worldToGlobalMatrixHelper = new Matrix4();
export function makePanelSpherecast(root, globalSphereWithLocalScale, globalPanelMatrixSignal, object) {
    return (sphere, intersects) => {
        root.peek().component.updateMatrix();
        computeWorldToGlobalMatrix(root.peek(), worldToGlobalMatrixHelper);
        sphereHelper.copy(globalSphereWithLocalScale).applyMatrix4(worldToGlobalMatrixHelper);
        if (!sphereHelper.intersectsSphere(sphere)) {
            return;
        }
        object.updateMatrixWorld(true);
        vectorHelper.copy(sphere.center).applyMatrix4(matrixHelper.copy(object.matrixWorld).invert());
        vectorHelper.x = clamp(vectorHelper.x, -0.5, 0.5);
        vectorHelper.y = clamp(vectorHelper.y, -0.5, 0.5);
        vectorHelper.z = 0;
        const uv = new Vector2(vectorHelper.x, vectorHelper.y);
        vectorHelper.applyMatrix4(object.matrixWorld);
        const distance = sphere.center.distanceTo(vectorHelper);
        if (distance > sphere.radius) {
            return;
        }
        intersects.push({
            distance,
            object,
            point: vectorHelper.clone(),
            uv,
            normal: new Vector3(0, 0, 1),
        });
    };
}
const IdentityMatrix = new Matrix4();
export function setupBoundingSphere(target, pixelSize, globalMatrixSignal, size, abortSignal) {
    abortableEffect(() => {
        const sizeValue = size.value;
        const globalMatrix = globalMatrixSignal.value;
        if (sizeValue == null || globalMatrix == null) {
            return;
        }
        target.center.set(0, 0, 0);
        const [w, h] = sizeValue;
        const maxDiameter = Math.sqrt(w * w + h * h);
        target.radius = maxDiameter * 0.5 * pixelSize.value;
        target.applyMatrix4(globalMatrix);
    }, abortSignal);
}
/**
 * clips the sphere / raycast
 * also marks the mesh as a interaction panel
 */
export function makeClippedCast(component, fn, root, parent, orderInfoSignal) {
    return (raycaster, intersects) => {
        const oldLength = intersects.length;
        const fnResult = fn.call(component, raycaster, intersects);
        if (oldLength === intersects.length) {
            return fnResult;
        }
        const orderInfo = orderInfoSignal.peek();
        if (orderInfo == null) {
            return fnResult;
        }
        const clippingPlanes = parent.peek()?.clippingRect?.peek()?.planes;
        root.peek().component.updateMatrix();
        computeWorldToGlobalMatrix(root.peek(), worldToGlobalMatrixHelper);
        outer: for (let i = intersects.length - 1; i >= oldLength; i--) {
            const intersection = intersects[i];
            intersection.distance -=
                orderInfo.majorIndex * 0.01 +
                    orderInfo.minorIndex * 0.0001 + //1-100
                    orderInfo.elementType * 0.00001 + //1-10
                    orderInfo.patchIndex * 0.0000001; //1-100
            if (clippingPlanes == null) {
                continue;
            }
            for (let ii = 0; ii < 4; ii++) {
                planeHelper.copy(clippingPlanes[ii]).applyMatrix4(worldToGlobalMatrixHelper);
                if (planeHelper.distanceToPoint(intersection.point) < 0) {
                    intersects.splice(i, 1);
                    continue outer;
                }
            }
        }
        return fnResult;
    };
}
