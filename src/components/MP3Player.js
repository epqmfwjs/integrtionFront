import React, { useState, useRef, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text, Html } from '@react-three/drei';

export const MP3Player = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaylistLoop, setIsPlaylistLoop] = useState(false);
  const [playAll, setPlayAll] = useState(false);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const playlist = [
    { title: "001 로제(ROSÉ), Bruno Mars(브루노 마스)-01-APT.", url: "/music/001.mp3" },
    { title: "002 제니 (JENNIE)-01-Mantra", url: "/music/002.mp3"},
    { title: "003 세븐틴(SEVENTEEN)-02-LOVE, MONEY, FAME (feat. DJ Khaled)", url: "/music/003.mp3" },
    { title: "004 aespa-01-UP (KARINA Solo)", url: "/music/004.mp3" }
  ];

  // 오디오 요소 초기 설정
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('canplay', () => {
        if (isPlaying) {
          audioRef.current.play().catch(error => {
            console.error('Playback failed:', error);
            setIsPlaying(false);
          });
        }
      });
    }
  }, []);

  const handlePlayPause = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          await audioRef.current.pause();
        } else {
          setIsLoading(true);
          await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Playback failed:', error);
        setIsPlaying(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTrackSelect = async (index) => {
    // try-catch 블록으로 오디오 재생 중 발생할 수 있는 에러를 처리
    try {
      // 트랙 로딩 중임을 표시하는 상태 설정
      setIsLoading(true);
  
      // 현재 재생 중인 트랙이 있다면 중지
      if (isPlaying) {
        await audioRef.current?.pause();
      }
  
      // 선택된 트랙의 인덱스로 현재 트랙 상태 업데이트
      setCurrentTrack(index);
      
      // 오디오 엘리먼트가 존재하는 경우 새로운 트랙 로드 및 재생
      if (audioRef.current) {
        // 선택된 트랙의 URL을 오디오 소스로 설정
        audioRef.current.src = playlist[index].url;
  
        // 새로운 오디오 소스를 로드 (브라우저가 오디오 파일을 미리 가져옴)
        await audioRef.current.load();
  
        // 재생 상태를 true로 설정
        setIsPlaying(true);
  
        // 오디오 재생 시작
        await audioRef.current.play();
      }
  
    } catch (error) {
      // 에러 발생 시 콘솔에 에러 출력 및 재생 상태를 false로 설정
      console.error('Track selection failed:', error);
      setIsPlaying(false);
  
    } finally {
      // 성공/실패 여부와 관계없이 로딩 상태를 false로 설정
      setIsLoading(false);
    }
  };

// 트랙이 끝났을 때 실행되는 핸들러
const handleTrackEnd = async () => {
  try {
    // 전체 재생 모드인 경우
    if (playAll) {
      // 현재 트랙이 플레이리스트의 마지막이 아닌 경우
      if (currentTrack < playlist.length - 1) {
        // 다음 트랙 재생
        await handleTrackSelect(currentTrack + 1);
        // 재생 상태를 true로 설정
        setIsPlaying(true);

        // 오디오 재생 시작
        await audioRef.current.play();
      } 
      // 플레이리스트 반복 모드이고 마지막 트랙인 경우
      else if (isPlaylistLoop) {
        // 첫 번째 트랙으로 돌아가서 재생
        await handleTrackSelect(0);
        // 재생 상태를 true로 설정
        setIsPlaying(true);

        // 오디오 재생 시작
        await audioRef.current.play()
      } 
      // 마지막 트랙이고 반복 모드가 아닌 경우
      else {
        // 재생 중지 및 전체 재생 모드 해제
        setIsPlaying(false);
        setPlayAll(false);
      }
    } 
    // 한 곡 반복 모드인 경우
    else if (isLooping) {
      if (audioRef.current) {
        // 현재 트랙을 처음으로 되감기
        audioRef.current.currentTime = 0;
        // 다시 재생 시작
        await audioRef.current.play();
      }
    } 
    // 그 외의 경우
    else {
      // 재생 중지
      setIsPlaying(false);
    }
  } catch (error) {
    // 에러 발생 시 로그 출력 및 재생 중지
    console.error('Track end handling failed:', error);
    setIsPlaying(false);
  }
 };
 
 // 한 곡 반복 모드 토글 버튼 핸들러
 const toggleLoop = (e) => {
  // 이벤트 버블링 방지
  e.stopPropagation();
  // 한 곡 반복 상태 토글
  setIsLooping(!isLooping);
  // 다른 재생 모드들 비활성화
  setIsPlaylistLoop(false);
  setPlayAll(false);
  // 오디오 엘리먼트의 반복 속성 설정
  if (audioRef.current) {
    audioRef.current.loop = !isLooping;
  }
 };
 
 // 전체 재생 모드 토글 버튼 핸들러
 const togglePlayAll = (e) => {
  // 이벤트 버블링 방지
  e.stopPropagation();
  // 전체 재생 상태 토글
  setPlayAll(!playAll);
  // 다른 재생 모드들 비활성화
  setIsLooping(false);
  setIsPlaylistLoop(false);
  // 오디오 엘리먼트의 반복 속성 해제
  if (audioRef.current) {
    audioRef.current.loop = false;
  }
 };
 
 // 전체 반복 모드 토글 버튼 핸들러
 const togglePlaylistLoop = (e) => {
  // 이벤트 버블링 방지
  e.stopPropagation();
  // 전체 반복 상태 토글
  setIsPlaylistLoop(!isPlaylistLoop);
  // 한 곡 반복 모드 비활성화
  setIsLooping(false);
  // 전체 재생 모드 활성화 (전체 반복을 위해 필요)
  setPlayAll(true);
  // 오디오 엘리먼트의 반복 속성 해제
  if (audioRef.current) {
    audioRef.current.loop = false;
  }
 };

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group
        position={position}
        rotation={rotation}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={() => setShowPlaylist(!showPlaylist)}
      >
        {/* 스피커 본체 */}
        <mesh>
          <boxGeometry args={[1.5, 2, 1]} />
          <meshStandardMaterial color="#202020" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* 스피커 그릴 */}
        <mesh position={[0, 0, 0.505]}>
          <circleGeometry args={[0.4, 32]} />
          <meshStandardMaterial color="#303030" metalness={0.5} roughness={0.8} />
        </mesh>

        {/* 우퍼 */}
        <mesh position={[0, 0, 0.51]}>
          <circleGeometry args={[0.35, 32]} />
          <meshStandardMaterial color="#404040" metalness={0.3} roughness={0.9} />
        </mesh>

        {/* LED 디스플레이 */}
        <mesh position={[0, 0.8, 0.51]}>
          <planeGeometry args={[0.8, 0.2]} />
          <meshStandardMaterial 
            color={isPlaying ? "#4488ff" : "#202020"}
            emissive={isPlaying ? "#4488ff" : "#000000"}
            emissiveIntensity={isPlaying ? 0.5 : 0}
          />
        </mesh>

        {/* 플레이어 인터페이스 */}
        {showPlaylist && (
          <Html
            position={[0, 2, 1]}
            transform
            scale={0.2}
          >
            <div style={{
              width: '600px',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '10px',
              color: 'white'
            }}>
              <audio
                ref={audioRef}
                src={playlist[currentTrack].url}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
                onEnded={handleTrackEnd}
                loop={isLooping && !playAll}
              />
              <div style={{ marginBottom: '20px', textAlign: 'center', fontSize: '18px' }}>
                {isLoading ? 'Loading...' : `Now Playing: ${playlist[currentTrack].title}`}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}
                    disabled={isLoading}
                    style={{
                      padding: '8px 20px',
                      background: isLoading ? '#666' : '#4488ff',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isLoading ? '⌛' : isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    onClick={toggleLoop}
                    style={{
                      padding: '8px 20px',
                      background: isLooping ? '#4488ff' : '#666',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    🔁 한곡
                  </button>
                  <button 
                    onClick={togglePlayAll}
                    style={{
                      padding: '8px 20px',
                      background: playAll ? '#4488ff' : '#666',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    📑 전체
                  </button>
                  <button 
                    onClick={togglePlaylistLoop}
                    style={{
                      padding: '8px 20px',
                      background: isPlaylistLoop ? '#4488ff' : '#666',
                      border: 'none',
                      borderRadius: '5px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
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
                      if (audioRef.current) {
                        audioRef.current.currentTime = e.target.value;
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <span>
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #444', paddingTop: '10px' }}>
                <h3 style={{ marginBottom: '10px' }}>Playlist</h3>
                {playlist.map((track, index) => (
                  <div
                    key={index}
                    onClick={(e) => { e.stopPropagation(); handleTrackSelect(index); }}
                    style={{
                      padding: '10px',
                      margin: '5px 0',
                      background: currentTrack === index ? '#4488ff33' : 'transparent',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    {currentTrack === index && isPlaying ? '🎵' : '▶️'} {track.title}
                  </div>
                ))}
              </div>
            </div>
          </Html>
        )}

        {/* 상호작용 텍스트 */}
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