// src/components/OtherPlayer.js
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Billboard, Text } from '@react-three/drei';
import { Clone } from '@react-three/drei';
export const OtherPlayer = ({ position, nickname, currentAnimation = 'Stop', rotation = 0 ,modelPath}) => {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);
  const [currentAnim, setCurrentAnim] = useState('Stop');

  // 캐릭터별 오프셋 설정
  const MODEL_OFFSETS = {
    '/models/character1.glb': { scale: 0.0125, height: 1.6, col: 1.5, nameTagHeight: 1.3 },
    '/models/character2.glb': { scale: 0.0125, height: 1.65, col: 1.4, nameTagHeight: 1.4 },
    '/models/character3.glb': { scale: 0.0120, height: 1.95, col: 1.7, nameTagHeight: 1.4 },
    '/models/character4.glb': { scale: 0.0110, height: 1.7, col: 1.5, nameTagHeight: 1.4 },
    '/models/character5.glb': { scale: 0.0100, height: 1.85, col: 1.6, nameTagHeight: 1.4 },
    '/models/character6.glb': { scale: 0.0125, height: 1.7, col: 1.5, nameTagHeight: 1.4 }
  };
 
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

  const modelOffset = MODEL_OFFSETS[modelPath] || { scale: 0.0125, height: 0.73, nameTagHeight: 0.9 };

  // 닉네임 태그의 최종 높이 계산
  const nameTagPosition = modelOffset.height + modelOffset.nameTagHeight;

  return (
    <group position={position}>
      <primitive 
        object={scene}
        ref={group}
        scale={[modelOffset.scale, modelOffset.scale, modelOffset.scale]}
        rotation={[0, Number(rotation) + Math.PI, 0]}  // Math.PI 추가하여 180도 회전
        position={[0, modelOffset.height, 0]} // 모델 위치 조정
      />
      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
        position={[0, nameTagPosition, 0]}
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
// 모든 캐릭터 모델 프리로드
const characterModels = [
  '/models/character1.glb',
  '/models/character2.glb',
  '/models/character3.glb',
  '/models/character4.glb',
  '/models/character5.glb',
  '/models/character6.glb'
];

characterModels.forEach(model => {
  useGLTF.preload(model);
});