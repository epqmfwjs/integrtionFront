import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const InnerWalls = ({ wallsTexture }) => (
  <RigidBody type="fixed" colliders="cuboid">
    <mesh position={[10, 3, -5]} castShadow>
      <boxGeometry args={[0.5, 6, 15]} />
      <meshStandardMaterial map={wallsTexture} />
    </mesh>
  </RigidBody>
);