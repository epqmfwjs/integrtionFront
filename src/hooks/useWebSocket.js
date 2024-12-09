import { useRef, useEffect, useCallback, useMemo } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// 설정 및 유틸리티 import
import { 
  PREDICTION_CONFIG,
  ConnectionManager,
  PerformanceMonitor,
  optimizeDataForTransport,
  parseTransportData,
  compressPosition,
  cleanupStaleData,
  handleError,
  // 누락된 함수들 추가
  predictAndInterpolateRotation,
  updateNetworkParams,
  scheduleUpdate,
  createThrottle
} from '../utils/websocketUtils';

export const useWebSocket = ({
  playerData,
  position,
  currentCharacterAnimation,
  currentRotation,
  setOtherPlayers,
  setChatHistory,
  setChatMessage
}) => {
  // 기존 refs
  const stompClientRef = useRef(null);
  const positionQueue = useRef([]);
  const chatMessagesRef = useRef({});
  const lastPositionsRef = useRef({});
  const lastUpdateTime = useRef(0);
  const lastSentPosition = useRef(null);  // 추가
  const animationFrameRef = useRef(null); // 추가

  // 새로운 최적화 관련 refs
  const performanceMonitor = useRef(new PerformanceMonitor());
  const connectionManager = useRef(new ConnectionManager(PREDICTION_CONFIG));
  const updateThrottle = useRef(createThrottle(PREDICTION_CONFIG.minUpdateInterval));
  const predictionStateRef = useRef({
    lastPosition: null,
    velocity: [0, 0, 0],
    lastTimestamp: 0
  });

  // 메모이즈된 설정
  const networkConfig = useMemo(() => ({
    updateInterval: PREDICTION_CONFIG.minUpdateInterval,
    batchSize: PREDICTION_CONFIG.batchSize,
    maxQueueSize: PREDICTION_CONFIG.maxQueueSize
  }), []);

  const POSITION_UPDATE_INTERVAL = 16; // 약 60fps
  const MOVEMENT_THRESHOLD = 0.01;
  const QUEUE_SIZE = 3;

  // 위치 변화 감지 함수 추가
  const hasSignificantChange = useCallback((newPos, oldPos) => {
    if (!oldPos) return true;
    
    return newPos.some((coord, index) => 
      Math.abs(coord - oldPos[index]) > MOVEMENT_THRESHOLD
    );
  }, []);

  const sendPosition = useCallback(() => {
    const now = Date.now();
    
    // 1. 업데이트 주기 제한
    if (now - lastUpdateTime.current < POSITION_UPDATE_INTERVAL) {
      return;
    }
  
    // 2. 데이터 유효성 강화 검사
    if (!position || 
        !Array.isArray(position) || 
        position.length !== 3 || 
        position.some(coord => typeof coord !== 'number')) {
      return;
    }
  
    // 3. 위치 변화 감지
    if (!hasSignificantChange(position, lastSentPosition.current)) {
      return;
    }
  
    // 4. 위치 데이터 큐잉
    positionQueue.current.push([...position]);
    if (positionQueue.current.length > QUEUE_SIZE) {
      positionQueue.current.shift();
    }
  
    // 5. 평균 위치 계산 (스무딩)
    const smoothedPosition = positionQueue.current.reduce((acc, pos) => 
      pos.map((coord, i) => acc[i] + coord / positionQueue.current.length)
    , [0, 0, 0]);
  
    const optimizedData = {
      nickname: playerData?.nickname,
      position: smoothedPosition.map(coord => {
        // 안전한 숫자 변환
        const safeCoord = Number.isFinite(coord) ? coord : 0;
        return Number(safeCoord.toFixed(2));
      }),
      currentAnimation: currentCharacterAnimation,
      rotation: Number((currentRotation || 0).toFixed(2)),
      characterId: playerData?.characterId,
      modelPath: playerData?.modelPath,
      timestamp: now
    };
  
    if (stompClientRef.current?.connected) {
      stompClientRef.current.send('/app/position', {}, JSON.stringify(optimizedData));
      lastSentPosition.current = smoothedPosition;
      lastUpdateTime.current = now;
    }
  }, [position, currentCharacterAnimation, currentRotation, playerData, hasSignificantChange]);


  // 위치 업데이트 최적화
  useEffect(() => {
    if (!stompClientRef.current?.connected) return;
    
    const updateFrame = () => {
      try {
        sendPosition();
      } catch (error) {
        console.error('Position update error:', error);
      }
      animationFrameRef.current = requestAnimationFrame(updateFrame);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateFrame);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sendPosition]);

  // 위치 예측 및 보간 처리 개선
  const predictAndInterpolatePosition = useCallback((prevPlayer, serverPosition, timeDelta) => {
    // 위치 예측
    const predictedPosition = prevPlayer.position.map((coord, i) => {
      const velocity = prevPlayer.velocity?.[i] || 0;
      return coord + (velocity * timeDelta);
    });

    // 예측 오차 계산
    const predictionError = Math.sqrt(
      serverPosition.reduce((sum, coord, i) => 
        sum + Math.pow(coord - predictedPosition[i], 2), 0)
    );

    // 성능 메트릭 기록
    performanceMonitor.current.addMetric('predictionError', predictionError);

    // 급격한 변화 감지
    if (predictionError > PREDICTION_CONFIG.maxPredictionError) {
      return {
        position: serverPosition,
        needsCorrection: true,
        confidence: 1
      };
    }

    // 보간 강도 동적 조정
    const confidence = Math.min(
      1,
      predictionError / PREDICTION_CONFIG.maxPredictionError
    );

    // 부드러운 보간 처리
    const interpolatedPosition = predictedPosition.map((coord, i) => {
      const target = serverPosition[i];
      const diff = target - coord;
      return coord + (diff * PREDICTION_CONFIG.positionSmoothing * confidence);
    });

    return {
      position: interpolatedPosition,
      needsCorrection: false,
      confidence
    };
  }, []);

  // 최적화된 위치 업데이트 처리
  const handlePositionUpdate = useCallback((positions, timestamp) => {
    if (!positions) return;

    setOtherPlayers(prev => {
      const newPlayers = {};
      const updates = [];

      Object.entries(positions).forEach(([nickname, serverData]) => {
        if (nickname === playerData?.nickname) return;

        const prevPlayer = prev[nickname];
        const chatData = chatMessagesRef.current[nickname];

        // 이전 업데이트보다 오래된 데이터는 무시
        if (prevPlayer?.lastUpdateTime > timestamp) {
          newPlayers[nickname] = prevPlayer;
          return;
        }

        // 새로운 플레이어 처리
        if (!prevPlayer) {
          const initialState = {
            ...serverData,
            velocity: [0, 0, 0],
            lastUpdateTime: timestamp,
            chatMessage: chatData?.message,
            messageTimestamp: chatData?.timestamp
          };
          
          newPlayers[nickname] = initialState;
          lastPositionsRef.current[nickname] = serverData.position;
          return;
        }

        // 위치 예측 및 보간
        const timeDelta = (timestamp - prevPlayer.lastUpdateTime) / 1000;
        const { position: interpolatedPosition, confidence } = 
          predictAndInterpolatePosition(prevPlayer, serverData.position, timeDelta);

        // 속도 계산
        const velocity = interpolatedPosition.map((pos, i) => 
          (pos - prevPlayer.position[i]) / timeDelta
        );

        // 회전 보간
        const { rotation: interpolatedRotation } = predictAndInterpolateRotation(
          prevPlayer.rotation,
          serverData.rotation,
          confidence
        );

        // 상태 업데이트 준비
        updates.push({
          nickname,
          state: {
            ...serverData,
            position: interpolatedPosition,
            rotation: interpolatedRotation,
            velocity,
            lastUpdateTime: timestamp,
            chatMessage: chatData?.message,
            messageTimestamp: chatData?.timestamp
          }
        });
      });

      // 배치 업데이트 적용
      updates.forEach(({ nickname, state }) => {
        newPlayers[nickname] = state;
        lastPositionsRef.current[nickname] = state.position;
      });

      // 성능 메트릭 업데이트
      if (updates.length > 0) {
        performanceMonitor.current.addMetric('updateBatchSize', updates.length);
      }

      // 오래된 데이터 정리
      cleanupStaleData(lastPositionsRef.current, PREDICTION_CONFIG.cleanupInterval);

      return newPlayers;
    });
  }, [playerData, predictAndInterpolatePosition]);

  // 최적화된 데이터 전송
  const sendPositionUpdate = useCallback(() => {
    if (!stompClientRef.current?.connected) return;

    const now = Date.now();
    const timeDelta = now - lastUpdateTime.current;

    // 업데이트 주기 조정
    const currentRtt = performanceMonitor.current.getAverageMetric('rtt') || 0;
    const adjustedInterval = updateNetworkParams(currentRtt);

    if (timeDelta < adjustedInterval) return;

    const compressedPosition = compressPosition(position);
    const updateData = optimizeDataForTransport({
      nickname: playerData?.nickname,
      position: compressedPosition,
      animation: currentCharacterAnimation,
      rotation: currentRotation,
      timestamp: now
    });

    try {
      stompClientRef.current.send('/app/position', {}, JSON.stringify(updateData));
      lastUpdateTime.current = now;

      // 성능 메트릭 업데이트
      performanceMonitor.current.addMetric('sendLatency', Date.now() - now);
    } catch (error) {
      console.error('Position update error:', error);
    }
  }, [position, currentCharacterAnimation, currentRotation, playerData]);

  // WebSocket 연결
  const connectWebSocket = useCallback(async (data) => {
    if (connectionManager.current.isConnecting) return;

    try {
      await connectionManager.current.connect(async () => {
        //const socket = new SockJS('http://localhost:5000/ws');
        const socket = new SockJS(process.env.REACT_APP_WEBSOCKET_URL);
        const client = Stomp.over(socket);

        // 커스텀 디버그 핸들러
        client.debug = (str) => {
          if (str.includes('Connected') || str.includes('Error') || str.includes('error')) {
            console.log(str);
            performanceMonitor.current.addMetric('connectionEvent', {
              type: str.includes('Error') ? 'error' : 'info',
              timestamp: Date.now()
            });
          }
        };

        await new Promise((resolve, reject) => {
          const connectStartTime = Date.now();

          client.connect(
            {},
            () => {
              console.log('WebSocket Connected');
              stompClientRef.current = client;
              
              // 연결 성능 메트릭 기록
              performanceMonitor.current.addMetric('connectionTime', 
                Date.now() - connectStartTime
              );

              // 플레이어 위치 구독 최적화
              client.subscribe('/topic/players', message => {
                try {
                  const receiveTime = Date.now();
                  const parsedData = parseTransportData(JSON.parse(message.body));
                  
                  setOtherPlayers(prev => {
                    const newPlayers = {};
                    
                    Object.entries(parsedData).forEach(([nickname, playerData]) => {
                      if (nickname === data.nickname) return;
                      
                      const prevPlayer = prev[nickname];
                      const chatData = chatMessagesRef.current[nickname];
                      
                      // 움직임 감지
                      const hasMovement = prevPlayer && playerData.position.some((coord, i) => 
                        Math.abs(coord - prevPlayer.position[i]) > 0.01
                      );
              
                      // 위치 보간 처리 개선
                      const interpolatedPosition = prevPlayer 
                        ? playerData.position.map((target, i) => {
                            const current = prevPlayer.position[i];
                            const diff = target - current;
                            // 큰 변화가 있을 경우 즉시 이동
                            if (Math.abs(diff) > 5) return target;
                            // 부드러운 보간 처리
                            return current + (diff * PREDICTION_CONFIG.positionSmoothing);
                          })
                        : playerData.position;
              
                      // 회전 보간 처리
                      let interpolatedRotation = playerData.rotation;
                      if (prevPlayer) {
                        let rotationDiff = playerData.rotation - prevPlayer.rotation;
                        if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
                        if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
                        interpolatedRotation = prevPlayer.rotation + 
                          (rotationDiff * PREDICTION_CONFIG.rotationSmoothing);
                      }
              
                      // 애니메이션 상태 업데이트
                      const currentAnimation = hasMovement 
                        ? playerData.currentAnimation 
                        : 'Stop';
              
                      newPlayers[nickname] = {
                        ...playerData,
                        position: interpolatedPosition,
                        rotation: interpolatedRotation,
                        lastUpdateTime: receiveTime,
                        chatMessage: chatData?.message,
                        messageTimestamp: chatData?.timestamp,
                        modelPath: playerData.modelPath,
                        characterId: playerData.characterId,
                        currentAnimation: currentAnimation,
                        velocity: hasMovement ? [1, 0, 1] : [0, 0, 0]  // 움직임 상태 반영
                      };
              
                      lastPositionsRef.current[nickname] = interpolatedPosition;
                    });
              
                    return newPlayers;
                  });
              
                } catch (error) { 
                  console.error('Position processing error:', error);
                }
              });
              
              // 2. 채팅 메시지 구독
              client.subscribe('/topic/chat', message => {
                try {
                  const chatMessage = JSON.parse(message.body);
                  if (chatMessage.nickname !== data.nickname) {
                    const now = Date.now();
                    chatMessagesRef.current[chatMessage.nickname] = {
                      message: chatMessage.message,
                      timestamp: now
                    };
              
                    setOtherPlayers(prev => {
                      const playerData = prev[chatMessage.nickname];
                      if (!playerData) return prev;
                      
                      return {
                        ...prev,
                        [chatMessage.nickname]: {
                          ...playerData,
                          chatMessage: chatMessage.message,
                          messageTimestamp: now
                        }
                      };
                    });
              
                    setChatHistory(prev => [...prev, chatMessage]);
                  }
                } catch (error) {
                  console.error('Chat processing error:', error);
                }
              });

              // 최적화된 입장 메시지
              const joinMessage = optimizeDataForTransport({
                nickname: data.nickname,
                position: compressPosition(position),
                characterId: data.characterId,
                modelPath: data.modelPath,
                timestamp: Date.now(),
                needsNotification: true
              });

              client.send('/app/join', {}, JSON.stringify(joinMessage));
              resolve();
            },
            error => {
              console.error('STOMP connection error:', error);
              performanceMonitor.current.addMetric('error', {
                type: 'connection',
                timestamp: Date.now()
              });
              reject(error);
            }
          );
        });
      });
    } catch (error) {
      console.error('Connection attempt failed:', error);
    }
  }, [position, handlePositionUpdate]);

  // 채팅 메시지 전송
const sendChat = useCallback((message) => {
  if (stompClientRef.current?.connected && playerData) {
    const chatData = {
      nickname: playerData.nickname,
      message: message,
      timestamp: Date.now()
    };
    
    stompClientRef.current.send('/app/chat', {}, JSON.stringify(chatData));
    setChatHistory(prev => [...prev, { ...chatData, isSelf: true }]);
    setChatMessage(message);
  }
}, [playerData, setChatHistory, setChatMessage]);

  // 최적화된 연결 해제
  const disconnect = useCallback(async () => {
    if (stompClientRef.current?.connected && playerData) {
      try {
        const leaveMessage = optimizeDataForTransport({
          nickname: playerData.nickname,
          position: compressPosition(position),
          timestamp: Date.now()
        });

        await handleError(
          async () => {
            await new Promise((resolve) => {
              stompClientRef.current.send('/app/leave', {}, JSON.stringify(leaveMessage));
              resolve();
            });
          },
          3
        );

        if (stompClientRef.current.connected) {
          stompClientRef.current.disconnect();
        }

        // 리소스 정리
        stompClientRef.current = null;
        positionQueue.current = [];
        cleanupStaleData(lastPositionsRef.current, 0);
        performanceMonitor.current.addMetric('disconnect', {
          type: 'normal',
          timestamp: Date.now()
        });

      } catch (error) {
        console.error('Disconnect error:', error);
        performanceMonitor.current.addMetric('error', {
          type: 'disconnect',
          timestamp: Date.now()
        });
      }
    }
  }, [playerData, position]);

  // 자동 재연결 및 상태 모니터링
  useEffect(() => {
    const monitorConnection = () => {
      const metrics = performanceMonitor.current.metrics;
      const avgRtt = performanceMonitor.current.getAverageMetric('rtt');
      
      // 네트워크 상태에 따른 동적 조정
      if (avgRtt > 200) { // RTT가 200ms 이상이면
        networkConfig.updateInterval = Math.min(
          networkConfig.updateInterval * 1.5,
          PREDICTION_CONFIG.maxUpdateInterval
        );
      } else if (avgRtt < 50) { // RTT가 50ms 미만이면
        networkConfig.updateInterval = Math.max(
          networkConfig.updateInterval * 0.8,
          PREDICTION_CONFIG.minUpdateInterval
        );
      }

      // 성능 메트릭 정리
      if (metrics.length > 1000) {
        performanceMonitor.current.cleanup();
      }
    };

    const monitorInterval = setInterval(monitorConnection, 5000);
    return () => clearInterval(monitorInterval);
  }, [networkConfig]);

  // 위치 업데이트 스케줄링
  useEffect(() => {
    const updateInterval = setInterval(() => {
      updateThrottle.current(sendPositionUpdate, true);
    }, networkConfig.updateInterval);

    return () => clearInterval(updateInterval);
  }, [sendPositionUpdate, networkConfig.updateInterval]);

  return {
    connectWebSocket,
    sendChat,
    disconnect,
    isConnected: !!stompClientRef.current?.connected,
    networkMetrics: {
      getAverageRtt: () => performanceMonitor.current.getAverageMetric('rtt'),
      getErrorRate: () => performanceMonitor.current.getErrorRate(),
      getCurrentUpdateInterval: () => networkConfig.updateInterval
    }
  };
};

export default useWebSocket;