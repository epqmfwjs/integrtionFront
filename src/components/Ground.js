import React, { useEffect, useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';

export const Ground = ({ onGroundReady }) => {
  // 텍스처 로딩
  const grassNormalMap = useLoader(TextureLoader, '/images/grass_normal.jpg');
  const wallTexture = useLoader(TextureLoader, '/images/wall.jpg');

  // 텍스처 설정
  const textures = useMemo(() => {
    [grassNormalMap, wallTexture].forEach(texture => {
      texture.wrapS = texture.wrapT = RepeatWrapping;
    });

    grassNormalMap.repeat.set(5, 5);
    wallTexture.repeat.set(10, 1);

    return { grassNormalMap, wallTexture };
  }, [grassNormalMap, wallTexture]);

  // 재질 정의
  const materials = useMemo(() => ({
    grass: {
      map: textures.grassNormalMap,
      normalMap: textures.grassNormalMap,
      normalScale: [0.1, 0.1],
      roughness: 0.8,
      metalness: 0,
      envMapIntensity: 0.5
    },
    wall: {
      map: textures.wallTexture,
      roughness: 0.7,
      metalness: 0.1,
      color: "#e0e0e0"
    }
  }), [textures]);

  // 벽 데이터
  const wallsData = useMemo(() => [
    { position: [0, 2, 50], rotation: [0, 0, 0], id: 'front' },
    { position: [0, 2, -50], rotation: [0, 0, 0], id: 'back' },
    { position: [-50, 2, 0], rotation: [0, Math.PI / 2, 0], id: 'left' },
    { position: [50, 2, 0], rotation: [0, Math.PI / 2, 0], id: 'right' }
  ], []);

  // 벽 메시 생성
  const walls = useMemo(() => 
    wallsData.map(({ position, rotation, id }) => (
      <mesh 
        key={id}
        position={position} 
        rotation={rotation} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[100, 4, 1]} />
        <meshStandardMaterial {...materials.wall} />
      </mesh>
    )), 
  [wallsData, materials.wall]);

  // 벽 콜라이더
  const wallColliders = useMemo(() => [
    { args: [50, 2, 0.5], position: [0, 2, 50], id: 'front-collider' },
    { args: [50, 2, 0.5], position: [0, 2, -50], id: 'back-collider' },
    { args: [0.5, 2, 50], position: [-50, 2, 0], id: 'left-collider' },
    { args: [0.5, 2, 50], position: [50, 2, 0], id: 'right-collider' }
  ], []);

  useEffect(() => {
    if (onGroundReady) {
      console.log('Ground textures loaded, calling onGroundReady');
      onGroundReady();
    }
  }, [onGroundReady]);

  return (
    <group>
      {/* 안전 바닥 */}
      <RigidBody type="fixed">
        <CuboidCollider 
          args={[100, 0.5, 100]} 
          position={[0, -10, 0]} 
          sensor 
          restitution={0}
          friction={1}
        />
      </RigidBody>

      {/* 메인 바닥 */}
      <RigidBody type="fixed" friction={1}>
        <CuboidCollider 
          args={[50, 0.1, 50]} 
          position={[0, -0.1, 0]} 
          friction={1}
        />
        <mesh 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0, 0]} 
          receiveShadow
        >
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial {...materials.grass} />
        </mesh>
      </RigidBody>

      {/* 벽 */}
      <RigidBody type="fixed" friction={1}>
        {wallColliders.map(({ args, position, id }) => (
          <CuboidCollider 
            key={id}
            args={args}
            position={position}
            friction={1}
            restitution={0.2}
          />
        ))}
        {walls}
      </RigidBody>
    </group>
  );
};