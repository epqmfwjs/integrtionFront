import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import axios from '../util/axiosConfig';
import { useSwipeable } from 'react-swipeable';

// 반응형 디자인을 위한 중단점 설정
const breakpoints = {
  xs: 320,  // 작은 모바일
  sm: 480,  // 일반 모바일
  md: 740,  // 태블릿
  lg: 1024, // 작은 데스크톱
  xl: 1200  // 큰 데스크톱
};

// 현재 화면 크기에 따른 스타일 계산 함수
const getResponsiveStyles = (width) => {
  if (width <= breakpoints.xs) return {
    cardWidth: '100%',
    cardHeight: '180px',
    fontSize: '0.9rem',
    headerSize: '1.3rem',
    padding: '0.6rem'
  };
  if (width <= breakpoints.sm) return {
    cardWidth: '100%',
    cardHeight: '200px',
    fontSize: '1rem',
    headerSize: '1.4rem',
    padding: '0.8rem'
  };
  if (width <= breakpoints.md) return {
    cardWidth: '100%',
    cardHeight: '220px',
    fontSize: '1.1rem',
    headerSize: '1.5rem',
    padding: '1rem'
  };
  return {
    cardWidth: '100%',
    cardHeight: '200px',
    fontSize: '1rem',
    headerSize: '1.75rem',
    padding: '1.25rem'
  };
};

function Model({ modelPath }) {
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, scene);

  React.useEffect(() => {
    if (actions.Stop) {
      actions.Stop.reset().fadeIn(0.5).play();
      return () => actions.Stop.stop();
    }
  }, [actions]);

  // 화면 크기에 따른 모델 스케일 조정
  const scale = window.innerWidth <= breakpoints.sm ? 0.01 : 0.0125;
  scene.scale.set(scale, scale, scale);

  return <primitive object={scene} />;
}

const CharacterCard = ({ character, selected, onClick, inUse, screenSize }) => {
  const styles = getResponsiveStyles(screenSize);

  return (
    <div 
      onClick={() => !inUse && onClick()}
      style={{ 
        width: screenSize <= breakpoints.md ? styles.cardWidth : '100%',
        maxWidth: screenSize <= breakpoints.md ? '300px' : '250px',
        margin: screenSize <= breakpoints.md ? '0 auto' : '0',
        cursor: inUse ? 'not-allowed' : 'pointer',
        backgroundColor: inUse ? 'rgba(255, 255, 255, 0.1)' : 
                      selected ? 'rgba(0, 123, 255, 0.2)' : 
                      'rgba(255, 255, 255, 0.1)',
        opacity: inUse ? 0.7 : 1,
        borderRadius: '0.75rem',
        padding: styles.padding,
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        border: selected ? '2px solid #00bfff' : '2px solid rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ 
        height: styles.cardHeight,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Canvas
          camera={{ 
            position: [0, 1, screenSize <= breakpoints.sm ? 4 : 3], 
            fov: screenSize <= breakpoints.sm ? 60 : 50 
          }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <spotLight position={[0, 5, 0]} intensity={1} angle={0.6} penumbra={1} />
          <Suspense fallback={null}>
            <Model modelPath={character.modelPath} />
          </Suspense>
          {/* PC 화면에서만 OrbitControls 활성화 */}
          {screenSize > breakpoints.md && (
            <OrbitControls 
              enableZoom={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2}
            />
          )}
        </Canvas>
      </div>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '0.8em'
      }}>
        <h3 style={{ 
          margin: '0',
          fontSize: styles.fontSize,
          fontWeight: 'bold',
          color: inUse ? '#ff4d4f' : selected ? '#00bfff' : '#ffffff',
          textShadow: '0 0 8px rgba(0, 255, 255, 0.8)'
        }}>
          {character.name}
        </h3>
        <p style={{ 
          margin: '0.4em 0 0',
          fontSize: `calc(${styles.fontSize} * 0.9)`,
          color: inUse ? '#ff4d4f' : '#cccccc'
        }}>
          {inUse ? '접속 중' : '접속 가능'}
        </p>
      </div>
    </div>
  );
};

const CharacterSelection = ({ onSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterStatus, setCharacterStatus] = useState({});
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const styles = getResponsiveStyles(screenSize);

  const characters = [
    { id: 1, name: "제이크", description: "첫 번째 캐릭터", modelPath: "/models/character1.glb" },
    { id: 2, name: "리사", description: "두 번째 캐릭터", modelPath: "/models/character2.glb" },
    { id: 3, name: "맥스", description: "세 번째 캐릭터", modelPath: "/models/character3.glb" },
    { id: 4, name: "줄리", description: "네 번째 캐릭터", modelPath: "/models/character4.glb" },
    { id: 5, name: "잠비", description: "다섯 번째 캐릭터", modelPath: "/models/character5.glb" },
    { id: 6, name: "그렘린", description: "여섯 번째 캐릭터", modelPath: "/models/character6.glb" }
  ];

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchCharacterStatus = async () => {
      try {
        const response = await axios.get('/api/member/character-status');
        setCharacterStatus(response.data);
      } catch (error) {
        console.error('캐릭터 상태 조회 실패:', error);
      }
    };

    fetchCharacterStatus();
    const interval = setInterval(fetchCharacterStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelect = () => {
    if (selectedCharacter && !characterStatus[selectedCharacter.id]) {
      onSelect(selectedCharacter);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (screenSize <= breakpoints.md) {
        const currentIndex = characters.findIndex(c => c.id === (selectedCharacter?.id || 1));
        if (currentIndex < characters.length - 1) {
          setSelectedCharacter(characters[currentIndex + 1]);
        }
      }
    },
    onSwipedRight: () => {
      if (screenSize <= breakpoints.md) {
        const currentIndex = characters.findIndex(c => c.id === (selectedCharacter?.id || 1));
        if (currentIndex > 0) {
          setSelectedCharacter(characters[currentIndex - 1]);
        }
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  return (
    <div style={{
      width: '100%',
      maxWidth: screenSize <= breakpoints.md ? '100%' : '100vh',
      minHeight: screenSize <= breakpoints.md ? '100vh' : '100%',
      margin: '0 auto',
      padding: screenSize <= breakpoints.sm ? '0.8rem' : '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(120deg, #0d0d0d, #1a1a40, #3333cc)',
      backgroundSize: '400% 400%',
      animation: 'backgroundAnimation 20s ease infinite',
      boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
    }}>
      {/* 헤더 섹션을 PC에서만 표시 */}
      {screenSize > breakpoints.md && (
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
        }}>
          <h2 style={{ 
            fontSize: styles.headerSize,
            fontWeight: 'bold', 
            marginBottom: '1rem',
            marginTop: '2rem',
            color: '#ffffff', 
            textShadow: '0 0 12px rgba(0, 123, 255, 0.8)' 
          }}>
            캐릭터 선택
          </h2>
          <p style={{ 
            color: '#cccccc',
            marginBottom: '2em',
            fontSize: styles.fontSize,
          }}>
            마음에 드는 캐릭터를 선택하세요. 마우스로 드래그하여 캐릭터를 회전할 수 있습니다.
          </p>
        </div>
      )}
  
      {screenSize <= breakpoints.md ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          maxHeight: '-webkit-fill-available',
        }}>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '1rem',
            padding: '0 1rem',
          }}>
            {/* 왼쪽: 캐릭터 카드 영역 */}
            <div {...handlers} style={{
              flex: '0.5',
              marginBottom: '3rem',
              marginRight: '1rem',
              position: 'relative',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '60%',
            }}>
              {(selectedCharacter || characters[0]) && (
                <CharacterCard
                  character={selectedCharacter || characters[0]}
                  selected={true}
                  inUse={characterStatus[selectedCharacter?.id || characters[0].id]}
                  onClick={() => setSelectedCharacter(selectedCharacter || characters[0])}
                  screenSize={screenSize}
                />
              )}
              {/* 페이지 인디케이터 */}
              <div style={{
                position: 'absolute',
                bottom: '0.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '0.4rem',
              }}>
                {characters.map((char) => (
                  <div
                    key={char.id}
                    style={{
                      width: '0.4rem',
                      height: '0.4rem',
                      borderRadius: '50%',
                      backgroundColor: (selectedCharacter?.id || characters[0].id) === char.id ? 
                        '#00bfff' : 'rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
  
            {/* 오른쪽: 정보 및 버튼 영역 */}
            <div style={{
              flex: '0.8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '1rem',
              padding: '1rem',
              height: '100%',
              maxWidth: '40%',
            }}>
              <div style={{
                textAlign: 'left',
                marginBottom: '1rem',
              }}>
                <h3 style={{
                  margin: '0',
                  textAlign: 'center',
                  fontSize: '1.2rem',
                  color: '#fff',
                  fontWeight: 'bold',
                }}>
                  {selectedCharacter?.name || characters[0].name}
                </h3>
                <p style={{
                  margin: '0.5rem 0 0',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#ccc',
                }}>
                  {selectedCharacter?.description || characters[0].description}
                </p>
              </div>
  
              <button
                onClick={handleSelect}
                disabled={!selectedCharacter || characterStatus[selectedCharacter.id]}
                style={{
                  width: '100%',
                  padding: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '2px solid #00bfff',
                  color: selectedCharacter && !characterStatus[selectedCharacter.id] ? '#00bfff' : '#ccc',
                  borderRadius: '0.5rem',
                  cursor: selectedCharacter && !characterStatus[selectedCharacter.id] ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(0,255,255,0.7)',
                  transition: 'all 0.3s ease',
                }}
              >
                {!selectedCharacter ? '캐릭터를 선택해주세요' : 
                 characterStatus[selectedCharacter.id] ? '사용 중인 캐릭터입니다' : 
                 '선택 완료'}
              </button>
  
              {/* 스와이프 가이드 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                marginTop: '0.5rem',
              }}>
                <span style={{ fontSize: '1.2rem' }}>←</span>
                <span>스와이프</span>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* PC 레이아웃 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${
              screenSize <= breakpoints.lg ? '220px' : '250px'
            }, 1fr))`,
            gap: '1.25rem',
            marginBottom: '1.875rem'
          }}>
            {characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                selected={selectedCharacter?.id === character.id}
                inUse={characterStatus[character.id]}
                onClick={() => setSelectedCharacter(character)}
                screenSize={screenSize}
              />
            ))}
          </div>
  
          {/* PC에서만 하단 선택 버튼 표시 */}
          <div style={{ 
            textAlign: 'center',
            marginTop: '3rem',
          }}>
            <button
              onClick={handleSelect}
              disabled={!selectedCharacter || characterStatus[selectedCharacter.id]}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '2px solid #00bfff',
                color: selectedCharacter && !characterStatus[selectedCharacter.id] ? '#00bfff' : '#ccc',
                borderRadius: '0.5rem',
                cursor: selectedCharacter && !characterStatus[selectedCharacter.id] ? 'pointer' : 'not-allowed',
                fontSize: styles.fontSize,
                fontWeight: 'bold',
                textShadow: '0 0 8px rgba(0,255,255,0.7)',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                if (selectedCharacter && !characterStatus[selectedCharacter.id]) {
                  e.target.style.backgroundColor = '#00bfff';
                  e.target.style.color = '#ffffff';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.color = selectedCharacter && !characterStatus[selectedCharacter.id] ? '#00bfff' : '#ccc';
              }}
            >
              {!selectedCharacter ? '캐릭터를 선택해주세요' : 
               characterStatus[selectedCharacter.id] ? '사용 중인 캐릭터입니다' : 
               '선택 완료'}
            </button>
          </div>
        </>
      )}
  
      {/* 모바일에서 캐릭터 인덱스 표시 */}
      {screenSize <= breakpoints.md && selectedCharacter && (
        <div style={{
          position: 'absolute',
          marginRight: '1.8rem',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: '0.4rem 0.6rem',
          borderRadius: '1rem',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          {`${characters.findIndex(c => c.id === selectedCharacter.id) + 1} / ${characters.length}`}
        </div>
      )}
  
      <style>
        {`
          @keyframes backgroundAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
  
          @media (max-width: ${breakpoints.xs}px) {
            :root {
              font-size: 14px;
            }
          }
  
          @media (min-width: ${breakpoints.xs + 1}px) and (max-width: ${breakpoints.sm}px) {
            :root {
              font-size: 16px;
            }
          }
  
          @media (orientation: landscape) and (max-width: ${breakpoints.md}px) {
            .character-selection {
              min-height: 100vh;
              padding-bottom: 2rem;
            }
          }
  
          @media (hover: hover) {
            .character-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 6px 12px rgba(0,0,0,0.4);
            }
          }
  
          @supports (-webkit-touch-callout: none) {
            .character-selection {
              min-height: -webkit-fill-available;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CharacterSelection;