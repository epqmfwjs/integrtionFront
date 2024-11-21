import React, { useState } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text, Html } from '@react-three/drei';

export const Computer = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);

  const folders = [
    {
      id: 'projects',
      name: '프로젝트',
      files: [
        { name: 'ExhibitScape', type: 'link', url: 'http://gogolckh.ddns.net:90' },
        { name: 'LearnWay', type: 'link', url: 'http://gogolckh.ddns.net:89' },
        { name: 'CCM', type: 'link', url: 'http://gogolckh.ddns.net:88' }
      ]
    },
    {
      id: 'documents',
      name: '문서',
      files: [
        { name: '이력서.pdf', type: 'document' },
        { name: '포트폴리오.pdf', type: 'document' }
      ]
    }
  ];

  const handleInteraction = () => {
    setIsActive(!isActive);
    setActiveFolder(null);
  };

  const handleFolderClick = (folderId) => {
    setActiveFolder(folderId);
  };

  const handleFileClick = (file) => {
    if (file.type === 'link' && file.url) {
      window.open(file.url, '_blank');
    }
  };

  const DesktopIcon = ({ name, onClick, position }) => (
    <div 
      style={{
        position: 'absolute',
        top: position[1],
        left: position[0],
        width: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        color: 'white'
      }}
      onClick={onClick}
    >
      <div style={{
        width: '100px',
        height: '100px',
        background: '#f0f0f0',
        borderRadius: '5px',
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        📁
      </div>
      <span style={{ fontSize: '12px', textAlign: 'center' }}>{name}</span>
    </div>
  );

  const FolderWindow = ({ folder, onClose }) => (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      height: '600px',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{folder.name}</span>
        <button 
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer' }}
        >✕</button>
      </div>
      <div style={{ padding: '10px' }}>
        {folder.files.map((file, index) => (
          <div
            key={index}
            onClick={() => handleFileClick(file)}
            style={{
              padding: '8px',
              cursor: 'pointer',
              borderRadius: '4px',
              ':hover': { background: '#f5f5f5' }
            }}
          >
            {file.type === 'link' ? '🌐' : '📄'} {file.name}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group 
        position={position} 
        rotation={rotation}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={handleInteraction}
      >
        {/* 책상 */}
        <mesh position={[0, 0.5, 18.8]}>
          <boxGeometry args={[2, 0.1, 1.2]} />
          <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.8} />
        </mesh>

        {/* 책상 다리 */}
        {[[-0.9, 0.05, 19.35], [0.9, 0.05, 19.35], [-0.9, 0.05, 18.25], [0.9, 0.05, 18.25]].map((pos, i) => (
          <mesh key={i} position={pos}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.8} />
          </mesh>
        ))}

        {/* 모니터 스탠드 */}
        <mesh position={[0, 1, 19]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
          <meshStandardMaterial color="#404040" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 모니터 베이스 */}
        <mesh position={[0, 0.55, 19]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
          <meshStandardMaterial color="#404040" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* 모니터 프레임 */}
        <mesh position={[0, 1.5, 19]}>
          <boxGeometry args={[1.6, 1, 0.1]} />
          <meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* 모니터 스크린 */}
        <mesh position={[0, 1.5, 19]}>
          <boxGeometry args={[1.5, 0.9, 0.01]} />
          <meshStandardMaterial 
            color={isActive ? "#ffffff" : "#000000"} 
            emissive={isActive ? "#4488ff" : "#000000"}
            emissiveIntensity={isActive ? 1.2 : 0}
          />
        </mesh>

        {/* 데스크톱 인터페이스 */}
        {isActive && (
          <Html
            center
            position={[0, 1.5, 18.8]}
            style={{
              width: '2090px',
              height: '2090px',
              background: 'linear-gradient(135deg, #0078D4, #005A9E)',
              border: '2px solid #333',
              borderRadius: '5px',
              transform: 'scale(0.5)',
              pointerEvents: 'auto',
              zIndex: 1000,
              overflow: 'hidden'
            }}
            distanceFactor={1.5}
            transform
            rotation={[0, Math.PI, 0]}
          >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {folders.map((folder, index) => (
                <DesktopIcon
                  key={folder.id}
                  name={folder.name}
                  onClick={() => handleFolderClick(folder.id)}
                  position={[20, 20 + (index * 100)]}
                />
              ))}
              
              {activeFolder && (
                <FolderWindow
                  folder={folders.find(f => f.id === activeFolder)}
                  onClose={() => setActiveFolder(null)}
                />
              )}
            </div>
          </Html>
        )}

        {/* 스크린 글로우 효과 */}
        {isActive && (
          <>
            {/* 중앙 메인 라이트 */}
            <pointLight
              position={[0, 1.4, 18.8]}
              intensity={0.7}
              distance={5}
              color="#4488ff"
            />
            {/* 측면 보조 라이트들 */}
            <pointLight
              position={[0.7, 1.4, 18.8]}
              intensity={0.3}
              distance={3}
              color="#4488ff"
            />
            <pointLight
              position={[-0.7, 1.4, 18.8]}
              intensity={0.3}
              distance={3}
              color="#4488ff"
            />
            {/* 주변 환경 글로우 */}
            <spotLight
              position={[0, 1.4, 18.8]}
              angle={Math.PI / 2}
              penumbra={1}
              intensity={0.5}
              distance={4}
              color="#4488ff"
            />
          </>
        )}

        {/* 키보드 */}
        <mesh position={[0, 0.6, 18.5]}>
          <boxGeometry args={[1, 0.05, 0.3]} />
          <meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* 마우스 */}
        <mesh position={[-0.8, 0.6, 18.5]}>
          <boxGeometry args={[0.15, 0.03, 0.25]} />
          <meshStandardMaterial color="#2b2b2b" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* 상호작용 텍스트 */}
        {isHovered && (
          <Text
            position={[0, 2.3, 19]}
            rotation={[0, Math.PI, 0]}
            scale={[0.2, 0.2, 0.2]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            상태 : {isActive ? '켜짐' : '꺼짐'}
          </Text>
        )}
      </group>
    </RigidBody>
  );
};