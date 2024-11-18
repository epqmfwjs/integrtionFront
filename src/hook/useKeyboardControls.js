// useKeyboardControls.js
import { useState, useEffect, useRef } from 'react';
import { getChatting } from '../state/chatState';

export const useKeyboardControls = () => {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false,
    kick: false,
  });

  // 상태 추적용 ref 추가
  const lastUpdateRef = useRef(0);
  const lastKickTimeRef = useRef(0);
  const THROTTLE_TIME = 16;
  const KICK_COOLDOWN = 1000;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (getChatting()) return;

      const now = performance.now();
      if (now - lastUpdateRef.current < THROTTLE_TIME) return;
      lastUpdateRef.current = now;

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
          e.preventDefault();
          setMovement(m => ({ ...m, jump: true }));
          break;
        case 'ShiftLeft':
          setMovement(m => ({ ...m, run: true }));
          break;
        case 'KeyF':
          const currentTime = performance.now();
          if (currentTime - lastKickTimeRef.current >= KICK_COOLDOWN) {
            setMovement(m => ({ ...m, kick: true }));
            lastKickTimeRef.current = currentTime;
            
            // 발차기 상태 자동 해제
            setTimeout(() => {
              setMovement(m => ({ ...m, kick: false }));
            }, 500);
          }
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (getChatting()) return;
      
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