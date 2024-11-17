import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import '../styles/Modal.css';  // CSS 파일 추가
export const Modal = ({ isOpen, onClose, onConfirm, projectInfo }) => {
  const { camera } = useThree();
  
  if (!isOpen || !projectInfo) return null;

  // 프로젝트(액자) 위치의 옆쪽에 모달 배치
  const offset = 2; // 액자로부터의 거리
  const modalPosition = [
    projectInfo.position[0] - 0.5,  // 액자보다 2단위 왼쪽으로
    projectInfo.position[1] - 1.5,      // 같은 높이
    projectInfo.position[2]       // 같은 z축
  ];

  return (
    <Html
      position={modalPosition}
      rotation-y={Math.PI / 2}  // 90도 회전하여 옆면 보이게
      transform
      distanceFactor={1}
      style={{
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="modal-container">
        <h3 style={{ 
          fontSize: '100px',  // 제목 크기
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>{projectInfo.title}</h3>
        <p style={{ 
          fontSize: '80px',  // 설명 텍스트 크기
          lineHeight: '1.5',
          marginBottom: '30px',
          whiteSpace: 'pre-line' // 줄바꿈 처리
        }}>{projectInfo.description}</p>
        <div>
          <button 
            onClick={onConfirm}
            className="modal-button confirm-button"
          >
            사이트 방문하기
          </button>
          <button 
            onClick={onClose}
            className="modal-button close-button"
          >
            닫기
          </button>
        </div>
      </div>
    </Html>
  );
};