import * as THREE from 'three';

export const getTargetPosition = (position) => {
  return new THREE.Vector3(position[0], position[1] + 1.2, position[2]);
};

export const getTargetRotation = (rotation) => {
  return Number(rotation) + Math.PI;
};