import { Intersection, Matrix4, Mesh, Object3D, Sphere, Vector2Tuple } from 'three';
import { Signal } from '@preact/signals-core';
import { OrderInfo } from '../order.js';
import { RootContext } from '../context.js';
import { Container } from '../components/container.js';
import { Component } from '../components/component.js';
export type AllowedPointerEventsType = 'all' | ((poinerId: number, pointerType: string, pointerState: unknown) => boolean) | {
    allow: string | Array<string>;
} | {
    deny: string | Array<string>;
};
declare module 'three' {
    interface Object3D extends PointerEventsProperties {
        spherecast?(sphere: Sphere, intersects: Array<Intersection>): void;
        intersectChildren?: boolean;
        interactableDescendants?: Array<Object3D>;
        ancestorsHaveListeners?: boolean;
        defaultPointerEvents?: PointerEventsProperties['pointerEvents'];
    }
}
export type PointerEventsProperties = {
    pointerEvents?: 'none' | 'auto' | 'listener';
    pointerEventsType?: AllowedPointerEventsType;
    pointerEventsOrder?: number;
};
export declare function makePanelSpherecast(root: Signal<RootContext>, globalSphereWithLocalScale: Sphere, globalPanelMatrixSignal: Signal<Matrix4 | undefined>, object: Object3D): Exclude<Mesh['spherecast'], undefined>;
export declare function setupBoundingSphere(target: Sphere, pixelSize: Signal<number>, globalMatrixSignal: Signal<Matrix4 | undefined>, size: Signal<Vector2Tuple | undefined>, abortSignal: AbortSignal): void;
/**
 * clips the sphere / raycast
 * also marks the mesh as a interaction panel
 */
export declare function makeClippedCast<T extends Mesh['raycast'] | Exclude<Mesh['spherecast'], undefined>>(component: Component, fn: T, root: Signal<RootContext>, parent: Signal<Container | undefined>, orderInfoSignal: Signal<OrderInfo | undefined>): (raycaster: Parameters<T>[0], intersects: Parameters<T>[1]) => unknown;
