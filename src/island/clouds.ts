import { each } from 'lodash';
import * as THREE from 'three';

import { WORLD_SIZE } from '../utils/lba';
import { applyLightningUniforms } from './lightning';

export function loadClouds(props, geometries) {
    const threeObject = new THREE.Object3D();
    const cloudGeo = new THREE.PlaneBufferGeometry(600, 600);
    for (let p = 0; p < 50; p += 1) {
        const cloud = new THREE.Mesh(cloudGeo, geometries.clouds.material);
        cloud.onBeforeRender = applyLightningUniforms;
        cloud.position.set(
            p === 0 ? 0 : Math.random() * 1600 - 800,
            WORLD_SIZE * 2 + p - 20,
            p === 0 ? 0 : Math.random() * 1600 - 800
        );
        cloud.rotation.x = Math.PI / 2;
        cloud.renderOrder = 4 + (50 - p);
        threeObject.add(cloud);
    }
    if (props.whiteness) {
        geometries.clouds.material.uniforms.whiteness.value = props.whiteness;
    }
    if (props.opacity) {
        geometries.clouds.material.uniforms.opacity.value = props.opacity;
    }
    const update = (time) => {
        each(threeObject.children, cloud => cloud.rotation.z += props.speed * time.delta);
    };
    return {threeObject, update};
}