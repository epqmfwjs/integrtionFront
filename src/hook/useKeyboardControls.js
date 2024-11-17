// src/hooks/useKeyboardControls.js
import { useState, useEffect } from 'react';

export const useKeyboardControls = () => {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false,
  });

  // 마지막 업데이트 시간 추적
  let lastUpdate = 0;
  const THROTTLE_TIME = 16; // 약 60fps에 해당 (1000ms / 60)

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 현재 시간 확인
      const now = performance.now();
      
      // 마지막 업데이트로부터 충분한 시간이 지났는지 확인
      if (now - lastUpdate < THROTTLE_TIME) {
        return;
      }
      
      lastUpdate = now;

      switch (e.code) {
        case 'KeyW':
          setMovement(m => ({ ...m, forward: true }));
          break;
        case 'KeyS':
          setMovement(m => ({ ...m, backward: true }));
          break;
        case 'KeyA':
          setMovement(m => ({ ...m, left: true }));
          break;
        case 'KeyD':
          setMovement(m => ({ ...m, right: true }));
          break;
        case 'Space':
          setMovement(m => ({ ...m, jump: true }));
          break;
        case 'ShiftLeft':
          setMovement(m => ({ ...m, run: true }));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
          setMovement(m => ({ ...m, forward: false }));
          break;
        case 'KeyS':
          setMovement(m => ({ ...m, backward: false }));
          break;
        case 'KeyA':
          setMovement(m => ({ ...m, left: false }));
          break;
        case 'KeyD':
          setMovement(m => ({ ...m, right: false }));
          break;
        case 'Space':
          setMovement(m => ({ ...m, jump: false }));
          break;
        case 'ShiftLeft':
          setMovement(m => ({ ...m, run: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
};