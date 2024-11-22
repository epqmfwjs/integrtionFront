// src/components/Character.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import {  useRapier } from '@react-three/rapier';

const MODEL_OFFSETS = {
  '/models/character1.glb': { scale: 0.0125, height: 1.3, col: 1.5 },
  '/models/character2.glb': { scale: 0.0125, height: 1.35, col: 1.4 },
  '/models/character3.glb': { scale: 0.0120, height: 1.7, col: 1.7 },
  '/models/character4.glb': { scale: 0.0110, height: 1.4, col: 1.5 },
  '/models/character5.glb': { scale: 0.0100, height: 1.6, col: 1.6 },
  '/models/character6.glb': { scale: 0.0125, height: 1.4, col: 1.5 }
};

export const Character = ({ position, setPosition, onAnimationChange, modelPath }) => {
  const group = useRef();
  const characterRef = useRef();
  const rigidBodyRef = useRef();
  const movement = useKeyboardControls();
  const { camera } = useThree();
  const lastRotation = useRef(0);
  const { world } = useRapier();
  
  const [currentAnimation, setCurrentAnimation] = useState('Stop');
  const [isKicking, setIsKicking] = useState(false);
  const [canKick, setCanKick] = useState(true);
  const [canJump, setCanJump] = useState(true);
  
  const KICK_COOLDOWN = 1000;
  const JUMP_COOLDOWN = 500;
  const isInitialized = useRef(false);

  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    return () => {
      if (scene) {
        scene.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }, [modelPath, scene]);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const fadeToAction = (newAction, duration = 0.5) => {
      if (currentAnimation === newAction) return;

      if (actions[currentAnimation]) {
        actions[currentAnimation].fadeOut(duration);
      }

      actions[newAction]
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();

      setCurrentAnimation(newAction);
      onAnimationChange(newAction);
    };

    const isMoving = movement.forward || movement.backward || movement.left || movement.right;
    const isRunning = isMoving && movement.run;
    const isJumping = movement.jump;

    if (movement.kick && canKick && actions['Kick']) {  // Kick 애니메이션 존재 확인
      setIsKicking(true);
      setCanKick(false);
      fadeToAction('Kick', 0.2);
      
      setTimeout(() => {
        setIsKicking(false);
        fadeToAction(isMoving ? (isRunning ? 'FastRun' : 'Running') : 'Stop');
      }, 500);
  
      setTimeout(() => {
        setCanKick(true);
      }, KICK_COOLDOWN);
      
    } else if (isJumping) {
      const jumpAnim = isMoving ? 'RunJump' : 'StopJump';
      if (actions[jumpAnim]) {  // 점프 애니메이션 존재 확인
        fadeToAction(jumpAnim);
      }
    } else if (isRunning && actions['FastRun']) {  // FastRun 애니메이션 존재 확인
      fadeToAction('FastRun');
    } else if (isMoving && actions['Running']) {  // Running 애니메이션 존재 확인
      fadeToAction('Running');
    } else if (!isKicking && actions['Stop']) {  // Stop 애니메이션 존재 확인
      fadeToAction('Stop');
    }
  }, [movement, actions, currentAnimation, onAnimationChange, isKicking, canKick]);

  useEffect(() => {
    if (actions && actions.Stop) {
      actions.Stop.play();
      setCurrentAnimation('Stop');
    }
  }, [actions]);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    if (!isInitialized.current) {
      rigidBodyRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] });
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      isInitialized.current = true;
    }


    const cameraAngle = Math.atan2(
      camera.position.x - position[0],
      camera.position.z - position[2]
    );

    const walkSpeed = 10;
    const runSpeed = 16;
    const moveSpeed = movement.run ? runSpeed : walkSpeed;
    
    let moveX = 0;
    let moveZ = 0;

    if (movement.forward) {
      moveX -= Math.sin(cameraAngle) * moveSpeed;
      moveZ -= Math.cos(cameraAngle) * moveSpeed;
    }
    if (movement.backward) {
      moveX += Math.sin(cameraAngle) * moveSpeed;
      moveZ += Math.cos(cameraAngle) * moveSpeed;
    }
    if (movement.left) {
      moveX -= Math.cos(cameraAngle) * moveSpeed;
      moveZ += Math.sin(cameraAngle) * moveSpeed;
    }
    if (movement.right) {
      moveX += Math.cos(cameraAngle) * moveSpeed;
      moveZ -= Math.sin(cameraAngle) * moveSpeed;
    }

    const currentVel = rigidBodyRef.current.linvel();
    const maxSpeed = movement.run ? 24 : 12;
    const currentSpeed = Math.sqrt(currentVel.x * currentVel.x + currentVel.z * currentVel.z);
    
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      rigidBodyRef.current.setLinvel({
        x: currentVel.x * scale,
        y: currentVel.y,
        z: currentVel.z * scale
      });
    }

    if (moveX !== 0 || moveZ !== 0) {
      const smoothing = movement.run ? 0.15 : 0.10;
      const targetVel = {
        x: moveX,
        y: currentVel.y,
        z: moveZ
      };
      
      rigidBodyRef.current.setLinvel({
        x: currentVel.x + (targetVel.x - currentVel.x) * smoothing,
        y: currentVel.y,
        z: currentVel.z + (targetVel.z - currentVel.z) * smoothing
      });

      const angle = Math.atan2(-moveX, -moveZ);
      if (group.current) {
        const currentRotation = group.current.rotation.y;
        const targetRotation = angle;
        const rotationSmoothing = movement.run ? 0.15 : 0.05;
        
        let rotationDiff = targetRotation - currentRotation;
        if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        group.current.rotation.y += rotationDiff * rotationSmoothing;
        lastRotation.current = group.current.rotation.y;
      }
      onAnimationChange(currentAnimation, lastRotation.current);
    } else {
      onAnimationChange(currentAnimation, lastRotation.current); 
      rigidBodyRef.current.setLinvel({
        x: currentVel.x * 0.8,
        y: currentVel.y,
        z: currentVel.z * 0.8
      });
    }

    // 발차기 처리
    if (movement.kick && canKick && rigidBodyRef.current) {
      const worldPosition = rigidBodyRef.current.translation();
      const kickRange = 2;
      const kickForce = 15;
      
      for (let i = 0; i < world.bodies.size; i++) {
        const body = world.bodies.get(i);
        const bodyUserData = body.userData;
        
        if (bodyUserData?.type === 'soccer-ball') {
          const ballPos = body.translation();
          const dx = ballPos.x - worldPosition.x;
          const dz = ballPos.z - worldPosition.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (distance < kickRange) {
            const angle = group.current.rotation.y;
            body.applyImpulse({
              x: -Math.sin(angle) * kickForce,
              y: kickForce * 0.3,
              z: -Math.cos(angle) * kickForce
            });
          }
        }
      }
    }

    if (movement.jump && canJump && Math.abs(currentVel.y) < 0.1) {
      rigidBodyRef.current.applyImpulse({ x: 0, y: 0.40, z: 0 });
      setCanJump(false);
      setTimeout(() => {
        setCanJump(true);
      }, JUMP_COOLDOWN);
    }

    const worldPosition = rigidBodyRef.current.translation();
    setPosition([worldPosition.x, worldPosition.y, worldPosition.z]);

    if (group.current) {
      const positionSmoothing = 0.3;
      group.current.position.x += (worldPosition.x - group.current.position.x) * positionSmoothing;
      group.current.position.y += (worldPosition.y + 0.3 - group.current.position.y) * positionSmoothing;
      group.current.position.z += (worldPosition.z - group.current.position.z) * positionSmoothing;
    }
  });

  const modelOffset = MODEL_OFFSETS[modelPath] || { scale: 0.0125, height: 0.73 };

  const INITIAL_SPAWN_POSITION = [0, 7, 0];
  const FALL_THRESHOLD = -5; // 추락 임계값
  const [isSpawning, setIsSpawning] = useState(true);

  // 안전한 스폰 위치로 리셋
  const resetToSpawnPosition = useCallback(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation({ 
        x: INITIAL_SPAWN_POSITION[0], 
        y: INITIAL_SPAWN_POSITION[1], 
        z: INITIAL_SPAWN_POSITION[2] 
      });
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 });
    }
  }, []);

  // 추락 감지 및 리스폰
  useFrame(() => {
    if (!rigidBodyRef.current) return;
    
    const currentPosition = rigidBodyRef.current.translation();
    
    // 추락 감지
    if (currentPosition.y < FALL_THRESHOLD) {
      console.log("Character fell below threshold, respawning...");
      resetToSpawnPosition();
    }

    // 초기 스폰시 위치 설정
    if (isSpawning) {
      resetToSpawnPosition();
      setIsSpawning(false);
    }
  });

  return (
    <group>
      <RigidBody
        ref={rigidBodyRef}        // 물리 객체 참조용 ref
        position={position}       // 초기 위치
        enabledRotations={[false, false, false]}    // x,y,z 축 회전 비활성화
        enabledTranslations={[true, true, true]}    // x,y,z 축 이동 활성화
        mass={2}                 // 물체의 질량 (무게감)
        type="dynamic"           // 물리 영향을 받는 동적 객체
        colliders={false}        // 기본 충돌체 비활성화 (커스텀 콜라이더 사용)
        lockRotations={true}     // 회전 잠금 (캐릭터 안정성)
        friction={0.2}           // 마찰력 (미끄러움 정도)
        linearDamping={0.5}        // 선형 감쇠 (움직임 저항)
        gravityScale={5}         // 중력 영향도
        canSleep={false}        // 물리 연산 항상 활성화
        ccd={true}              // 연속 충돌 감지 (빠른 움직임 처리)
        maxVelocity={25}        // 최대 이동 속도
        solverIterations={80}   // 물리 연산 정확도
        restitution={0}         // 탄성 (튀어오름 정도)
        velocityThreshold={0.5} // 속도 임계값 (최소 움직임 감지)
      >
      <CuboidCollider 
        args={[0.15, 0.125, 0.15]}
        position={[0, modelOffset.col / 2, 0]}
        sensor={false}
        friction={0.5}
      />

      {/* 물리엔진 시각화 */}
      {/* <mesh position={[0, modelOffset.col / 2, 0]}>
        <boxGeometry args={[0.3, 0.25, 0.3]} /> 
        <meshBasicMaterial 
          color="red" 
          wireframe={true}
          transparent={true}
          opacity={0.5}
        />
      </mesh> */}
      </RigidBody>
      
      <group ref={group}>
        {scene && (
          <primitive 
            ref={characterRef}
            object={scene} 
            scale={[modelOffset.scale, modelOffset.scale, modelOffset.scale]}
            rotation={[0, Math.PI, 0]}
            position={[0, modelOffset.height, 0]}
            frustumCulled={true}
            matrixAutoUpdate={true}
          />
        )}
      </group>
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