import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';

function Model({ modelPath }) {
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, scene);
  
  React.useEffect(() => {
    if (actions.Stop) {
      actions.Stop.reset().fadeIn(0.5).play();
      return () => actions.Stop.stop();
    }
  }, [actions]);

  scene.scale.set(0.0125, 0.0125, 0.0125);
  
  return <primitive object={scene} />;
}

const CharacterCard = ({ character, selected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{ 
        width: '250px',
        cursor: 'pointer',
        backgroundColor: selected ? '#e3f2fd' : '#fff',
        borderRadius: '8px',
        padding: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: selected ? '2px solid #007bff' : '2px solid transparent',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ 
        height: '200px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Canvas
          camera={{ position: [0, 1, 3], fov: 50 }}
          style={{ background: '#f5f5f5' }}
        >
          <ambientLight intensity={5} />
          <pointLight position={[10, 10, 10]} intensity={2} />
          <pointLight position={[-10, -10, -10]} intensity={1} />
          <spotLight 
            position={[0, 5, 0]} 
            intensity={1} 
            angle={0.6} 
            penumbra={1} 
          />
          <Suspense fallback={null}>
            <Model modelPath={character.modelPath} />
          </Suspense>
          <OrbitControls 
            enableZoom={false}
            minPolarAngle={Math.PI/4}
            maxPolarAngle={Math.PI/2}
          />
        </Canvas>
      </div>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '10px'
      }}>
        <h3 style={{ 
          margin: '0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: selected ? '#007bff' : '#333'
        }}>
          {character.name}
        </h3>
        <p style={{ 
          margin: '5px 0 0',
          fontSize: '14px',
          color: '#666'
        }}>
          {character.description}
        </p>
      </div>
    </div>
  );
};

const CharacterSelection = ({ onSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  
  const characters = [
    { id: 1, name: "제이크", description: "첫 번째 캐릭터", modelPath: "/models/character1.glb" },
    { id: 2, name: "리사", description: "두 번째 캐릭터", modelPath: "/models/character2.glb" },
    { id: 3, name: "맥스", description: "세 번째 캐릭터", modelPath: "/models/character3.glb" },
    { id: 4, name: "줄리", description: "네 번째 캐릭터", modelPath: "/models/character4.glb" },
    { id: 5, name: "잠비", description: "다섯 번째 캐릭터", modelPath: "/models/character5.glb" },
    { id: 6, name: "그렘린", description: "여섯 번째 캐릭터", modelPath: "/models/character6.glb" }
  ];

  const handleSelect = () => {
    if (selectedCharacter) {
      onSelect(selectedCharacter);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '12px' }}>
          캐릭터 선택
        </h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          마음에 드는 캐릭터를 선택하세요. 마우스로 드래그하여 캐릭터를 회전할 수 있습니다.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {characters.map((character) => (
          <CharacterCard
            key={character.id}
            character={character}
            selected={selectedCharacter?.id === character.id}
            onClick={() => setSelectedCharacter(character)}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleSelect}
          disabled={!selectedCharacter}
          style={{
            padding: '12px 32px',
            backgroundColor: selectedCharacter ? '#007bff' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedCharacter ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease'
          }}
        >
          {selectedCharacter ? '선택 완료' : '캐릭터를 선택해주세요'}
        </button>
      </div>
    </div>
  );
};

export default CharacterSelection;