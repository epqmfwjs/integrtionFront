import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import axios from '../utils/axiosConfig';
import { useSwipeable } from 'react-swipeable';

// 중단점 설정 수정
const breakpoints = {
  mobile: 480,    // 모바일
  tablet: 768,    // 태블릿
  laptop: 1024,   // 노트북
  desktop: 1200,  // 데스크탑
  wide: 1440     // 와이드 스크린
};

// 반응형 스타일 계산 함수 수정
const getResponsiveStyles = (width, height) => {
  const isLandscape = width > height;

  // 모바일/태블릿 화면 조건 수정
  const isMobileView = width <= breakpoints.tablet || height <= 500;

  if (isMobileView) {
    return {
      containerStyle: {
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: '1rem',
        justifyContent: 'center',
        alignItems: 'center'
      },
      gridStyle: {
        display: 'flex',  // grid 대신 flex 사용
        width: '70%',
        alignItems: 'center',
        justifyContent: 'center'
      },
      cardWidth: isLandscape ? '190px' : '180px',
      cardHeight: isLandscape ? '190px' : '180px',
      fontSize: '1rem',
      headerSize: '1.2rem'
    };
  }

  // 데스크탑 (기존 그리드 레이아웃 유지)
  return {
    containerStyle: {
      padding: '0.5rem',
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    gridStyle: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      width: '70%',
      alignItems: 'center',
      margin: '0 auto'
    },
    cardWidth: '250px',
    cardHeight: '250px',
    fontSize: '1rem',
    headerSize: '1.5rem'
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

  // 모델 스케일 축소
  const scale = 0.00800; // 기존 0.0125에서 축소
  scene.scale.set(scale, scale, scale);

  return <primitive object={scene} />;
}

// CharacterCard 컴포넌트 수정
const CharacterCard = ({ 
  character, 
  selected, 
  inUse, 
  onClick, 
  screenSize,
  cardWidth,
  cardHeight,
  fontSize,
  styles  // styles prop 추가
}) => {
  const isMobile = screenSize <= breakpoints.tablet;

  return (
    <div onClick={() => !inUse && onClick()}
      style={{
        width: cardWidth,
        height: cardHeight,
        margin: '0 auto',
        cursor: inUse ? 'not-allowed' : 'pointer',
        backgroundColor: inUse ? 'rgba(255, 255, 255, 0.1)' : 
                      selected ? 'rgba(0, 123, 255, 0.2)' : 
                      'rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        padding: '1rem',
        transition: 'all 0.3s ease',
        transform: selected ? 'scale(1.05)' : 'scale(1)',  // 선택된 카드 강조
      }}>
      <div style={{ 
        height: cardHeight,  // styles.cardHeight를 cardHeight로 변경
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '0.5rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Canvas
          camera={{ 
            // 화면 크기에 따라 카메라 위치 동적 조정
            position: [0, 0.8, screenSize <= breakpoints.tablet ? 3 : 2.5],
            fov: screenSize <= breakpoints.tablet ? 50 : 45
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
        marginTop: isMobile ? '0' : '1.5em',  // 모바일에서는 마진 제거
        marginBottom: isMobile ? '0' : '1.5em'  // 모바일에서는 마진 제거
      }}>
        <h3 style={{ 
          margin: '0',
          fontSize: fontSize,  // styles.fontSize를 fontSize로 변경
          fontWeight: 'bold',
          color: inUse ? '#ff4d4f' : selected ? '#00bfff' : '#ffffff',
          textShadow: '0 0 8px rgba(0, 255, 255, 0.8)'
        }}>
          {character.name}
        </h3>
        <p style={{ 
          margin: isMobile ? '0' : '0.4em 0 0',  // 모바일에서는 마진 제거
          fontSize: `calc(${fontSize} * 0.9)`,  // styles.fontSize를 fontSize로 변경
          color: inUse ? '#ff4d4f' : '#cccccc'
        }}>
          {inUse ? '접속 중' : '접속 가능'}
        </p>
      </div>
    </div>
  );
};

// CharacterSelectionModal 컴포넌트
const CharacterSelectionModal = ({ isOpen, onClose, onConfirm, character, isInUse }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a40, #3333cc)',
        padding: '2rem',
        borderRadius: '1rem',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 0 20px rgba(0, 123, 255, 0.3)'
      }}>
        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>
          {character.name}
        </h3>
        <p style={{ color: '#ccc', marginBottom: '2rem' }}>
          {isInUse ? '현재 사용 중인 캐릭터입니다.' : '이 캐릭터를 선택하시겠습니까?'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {!isInUse && (
            <button
              onClick={onConfirm}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#00bfff',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              선택
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

// 스와이프 네비게이션 버튼 컴포넌트 추가
const NavigationButton = ({ direction, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      [direction === 'prev' ? 'left' : 'right']: '20px',
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      color: 'white',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {direction === 'prev' ? '←' : '→'}
  </button>
);

const CharacterSelection = ({ onSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterStatus, setCharacterStatus] = useState({});
  const [screenSize, setScreenSize] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const styles = getResponsiveStyles(screenSize, screenHeight);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      setScreenHeight(window.innerHeight);
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

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (selectedCharacter && !characterStatus[selectedCharacter.id]) {
      onSelect(selectedCharacter);
    }
    setModalOpen(false);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(characters.length - 1, prev + 1));
  };

  // isMobileView 상태 추가
  const isMobileView = screenSize <= breakpoints.tablet || screenHeight <= 500;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMobileView) {
        handleNext();
      }
    },
    onSwipedRight: () => {
      if (isMobileView) {
        handlePrev();
      }
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // 컨테이너 스타일 수정
  return (
    <div style={{
      width: '100%',
      height: '100vh',              // 전체 높이로 변경
      margin: '0 auto',
      background: 'linear-gradient(120deg, #0d0d0d, #1a1a40, #3333cc)',
      backgroundSize: '400% 400%',
      animation: 'backgroundAnimation 20s ease infinite',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',  // 변경
      overflow: screenSize <= breakpoints.tablet ? 'auto' : 'hidden',  // 모바일에서만 스크롤 허용
      overflowX: 'hidden',  // 가로 스크롤은 항상 비활성화
      ...styles.containerStyle
    }}>
      {/* 헤더 섹션 */}
      <div style={{
        width: '100%',
        textAlign: 'center',
        padding: '0.5rem'
      }}>
        <h2 style={{
          fontSize: styles.headerSize,
          color: '#ffffff',
          margin: 0,
          textShadow: '0 0 12px rgba(0, 123, 255, 0.8)'
        }}>
          캐릭터 선택
        </h2>
      </div>

      {/* 캐릭터 그리드/스와이프 영역 */}
      <div 
        {...handlers}
        style={{
          ...styles.gridStyle,
          position: 'relative',
          flex: 1,
          padding: '2rem 0'
        }}
      >
        {isMobileView ? (
          <>
            <NavigationButton
              direction="prev"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            />
            <CharacterCard
              character={characters[currentIndex]}
              selected={selectedCharacter?.id === characters[currentIndex].id}
              inUse={characterStatus[characters[currentIndex].id]}
              onClick={() => handleCharacterClick(characters[currentIndex])}
              screenSize={screenSize}
              cardWidth={styles.cardWidth}
              cardHeight={styles.cardHeight}
              fontSize={styles.fontSize}
              styles={styles}
            />
            <NavigationButton
              direction="next"
              onClick={handleNext}
              disabled={currentIndex === characters.length - 1}
            />
          </>
        ) : (
          // 데스크탑 그리드 뷰
          characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              selected={selectedCharacter?.id === character.id}
              inUse={characterStatus[character.id]}
              onClick={() => handleCharacterClick(character)}
              screenSize={screenSize}
              cardWidth={styles.cardWidth}
              cardHeight={styles.cardHeight}
              fontSize={styles.fontSize}
              styles={styles}
            />
          ))
        )}
      </div>

      {/* 모달 컴포넌트 */}
      <CharacterSelectionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        character={selectedCharacter}
        isInUse={selectedCharacter ? characterStatus[selectedCharacter.id] : false}
      />

      {/* 반응형 스타일 */}
      <style>
        {`
          @media (max-width: ${breakpoints.tablet}px) and (orientation: landscape) {
            .character-selection {
              overflow-y: auto;
              max-height: 100vh;
            }
          }

          @media (min-width: ${breakpoints.laptop}px) {
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