import React, { useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { RigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { PlayerModal } from './components/PlayerModal';
import { repeatManager  } from './components/RepeatManager';
import { cos } from 'three/webgpu';
import  axios from '../../../utils/axiosConfig';

export const SpotifyPlayer = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  // ===== 상태 관리 =====
  const [token, setToken] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress_ms, setProgress_ms] = useState(0);
  const [duration_ms, setDuration_ms] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0);
  const [isPlaylistRepeat, setIsPlaylistRepeat] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(repeatManager.getRepeatState());
  const [trackMap, setTrackMap] = useState(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);


  // ===== 서버 토큰 관리 =====
  const getServerToken = async () => {
    try {
      const response = await axios.get('/api/spotify/token');
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get server token:', error);
      // 토큰 가져오기 실패해도 컴포넌트는 유지
      return null;
    }
  };

  // ===== 초기 토큰 설정 =====
  useEffect(() => {
    const initializeToken = async () => {
      const serverToken = await getServerToken();
      if (serverToken) {
        setToken(serverToken);
        //setShowPlayerModal(true);
      }
    };

    initializeToken();
  }, []);

  // 현재 맵 상태 확인 함수
  const logMapState = () => {
    console.log('현재 트랙 맵 상태:', {
      총곡수: trackMap.size,
      현재인덱스: currentIndex,
      전체트랙: Array.from(trackMap.entries()).map(([index, track]) => ({
        인덱스: index,
        곡명: track.name,
        아티스트: track.artists?.[0]?.name
      }))
    });
  };

  // ===== 애니메이션 관련 =====
  const [rotation2, setRotation2] = useState(0);
  const { scale } = useSpring({
    scale: isHovered ? 1.1 : 1,
    config: { tension: 300, friction: 10 },
  });

  // ===== 디버깅 로거 =====
  // const logger = {
  //   playState: (action, details = {}) => {
  //     console.log(`[Player State] ${action}:`, {
  //       currentTrack: currentTrack?.name,
  //       isPlaying,
  //       playlistIndex: currentPlaylistIndex,
  //       playlistLength: playlist.length,
  //       isRepeatOn,
  //       isTransitioning,
  //       ...details
  //     });
  //   },
  //   error: (action, error) => {
  //     console.error(`[Player Error] ${action}:`, error);
  //   }
  // };

  // ===== API 컨트롤 함수들 =====
  const spotifyApi = {
    async getCurrentTrack() {
      if (!token || isTransitioning) return null;
  
      try {
          const response = await axios.get('/api/spotify/player/current-playback');
          
          if (response.status === 200 && response.data && response.data.item) {
              setCurrentTrack(response.data.item);
              setIsPlaying(response.data.is_playing);
              setProgress_ms(response.data.progress_ms || 0);
              setDuration_ms(response.data.item.duration_ms || 0);
              setLastUpdateTime(Date.now());
              return response.data;
          }
          return null;
      } catch (error) {
        if (error.response?.status === 401) {
          const newToken = await getServerToken();
          if (newToken) setToken(newToken);
        }
        console.error('Get Current Track', error);
        return null;
      }
    },

    async nextTrack() {
      console.log('nextTrack 정보', {
        currentTrack,
        playlist,
        currentPlaylistIndex,
        isRepeatOn: repeatManager.getRepeatState(),
        isTransitioning,
        player
      });
      if (!player || !currentTrack || isTransitioning) return;
      setIsTransitioning(true);
      try {
        // 다음 트랙 인덱스 계산
        let nextIndex;
        if (currentPlaylistIndex < playlist.length - 1) {
          nextIndex = currentPlaylistIndex + 1;
          //console.log('다음 트랙 nextIndex : ', nextIndex);
        } else if (isRepeatOn && currentPlaylistIndex === playlist.length - 1) {
          console.log('반복재생이면서 마지막트랙이면 첫번째 트랙으로');
          nextIndex = 0;
        } else if (!isRepeatOn && currentPlaylistIndex === playlist.length - 1) {
          console.log('넥스트버튼 마지막트랙이면 첫번째 트랙으로');
          nextIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }

        await spotifyApi.playTrackFromPlaylist(nextIndex);
      } catch (error) {
        console.error('Next Track', error);
      } finally {
        setTimeout(() => setIsTransitioning(false), 1500);
      }
    },

    async previousTrack() {
      if (!player || !currentTrack) return;
      try {
        const currentIndex = playlist.findIndex(track => track.uri === currentTrack.uri);
        
        if (currentIndex !== -1) {
          if (currentIndex > 0) {
            await spotifyApi.playTrackFromPlaylist(currentIndex - 1);
          } else if (isPlaylistRepeat) {
            await spotifyApi.playTrackFromPlaylist(playlist.length - 1);
          }
        } else {
          if (playlist.length > 0) {
            await spotifyApi.playTrackFromPlaylist(playlist.length - 1);
          } else {
            await player.previousTrack();
            setTimeout(spotifyApi.getCurrentTrack, 500);
          }
        }
      } catch (error) {
        console.error('Error going to previous track:', error);
      }
    },

    async playTrackFromPlaylist(index) {
      console.log('재생요청 인덱스',index)
      if (!playlist[index] || isTransitioning) return;
      
      setIsTransitioning(true);
      // logger.playState('Playing from Playlist', { 
      //   previousIndex: currentPlaylistIndex,
      //   newIndex: index,
      // });
      
      try {
        setCurrentPlaylistIndex(index);
        setCurrentTrack(playlist[index]);
        
        await spotifyApi.playTrack(playlist[index].uri);
      } catch (error) {
        console.error('Play from Playlist', error);
      }
    },

    async playTrack(uri) {
      if (!token || !deviceId || isTransitioning) return;
    
      setIsTransitioning(true);
      //console.log('Playing Track', { uri });
    
      try {
        let playResponse = await axios.put(`/api/spotify/player/play?device_id=${deviceId}`, {
          uris: [uri],
          position_ms: 0
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
    
        if (!playResponse.ok && playResponse.status === 404) {
          await axios.put('/api/spotify/player', {
            device_ids: [deviceId],
            play: false,
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
    
          playResponse = await axios.put(`/api/spotify/player/play?device_id=${deviceId}`, {
            uris: [uri],
            position_ms: 0
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
        }
    
        if (playResponse.ok) {
          setIsPlaying(true);
          setProgress_ms(0);
          setLastUpdateTime(Date.now());
    
          const trackFromPlaylist = playlist.find(track => track.uri === uri);
          if (trackFromPlaylist) {
            setCurrentTrack(trackFromPlaylist);
            setDuration_ms(trackFromPlaylist.duration_ms);
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          const newToken = await getServerToken();
          if (newToken) setToken(newToken);
        }
        console.error('Play Track', error);
      } finally {
        setTimeout(() => setIsTransitioning(false), 500);
      }
    },

    async togglePlayback() {
      if (!token || !deviceId || !player || isTransitioning) return;

      try {
        if (isPlaying) {
          await player.pause();
          console.log('Paused');
        } else {
          await player.resume();
          console.log('Resumed');
        }
        setIsPlaying(!isPlaying);
        setLastUpdateTime(Date.now());
      } catch (error) {
        console.error('Toggle Playback', error);
      }
    },

    addToPlaylist: (track) => {
      console.log('리스트 추가:', track); 
      setPlaylist(prev => {
        const newPlaylist = [...prev, track];
        console.log('New playlist:', newPlaylist); 
        return newPlaylist;
      });
    },

    removeFromPlaylist: (index) => {
      console.log('리스트 삭제', { index });
      setPlaylist(prev => prev.filter((_, i) => i !== index));
      if (currentPlaylistIndex === index) {
        spotifyApi.nextTrack();
      } else if (currentPlaylistIndex > index) {
        setCurrentPlaylistIndex(prev => prev - 1);
      }
    }
  };

  // ===== Spotify SDK 초기화 =====
  useEffect(() => {
    if (!token) return;

    const setupPlayer = () => {
      window.onSpotifyWebPlaybackSDKReady = () => {
        const spotifyPlayer = new window.Spotify.Player({
          name: 'Metaverse Player',
          getOAuthToken: async cb => { 
            const serverToken = await getServerToken();
            cb(serverToken || token);
          },
          volume: 0.5
        });

        // 에러 핸들러 설정
        ['initialization_error', 'authentication_error', 'account_error', 'playback_error'].forEach(error => {
          spotifyPlayer.addListener(error, async ({ message }) => {
            console.error(error, message);
            if (error === 'authentication_error') {
              const newToken = await getServerToken();
              if (newToken) setToken(newToken);
            }
          });
        });

        // 상태 변경 핸들러
        spotifyPlayer.addListener('player_state_changed', state => {
          if (!state) return;
          
            const currentTrack = state.track_window.current_track;

          // 재생 상태 업데이트
          setProgress_ms(state.position);
          setDuration_ms(state.duration);
          setIsPlaying(!state.paused);
          setLastUpdateTime(Date.now());
        });

        // 디바이스 준비 핸들러
        spotifyPlayer.addListener('ready', async ({ device_id }) => {
          console.log('Device Ready', { device_id });
          setDeviceId(device_id);
          setPlayer(spotifyPlayer);

          try {
            await fetch('https://api.spotify.com/v1/me/player', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                device_ids: [device_id],
                play: false,
              }),
            });
          } catch (error) {
            console.error('Device Activation', error);
          }
        });

        spotifyPlayer.connect();
      };

      if (!document.getElementById('spotify-player')) {
        const script = document.createElement('script');
        script.id = 'spotify-player';
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    };

    setupPlayer();

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [token]);

  // ===== 실시간 재생 시간 업데이트 =====
  useEffect(() => {
    if (!isPlaying || !duration_ms) return;

    let animationFrame;
    const updateProgress = () => {
      const now = Date.now();
      const timeDiff = now - lastUpdateTime;
      const newProgress = progress_ms + timeDiff;
      
      if (newProgress >= duration_ms) {
        setProgress_ms(duration_ms);
        if (!isTransitioning) {
          //console.log('실시간재생시간업데이트에서 현재 인덱스 : ',currentPlaylistIndex);
          //console.log('실시간재생시간업데이트에서 현재 리스트길이 : ',currentPlaylistIndex);
          if (isRepeatOn || currentPlaylistIndex < playlist.length - 1) {
            //console.log('실시간재생시간업데이트에서 실행');
            spotifyApi.nextTrack();
          } else {
            setIsPlaying(false);
          }
        }
      } else {
        setProgress_ms(newProgress);
        setLastUpdateTime(now);
        animationFrame = requestAnimationFrame(updateProgress);
      }
    };
    
    animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, lastUpdateTime, duration_ms, progress_ms, isTransitioning]);

  // ===== 정기적 상태 업데이트 =====
  useEffect(() => {
    if (token && showPlayerModal && !isTransitioning) {
      spotifyApi.getCurrentTrack();
      const interval = setInterval(spotifyApi.getCurrentTrack, 5000);
      return () => clearInterval(interval);
    }
  }, [token, showPlayerModal, isTransitioning, currentTrack]);

  // ===== 최근 트랙 업데이트 =====
  useEffect(() => {
    if (currentTrack && !recentTracks.find(track => track.id === currentTrack.id)) {
      setRecentTracks(prev => [currentTrack, ...prev].slice(0, 10));
    }
  }, [currentTrack]);

  // ===== 디스크 회전 =====
  useFrame(() => {
    if (isPlaying) {
      setRotation2(prev => prev + 0.01);
    }
  });

  // ===== 반복 재생 토글 핸들러 =====
  const handleToggleRepeat = () => {
    const newState = repeatManager.toggleRepeat();
    setIsRepeatOn(newState);
    console.log('Repeat Mode Toggled', { isRepeatOn: newState });
  };

  return (
    <RigidBody type="fixed" colliders="hull">
      <animated.group 
        position={position} 
        rotation={rotation} 
        scale={scale}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={() => setShowPlayerModal(true)}
      >
        {/* 메인 스피커 본체 */}
        <mesh castShadow position={[0, 0.5, -0.75]}>
          <boxGeometry args={[2, 3, 2.5]} />
          <meshStandardMaterial color="#282828" />
        </mesh>
  
        {/* 왼쪽 작은 스피커 본체 */}
        <mesh castShadow 
          position={[-1.8, -0.3, 0]}
          rotation={[0, -Math.PI / 6, 0]}  // Y축 기준 -30도 회전
        >
          <boxGeometry args={[0.7, 1.5, 0.8]} />
          <meshStandardMaterial color="#282828" />
        </mesh>
  
        {/* 오른쪽 작은 스피커 본체 */}
        <mesh castShadow 
          position={[1.8, -0.3, 0]}
          rotation={[0, Math.PI / 6, 0]}  // Y축 기준 -30도 회전
        >
          <boxGeometry args={[0.7, 1.5, 0.8]} />
          <meshStandardMaterial color="#282828" />
        </mesh>
  
        {/* 왼쪽 스피커 그릴 */}
        <mesh 
          position={[-2, -0.3, 0.36]}
          rotation={[0, -Math.PI / 6, 0]}  // Y축 기준 -30도 회전
        >
          <planeGeometry args={[0.7, 1.4]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
  
        {/* 오른쪽 스피커 그릴 */}
        <mesh 
          position={[2, -0.3, 0.36]}
          rotation={[0, Math.PI / 6, 0]}  // Y축 기준 -30도 회전
        >
          <planeGeometry args={[0.7, 1.4]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
  
        {/* 왼쪽 스피커 드라이버 */}
        <mesh 
          position={[-2, -0.3, 0.37]}
          rotation={[0, -Math.PI / 6, 0]}  // Y축 기준 -30도 회전
        >
          <circleGeometry args={[0.25, 32]} />
          <meshStandardMaterial 
            color="#666666"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* 오른쪽 스피커 드라이버 */}
        <mesh 
          position={[2, -0.3, 0.37]}
          rotation={[0, Math.PI / 6, 0]}  // Y축 기준 30도 회전
        >
          <circleGeometry args={[0.25, 32]} />
          <meshStandardMaterial 
            color="#666666"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
  
        {/* 기존 스피커 그릴 (앞면) */}
        <mesh position={[0, 0.5, 0.51]}>
          <planeGeometry args={[1.8, 2.8]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
  
        {/* 우퍼 (큰 스피커) */}
        <mesh position={[0, -0.25, 0.52]}>
          <circleGeometry args={[0.6, 32]} />
          <meshStandardMaterial 
            color="#666666"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
  
        {/* 트위터 (작은 스피커) */}
        <mesh position={[0, 1.3, 0.52]}>
          <circleGeometry args={[0.4, 32]} />
          <meshStandardMaterial 
            color="#666666"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
  
        {/* LED 디스플레이 */}
        <mesh position={[0, 0.6, 0.52]}>
          <planeGeometry args={[1.5, 0.3]} />
          <meshStandardMaterial 
            color={isPlaying ? "#1DB954" : "#1a1a1a"}
            emissive={isPlaying ? "#1DB954" : "#000000"}
            emissiveIntensity={isPlaying ? 0.5 : 0}
          />
          {currentTrack && (
            <Html
              center
              position={[0, 0, 0.1]}
              style={{
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              <div style={{ 
                color: 'white', 
                fontSize: '12px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                fontFamily: 'monospace'
              }}>
                {/* {currentTrack.name} */}
              </div>
            </Html>
          )}
        </mesh>
  
        {/* 컨트롤 버튼 */}
        <mesh position={[-0.7, 0.3, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.4]} />
          <meshStandardMaterial color="#1DB954" />
        </mesh>

        {/* 모달들 */}
        {showPlayerModal && (
          <PlayerModal
            currentTrack={{
              ...currentTrack,
              progress_ms,
              duration_ms
            }}
            isPlaying={isPlaying}
            onClose={() => setShowPlayerModal(false)}
            onPlayPause={spotifyApi.togglePlayback}
            onNextTrack={spotifyApi.nextTrack}
            onPrevTrack={spotifyApi.previousTrack}
            onTrackSelect={spotifyApi.playTrack}
            onPlayTrackFromPlaylist={spotifyApi.playTrackFromPlaylist}
            onRemoveFromPlaylist={spotifyApi.removeFromPlaylist}
            onAddToPlaylist={spotifyApi.addToPlaylist}
            isPlaylistRepeat={isRepeatOn}
            onToggleRepeat={handleToggleRepeat}
            currentPlaylistIndex={currentPlaylistIndex}
            token={token}
            recentTracks={recentTracks}
            playlist={playlist}
          />
        )}
      </animated.group>
    </RigidBody>
  );
};

export default SpotifyPlayer;