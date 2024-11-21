import { useRef, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

export const useWebSocket = ({
  playerData,
  position,
  currentCharacterAnimation,
  currentRotation,
  setOtherPlayers,
  setChatHistory,
  setChatMessage
}) => {
  const stompClientRef = useRef(null);
  const isConnecting = useRef(false);
  const chatMessagesRef = useRef({});

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
            client.subscribe('/topic/chat', message => {
              try {
                const chatMessage = JSON.parse(message.body);
                //console.log('받은 채팅 메시지:', chatMessage);

                if (chatMessage.nickname !== data.nickname) {
                  // 채팅 메시지 임시 저장
                  chatMessagesRef.current[chatMessage.nickname] = {
                    message: chatMessage.message,
                    timestamp: new Date().getTime()
                  };

                  setOtherPlayers(prev => {
                    const playerData = prev[chatMessage.nickname];
                    //console.log('채팅 업데이트 전 플레이어 데이터:', playerData);
                    
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

  // 채팅 메시지 전송 함수
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

  // 위치 업데이트 전송
  const sendPosition = () => {
    if (!stompClientRef.current?.connected || !playerData) return;
    
    stompClientRef.current.send('/app/position', {}, JSON.stringify({
      nickname: playerData.nickname,
      position: position,
      currentAnimation: currentCharacterAnimation,
      rotation: currentRotation,
      characterId: playerData.characterId,
      modelPath: playerData.modelPath
    }));
  };

  // 연결 해제 함수
  const disconnect = async () => {
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
          client.disconnect();
        }
        
        stompClientRef.current = null;
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  };

  // 위치 업데이트 효과
  useEffect(() => {
    sendPosition();
  }, [position, currentCharacterAnimation, currentRotation, playerData]);

  return {
    connectWebSocket,
    sendChat,
    disconnect,
    isConnected: !!stompClientRef.current?.connected
  };
};
