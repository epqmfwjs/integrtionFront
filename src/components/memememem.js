// src/components/MetaverseScene.js
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Text, Billboard } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Buildings } from './Buildings';
import { Character } from './Character';
import { Ground } from './Ground';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { Color } from 'three';
import { TouchControls } from './TouchControls';
import { useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { OtherPlayer } from './OtherPlayer';

// 닉네임 텍스트 컴포넌트
const NicknameText = ({ position, rotation }) => {
  const nickname = localStorage.getItem('nickname');
  
  return (
    <group position={[position[0], position[1] + 2.3, position[2]]}>
      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
        position={[0, 0, 0]}
      >
        {/* 메인 배경 */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial 
            color="white" 
            opacity={0.8} 
            transparent
          />
        </mesh>
        
        {/* 테두리 효과 (선택사항) */}
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
    </group>
  );
};

export const MetaverseScene = () => {
  const [position, setPosition] = useState([0, 5, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const [otherPlayers, setOtherPlayers] = useState({});
  const navigate = useNavigate();
  const stompClientRef = useRef(null);
  const isConnecting = useRef(false);
  const [currentCharacterAnimation, setCurrentCharacterAnimation] = useState('Stop');
  const [currentRotation, setCurrentRotation] = useState(0);

  useEffect(() => {
    //console.log('Current otherPlayers:', otherPlayers);
  }, [otherPlayers]);

// WebSocket 연결 함수
const connectWebSocket = async () => {
  if (isConnecting.current || stompClientRef.current?.connected) return;
  
  isConnecting.current = true;
  const nickname = localStorage.getItem('nickname');
  
  console.log('Connecting with nickname:', nickname);
  
  try {
    const socket = new SockJS('http://localhost:5000/ws');
    //const socket = new SockJS(`http://gogolckh.ddns.net:10/ws`);
    const client = Stomp.over(socket);

    // STOMP 디버그 설정
    client.debug = () => {};

    await new Promise((resolve, reject) => {
      client.connect(
        {},
        () => {
          console.log('WebSocket Connected');
          stompClientRef.current = client;
          
          // 다른 플레이어들의 위치 정보 구독
          client.subscribe('/topic/players', message => {
            try {
              const positions = JSON.parse(message.body);
              const currentNickname = localStorage.getItem('nickname');
              
              // 다른 플레이어들의 데이터만 필터링
              const filteredPositions = Object.fromEntries(
                Object.entries(positions).filter(([key]) => key !== currentNickname)
              );
              
              // prev 상태를 유지하지 않고 새로운 상태로 완전히 교체
              setOtherPlayers(filteredPositions); // 이전: ...prev를 사용하지 않음
            } catch (error) {
              console.error('Error processing message:', error);
            }
          });

          // 입장 메시지 전송
          const joinMessage = {
            nickname: nickname,
            position: position
          };
          console.log('Sending join message:', joinMessage);
          client.send('/app/join', {}, JSON.stringify(joinMessage));

          resolve();
        },
        error => {
          console.error('STOMP connection error:', error);
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Failed to connect:', error);
  } finally {
    isConnecting.current = false;
  }
};

  // 초기 연결 및 정리
  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    if (!nickname) {
      navigate('/');
      return;
    }

    let mounted = true;

    const initConnection = async () => {
      if (mounted) {
        await connectWebSocket();
      }
    };

    initConnection();

    // 모바일 기기 감지
    const checkMobile = () => {
      if (mounted) {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // 정리 함수
    return () => {
      mounted = false;
      
      const cleanup = async () => {
        if (stompClientRef.current?.connected) {
          try {
            const client = stompClientRef.current;
            
            // 퇴장 메시지 전송
            await new Promise((resolve) => {
              client.send('/app/leave', {}, JSON.stringify({
                nickname: nickname,
                position: position
              }));
              resolve();
            });

            // 구독 해제
            if (client.connected) {
              client.disconnect();
            }
            
            stompClientRef.current = null;
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        }
      };

      cleanup();
      window.removeEventListener('resize', checkMobile);
    };
  }, [navigate]);

  // 위치 업데이트 처리
  useEffect(() => {
    if (!stompClientRef.current?.connected) return;
    
    const nickname = localStorage.getItem('nickname');
    if (!nickname) return;
  
    //console.log('Sending animation state:', currentCharacterAnimation); // 로그 추가

    stompClientRef.current.send('/app/position', {}, JSON.stringify({
      nickname: nickname,
      position: position,
      currentAnimation: currentCharacterAnimation,  // Stop 대신 실제 애니메이션 상태 전송
      rotation: currentRotation  // 회전 정보 추가
    }));
  
  }, [position, currentCharacterAnimation, currentRotation]);  // 의존성 배열에 currentCharacterAnimation 추가

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        gl={{ 
          antialias: true,
          alpha: false,
          stencil: false,
          depth: true
        }}
        camera={{
          position: [0, 5, 10],
          fov: 60
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(new Color('#87CEEB'), 1)
        }}
      >
        <Sky />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 10]}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <Physics
          gravity={[0, -9.81, 0]}
          timeStep={1/155}
          interpolate={true}
          maxStabilizationIterations={20}
          maxVelocityIterations={20}
          maxPositionIterations={20}
        >
          <Character 
            position={position} 
            setPosition={setPosition}
            onAnimationChange={(animation, rotation) => {
              setCurrentCharacterAnimation(animation);
              setCurrentRotation(rotation);
            }}
          />
          <Buildings characterPosition={position} />
          <Ground />
          <NicknameText position={position} />
          
          {Object.entries(otherPlayers).map(([playerNickname, playerData]) => (
            playerData?.position && (
              <OtherPlayer
                key={playerNickname}
                position={playerData.position}
                nickname={playerNickname}
                currentAnimation={playerData.currentAnimation || 'Stop'}
                rotation={playerData.rotation || 0}  // rotation 값 전달 추가
              />
            )
          ))}
        </Physics>
        <ThirdPersonCamera target={position} />
      </Canvas>
      {isMobile && <TouchControls />}
    </div>
  );
};