import { useEffect, useCallback } from 'react';

export const usePointerLock = () => {
  useEffect(() => {
    return () => {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, []);

  const exitPointerLock = useCallback(() => {
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (error) {
        console.error('Error unlocking pointer:', error);
      }
    }
  }, []);

  return { exitPointerLock };
};