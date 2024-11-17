// src/components/Buildings.js
import React, { useEffect, useState, useCallback } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useThree, useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping, PointLight, MeshStandardMaterial, SpotLight } from 'three';
import { Text } from '@react-three/drei'; // Text 컴포넌트 추가
import { Modal } from './Modal';

export const Buildings = ({ characterPosition }) => {  // characterPosition prop 추가
  const { gl } = useThree();
  
  // 이미지 텍스처 로드
  const texture1 = useLoader(TextureLoader, '/images/ExhibitScape.png'); // 첫 번째 액자 이미지
  const texture2 = useLoader(TextureLoader, '/images/LearnWay.jpg'); // 두 번째 액자 이미지
  const texture3 = useLoader(TextureLoader, '/images/CCM.png'); // 세 번째 액자 이미지
  
  // 바닥 텍스처 로드
  const marbleTexture = useLoader(TextureLoader, '/images/marble.jpg');
  marbleTexture.wrapS = RepeatWrapping;
  marbleTexture.wrapT = RepeatWrapping;
  marbleTexture.repeat.set(10, 10); // 텍스처 반복 횟수

  // 천장 텍스처 로드
  const ceilingTexture = useLoader(TextureLoader, '/images/ceiling.jpg');
  ceilingTexture.wrapS = RepeatWrapping;
  ceilingTexture.wrapT = RepeatWrapping;
  ceilingTexture.repeat.set(10, 10); // 텍스처 반복 횟수

  // 내부 벽 텍스처 로드
  const wallsTexture = useLoader(TextureLoader, '/images/walls.jpg');
  wallsTexture.wrapS = RepeatWrapping;
  wallsTexture.wrapT = RepeatWrapping;
  wallsTexture.repeat.set(1, 1); // 텍스처 반복 횟수

  // 옥상 데크 텍스처 로드
  const woodTexture = useLoader(TextureLoader, '/images/wood.jpg');
  woodTexture.wrapS = RepeatWrapping;
  woodTexture.wrapT = RepeatWrapping;
  woodTexture.repeat.set(1, 1); // 텍스처 반복 횟수

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleModalConfirm = useCallback(() => {
    if (selectedProject && selectedProject.url) {
      window.open(selectedProject.url, '_blank');
      setModalOpen(false);
    }
  }, [selectedProject]);

  const handleFrameClick = useCallback((project) => {
    console.log('Frame clicked:', project); // 클릭 이벤트 디버깅

    // 즉시 상태 업데이트 후 포인터 락 해제
    setSelectedProject(project);
    setModalOpen(true);

    // 포인터 락 해제는 상태 업데이트 후에 실행
    if (document.pointerLockElement) {
      try {
        document.exitPointerLock();
      } catch (error) {
        console.error('Error unlocking pointer:', error);
      }
    }
  }, []);

  // 액자 클릭 이벤트 핸들러
  const handleMeshClick = useCallback((e, project) => {
    e.stopPropagation();
    console.log('Mesh clicked, current pointer lock:', document.pointerLockElement); // 클릭 상태 디버깅
    handleFrameClick(project);
  }, [handleFrameClick]);

  useEffect(() => {
    // 페이지 언마운트시 포인터 락 해제
    return () => {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
  }, []);

  // 포인터 이벤트 핸들러 개선
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    gl.domElement.style.cursor = 'pointer';
  }, [gl]);

  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    gl.domElement.style.cursor = 'default';
  }, [gl]);

  // 발광 재질 생성 수정
  const glowMaterial = new MeshStandardMaterial({
    color: '#FFF5E1',
    emissive: '#FFF5E1',
    emissiveIntensity: 3,  // 발광 강도 증가
    toneMapped: false
  });

  // 벽등 컴포넌트 수정
  const WallLamp = ({ position }) => (
    <group position={position} rotation={[0, Math.PI, 0]}> {/* 180도 회전 추가 */}
      {/* 벽등 마운트 */}
      <mesh castShadow>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <meshStandardMaterial color="#696969" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* 벽등 갓 */}
      <mesh position={[0.2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 0.3, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={0.6} 
          roughness={0.3}
          emissive="#FFD700"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* 주 스포트라이트 - 방향 수정 */}
      <spotLight
        position={[0.3, 0, 0]}
        target-position={[1, 0, 0]} // 빛을 비추는 방향 지정
        angle={Math.PI / 3}
        penumbra={0.8}
        intensity={3}
        distance={10}
        color="#FFF5E1"
        castShadow
        power={20}
        decay={1.5}
      />
      
      {/* 보조 포인트라이트 */}
      <pointLight
        position={[0.3, 0, 0]}
        intensity={1}
        distance={5}
        color="#FFF5E1"
        castShadow={false}
        decay={2}
      />
      
      {/* 발광 구체 */}
      <mesh position={[0.2, -0.2, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <primitive object={glowMaterial.clone()} />
      </mesh>

      {/* 빛 번짐 효과 (여러 레이어) */}
      {[0.15, 0.2, 0.25].map((size, i) => (
        <mesh key={i} position={[0.2, -0.3, 0]}>
          <sphereGeometry args={[size, 16, 16]} />
          <meshBasicMaterial 
            color="#FFF5E1" 
            transparent={true} 
            opacity={0.15 - i * 0.03}
            blending={2}
          />
        </mesh>
      ))}
    </group>
  );

  return (
    <group>
      {/* 메인 전시장 바닥 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[50, 0.2, 50]} />
          <meshStandardMaterial 
            map={marbleTexture}
            metalness={0.2}
            roughness={0.1}
            envMapIntensity={0.5}
          />
        </mesh>
        {/* 바닥 하이라이트 효과 */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[50, 0.01, 50]} />
          <meshPhysicalMaterial
            transparent
            opacity={0.1}
            metalness={1}
            roughness={0}
            clearcoat={1}
            reflectivity={1}
          />
        </mesh>
      </RigidBody>

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


      {/* 바닥 장식용 골드 라인 */}
      <mesh position={[0, 0.12, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[70, 0.01, 0.5]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[70, 0.01, 0.5]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 외벽 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 5, -25]} castShadow>
          <boxGeometry args={[50, 12, 1]} />
          <meshStandardMaterial 
            map={ceilingTexture}
          />
        </mesh>
        
        {/* 조작 설명 텍스트 */}
        <group position={[0, 6, -24.4]}>
          <Text
            position={[0, 2, 0]}
            scale={[0.8, 0.8, 0.8]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            조작 방법
          </Text>
          <Text
            position={[0, 1, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            이동: W A S D
          </Text>
          <Text
            position={[0, 0.2, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            점프: Space Bar
          </Text>
          <Text
            position={[0, -0.6, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            Shift 키 : 전력질주 
          </Text>
          <Text
            position={[0, -1.4, 0]}
            scale={[0.5, 0.5, 0.5]}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            Ctrl 키 : 마우스모드 액션모드 변경
          </Text>
        </group>

        <mesh position={[25, 10, 0]} castShadow>
          <boxGeometry args={[1, 2, 51]} />
          <meshStandardMaterial 
            map={ceilingTexture}
          />
        </mesh>

        {/* 유리창 밑 틀 */}
        <mesh position={[0, 0.2, 25]} castShadow>
          <boxGeometry args={[50, 1, 1]} />
          <meshStandardMaterial 
            map={ceilingTexture}
          />
        </mesh>
        {/* 유리창 위 틀 */}
        <mesh position={[0, 10, 25]} castShadow>
          <boxGeometry args={[50, 2, 1]} />
          <meshStandardMaterial 
            map={ceilingTexture}
          />
        </mesh>

        {/* 유리창 */}
        <mesh position={[0, 5, 25]} castShadow>
          <boxGeometry args={[50, 10, 0.1]} />
          <meshPhysicalMaterial 
            transparent={true}
            opacity={0.3}
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            reflectivity={1}
            color="#88ccff"
          />
        </mesh>
      </RigidBody>

      {/* 전시 벽면들 */}
      {/* <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-10, 3, -5]} castShadow>
          <boxGeometry args={[0.5, 6, 15]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      </RigidBody> */}

      {/* 계단 - 각 계단마다 개별 RigidBody 적용 */}
      {/* 첫 번째 계단 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-27, 1.5, 15]} castShadow>
          <boxGeometry args={[2.5, 0.3, 6]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
      </RigidBody>

      {/* 두 번째 계단 */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-27, 3, 9]} castShadow>
          <boxGeometry args={[2.5, 0.3, 6]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
      </RigidBody>

      {/* 세 번째 계단 */}
      <RigidBody type="fixed" position={[-27, 4.5,3]} colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[2.5, 0.3, 6]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
      </RigidBody>

      {/* 네 번째 계단 */}
      <RigidBody type="fixed" position={[-27, 6, -3]} colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[2.5, 0.3, 6]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
      </RigidBody>

      {/* 다섯 번째 계단 */}
      <RigidBody type="fixed" position={[-27, 7.5, -9]} colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[2.5, 0.3, 6]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
      </RigidBody>

      {/* 여섯 번째 계단 */}
      <RigidBody type="fixed" position={[-27, 9, -15]} colliders="cuboid">
        <mesh castShadow>
          <boxGeometry args={[2.5, 0.3, 6]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
      </RigidBody>

      
      {/*왼쪽 전시벽면*/}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[10, 3, -5]} castShadow>
          <boxGeometry args={[0.5, 6, 15]} />
          <meshStandardMaterial 
            map={wallsTexture}
          />
        </mesh>
        
        {/* 벽등 설치 */}
        {[-11, -6, -1].map((z, index) => (
          <WallLamp key={index} position={[9.5, 4.5, z]} />
        ))}
      </RigidBody>

      {/* 왼쪽 액자 1   
      <group position={[-9.7, 2, -3]} rotation={[0, Math.PI * 2.5, 0]}>
        
        <Text
          position={[0, 1, 0]}
          scale={[0.3, 0.3, 0.3]}
          color="black"
          anchorX="center"
          anchorY="bottom"
        >
          ReCCM
        </Text>
        
        
        <Text
          position={[1, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          color="black"
          anchorX="left"
          anchorY="middle"
          maxWidth={2}
        >
          카페인계산기및정보공유웹서비스
          기술 Java/SpringBoot/gradle/JPA/MySQL
          프로젝트 기간: 2024.09~2021.10
          개인프로젝트
        </Text>

        
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[1.7, 1.7, 0.1]} /> 
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        <mesh
          position={[0, 0, 0]}
          onClick={() => handleFrameClick('https://example.com')}
          onPointerOver={(e) => gl.domElement.style.cursor = 'pointer')}
          onPointerOut={(e) => gl.domElement.style.cursor = 'default')}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={texture1} />
        </mesh>
      </group>
*/}
      {/* 오른쪽 액자 1*/}
      <group position={[9.7, 2, -1]} rotation={[0, -Math.PI/2, 0]}>
        {/* 제목 텍스트 */}
        <Text
          position={[0, 1, 0]}
          scale={[0.3, 0.3, 0.3]}
          color="black"
          anchorX="center"
          anchorY="bottom"
        >
          ExhibitScape
        </Text>
        
        {/* 설명 텍스트 */}
        <Text
          position={[1, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          color="black"
          anchorX="left"
          anchorY="middle"
          maxWidth={2}
          >
          팀프로젝트
          전시회소개및커뮤니티웹서비스
          기술 Java/SpringBoot/gradle/JPA/MySQL/WebSocket
          기간 2024.05.10~2021.06.05
        </Text>

        {/* 액자 테두리 */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[1.7, 1.7, 0.1]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        {/* 액자 이미지 */}
        <mesh
          position={[0, 0, 0]}
          onClick={(e) => {
            handleMeshClick(e, {
              title: 'ExhibitScape',
              description: '공용 아이디\ntest\n공용 비밀번호 password123!\n\n본 사이트는 아직 반응형 웹이 아닙니다. PC환경에서 확인해주세요.\n사이트를 방문하시겠습니까?',
              url: 'http://gogolckh.ddns.net:90',
              position: [9.7, 2, -1]
            });
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={texture1} />
        </mesh>
      </group>

      {/* 오른쪽 액자 2*/}
      <group position={[9.7, 2, -6]} rotation={[0, -Math.PI/2, 0]}>
        {/* 제목 텍스트 */}
        <Text
          position={[0, 1, 0]}
          scale={[0.3, 0.3, 0.3]}
          color="black"
          anchorX="center"
          anchorY="bottom"
        >
          LearnWay
        </Text>
        
        {/* 설명 텍스트 */}
        <Text
          position={[1, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          color="black"
          anchorX="left"
          anchorY="middle"
          maxWidth={2}
        >
          팀프로젝트(기업연계)
          학생일정관리및커뮤니티웹서비스
          기술 Java/SpringBoot/gradle/JPA/MySQL
          /AWS/WebSocket/WebRTC
          기간 2024.06.13~2021.07.12
        </Text>

        {/* 액자 테두리 */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[1.7, 1.7, 0.1]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* 액자 이미지 */}
        <mesh
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            handleFrameClick({
              title: 'LearnWay',
              description: '공용 아이디\ntest\n공용 비밀번호 password123!\n\n본 사이트는 아직 반응형 웹이 아닙니다. PC환경에서 확인해주세요.\n사이트를 방문하시겠습니까?',
              url: 'http://gogolckh.ddns.net:89',
              position: [9.7, 2, -6]
            });
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={texture2} />
        </mesh>
      </group>

      {/* 오른쪽 액자 3*/}
      <group position={[9.7, 2, -11]} rotation={[0, -Math.PI/2, 0]}>
        {/* 제목 텍스트 */}
        <Text
          position={[0, 1, 0]}
          scale={[0.3, 0.3, 0.3]}
          color="black"
          anchorX="center"
          anchorY="bottom"
        >
          CCM
        </Text>
        
        {/* 설명 텍스트 */}
        <Text
          position={[1, 0, 0]}
          scale={[0.1, 0.1, 0.1]}
          color="black"
          anchorX="left"
          anchorY="middle"
          maxWidth={2}
        >
          개인프로젝트
          카페인계산기및정보공유웹서비스
          
          기술 Java/SpringBoot/gradle/JPA/MySQL
          
          기간 2024.09~2021.10
        </Text>

        {/* 액자 테두리 */}
        <mesh position={[0, 0, -0.06]}>
          <boxGeometry args={[1.7, 1.7, 0.1]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
        
        {/* 액자 이미지 */}
        <mesh
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            handleFrameClick({
              title: 'CCM',
              description: '공용 아이디\ntest\n공용 비밀번호 password123!\n\n본 사이트는 아직 반응형 웹이 아닙니다. PC환경에서 확인해주세요.\n사이트를 방문하시겠습니까?',
              url: 'http://gogolckh.ddns.net:88',
              position: [9.7, 2, -11]
            });
          }}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial map={texture3} />
        </mesh>
      </group>

      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleModalConfirm}
        projectInfo={selectedProject}
        characterPosition={characterPosition}  // 캐릭터 위치 전달
      />

      {/* 천장 */}
      <RigidBody 
        type="fixed" 
        friction={0.5}
        colliders="cuboid"
        restitution={0}
      >
        <mesh position={[0, 9.8, 0]}>
          <boxGeometry args={[50, 0.3, 50]} />
          <meshStandardMaterial map={ceilingTexture} />
        </mesh>
      </RigidBody>

      {/* 옥상 데크 */}
      {/* <RigidBody 
        type="fixed" 
        friction={0.5}
        colliders="cuboid"
        restitution={0}
      >
        <mesh position={[0, 10.3, 0]}> // 위치 조정
          <boxGeometry args={[50, 0.3, 50]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
      </RigidBody> */}

      {/* 천장 스포트라이트 */}
      <spotLight
        position={[0, 9, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* 보조 조명들 */}
      <pointLight
        position={[-10, 8, -5]}
        intensity={1}
        color="#ffffff"
        castShadow
      />
      <pointLight
        position={[10, 8, -5]}
        intensity={1}
        color="#ffffff"
        castShadow
      />

      {/* 환경광 추가 */}
      <ambientLight intensity={0.6} />
    </group>
  );
};