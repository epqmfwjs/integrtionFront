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
import axios from '../util/axiosConfig';
import ChatBubble from './ChatBubble';
import ChatInterface from './ChatInterface';
import {  Debug } from '@react-three/rapier';
import { GridHelper } from 'three';
import { Stats } from '@react-three/drei';
import { Perf } from 'r3f-perf';
import { useWebSocket } from '../hooks/useWebSocket';

// 닉네임 텍스트 컴포넌트
const NicknameText = ({ nickname, position }) => {
  if (!nickname) return null;
  
  return (
    <group position={[position[0], position[1] + 3.2, position[2]]}>
      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
        position={[0, 0, 0]}
      >
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.8, 0.15]} />
          <meshBasicMaterial color="white" opacity={0.8} transparent />
        </mesh>
        
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[0.85, 0.20]} />
          <meshBasicMaterial color="black" opacity={0.2} transparent />
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
  const [position, setPosition] = useState([0, 7, 0]);
  const [isMobile, setIsMobile] = useState(false);
  const [otherPlayers, setOtherPlayers] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();
  const stompClientRef = useRef(null);
  const isConnecting = useRef(false);
  const chatMessagesRef = useRef({});
  const [currentCharacterAnimation, setCurrentCharacterAnimation] = useState('Stop');
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isGroundReady, setIsGroundReady] = useState(false);

  // 플레이어 데이터 가져오기
  const fetchPlayerData = async () => {
    try {
      const nickname = localStorage.getItem('nickname');
      // nickname이 없으면 '/' 경로로 리다이렉트
      if (!nickname) {
        window.location.href = 'http://gogolckh.ddns.net:10/';  // navigate 대신 직접 리다이렉트
        //navigate('/');
        return null;
      }

      // API 엔드포인트 확인
      const response = await axios.get('/api/member/me', {
        params: { nickname }
      });

      // 응답 로깅 추가
      console.log('API Response:', response);

      if (response?.data) {
        setPlayerData(response.data);
        localStorage.removeItem('nickname');
        return response.data;
      }
      
      throw new Error('No data received');

    } catch (error) {
      // 에러 상세 로깅 추가
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      // API 에러가 401일 경우에도 '/' 경로로 리다이렉트
      if (error.response?.status === 401 || error.response?.status === 404) {
        localStorage.removeItem('nickname');
        window.location.href = 'http://gogolckh.ddns.net:10/';  // navigate 대신 직접 리다이렉트
        //navigate('/');
      }
      return null;
    }
  };

  const { connectWebSocket, sendChat, disconnect, isConnected } = useWebSocket({
    playerData,
    position,
    currentCharacterAnimation,
    currentRotation,
    setOtherPlayers,
    setChatHistory,
    setChatMessage
  });

  // 초기 연결 및 데이터 로드
  useEffect(() => {
    let mounted = true;

    const initScene = async () => {
      if (mounted) {
        const data = await fetchPlayerData();
        if (data) {
          await connectWebSocket(data);
        }
      }
    };

    initScene();
    
    // 모바일 기기 감지
    const checkMobile = () => {
      if (mounted) {
        setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mounted = false;
      disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, [navigate]);

  if (!playerData) return null;

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
          {/* 성능 모니터링 컴포넌트 추가 */}
          {/* <Stats showPanel={0} />
          <Perf position="top-center" /> */}

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
            {/* Ground를 먼저 로드하고 준비되면 캐릭터 로드 */}
            <Ground onGroundReady={() => setIsGroundReady(true)} />
            <Buildings characterPosition={position} />
            
            {/* 그라운드가 준비된 후에만 캐릭터 렌더링 */}
            {isGroundReady && (
              <Character 
                position={position} 
                setPosition={setPosition}
                modelPath={playerData.modelPath}
                onAnimationChange={(animation, rotation) => {
                  setCurrentCharacterAnimation(animation);
                  setCurrentRotation(rotation);
                }}
              />
            )}
            <NicknameText position={position} nickname={playerData.nickname} />
            <ChatBubble 
              message={chatMessage}
              position={position}
              height={3.2}
            />
            
            {Object.entries(otherPlayers).map(([playerNickname, data]) => (
              data?.position && (
                <group key={`${playerNickname}-${data.messageTimestamp || ''}`}>
                  <OtherPlayer
                    position={data.position}
                    nickname={playerNickname}
                    currentAnimation={data.currentAnimation || 'Stop'}
                    rotation={data.rotation || 0}
                    modelPath={data.modelPath}
                    chatMessage={data.chatMessage}
                    messageTimestamp={data.messageTimestamp}
                  />
                </group>
              )
            ))}
          </Physics>
          <ThirdPersonCamera target={position} />
        </Canvas>
        
        {/* 채팅 인터페이스 */}
        <ChatInterface 
          onSendMessage={sendChat}
          chatHistory={chatHistory}
        />
        
        {isMobile && <TouchControls />}
      </div>
  );
};