import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const ThirdPersonCamera = ({ target }) => {
  const { camera } = useThree();
  
  // 카메라 상태 refs
  const rotationAngle = useRef(Math.PI);
  const verticalAngle = useRef(0);
  const currentDistance = useRef(5);
  const isRightMouseDown = useRef(false);
  const isTouchJoystickActive = useRef(false);
  const smoothedTarget = useRef([0, 0, 0]);
  const lastValidTarget = useRef([0, 0, 0]);

  // 모바일 감지
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 카메라 설정
  const cameraSettings = {
    minDistance: isMobile ? 4 : 2,
    maxDistance: isMobile ? 15 : 10,
    defaultDistance: isMobile ? 7 : 7,
    height: isMobile ? 6 : 5,
    rotationSpeed: 0.003,
    verticalRotationSpeed: 0.003,
    smoothness: 0.1,
    zoomSpeed: 0.1,
    minVerticalAngle: -Math.PI / 3,
    maxVerticalAngle: Math.PI / 3,
    positionSmoothing: 0.1,    // 위치 보간 속도
    lookAtSmoothing: 0.15      // 시점 보간 속도
  };

  // 초기 거리 설정
  currentDistance.current = cameraSettings.defaultDistance;

  useEffect(() => {
    const handleCtrlKey = (e) => {
      if (e.key === 'Control') {
        if (document.pointerLockElement) {
          document.exitPointerLock();
        } else {
          document.body.requestPointerLock();
        }
      }
    };

    const handleMouseMove = (e) => {
      if (document.pointerLockElement || isRightMouseDown.current) {
        rotationAngle.current -= e.movementX * cameraSettings.rotationSpeed;
        verticalAngle.current = THREE.MathUtils.clamp(
          verticalAngle.current + e.movementY * cameraSettings.verticalRotationSpeed,
          cameraSettings.minVerticalAngle,
          cameraSettings.maxVerticalAngle
        );
      }
    };

    const handleMouseDown = (e) => {
      if (e.button === 2) {
        isRightMouseDown.current = true;
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        isRightMouseDown.current = false;
      }
    };

    const handleWheel = (e) => {
      const zoomFactor = cameraSettings.zoomSpeed;
      let newDistance = currentDistance.current;
      
      if (e.deltaY > 0) {
        newDistance = Math.min(
          newDistance + (newDistance * zoomFactor),
          cameraSettings.maxDistance
        );
      } else {
        newDistance = Math.max(
          newDistance - (newDistance * zoomFactor),
          cameraSettings.minDistance
        );
      }
      
      currentDistance.current = newDistance;
    };

    let lastTouchX = 0;
    let lastTouchY = 0;
    let touchStartTime = 0;
    const TOUCH_DURATION_THRESHOLD = 100; // 터치 지속 시간 임계값

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
      touchStartTime = Date.now();
    };

    const handleTouchMove = (e) => {
      if (isTouchJoystickActive.current) return;
      
      // 터치 지속 시간이 임계값을 초과한 경우에만 카메라 회전
      if (Date.now() - touchStartTime > TOUCH_DURATION_THRESHOLD) {
        const touch = e.touches[0];
        const movementX = touch.clientX - lastTouchX;
        const movementY = touch.clientY - lastTouchY;
        
        rotationAngle.current -= movementX * cameraSettings.rotationSpeed * 0.5;
        verticalAngle.current = THREE.MathUtils.clamp(
          verticalAngle.current + movementY * cameraSettings.verticalRotationSpeed * 0.5,
          cameraSettings.minVerticalAngle,
          cameraSettings.maxVerticalAngle
        );

        lastTouchX = touch.clientX;
        lastTouchY = touch.clientY;
      }
    };

    const handleJoystickState = (e) => {
      isTouchJoystickActive.current = e.detail.isActive;
    };

    const preventDefault = (e) => e.preventDefault();

    // 이벤트 리스너 등록
    window.addEventListener('joystickState', handleJoystickState);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('keydown', handleCtrlKey);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('joystickState', handleJoystickState);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('keydown', handleCtrlKey);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [cameraSettings.rotationSpeed, cameraSettings.verticalRotationSpeed]);

  useFrame(() => {
    if (!target) return;

    // 타겟 위치 유효성 검사
    const isValidPosition = !target.some(coord => isNaN(coord));
    const currentTarget = isValidPosition ? target : lastValidTarget.current;

    if (isValidPosition) {
      lastValidTarget.current = currentTarget;
    }

    // 타겟 위치 부드럽게 보간
    smoothedTarget.current = smoothedTarget.current.map((coord, i) => {
      return coord + (currentTarget[i] - coord) * cameraSettings.positionSmoothing;
    });

    // 수평거리와 수직거리 계산
    const horizontalDistance = Math.cos(verticalAngle.current) * currentDistance.current;
    const verticalDistance = Math.sin(verticalAngle.current) * currentDistance.current;

    // 카메라의 목표 위치 계산
    const targetPosition = new THREE.Vector3(
      smoothedTarget.current[0] - Math.sin(rotationAngle.current) * horizontalDistance,
      smoothedTarget.current[1] + cameraSettings.height + verticalDistance,
      smoothedTarget.current[2] - Math.cos(rotationAngle.current) * horizontalDistance
    );

    // 현재 lookAt 위치를 보간
    const currentLookAt = new THREE.Vector3(
      smoothedTarget.current[0],
      smoothedTarget.current[1] + 1,
      smoothedTarget.current[2]
    );

    // 카메라 위치와 시점 부드럽게 업데이트
    camera.position.lerp(targetPosition, cameraSettings.smoothness);
    
    // 현재 카메라가 바라보는 방향과 목표 방향을 보간
    const currentDirection = new THREE.Vector3();
    camera.getWorldDirection(currentDirection);
    
    const targetDirection = currentLookAt.clone().sub(camera.position).normalize();
    const interpolatedDirection = currentDirection.lerp(targetDirection, cameraSettings.lookAtSmoothing);
    
    camera.lookAt(
      camera.position.x + interpolatedDirection.x,
      camera.position.y + interpolatedDirection.y,
      camera.position.z + interpolatedDirection.z
    );
  });

  return null;
};