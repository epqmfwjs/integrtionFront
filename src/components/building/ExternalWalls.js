import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text } from '@react-three/drei';

export const ExternalWalls = ({ ceilingTexture }) => (
  <RigidBody type="fixed" colliders="cuboid">
    <mesh position={[0, 5, -25]} castShadow>
      <boxGeometry args={[50, 12, 1]} />
      <meshStandardMaterial map={ceilingTexture} />
    </mesh>
    
    <group position={[0, 6, -24.4]}>
      <Text position={[0, 2, 0]} scale={[0.8, 0.8, 0.8]} color="black" anchorX="center" anchorY="middle">
        조작 방법
      </Text>
      <Text position={[0, 1, 0]} scale={[0.5, 0.5, 0.5]} color="black" anchorX="center" anchorY="middle">
        이동: W A S D
      </Text>
      <Text position={[0, 0.2, 0]} scale={[0.5, 0.5, 0.5]} color="black" anchorX="center" anchorY="middle">
        점프: Space Bar
      </Text>
      <Text position={[0, -0.6, 0]} scale={[0.5, 0.5, 0.5]} color="black" anchorX="center" anchorY="middle">
        Shift 키 : 전력질주 
      </Text>
      <Text position={[0, -1.4, 0]} scale={[0.5, 0.5, 0.5]} color="black" anchorX="center" anchorY="middle">
        Ctrl 키 : 마우스모드 액션모드 변경
      </Text>
    </group>

    <mesh position={[25, 10, 0]} castShadow>
      <boxGeometry args={[1, 2, 51]} />
      <meshStandardMaterial map={ceilingTexture} />
    </mesh>

    <mesh position={[0, 0.2, 25]} castShadow>
      <boxGeometry args={[50, 1, 1]} />
      <meshStandardMaterial map={ceilingTexture} />
    </mesh>
    
    <mesh position={[0, 10, 25]} castShadow>
      <boxGeometry args={[50, 2, 1]} />
      <meshStandardMaterial map={ceilingTexture} />
    </mesh>

    <mesh position={[0, 5, 25]} castShadow>
      <boxGeometry args={[50, 10, 0.1]} />
      <meshPhysicalMaterial 
        transparent={true}
        opacity={0.3}
        metalness={0.9}
        roughness={0.1}
        clearcoat={1}
        reflectivity={1}
        color="#88ccff"
      />
    </mesh>
  </RigidBody>
);