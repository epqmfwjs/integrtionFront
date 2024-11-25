import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3인칭 시점 카메라 컴포넌트
 * @param {Array} target - 카메라가 따라갈 대상의 위치 [x, y, z]
 */
export const ThirdPersonCamera = ({ target }) => {
  // Three.js의 카메라 객체를 가져옴
  const { camera } = useThree();
  
  // 카메라의 현재 상태를 저장하는 ref들
  const rotationAngle = useRef(Math.PI); // 수평 회전 각도 (라디안)
  const verticalAngle = useRef(0);       // 수직 회전 각도 (라디안)
  const currentDistance = useRef(5);      // 카메라와 타겟 사이의 현재 거리
  const isLocked = useRef(false);         // 마우스 포인터 잠금 상태
  const isRightMouseDown = useRef(false);  // 오른쪽 마우스 버튼 상태 추가
  const isTouchJoystickActive = useRef(false); // 조이스틱 활성화 상태 추가

  // 모바일 감지 추가
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // 카메라 설정값들
  const cameraSettings = {
    minDistance: isMobile ? 4 : 2,          // 모바일일 때 최소 거리 증가
    maxDistance: isMobile ? 15 : 10,        // 모바일일 때 최대 거리 증가
    defaultDistance: isMobile ? 7 : 7,      // 모바일일 때 기본 거리 증가
    height: isMobile ? 6 : 5,              // 모바일일 때 높이 증가
    rotationSpeed: 0.003,    // 수평 회전 속도
    verticalRotationSpeed: 0.003, // 수직 회전 속도
    smoothness: 0.3,        // 카메라 움직임 부드러움 (0-1)
    zoomSpeed: 0.1,         // 줌 속도를 더 크게 조정
    minVerticalAngle: -Math.PI / 3, // 최소 수직 각도 (-60도)
    maxVerticalAngle: Math.PI / 3   // 최대 수직 각도 (60도)
  };

  // 초기 거리 설정
  currentDistance.current = cameraSettings.defaultDistance;

  useEffect(() => {
    /**
     * Ctrl 키 핸들러
     * 포인터 락 상태를 토글합니다
     */
    const handleCtrlKey = (e) => {
      if (e.key === 'Control') {
        if (document.pointerLockElement) {
          document.exitPointerLock();
        } else {
          document.body.requestPointerLock();
        }
      }
    };

    /**
     * 마우스 이동 핸들러
     * 포인터락 모드 또는 오른쪽 마우스 클릭 상태에서만 카메라 회전
     */
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

    /**
     * 마우스 버튼 이벤트 핸들러 추가
     */
    const handleMouseDown = (e) => {
      if (e.button === 2) { // 오른쪽 마우스 버튼
        isRightMouseDown.current = true;
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        isRightMouseDown.current = false;
      }
    };

    /**
     * 컨텍스트 메뉴 방지
     */
    const preventDefault = (e) => {
      e.preventDefault();
    };

    /**
     * 클릭 위치 확인을 위한 핸들러
     */
    const handleClick = (e) => {
      // console.log('클릭 위치 - 화면 좌표:', {
      //   x: e.clientX,
      //   y: e.clientY
      // });
      // console.log('클릭 위치 - 페이지 좌표:', {
      //   x: e.pageX,
      //   y: e.pageY
      // });
      // console.log('클릭 위치 - 화면 기준 비율:', {
      //   x: (e.clientX / window.innerWidth).toFixed(2),
      //   y: (e.clientY / window.innerHeight).toFixed(2)
      // });
    };

    /**
     * 포인터 잠금 상태 변경 핸들러
     */
    const handleLockChange = () => {
      isLocked.current = !!document.pointerLockElement;
    };

  /**
   * 마우스 휠 핸들러
   * 줌 인/아웃 처리
   */
  const handleWheel = (e) => {
    // 줌 속도 조절
    const zoomFactor = 0.1; // 줌 속도를 더 세밀하게 조절

    // 현재 거리 계산
    let newDistance = currentDistance.current;
    
    if (e.deltaY > 0) {
      // 줌 아웃 (휠 아래로)
      newDistance = Math.min(
        newDistance + (newDistance * zoomFactor),
        cameraSettings.maxDistance
      );
    } else {
      // 줌 인 (휠 위로)
      newDistance = Math.max(
        newDistance - (newDistance * zoomFactor),
        cameraSettings.minDistance
      );
    }

    // 새로운 거리 적용
    currentDistance.current = newDistance;
  };

    let lastTouchX = 0;
    let lastTouchY = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    };

    const handleTouchMove = (e) => {
      // 조이스틱 사용 중에는 카메라 회전 비활성화
      if (isTouchJoystickActive.current) return;

      const touch = e.touches[0];
      const movementX = touch.clientX - lastTouchX;
      const movementY = touch.clientY - lastTouchY;
      
      rotationAngle.current -= movementX * cameraSettings.rotationSpeed;
      verticalAngle.current = THREE.MathUtils.clamp(
        verticalAngle.current + movementY * cameraSettings.verticalRotationSpeed,
        cameraSettings.minVerticalAngle,
        cameraSettings.maxVerticalAngle
      );

      lastTouchX = touch.clientX;
      lastTouchY = touch.clientY;
    };

    // 조이스틱 상태 이벤트 리스너 추가
    const handleJoystickState = (e) => {
      isTouchJoystickActive.current = e.detail.isActive;
    };
    window.addEventListener('joystickState', handleJoystickState);

    // 터치 이벤트 리스너 추가
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);

    // 이벤트 리스너 등록
    document.addEventListener('keydown', handleCtrlKey);  // ESC -> Ctrl로 변경
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('wheel', handleWheel, { passive: false });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('keydown', handleCtrlKey);  // ESC -> Ctrl로 변경
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('wheel', handleWheel, { passive: false });
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('joystickState', handleJoystickState);
    };
  }, []);

  /**
   * 매 프레임마다 카메라 위치 업데이트
   */
  useFrame(() => {
    if (!target) return;

    // 수평거리와 수직거리 계산 (구면 좌표계 사용)
    const horizontalDistance = Math.cos(verticalAngle.current) * currentDistance.current;
    const verticalDistance = Math.sin(verticalAngle.current) * currentDistance.current;

    // 타겟을 중심으로 카메라의 새로운 위치 계산
    const targetPosition = new THREE.Vector3(
      target[0] - Math.sin(rotationAngle.current) * horizontalDistance,
      target[1] + cameraSettings.height + verticalDistance,
      target[2] - Math.cos(rotationAngle.current) * horizontalDistance
    );

    // 카메라 위치를 부드럽게 업데이트
    camera.position.lerp(targetPosition, cameraSettings.smoothness);
    // 카메라가 항상 타겟을 바라보도록 설정
    camera.lookAt(target[0], target[1] + 1, target[2]);
  });

  return null; // React 컴포넌트는 null을 반환 (시각적 요소 없음)
};