// frontend/src/components/world/Ground.js
import React, { useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';

export const Ground = ({ onGroundReady }) => {
  // 텍스처 로드
  const grassTexture = useLoader(TextureLoader, '/images/grass.jpg');
  const grassNormalMap = useLoader(TextureLoader, '/images/grass_normal.jpg');
  const wallTexture = useLoader(TextureLoader, '/images/wall.jpg');
  
  // 텍스처 설정
  [ grassNormalMap, wallTexture].forEach(texture => {
    texture.wrapS = texture.wrapT = RepeatWrapping;
  });
  
  //grassTexture.repeat.set(200, 200);
  grassNormalMap.repeat.set(5, 5);
  wallTexture.repeat.set(10, 1); // 벽 텍스처 반복

  useEffect(() => {
    // 그라운드가 로드되면 콜백 호출
    if (onGroundReady) {
      onGroundReady();
    }
  }, [onGroundReady]);

  return (
    <group>
      {/* 추락 방지용 안전 충돌체 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -10, 0]} visible={false}>
          <boxGeometry args={[200, 1, 200]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* 잔디 바닥 */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            map={grassNormalMap}
            normalMap={grassNormalMap}
            normalScale={[0.1, 0.1]}
            roughness={0.8}
            metalness={0}
            envMapIntensity={0.5}
          />
        </mesh>
      </RigidBody>

      {/* 경계 벽들 */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* 앞쪽 벽 */}
        <mesh position={[0, 2, 50]} castShadow receiveShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial 
            map={wallTexture}
            roughness={0.7}
            metalness={0.1}
            color="#e0e0e0"
          />
        </mesh>
        {/* 뒤쪽 벽 */}
        <mesh position={[0, 2, -50]} castShadow receiveShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial 
            map={wallTexture}
            roughness={0.7}
            metalness={0.1}
            color="#e0e0e0"
          />
        </mesh>
        {/* 왼쪽 벽 */}
        <mesh position={[-50, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial 
            map={wallTexture}
            roughness={0.7}
            metalness={0.1}
            color="#e0e0e0"
          />
        </mesh>
        {/* 오른쪽 벽 */}
        <mesh position={[50, 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[100, 4, 1]} />
          <meshStandardMaterial 
            map={wallTexture}
            roughness={0.7}
            metalness={0.1}
            color="#e0e0e0"
          />
        </mesh>
      </RigidBody>
    </group>
  );
};