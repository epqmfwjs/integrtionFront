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
  const [position, setPosition] = useState([0, 5, 0]);
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

  // 플레이어 데이터 가져오기
  const fetchPlayerData = async () => {
    try {
      const nickname = localStorage.getItem('nickname');
      if (!nickname) {
        navigate('/');
        return null;
      }

      const response = await axios.get('/api/member/me', {
        params: { nickname }
      });

      if (response?.data) {
        setPlayerData(response.data);
        localStorage.removeItem('nickname');
        return response.data;
      }
      
      throw new Error('No data received');

    } catch (error) {
      console.error('API Error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('nickname');
        navigate('/');
      }
      return null;
    }
  };

  // 채팅 메시지 전송
  const sendChat = (message) => {
    if (stompClientRef.current?.connected && playerData) {
      const chatData = {
        nickname: playerData.nickname,
        message: message,
        timestamp: new Date().getTime()
      };
      
      stompClientRef.current.send('/app/chat', {}, JSON.stringify(chatData));
      
      // 로컬 채팅 히스토리 업데이트
      setChatHistory(prev => [...prev, { ...chatData, isSelf: true }]);
      setChatMessage(message);
    }
  };

  // WebSocket 연결 함수
  const connectWebSocket = async (data) => {
    if (isConnecting.current || stompClientRef.current?.connected) return;
    isConnecting.current = true;
    
    try {
      //const socket = new SockJS('http://localhost:5000/ws');
      const socket = new SockJS('http://gogolckh.ddns.net:10/ws');
      const client = Stomp.over(socket);
      client.debug = () => {};

      await new Promise((resolve, reject) => {
        client.connect(
          {},
          () => {
            console.log('WebSocket Connected');
            stompClientRef.current = client;
            
            // 플레이어 위치 구독
            client.subscribe('/topic/players', message => {
              try {
                const positions = JSON.parse(message.body);
                const filteredPositions = Object.fromEntries(
                  Object.entries(positions).filter(([key]) => key !== data.nickname)
                );
            
                // 채팅 메시지 상태 보존하며 위치 업데이트
                setOtherPlayers(prev => {
                  const updatedPlayers = {};
                  Object.entries(filteredPositions).forEach(([nickname, playerData]) => {
                    const chatData = chatMessagesRef.current[nickname];
                    updatedPlayers[nickname] = {
                      ...playerData,
                      chatMessage: chatData?.message,
                      messageTimestamp: chatData?.timestamp
                    };
                  });
                  return updatedPlayers;
                });
              } catch (error) {
                console.error('Error processing message:', error);
              }
            });

            // 채팅 메시지 구독
            

            // WebSocket 구독 부분 수정
            client.subscribe('/topic/chat', message => {
              try {
                const chatMessage = JSON.parse(message.body);
                console.log('받은 채팅 메시지:', chatMessage);

                if (chatMessage.nickname !== data.nickname) {
                  // 채팅 메시지 임시 저장
                  chatMessagesRef.current[chatMessage.nickname] = {
                    message: chatMessage.message,
                    timestamp: new Date().getTime()
                  };

                  setOtherPlayers(prev => {
                    const playerData = prev[chatMessage.nickname];
                    console.log('채팅 업데이트 전 플레이어 데이터:', playerData);
                    
                    if (playerData) {
                      return {
                        ...prev,
                        [chatMessage.nickname]: {
                          ...playerData,
                          chatMessage: chatMessage.message,
                          messageTimestamp: new Date().getTime()
                        }
                      };
                    }
                    return prev;
                  });

                  setChatHistory(prev => [...prev, { ...chatMessage, isSelf: false }]);
                }
              } catch (error) {
                console.error('채팅 메시지 처리 중 에러:', error);
              }
            });

            const joinMessage = {
              nickname: data.nickname,
              position: position,
              characterId: data.characterId,
              modelPath: data.modelPath
            };
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
      
      const cleanup = async () => {
        if (stompClientRef.current?.connected && playerData) {
          try {
            const client = stompClientRef.current;
            
            await new Promise((resolve) => {
              client.send('/app/leave', {}, JSON.stringify({
                nickname: playerData.nickname,
                position: position
              }));
              resolve();
            });

            if (client.connected) {
              localStorage.removeItem('nickname');
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
    if (!stompClientRef.current?.connected || !playerData) return;
    
    stompClientRef.current.send('/app/position', {}, JSON.stringify({
      nickname: playerData.nickname,
      position: position,
      currentAnimation: currentCharacterAnimation,
      rotation: currentRotation,
      characterId: playerData.characterId,
      modelPath: playerData.modelPath
    }));
  
  }, [position, currentCharacterAnimation, currentRotation, playerData]);

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
            modelPath={playerData.modelPath}
            onAnimationChange={(animation, rotation) => {
              setCurrentCharacterAnimation(animation);
              setCurrentRotation(rotation);
            }}
          />
          <Buildings characterPosition={position} />
          <Ground />
          <NicknameText position={position} nickname={playerData.nickname} />
          <ChatBubble 
            message={chatMessage}
            position={position}
            height={3.2}
          />
          
          {Object.entries(otherPlayers).map(([playerNickname, data]) => {
            console.log('렌더링 데이터:', {
              nickname: playerNickname,
              chatMessage: data.chatMessage,
              messageTimestamp: data.messageTimestamp,
              position: data.position,
              fullData: data
            });

            return data?.position && (
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
            );
          })}
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