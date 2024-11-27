// Campfire.js
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Campfire = ({ position }) => {
  const flameRef = useRef();
  const sparklesRef = useRef();
  const lightRef = useRef();

  const SCALE_FACTOR = 2.5; // 전체적인 크기 조정 계수

  // 불꽃 파티클 시스템
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      temp.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2 * SCALE_FACTOR,
          Math.random() * 0.5 * SCALE_FACTOR,
          (Math.random() - 0.5) * 0.2 * SCALE_FACTOR
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          Math.random() * 0.02 + 0.02,
          (Math.random() - 0.5) * 0.01
        ),
        lifetime: Math.random() * 1 + 0.5
      });
    }
    return temp;
  }, []);

  // 애니메이션 프레임
  useFrame((state, delta) => {
    // 불꽃 움직임
    if (flameRef.current) {
      flameRef.current.rotation.y += delta * 2;
      flameRef.current.scale.x = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
      flameRef.current.scale.z = 1 + Math.cos(state.clock.elapsedTime * 10) * 0.1;
    }

    // 빛 강도 변화
    if (lightRef.current) {
      lightRef.current.intensity = 8 + Math.sin(state.clock.elapsedTime * 5) * 2;
    }

    // 파티클 업데이트
    particles.forEach(particle => {
      particle.position.add(particle.velocity);
      particle.lifetime -= delta;
      if (particle.lifetime < 0) {
        particle.position.set(
          (Math.random() - 0.5) * 0.2,
          0,
          (Math.random() - 0.5) * 0.2
        );
        particle.lifetime = Math.random() * 1 + 0.5;
      }
    });
  });

  return (
    <group position={position}>
      {/* 메인 불꽃 */}
      <group ref={flameRef}>
        <mesh position={[0, 0.4, 0]}>
          <coneGeometry args={[0.3 * SCALE_FACTOR, 0.8 * SCALE_FACTOR, 8]}/>
          <meshStandardMaterial 
            color="#ff4500"
            emissive="#ff4500"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* 파티클 시스템 */}
      <points ref={sparklesRef}>
        <bufferGeometry>
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={particles.length}
            array={new Float32Array(particles.length * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#ffa500"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 장작 */}
      {[0, 1, 2].map((i) => (
        <mesh 
          key={i}
          position={[0, 0.3, 0]}
          rotation={[0, i * Math.PI/3, 0]}
        >
          <cylinderGeometry args={[0.05 * SCALE_FACTOR, 0.05 * SCALE_FACTOR, 0.5 * SCALE_FACTOR, 6]}  />
          <meshStandardMaterial color="#4a2700" />
        </mesh>
      ))}

      {/* 돌 받침 */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * Math.PI/3) * 0.4 * SCALE_FACTOR,
            -0.1 * SCALE_FACTOR,
            Math.cos(i * Math.PI/3) * 0.4 * SCALE_FACTOR
          ]}
        >
          <sphereGeometry args={[0.15 * SCALE_FACTOR, 8, 8]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}

      {/* 깜박이는 빛 */}
      <pointLight
        ref={lightRef}
        position={[0, 1 * SCALE_FACTOR, 0]}
        color="#ff6b1a"
        intensity={15}
        distance={30}
        decay={1}
      />
    </group>
  );
};