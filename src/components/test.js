import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Billboard, Text, Clone } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

export const OtherPlayer = ({ position, nickname, currentAnimation = 'Stop', rotation = 0 }) => {
  const group = useRef();
  const modelRef = useRef();
  const { scene, animations } = useGLTF('/models/character2.glb');
  const actions = useRef({});
  
  // scene과 mixer를 동시에 관리
  const [sceneAndMixer] = useState(() => {
    const clonedScene = clone(scene);  // SkeletonUtils.clone 대신 clone 직접 사용
    return {
      scene: clonedScene,
      mixer: new THREE.AnimationMixer(clonedScene)
    };
  });
  
  const cloneKey = `player-${nickname}-${position.join(',')}`;

// 모든 애니메이션 액션 초기화
useEffect(() => {
  if (modelRef.current && animations.length) {
    console.log(`${nickname}의 사용 가능한 애니메이션 목록:`, 
      animations.map(anim => anim.name)
    );

    animations.forEach((animation) => {
      const action = sceneAndMixer.mixer.clipAction(animation);
      // 기본 설정
      action.setLoop(THREE.LoopRepeat); // 모든 애니메이션 반복 설정
      action.clampWhenFinished = false;
      // 가중치와 타임스케일 설정
      action.setEffectiveWeight(1);
      action.setEffectiveTimeScale(1);
      
      actions.current[animation.name] = action;

      // Stop 애니메이션 자동 시작
      if (animation.name === 'Stop') {
        action.play();
      }
    });
  }
}, [animations, sceneAndMixer, nickname]);

// 애니메이션 변경 처리
useEffect(() => {
  if (actions.current) {
    // 현재 실행 중인 모든 액션 중지
    Object.values(actions.current).forEach(action => {
      if (action.isRunning()) {
        console.log(`실행 중이던 애니메이션: ${action._clip.name}`);
        action.fadeOut(0.2); // 페이드 아웃 시간을 좀 더 짧게
        action.stop();
      }
    });

    // 새 애니메이션 시작
    const newAction = actions.current[currentAnimation];
    if (newAction) {
      console.log(`새로 시작하는 애니메이션: ${newAction._clip.name}`);
      newAction
        .reset()
        .setLoop(THREE.LoopRepeat)
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.2) // 페이드 인 시간도 좀 더 짧게
        .play();
    }
  }
}, [currentAnimation]);

  useFrame((_, delta) => {
    sceneAndMixer.mixer.update(delta);
  });

  useEffect(() => {
    if (group.current) {
      const targetY = position[1] + 1.2;
      group.current.position.lerp(
        new THREE.Vector3(position[0], targetY, position[2]),
        0.3
      );
    }
  }, [position]);

  return (
    <>
      <group 
        ref={group}
        rotation={[0, Number(rotation) + Math.PI, 0]}
        position={[position[0], position[1] + 1.2, position[2]]}
      >
        <Clone 
          ref={modelRef}
          object={sceneAndMixer.scene}
          scale={[0.0125, 0.0125, 0.0125]}
          castShadow
          receiveShadow
          key={cloneKey}
          visible={true}
        />
      </group>

      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
        position={[position[0], position[1] + 2.5, position[2]]}
      >
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial 
            color="white" 
            opacity={0.8} 
            transparent
          />
        </mesh>
        
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[0.85, 0.20]} />
          <meshBasicMaterial 
            color="black" 
            opacity={0.2} 
            transparent
          />
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
    </>
  );
};

useGLTF.preload('/models/character2.glb');