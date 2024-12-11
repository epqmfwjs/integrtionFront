import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations, Billboard, Text } from '@react-three/drei';
import ChatBubble from './ChatBubble';

export const OtherPlayer = ({ 
  position, 
  nickname, 
  currentAnimation = 'Stop', 
  rotation = 0,
  modelPath,
  chatMessage
}) => {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);
  const [currentAnim, setCurrentAnim] = useState('Stop');

  // 캐릭터별 오프셋 설정
  const MODEL_OFFSETS = {
    '/models/character1.glb': { scale: 0.0125, height: 1.6, col: 1.5, nameTagHeight: 1.3, chatHeight: 2.0 }, //제이크
    '/models/character2.glb': { scale: 0.0125, height: 1.65, col: 1.4, nameTagHeight: 1.4, chatHeight: 2.1 }, //리사
    '/models/character3.glb': { scale: 0.0120, height: 1.95, col: 1.7, nameTagHeight: 1.4, chatHeight: 2.4 }, //맥스
    '/models/character4.glb': { scale: 0.0110, height: 1.7, col: 1.5, nameTagHeight: 1.4, chatHeight: 2.2 }, //줄리
    '/models/character5.glb': { scale: 0.0100, height: 1.85, col: 1.6, nameTagHeight: 1.4, chatHeight: 2.3 },
    '/models/character6.glb': { scale: 0.0125, height: 1.7, col: 1.5, nameTagHeight: 1.4, chatHeight: 2.2 },
    '/models/character99.glb': { scale: 0, height: 1.3, col: 1.5, chatHeight: 2.2 },//관리자
  };
 
  // 애니메이션 매핑 추가
  const animationMap = {
    'Stop': 'Idle',
    'Running': 'Walk',
    'FastRun': 'Run',
    'StopJump': 'Jump',
    'RunJump': 'JumpRun'
  };

  useEffect(() => {
    if (actions && actions.Idle) {
      actions.Idle.play();
    }
  }, [actions]);

  useEffect(() => {
    if (!actions) return;
    
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
      if (actions.Stop) {
        actions.Stop.play();
      }
    }
  }, [actions, currentAnimation]);

  const modelOffset = MODEL_OFFSETS[modelPath] || { 
    scale: 0.0125, 
    height: 0.73, 
    nameTagHeight: 0.9,
    chatHeight: 1.8 
  };

  const nameTagPosition = modelOffset.height + modelOffset.nameTagHeight;

  return (
    <group position={position}>
      <primitive 
        object={scene}
        ref={group}
        scale={[modelOffset.scale, modelOffset.scale, modelOffset.scale]}
        rotation={[0, Number(rotation) + Math.PI, 0]}
        position={[0, modelOffset.height, 0]}
      />
      
      {/* 닉네임 태그 */}
      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
        position={[0, nameTagPosition, 0]}
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

      {/* 채팅 버블 */}
      {chatMessage && (
        <ChatBubble
          message={chatMessage}
          position={[0, modelOffset.chatHeight, 0]}
          height={0.5}
        />
      )}
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
  '/models/character6.glb',
  '/models/character99.glb'
];

characterModels.forEach(model => {
  useGLTF.preload(model);
});

export default OtherPlayer;