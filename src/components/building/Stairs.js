// src/components/building/Stairs.js
import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Stairs = ({ woodTexture }) => {
  const stairPositions = [
    { y: 1.5, z: 15 },
    { y: 3, z: 9 },
    { y: 4.5, z: 3 },
    { y: 6, z: -3 },
    { y: 7.5, z: -9 },
    { y: 9, z: -15 }
  ];

  return (
    <>
      {stairPositions.map((pos, index) => (
        <RigidBody key={index} type="fixed" position={[-27, pos.y, pos.z]} colliders="cuboid">
          <mesh castShadow>
            <boxGeometry args={[2.5, 0.3, 6]} />
            <meshStandardMaterial map={woodTexture} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
};