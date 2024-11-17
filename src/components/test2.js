// src/components/OtherPlayer.js
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Billboard, Text } from '@react-three/drei';
import { Clone } from '@react-three/drei';
export const OtherPlayer = ({ position, nickname, currentAnimation = 'Stop', rotation = 0 }) => {
  const group = useRef();
  const { scene, animations } = useGLTF('/models/character2.glb');
  const { actions } = useAnimations(animations, group);
  const [currentAnim, setCurrentAnim] = useState('Stop');
  
  // 애니메이션 매핑 추가
  const animationMap = {
    'Stop': 'Idle',
    'Running': 'Walk',
    'FastRun': 'Run',
    'StopJump': 'Jump',
    'RunJump': 'JumpRun'
  };
  // 초기 애니메이션 설정을 위한 useEffect 추가
  useEffect(() => {
    if (actions && actions.Idle) {
      actions.Idle.play();
    }
  }, [actions]);
  useEffect(() => {
    if (!actions) return;
    
    console.log('OtherPlayer animation changing to:', currentAnimation);
    // 이전 애니메이션들 중지
    Object.values(actions).forEach(action => action?.stop());
    // 새 애니메이션 시작
    if (actions[currentAnimation]) {
      actions[currentAnimation]
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(0.5)
        .play();
    } else {
      console.warn('Animation not found:', currentAnimation);
      // 기본 애니메이션으로 폴백
      if (actions.Stop) {
        actions.Stop.play();
      }
    }
  }, [actions, currentAnimation]);
  useEffect(() => {
    console.log('OtherPlayer received rotation:', rotation); // 디버깅용
  }, [rotation]);
  return (
    <group position={position}>
      <primitive 
        object={scene}
        ref={group}
        scale={[0.0125, 0.0125, 0.0125]}
        rotation={[0, Number(rotation) + Math.PI, 0]}  // Math.PI 추가하여 180도 회전
        position={[0, 1.2, 0]}   // 0.73에서 1.0으로 높이 조정
      />
      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
        position={[0, 2.5, 0]}
      >
        {/* 메인 배경 */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial 
            color="white" 
            opacity={0.8} 
            transparent
          />
        </mesh>
        
        {/* 테두리 효과 */}
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
    </group>
  );
};
useGLTF.preload('/models/character2.glb');