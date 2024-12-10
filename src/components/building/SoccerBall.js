import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { TextureLoader } from 'three';

export const SoccerBall = ({ position = [0, 1, 0] }) => {
  const ballRef = useRef();
  const textureMap = useLoader(TextureLoader, '/images/soccer-ball.jpg');
  
  // 공 회전 상태 추적
  const rotationSpeed = useRef({ x: 0, y: 0, z: 0 });
  
  useFrame(() => {
    if (!ballRef.current) return;
    
    // 현재 공의 선속도 가져오기
    const velocity = ballRef.current.linvel();
    
    // 속도에 따른 회전 계산
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    rotationSpeed.current.x = velocity.z * 0.5;
    rotationSpeed.current.z = -velocity.x * 0.5;
    
    // 회전 적용
    ballRef.current.rotation.x += rotationSpeed.current.x * 0.1;
    ballRef.current.rotation.z += rotationSpeed.current.z * 0.1;
  });

  // 공을 찰 때의 힘 계산
  const handleKick = (force) => {
    if (!ballRef.current) return;
    
    // 캐릭터의 방향을 기준으로 힘 적용
    ballRef.current.applyImpulse({
      x: force.x,
      y: force.y,
      z: force.z
    });
  };

  return (
    <RigidBody
      ref={ballRef}
      position={position}
      restitution={0.8} // 탄성 (튀는 정도)
      friction={0.2} // 마찰 (구르는 정도)
      linearDamping={0.5} // 선형 감속
      angularDamping={0.2} // 회전 감속
      colliders="ball"
      mass={1} // 공의 질량
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.3, 32, 32]} /> {/* 반지름 0.4 미터의 공 */}
        <meshStandardMaterial 
          map={textureMap}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
    </RigidBody>
  );
};