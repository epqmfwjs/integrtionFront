// src/components/Buildings.js
import React, { useState, useCallback } from 'react';
import { useThree, useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';
import { Floor } from './building/Floor';
import { WallLamp } from './building/WallLamp';
import { Stairs } from './building/Stairs';
import { ProjectFrame } from './building/ProjectFrame';
import { ExternalWalls } from './building/ExternalWalls';
import { Ceiling } from './building/Ceiling';
import { Modal } from './building/Modal';
import { SoccerBall } from './building/SoccerBall';
import { Campfire } from './building/Campfire';
import { SpotifyPlayer } from './building/musicPlayer/SpotifyPlayer';
import { RigidBody } from '@react-three/rapier';

export const Buildings = ({ characterPosition }) => {
  const { gl } = useThree();
  
  // 텍스처 로딩
  const texture1 = useLoader(TextureLoader, '/images/ExhibitScape.png');
  const texture2 = useLoader(TextureLoader, '/images/LearnWay.jpg');
  const texture3 = useLoader(TextureLoader, '/images/CCM.png');
  const marbleTexture = useLoader(TextureLoader, '/images/marble.jpg');
  const ceilingTexture = useLoader(TextureLoader, '/images/ceiling.jpg');
  const wallsTexture = useLoader(TextureLoader, '/images/walls.jpg');
  const woodTexture = useLoader(TextureLoader, '/images/wood.jpg');

  // 텍스처 설정
  [marbleTexture, ceilingTexture, wallsTexture, woodTexture].forEach(texture => {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  });

  marbleTexture.repeat.set(10, 10);
  ceilingTexture.repeat.set(10, 10);
  wallsTexture.repeat.set(1, 1);
  woodTexture.repeat.set(1, 1);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleModalConfirm = useCallback(() => {
    if (selectedProject?.url) {
      window.open(selectedProject.url, '_blank');
      setModalOpen(false);
    }
  }, [selectedProject]);

  const handleMeshClick = useCallback((e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setModalOpen(true);
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }, []);

  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    gl.domElement.style.cursor = 'pointer';
  }, [gl]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    gl.domElement.style.cursor = 'default';
  }, [gl]);

  // InnerWalls 컴포넌트
  const InnerWalls = () => (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[10, 3, -5]} castShadow>
        <boxGeometry args={[0.5, 6, 15]} />
        <meshStandardMaterial map={wallsTexture} />
      </mesh>
    </RigidBody>
  );

  // ExtendedFloor 컴포넌트
  const ExtendedFloor = () => (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={[-37.5, 0.1, 0]} receiveShadow>
        <boxGeometry args={[25, 0.2, 50]} />
        <meshStandardMaterial 
          map={marbleTexture}
          metalness={0.2}
          roughness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>
    </RigidBody>
  );

  return (
    <group>
      <Floor marbleTexture={marbleTexture} />
      <ExtendedFloor />
      <ExternalWalls ceilingTexture={ceilingTexture} />
      <InnerWalls />
      <Stairs woodTexture={woodTexture} />
      
      {[-11, -6, -1].map((z, index) => (
        <WallLamp key={index} position={[9.5, 4.5, z]} />
      ))}

      {/* 프로젝트 프레임들 */}
      <ProjectFrame
        position={[9.7, 2, -1]}
        title="ExhibitScape"
        texture={texture1}
        handleMeshClick={handleMeshClick}
        handlePointerOver={handlePointerOver}
        handlePointerOut={handlePointerOut}
        modalInfo={{
          title: 'ExhibitScape',
          description: '공용 아이디\ntest\n공용 비밀번호 password123!\n\n본 사이트는 아직 반응형 웹이 아닙니다. PC환경에서 확인해주세요.\n사이트를 방문하시겠습니까?',
          url: 'http://gogolckh.ddns.net:90'
        }}
        description={'팀프로젝트\n\n전시회정보공유웹서비스\n\n기술 Java/SpringBoot/gradle/JPA/MySQL/WebSocket\n\n기간 2024.05.10~2021.06.05'}
      />

      <ProjectFrame
        position={[9.7, 2, -6]}
        title="LearnWay"
        texture={texture2}
        handleMeshClick={handleMeshClick}
        handlePointerOver={handlePointerOver}
        handlePointerOut={handlePointerOut}
        modalInfo={{
          title: 'LearnWay',
          description: '공용 아이디\ntest\n공용 비밀번호 password123!\n\n본 사이트는 아직 반응형 웹이 아닙니다. PC환경에서 확인해주세요.\n사이트를 방문하시겠습니까?',
          url: 'http://gogolckh.ddns.net:89'
        }}
        description={'팀프로젝트(기업연계)\n\n학생일정관리및커뮤니티웹서비스\n\n기술 Java/SpringBoot/gradle/JPA/MySQL\n/AWS/WebSocket/WebRTC\n\n기간 2024.06.13~2021.07.12'}
      />

      <ProjectFrame
        position={[9.7, 2, -11]}
        title="CCM"
        texture={texture3}
        handleMeshClick={handleMeshClick}
        handlePointerOver={handlePointerOver}
        handlePointerOut={handlePointerOut}
        modalInfo={{
          title: 'CCM',
          description: '공용 아이디\ntest\n공용 비밀번호 password123!\n\n본 사이트는 아직 반응형 웹이 아닙니다. PC환경에서 확인해주세요.\n사이트를 방문하시겠습니까?',
          url: 'http://gogolckh.ddns.net:88'
        }}
        description={'개인프로젝트\n\n카페인계산기및정보공유웹서비스\n\n기술 Java/SpringBoot/gradle/JPA/MySQL\n\n기간 2024.09~2021.10'}
      />

      <Ceiling ceilingTexture={ceilingTexture} />
      
      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        projectInfo={selectedProject}
        characterPosition={characterPosition}
      />

      <SoccerBall position={[5, 1, 5]} />
      <Campfire position={[-38, 0.2, 41]} />

      {/* MusicPlayer */}
      <SpotifyPlayer 
        position={[-45.8, 1, 45.8]} 
        rotation={[0, Math.PI / 1.5, 0]} 
      />
    </group>
  );
};