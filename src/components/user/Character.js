import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useRapier } from '@react-three/rapier';
import * as THREE from 'three';

const MODEL_OFFSETS = {
  '/models/character1.glb': { scale: 0.0125, height: 1.3, col: 1.5 },
  '/models/character2.glb': { scale: 0.0125, height: 1.35, col: 1.4 },
  '/models/character3.glb': { scale: 0.0120, height: 1.7, col: 1.7 },
  '/models/character4.glb': { scale: 0.0110, height: 1.4, col: 1.5 },
  '/models/character5.glb': { scale: 0.0100, height: 1.6, col: 1.6 },
  '/models/character6.glb': { scale: 0.0125, height: 1.4, col: 1.5 }
};

// 상수 정의
const MOVEMENT_CONFIG = {
  walkSpeed: 10,
  runSpeed: 16,
  maxWalkSpeed: 12,
  maxRunSpeed: 20,
  smoothingWalk: 0.1,
  smoothingRun: 0.15,
  rotationSmoothingWalk: 0.05,
  rotationSmoothingRun: 0.15,
  jumpForce: 0.4,
  kickForce: 15,
  kickRange: 2,
  velocityDamping: 0.8,
  positionSmoothing: 0.2
};

export const Character = ({ position, setPosition, onAnimationChange, modelPath }) => {
  const group = useRef();
  const characterRef = useRef();
  const rigidBodyRef = useRef();
  const movement = useKeyboardControls();
  const { camera } = useThree();
  const lastRotation = useRef(0);
  const { world } = useRapier();
  const lastPosition = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3());
  
  const [currentAnimation, setCurrentAnimation] = useState('Stop');
  const [isKicking, setIsKicking] = useState(false);
  const [canKick, setCanKick] = useState(true);
  const [canJump, setCanJump] = useState(true);
  
  const KICK_COOLDOWN = 1000;
  const JUMP_COOLDOWN = 500;
  const isInitialized = useRef(false);

  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);

  // 리소스 정리
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

  // 애니메이션 처리
  const fadeToAction = useCallback((newAction, duration = 0.5) => {
    if (!actions || currentAnimation === newAction) return;

    if (actions[currentAnimation]) {
      actions[currentAnimation].fadeOut(duration);
    }

    if (actions[newAction]) {
      actions[newAction]
        .reset()
        .setEffectiveTimeScale(1)
        .setEffectiveWeight(1)
        .fadeIn(duration)
        .play();

      setCurrentAnimation(newAction);
      onAnimationChange(newAction);
    }
  }, [actions, currentAnimation, onAnimationChange]);

  // 애니메이션 상태 관리
  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return;

    const isMoving = movement.forward || movement.backward || movement.left || movement.right;
    const isRunning = isMoving && movement.run;
    const isJumping = movement.jump;

    if (movement.kick && canKick && actions['Kick']) {
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
      if (actions[jumpAnim]) {
        fadeToAction(jumpAnim);
      }
    } else if (isRunning && actions['FastRun']) {
      fadeToAction('FastRun');
    } else if (isMoving && actions['Running']) {
      fadeToAction('Running');
    } else if (!isKicking && actions['Stop']) {
      fadeToAction('Stop');
    }
  }, [movement, actions, fadeToAction, canKick]);

  // 초기 애니메이션 설정
  useEffect(() => {
    if (actions && actions.Stop) {
      actions.Stop.play();
      setCurrentAnimation('Stop');
    }
  }, [actions]);

  // 물리 업데이트 및 움직임 처리
  useFrame(() => {
    if (!rigidBodyRef.current) return;

    // 초기화
    if (!isInitialized.current) {
      rigidBodyRef.current.setTranslation({ x: position[0], y: position[1], z: position[2] });
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      isInitialized.current = true;
      lastPosition.current.set(position[0], position[1], position[2]);
    }

    const cameraAngle = Math.atan2(
      camera.position.x - position[0],
      camera.position.z - position[2]
    );

    // 이동 속도 계산
    const moveSpeed = movement.run ? MOVEMENT_CONFIG.runSpeed : MOVEMENT_CONFIG.walkSpeed;
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

    // 속도 제한 및 보간
    const currentVel = rigidBodyRef.current.linvel();
    const maxSpeed = movement.run ? MOVEMENT_CONFIG.maxRunSpeed : MOVEMENT_CONFIG.maxWalkSpeed;
    const currentSpeed = Math.sqrt(currentVel.x * currentVel.x + currentVel.z * currentVel.z);
    
    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed;
      rigidBodyRef.current.setLinvel({
        x: currentVel.x * scale,
        y: currentVel.y,
        z: currentVel.z * scale
      });
    }

    // 이동 및 회전 처리
    if (moveX !== 0 || moveZ !== 0) {
      const smoothing = movement.run ? MOVEMENT_CONFIG.smoothingRun : MOVEMENT_CONFIG.smoothingWalk;
      const targetVel = {
        x: moveX,
        y: currentVel.y,
        z: moveZ
      };
      
      // 속도 보간
      velocity.current.set(
        currentVel.x + (targetVel.x - currentVel.x) * smoothing,
        currentVel.y,
        currentVel.z + (targetVel.z - currentVel.z) * smoothing
      );

      rigidBodyRef.current.setLinvel(velocity.current);

      // 회전 보간
      const angle = Math.atan2(-moveX, -moveZ);
      if (group.current) {
        const currentRotation = group.current.rotation.y;
        const targetRotation = angle;
        const rotationSmoothing = movement.run ? 
          MOVEMENT_CONFIG.rotationSmoothingRun : 
          MOVEMENT_CONFIG.rotationSmoothingWalk;
        
        let rotationDiff = targetRotation - currentRotation;
        if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        group.current.rotation.y += rotationDiff * rotationSmoothing;
        lastRotation.current = group.current.rotation.y;
      }
    } else {
      // 정지 시 감속
      rigidBodyRef.current.setLinvel({
        x: currentVel.x * MOVEMENT_CONFIG.velocityDamping,
        y: currentVel.y,
        z: currentVel.z * MOVEMENT_CONFIG.velocityDamping
      });
    }

    // 발차기 처리
    if (movement.kick && canKick && rigidBodyRef.current) {
      const worldPosition = rigidBodyRef.current.translation();
      
      for (let i = 0; i < world.bodies.size; i++) {
        const body = world.bodies.get(i);
        if (body.userData?.type === 'soccer-ball') {
          const ballPos = body.translation();
          const dx = ballPos.x - worldPosition.x;
          const dz = ballPos.z - worldPosition.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (distance < MOVEMENT_CONFIG.kickRange) {
            const angle = group.current.rotation.y;
            body.applyImpulse({
              x: -Math.sin(angle) * MOVEMENT_CONFIG.kickForce,
              y: MOVEMENT_CONFIG.kickForce * 0.3,
              z: -Math.cos(angle) * MOVEMENT_CONFIG.kickForce
            });
          }
        }
      }
    }

    // 점프 처리
    if (movement.jump && canJump && Math.abs(currentVel.y) < 0.1) {
      rigidBodyRef.current.applyImpulse({ 
        x: 0, 
        y: MOVEMENT_CONFIG.jumpForce, 
        z: 0 
      });
      setCanJump(false);
      setTimeout(() => {
        setCanJump(true);
      }, JUMP_COOLDOWN);
    }

    // 위치 업데이트 및 보간
    const worldPosition = rigidBodyRef.current.translation();
    setPosition([worldPosition.x, worldPosition.y, worldPosition.z]);

    if (group.current) {
      group.current.position.lerp(
        new THREE.Vector3(
          worldPosition.x,
          worldPosition.y + 0.3,
          worldPosition.z
        ),
        MOVEMENT_CONFIG.positionSmoothing
      );
    }

    // 애니메이션 상태 업데이트
    onAnimationChange(currentAnimation, lastRotation.current);
  });

  const modelOffset = MODEL_OFFSETS[modelPath] || { scale: 0.0125, height: 0.73 };

  // 리스폰 처리
  const INITIAL_SPAWN_POSITION = [0, 7, 0];
  const FALL_THRESHOLD = -5;
  const [isSpawning, setIsSpawning] = useState(true);

  const resetToSpawnPosition = useCallback(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation({ 
        x: INITIAL_SPAWN_POSITION[0], 
        y: INITIAL_SPAWN_POSITION[1], 
        z: INITIAL_SPAWN_POSITION[2] 
      });
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 });
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 });
      lastPosition.current.set(
        INITIAL_SPAWN_POSITION[0],
        INITIAL_SPAWN_POSITION[1],
        INITIAL_SPAWN_POSITION[2]
      );
    }
  }, []);

  // 추락 감지 및 리스폰
  useFrame(() => {
    if (!rigidBodyRef.current) return;
    
    const currentPosition = rigidBodyRef.current.translation();
    
    if (currentPosition.y < FALL_THRESHOLD) {
      resetToSpawnPosition();
    }

    if (isSpawning) {
      resetToSpawnPosition();
      setIsSpawning(false);
    }
  });

  return (
    <group>
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        enabledRotations={[false, false, false]}
        enabledTranslations={[true, true, true]}
        mass={1}
        type="dynamic"
        colliders={false}
        lockRotations={true}
        friction={0.2}
        linearDamping={0.95}
        angularDamping={0.95}
        gravityScale={4}
        canSleep={false}
        ccd={true}
        maxVelocity={20}
        solverIterations={30}
        restitution={0}
      >
        <CuboidCollider 
          args={[0.15, 0.125, 0.15]}
          position={[0, modelOffset.col / 2, 0]}
          sensor={false}
          friction={0.5}
        />
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
  '/models/character6.glb',
  '/models/character99.glb'
];

characterModels.forEach(model => {
  useGLTF.preload(model);
});

export default Character;