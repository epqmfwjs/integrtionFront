import React, { useState } from 'react';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

export const ProjectFrame = ({ 
  position, 
  title, 
  description, 
  texture, 
  handleMeshClick, 
  handlePointerOver, 
  handlePointerOut,
  modalInfo 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const { scale } = useSpring({
    scale: isHovered ? 1.1 : 1,
    config: { tension: 300, friction: 10 },
  });

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      <Text
        position={[0, 1, 0]}
        scale={[0.3, 0.3, 0.3]}
        color="black"
        anchorX="center"
        anchorY="bottom"
      >
        {title}
      </Text>
      {/* 설명 텍스트 */}
      <Text
        position={[1, 0, 0]}
        scale={[0.1, 0.1, 0.1]}
        color="black"
        anchorX="left"
        anchorY="middle"
        maxWidth={2}
      >
        {description}
      </Text>

      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[1.7, 1.7, 0.1]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      <animated.mesh
        position={[0, 0, 0]}
        scale={scale}
        onClick={(e) => handleMeshClick(e, { ...modalInfo, position })}
        onPointerOver={(e) => {
          setIsHovered(true);
          handlePointerOver(e);
        }}
        onPointerOut={(e) => {
          setIsHovered(false);
          handlePointerOut(e);
        }}
      >
        <planeGeometry args={[1.5, 1.5]} />
        <meshBasicMaterial map={texture} />
      </animated.mesh>
    </group>
  );
};