import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const ExtendedFloor = ({ marbleTexture }) => (
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
);