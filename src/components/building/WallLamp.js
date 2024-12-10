import React from 'react';
import { MeshStandardMaterial } from 'three';

export const WallLamp = ({ position }) => {
  const glowMaterial = new MeshStandardMaterial({
    color: '#FFF5E1',
    emissive: '#FFF5E1',
    emissiveIntensity: 3,
    toneMapped: false
  });

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#696969" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <mesh position={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 0.3, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.6} 
          roughness={0.3}
          emissive="#FFD700"
          emissiveIntensity={1}
        />
      </mesh>
      
      <spotLight
        position={[0.3, 0, 0]}
        target-position={[1, 0, 0]}
        angle={Math.PI / 3}
        penumbra={0.8}
        intensity={3}
        distance={10}
        color="#FFF5E1"
        castShadow
        power={20}
        decay={1.5}
      />
      
      <pointLight
        position={[0.3, 0, 0]}
        intensity={1}
        distance={5}
        color="#FFF5E1"
        castShadow={false}
        decay={2}
      />
      
      <mesh position={[0.2, -0.2, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={glowMaterial.clone()} />
      </mesh>

      {[0.15, 0.2, 0.25].map((size, i) => (
        <mesh key={i} position={[0.2, -0.3, 0]}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial 
            color="#FFF5E1" 
            transparent={true} 
            opacity={0.15 - i * 0.03}
            blending={2}
          />
        </mesh>
      ))}
    </group>
  );
};