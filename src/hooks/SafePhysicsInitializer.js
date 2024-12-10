import { useState, useEffect } from 'react';
import { useRapier } from '@react-three/rapier';
import React from 'react';

export const useSafePhysicsSpawn = (initialPosition = [0, 0, 0]) => {
  const [isPhysicsReady, setPhysicsReady] = useState(false);
  const [safePosition, setSafePosition] = useState(initialPosition);

  return { 
    isPhysicsReady, 
    setPhysicsReady,
    safePosition, 
    setSafePosition 
  };
};

export const PhysicsInitializer = ({ position, setPhysicsReady, setSafePosition }) => {
  const { rapier, world } = useRapier();

  useEffect(() => {
    let mounted = true;

    const initializePhysics = async () => {
      if (!world || !rapier) return;

      // 지면 감지를 위한 레이캐스트 설정
      const rayOrigin = { x: position[0], y: 20, z: position[2] };
      const rayDir = { x: 0, y: -1, z: 0 };
      
      let groundHit = null;
      let attempts = 0;
      const maxAttempts = 10;

      while (mounted && !groundHit && attempts < maxAttempts) {
        try {
          const rayColliderToi = world.castRay(
            new rapier.Ray(
              { x: rayOrigin.x, y: rayOrigin.y, z: rayOrigin.z },
              { x: rayDir.x, y: rayDir.y, z: rayDir.z }
            ),
            100,
            true
          );
          
          if (rayColliderToi && rayColliderToi.toi < 100) {
            groundHit = rayColliderToi;
            break;
          }
        } catch (error) {
          console.log('Ray cast attempt failed:', error);
        }
        
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!mounted) return;

      // 안전한 스폰 위치 계산 (지면 위 약간의 여유 높이)
      const safeY = groundHit ? 20 - groundHit.toi + 1 : 1;
      setSafePosition([position[0], safeY, position[2]]);
      setPhysicsReady(true);
    };

    initializePhysics();

    return () => {
      mounted = false;
    };
  }, [world, rapier, position, setSafePosition, setPhysicsReady]);

  return null;
};