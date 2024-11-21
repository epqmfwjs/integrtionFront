import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text, Html } from '@react-three/drei';
import { musicList } from '../data/musicList';
import { useFrame } from '@react-three/fiber';

// 필요한 상태만 남기고 나머지 제거
export const YouTubeMP3Player = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isPlaylistLoop, setIsPlaylistLoop] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [actualTrackIndex, setActualTrackIndex] = useState(0); // 실제 재생 트랙 번호 추가
  const lastTrackRef = useRef(0); // 마지막 재생 트랙 참조 추가
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [lightIntensity, setLightIntensity] = useState(0);
  const lightColors = useMemo(() => ['#4488ff', '#ff4444', '#44ff44', '#ffff44'], []);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);

  const playlist = musicList;

  const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

  const loadYouTubeAPI = () => {
    return new Promise((resolve) => {
      if (window.YT) {
        resolve(window.YT);
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';  // 원래 URL로 복구

      window.onYouTubeIframeAPIReady = () => {
        resolve(window.YT);
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
  };

  const initializePlayer = async () => {
    try {
      setIsLoading(true);
      await loadYouTubeAPI();
      
      if (!playerRef.current && playerContainerRef.current) {
        const player = new window.YT.Player(playerContainerRef.current, {
          height: '1',
          width: '1',
          videoId: playlist[currentTrack].videoId,
          playerVars: {
            'playsinline': 1,
            'controls': 0,
            'modestbranding': 1,
            'showinfo': 0,
            'fs': 0,
            'rel': 0,
            'enablejsapi': 1,
            'origin': window.location.origin
          },
          events: {
            'onReady': (event) => {
              console.log('Player is ready');
              playerRef.current = event.target;
              setIsInitialized(true);
              setIsLoading(false);
            },
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError  // 에러 핸들러 연결
          }
        });
      }
    } catch (error) {
      console.error('Failed to initialize player:', error);
      setIsLoading(false);
      setIsInitialized(false);  // 초기화 실패 시 상태 리셋
    }
  };

  useEffect(() => {
    let mounted = true;

    if (showPlaylist && !isInitialized) {
      const init = async () => {
        try {
          await initializePlayer();
          if (!mounted) return;
        } catch (error) {
          console.error('Initialization failed:', error);
          if (mounted) {
            setIsLoading(false);
            setIsInitialized(false);
          }
        }
      };

      init();
    }

    return () => {
      mounted = false;
      if (playerRef.current) {
        stopTimeUpdate();
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [showPlaylist]);

  // onPlayerStateChange 함수 수정
  const onPlayerStateChange = (event) => {
    switch(event.data) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        startTimeUpdate();
        break;
      case window.YT.PlayerState.PAUSED:
        setIsPlaying(false);
        stopTimeUpdate();
        break;
      case window.YT.PlayerState.ENDED:
        console.log('Track ended. Current track:', currentTrack);
        setIsPlaying(false);
        stopTimeUpdate();
        handleTrackEnd();
        break;
    }
  };

  const onPlayerError = (event) => {
    console.error('Player error code:', event.data);
    setIsLoading(false);
    setIsPlaying(false);
  
    // 에러 코드에 따른 처리
    switch (event.data) {
      case 2:  // 유효하지 않은 매개변수
        console.log('Invalid video ID');
        break;
      case 5:  // HTML5 플레이어 관련 오류
        console.log('HTML5 player error');
        break;
      case 100:  // 비디오를 찾을 수 없음
        console.log('Video not found');
        break;
      case 101:
      case 150:  // 임베드 허용되지 않음
        console.log('Embedding not allowed, retrying...');
        setTimeout(() => {
          handleTrackSelect(currentTrack);
        }, 1000);
        break;
      default:
        console.log('Unknown error');
    }
  };

  const startTimeUpdate = () => {
    if (playerRef.current) {
      const updateTimer = setInterval(() => {
        if (playerRef.current) {
          setCurrentTime(playerRef.current.getCurrentTime());
          setDuration(playerRef.current.getDuration());
        }
      }, 1000);
      playerRef.current.updateTimer = updateTimer;
    }
  };

  const stopTimeUpdate = () => {
    if (playerRef.current?.updateTimer) {
      clearInterval(playerRef.current.updateTimer);
    }
  };

  // 단순화된 handleTrackSelect
  const handleTrackSelect = async (index) => {
    try {
      if (index < 0 || index >= playlist.length) return;
      
      console.log('Selecting track:', index);
      setIsLoading(true);
      lastTrackRef.current = index; // 실제 트랙 번호 업데이트
      setActualTrackIndex(index); // 상태 업데이트
      setCurrentTrack(index);

      if (!playerRef.current) {
        await initializePlayer();
        return;
      }

      await new Promise((resolve) => {
        playerRef.current.loadVideoById({
          videoId: playlist[index].videoId,
          startSeconds: 0,
        });
        
        // 로딩 완료 후 재생 시작
        const checkState = setInterval(() => {
          if (playerRef.current.getPlayerState() !== -1) {
            clearInterval(checkState);
            setIsPlaying(true);
            resolve();
          }
        }, 100);
      });
    } catch (error) {
      console.error('Error selecting track:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // handleTrackEnd 함수 수정
  const handleTrackEnd = () => {
    if (!playerRef.current) return;

    try {
      const currentIndex = lastTrackRef.current; // 현재 실제 트랙 번호 사용
      let nextTrack;
      
      if (isPlaylistLoop) {
        // 전체 반복 모드일 때
        nextTrack = (currentIndex + 1) % playlist.length;
        console.log('Loop mode: Playing next track:', nextTrack);
      } else if (currentIndex < playlist.length - 1) {
        // 일반 모드에서 다음 트랙이 있을 때
        nextTrack = currentIndex + 1;
        console.log('Normal mode: Playing next track:', nextTrack);
      } else {
        // 마지막 트랙일 때 처음으로 돌아가고 재생
        console.log('Last track finished, playing first track');
        nextTrack = 0;
      }

      lastTrackRef.current = nextTrack;
      setActualTrackIndex(nextTrack);
      handleTrackSelect(nextTrack);

    } catch (error) {
      console.error('Track end handling failed:', error);
      setIsPlaying(false);
    }
  };

  // 단순화된 컨트롤 함수들
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const togglePlaylistLoop = (e) => {
    e.stopPropagation();
    setIsPlaylistLoop(!isPlaylistLoop);
  };

  const buttonStyle = (active) => ({
    padding: '8px 20px',
    background: active ? '#4488ff' : '#666',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    transition: 'background-color 0.3s'
  });

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 조명 효과 애니메이션
  useFrame((state) => {
    if (isPlaying) {
      // 시간에 따른 사인파 진동으로 조명 강도 변경
      const intensity = Math.sin(state.clock.elapsedTime * 5) * 1.5 + 1.5;
      setLightIntensity(intensity);
      
      // 색상 변경 (더 천천히)
      if (state.clock.elapsedTime % 2 < 0.1) {  // 2초마다 색상 변경
        setCurrentColorIndex((prev) => (prev + 1) % lightColors.length);
      }
    }
  });

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group
        position={position}
        rotation={rotation}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={() => setShowPlaylist(!showPlaylist)}
      >
        {/* 상단 조명 효과 */}
        {isPlaying && (
          <>
            <pointLight
              position={[0, 2, 0]}
              intensity={lightIntensity * 5}
              color={lightColors[currentColorIndex]}
              distance={3}
            />
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial
                color={lightColors[currentColorIndex]}
                transparent
                opacity={lightIntensity * 1}
              />
            </mesh>
          </>
        )}

        <mesh>
          <boxGeometry args={[1.5, 2, 1]} />
          <meshStandardMaterial color="#202020" metalness={0.7} roughness={0.2} />
        </mesh>

        <mesh position={[0, 0, 0.505]}>
          <circleGeometry args={[0.4, 32]} />
          <meshStandardMaterial color="#303030" metalness={0.5} roughness={0.8} />
        </mesh>

        <mesh position={[0, 0, 0.51]}>
          <circleGeometry args={[0.35, 32]} />
          <meshStandardMaterial color="#404040" metalness={0.3} roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.8, 0.51]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshStandardMaterial 
            color={isPlaying ? "#4488ff" : "#202020"}
            emissive={isPlaying ? "#4488ff" : "#000000"}
            emissiveIntensity={isPlaying ? 0.5 : 0}
          />
        </mesh>

        {showPlaylist && (
          <Html position={[3.5, 1, 1.5]} transform scale={0.2}>
            <div style={{
              width: '800px',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '10px',
              color: 'white',
              position: 'relative'  // 추가
            }}>
              <div id="youtube-player-container">
                <div ref={playerContainerRef} style={{ 
                  position: 'absolute',
                  visibility: 'hidden',
                  pointerEvents: 'none',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                  overflow: 'hidden'  // 추가
                }} />
              </div>
              
              <div style={{ marginBottom: '20px', textAlign: 'center', fontSize: '24px' }}>
                {isLoading ? 'Loading...' : `재생 중 : ${playlist[currentTrack].title}`}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                    disabled={isLoading || !isInitialized}
                    style={buttonStyle(!isLoading)}
                  >
                    {isLoading ? '⌛' : isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    onClick={togglePlaylistLoop}
                    disabled={isLoading || !isInitialized}
                    style={buttonStyle(isPlaylistLoop)}
                  >
                    🔄 전체반복
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (playerRef.current) {
                        const newTime = parseFloat(e.target.value);
                        playerRef.current.seekTo(newTime);
                      }
                    }}
                    style={{ 
                      flex: 1,
                      cursor: isInitialized ? 'pointer' : 'not-allowed'
                    }}
                    disabled={!isInitialized}
                  />
                  <span>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
                <h3 style={{ marginBottom: '10px' }}>Playlist</h3>
                <div style={{
                  maxHeight: '300px',  // 최대 높이 설정
                  overflowY: 'auto',   // 세로 스크롤 추가
                  marginRight: '-10px',// 스크롤바 공간 확보
                  paddingRight: '10px' // 내용 패딩
                }}>
                  {playlist.map((track, index) => (
                    <div
                      key={index}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (!isLoading) handleTrackSelect(index); 
                      }}
                      style={{
                        padding: '10px',
                        margin: '5px 0',
                        background: currentTrack === index ? '#4488ff33' : 'transparent',
                        borderRadius: '5px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        opacity: isLoading ? 0.7 : 1,
                        transition: 'background-color 0.3s'
                      }}
                    >
                      {currentTrack === index && isPlaying ? '🎵' : '▶️'} {track.title}
                    </div>
                  ))}
                </div>
              </div>
              </div>
          </Html>
        )}

        {isHovered && (
          <Text
            position={[0, 1.2, 0.6]}
            scale={0.1}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {showPlaylist ? '플레이리스트 닫기' : '플레이리스트 열기'}
          </Text>
        )}
      </group>
    </RigidBody>
  );
};