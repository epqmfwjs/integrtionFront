import React from 'react';
import { Billboard, Text } from '@react-three/drei';

export const NicknameText = ({ nickname, position }) => {
  if (!nickname) return null;
  
  return (
    <group position={[position[0], position[1] + 3.2, position[2]]}>
      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
        position={[0, 0, 0]}
      >
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial color="white" opacity={0.8} transparent />
        </mesh>
        
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[0.85, 0.20]} />
          <meshBasicMaterial color="black" opacity={0.2} transparent />
        </mesh>

        <Text
          fontSize={0.1}
          color="black"
          anchorX="center"
          anchorY="middle"
          padding={0.05}
        >
          {nickname}
        </Text>
      </Billboard>
    </group>
  );
};