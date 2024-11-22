// src/components/building/Ceiling.js
import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Ceiling = ({ ceilingTexture }) => (
  <>
    <RigidBody type="fixed" friction={0.5} colliders="cuboid" restitution={0}>
      <mesh position={[0, 9.8, 0]}>
        <boxGeometry args={[50, 0.3, 50]} />
        <meshStandardMaterial map={ceilingTexture} />
      </mesh>
    </RigidBody>
    
    <spotLight
      position={[0, 9, 0]}
      angle={Math.PI / 4}
      penumbra={0.5}
      intensity={2}
      castShadow
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />

    <pointLight position={[-10, 8, -5]} intensity={1} color="#ffffff" castShadow />
    <pointLight position={[10, 8, -5]} intensity={1} color="#ffffff" castShadow />
    <ambientLight intensity={0.6} />
  </>
);