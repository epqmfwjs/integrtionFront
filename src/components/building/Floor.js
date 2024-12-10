import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Floor = ({ marbleTexture }) => (
  <>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[50, 0.2, 50]} />
        <meshStandardMaterial 
          map={marbleTexture}
          metalness={0.2}
          roughness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[50, 0.01, 50]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.1}
          metalness={1}
          roughness={0}
          clearcoat={1}
          reflectivity={1}
        />
      </mesh>
    </RigidBody>
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[-37.5, 0.1, 0]} receiveShadow>
        <boxGeometry args={[25, 0.2, 50]} />
        <meshStandardMaterial 
          map={marbleTexture}
          metalness={0.2}
          roughness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
    </RigidBody>
  </>
);