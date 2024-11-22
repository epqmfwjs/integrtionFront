// Campfire.js
import React from 'react';

export const Campfire = ({ position }) => {
  return (
    <group position={position}>
      {/* 불꽃 */}
      <group>
        {/* 중앙 불꽃 */}
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.3, 1, 8]} />
          <meshStandardMaterial 
            color="#ff4500"
            emissive="#ff4500"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* 작은 불꽃들 */}
        {[0, 1, 2, 3].map((i) => (
          <mesh 
            key={i} 
            position={[
              Math.sin(i * Math.PI/2) * 0.15,
              -0.1,
              Math.cos(i * Math.PI/2) * 0.15
            ]}
            rotation={[Math.random() * 0.2, 0, Math.random() * 0.2]}
          >
            <coneGeometry args={[0.1, 0.5, 8]} />
            <meshStandardMaterial 
              color="#ffa500"
              emissive="#ffa500"
              emissiveIntensity={2}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>

      {/* 장작 */}
      {[0, 1, 2].map((i) => (
        <mesh 
          key={i}
          position={[0, 0.3, 0]}
          rotation={[0, i * Math.PI/3, 0]}
        >
          <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
          <meshStandardMaterial color="#4a2700" />
        </mesh>
      ))}

      {/* 돌 받침 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI/3) * 0.4,
            -0.1,
            Math.cos(i * Math.PI/3) * 0.4
          ]}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}

      {/* 빛 */}
      <pointLight
        position={[0, 1, 0]}
        color="#ff6b1a"
        intensity={10}
        distance={20}
        decay={1}
      />
    </group>
  );
};