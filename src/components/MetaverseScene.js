import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { OtherPlayer } from './OtherPlayer';
import axios from '../utils/axiosConfig';
import ChatBubble from './ChatBubble';
import ChatInterface from './ChatInterface';
import { useWebSocket } from '../hooks/useWebSocket';
import { getChatting } from '../state/chatState';
import Swal from 'sweetalert2';

// 닉네임 텍스트 컴포넌트
const NicknameText = ({ nickname, position }) => {
 if (!nickname) return null;
 
 return (
   <group position={[position[0], position[1] + 3.5, position[2]]}>
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
 const [currentCharacterAnimation, setCurrentCharacterAnimation] = useState('Stop');
 const [currentRotation, setCurrentRotation] = useState(0);
 const [isGroundReady, setIsGroundReady] = useState(false);

 // 플레이어 데이터 가져오기
 const fetchPlayerData = async () => {
   try {
     // playerData가 이미 있으면 API 호출 스킵
     if (playerData) {
       return playerData;
     }

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
       // playerData를 성공적으로 받아온 후에만 localStorage 삭제
       localStorage.removeItem('nickname');
       return response.data;
     }

     throw new Error('No data received');

   } catch (error) {
     console.error('API Error Details:', {
       status: error.response?.status,
       data: error.response?.data,
       config: error.config
     });

     if (error.response?.status === 401 || error.response?.status === 404) {
       localStorage.removeItem('nickname');
       navigate('/');
     }
     return null;
   }
 };

 const { connectWebSocket, sendChat, disconnect } = useWebSocket({
   playerData,
   position,
   currentCharacterAnimation,
   currentRotation,
   setOtherPlayers,
   setChatHistory,
   setChatMessage
 });

 // 로그아웃 핸들러
 const handleLogout = useCallback(async () => {
   const result = await Swal.fire({
    title: 'Kwanghyun Wordl 로그아웃',
    text: '정말 떠나실껀가요 😭 ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#fdbb2d',
    cancelButtonColor: '#d33',
    confirmButtonText: '네',
    cancelButtonText: '아니오',
    allowOutsideClick: false,
    allowEscapeKey: false
   });

   if (result.isConfirmed) {
     await disconnect();
     window.location.href = '/';
   }
 }, [disconnect, navigate]);

 // 새로고침 이벤트 핸들러
useEffect(() => {
  let isHandlingUnload = false;

  const handleBeforeUnload = async (e) => {
    if (isHandlingUnload) return;
    
    e.preventDefault();
    
    isHandlingUnload = true;

    const result = await Swal.fire({
      title: 'Kwanghyun Wordl 로그아웃',
      text: '정말 떠나실껀가요 😭 ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fdbb2d',
      cancelButtonColor: '#d33',
      confirmButtonText: '네',
      cancelButtonText: '아니오',
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    if (result.isConfirmed) {
      await disconnect();
      window.location.href = '/';
    }
    
    isHandlingUnload = false;
    return false;
  };

  const handleKeyDown = async (e) => {
    const isChatting = getChatting();
    
    // 채팅 중일 때는 모든 키 이벤트 무시
    if (isChatting) {
      return;
    }

    // F5 또는 Ctrl+R 처리
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
      e.preventDefault(); 
      
      if (!isHandlingUnload) {
        isHandlingUnload = true;
        
        const result = await Swal.fire({
          title: 'Kwanghyun Wordl 로그아웃',
          text: '정말 떠나실껀가요 😭 ?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#fdbb2d',
          cancelButtonColor: '#d33',
          confirmButtonText: '네',
          cancelButtonText: '아니오',
          allowOutsideClick: false,
          allowEscapeKey: false
        });

        if (result.isConfirmed) {
          await disconnect();
          window.location.href = '/';
        }
        
        isHandlingUnload = false;
      }
    }
    // ESC 키 처리 - 채팅 중이 아닐 때만 실행
    else if (e.key === 'Escape') {
      e.preventDefault();
      handleLogout();
    }
  };

  // 브라우저 새로고침 버튼 등의 경우를 위한 기본 핸들러
  window.addEventListener('beforeunload', (e) => {
    if (!isHandlingUnload) {
      e.preventDefault();
      // 크로스 브라우저 지원을 위해 빈 문자열 반환
      return (e.returnValue = '');
    }
  });
  
  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [disconnect, handleLogout]);

// 뒤로가기 처리
useEffect(() => {
  const preventBack = async (e) => {
    // 기본 뒤로가기 동작 방지
    e.preventDefault();
    
    const result = await Swal.fire({
      title: 'Kwanghyun Wordl 로그아웃',
      text: '정말 떠나실껀가요 😭 ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#fdbb2d',
      cancelButtonColor: '#d33',
      confirmButtonText: '네',
      cancelButtonText: '아니오',
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    if (result.isConfirmed) {
      await disconnect();
      window.location.href = '/';
    }
  };

  // 뒤로가기 이벤트만 처리
  window.addEventListener('popstate', preventBack);

  return () => {
    window.removeEventListener('popstate', preventBack);
  };
}, [disconnect]);
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
         <Ground onGroundReady={() => setIsGroundReady(true)} />
         <Buildings characterPosition={position} />
         
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
     
     <ChatInterface 
       onSendMessage={sendChat}
       chatHistory={chatHistory}
     />
     
     {isMobile && <TouchControls />}
   </div>
 );
};