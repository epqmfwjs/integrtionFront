// src/components/Character.js
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useKeyboardControls } from '../hook/useKeyboardControls';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

export const Character = ({ position, setPosition, onAnimationChange }) => {
  const group = useRef();
  const characterRef = useRef();
  const rigidBodyRef = useRef();
  const movement = useKeyboardControls();
  const { camera } = useThree();
  
  // 현재 재생 중인 애니메이션 추적
  const [currentAnimation, setCurrentAnimation] = useState('Stop');
  
  // 모델과 애니메이션 로드
  const { scene, animations } = useGLTF('/models/character.glb');
  const { actions } = useAnimations(animations, group);

  // 점프 쿨다운 상태 추가
  const [canJump, setCanJump] = useState(true);
  const JUMP_COOLDOWN = 500; // 0.5초 (밀리초 단위)

  // 물리 엔진 초기화 확인을 위한 ref 추가
  const isInitialized = useRef(false);

  // 애니메이션 상태 관리
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    // 부드러운 전환 위한 크로스페이딩
    const fadeToAction = (newAction, duration = 0.5) => {
      if (currentAnimation === newAction) return;

      console.log('Character changing animation to:', newAction); // 로그 추가

      // 이전 애니메이션 페이드 아웃
      if (actions[currentAnimation]) {
        actions[currentAnimation].fadeOut(duration);
      }

      // 새 애니메이션 페이드 인
      actions[newAction]
        .reset()
        .setEffectiveTimeScale(1)  // 애니메이션 속도 조절
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();

      setCurrentAnimation(newAction);
      onAnimationChange(newAction);  // 부모 컴포넌트에 알림
    };

    // 움직임 상태 확인
    const isMoving = movement.forward || movement.backward || movement.left || movement.right;
    const isRunning = isMoving && movement.run;
    const isJumping = movement.jump;

    // 애니메이션 상태 결정
    if (isJumping) {
      if (isMoving) {
        fadeToAction('RunJump');  // 움직이면서 점프
      } else {
        fadeToAction('StopJump');  // 제자리 점프
      }
    } else if (isRunning) {
      fadeToAction('FastRun');
    } else if (isMoving) {
      fadeToAction('Running');
    } else {
      fadeToAction('Stop');
    }

  }, [movement, actions, currentAnimation, onAnimationChange]);

  // 초기 애니메이션 설정
  useEffect(() => {
    if (actions && actions.Stop) {
      actions.Stop.play();
      setCurrentAnimation('Stop');
    }
  }, [actions]);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    // 초기화 직후 한 번만 실행
    if (!isInitialized.current) {
      rigidBodyRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] });
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      isInitialized.current = true;
    }

    const cameraAngle = Math.atan2(
      camera.position.x - position[0],
      camera.position.z - position[2]
    );

    const walkSpeed = 12;
    const runSpeed = 24;
    const moveSpeed = movement.run ? runSpeed : walkSpeed;
    
    let moveX = 0;
    let moveZ = 0;

    // 이동 방향 계산
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

    // 최대 속도 제한 추가
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

    // 이동 및 회전 적용
    if (moveX !== 0 || moveZ !== 0) {
      // 속도 변화를 더 부드럽게
      const smoothing = movement.run ? 0.15 : 0.10; // 달리기 시 더 빠른 반응성
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

      // 회전도 더 부드럽게 - 달리기 시 더 빠른 회전
      const angle = Math.atan2(-moveX, -moveZ);
      if (group.current) {
        const currentRotation = group.current.rotation.y;
        const targetRotation = angle;
        const rotationSmoothing = movement.run ? 0.15 : 0.05; // 달리기 시 회전 속도 증가
        
        // 최단 경로로 회전하기
        let rotationDiff = targetRotation - currentRotation;
        if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        group.current.rotation.y += rotationDiff * rotationSmoothing;
        
        // 회전 정보도 전달
        onAnimationChange(currentAnimation, group.current.rotation.y);
      }
    } else {
      // 정지 시에도 부드럽게
      rigidBodyRef.current.setLinvel({
        x: currentVel.x * 0.8, // 점진적으로 감속
        y: currentVel.y,
        z: currentVel.z * 0.8
      });
    }

    // 점프 처리 추가
    if (movement.jump && canJump && Math.abs(currentVel.y) < 0.1) {
      rigidBodyRef.current.applyImpulse({ x: 0, y: 0.40, z: 0 });
      
      // 점프 쿨다운 시작
      setCanJump(false);
      setTimeout(() => {
        setCanJump(true);
      }, JUMP_COOLDOWN);
    }

    // 위치 업데이트를 더 부드럽게
    const worldPosition = rigidBodyRef.current.translation();
    setPosition([worldPosition.x, worldPosition.y, worldPosition.z]);

    if (group.current) {
      const positionSmoothing = 0.1; // 위치 부드러움
      group.current.position.x += (worldPosition.x - group.current.position.x) * positionSmoothing;
      group.current.position.y += (worldPosition.y + 0.3 - group.current.position.y) * positionSmoothing;
      group.current.position.z += (worldPosition.z - group.current.position.z) * positionSmoothing;
    }
  });

  return (
    <group>
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        enabledRotations={[false, false, false]}
        enabledTranslations={[true, true, true]} // 모든 축 이동 활성화
        mass={2}
        type="dynamic"
        colliders={false}
        lockRotations={true}
        friction={0.2}
        linearDamping={1.5}
        gravityScale={5}
        canSleep={false}
        ccd={true}
        maxVelocity={25}
        solverIterations={40}
        restitution={0}
        velocityThreshold={0.5}
      >
        <CuboidCollider 
          args={[0.15, 0.125, 0.15]} // 가로와 세로를 조금 더 크게
          position={[0, 0.25, 0]}
          sensor={false}
          friction={0.5} // 마찰력 증가
        />
      </RigidBody>
      
      <group ref={group}>
        <primitive 
          ref={characterRef}
          object={scene} 
          scale={[0.0125, 0.0125, 0.0125]}
          rotation={[0, Math.PI, 0]}
          position={[0, 0.73, 0]}
          frustumCulled={true}
          matrixAutoUpdate={true}
        />
      </group>
    </group>
  );
};

// 모델 프리로드
useGLTF.preload('/models/character.glb');