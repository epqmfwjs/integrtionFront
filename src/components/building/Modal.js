import React from 'react';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import '../../styles/Modal.css';  // CSS 파일 추가
export const Modal = ({ isOpen, onClose, onConfirm, projectInfo }) => {
  const { camera } = useThree();
  
  if (!isOpen || !projectInfo) return null;

  const offset = 2;
  const modalPosition = [
    projectInfo.position[0] - 0.5,
    projectInfo.position[1] - 1.5,
    projectInfo.position[2]
  ];

  return (
    <Html
      position={modalPosition}
      rotation-y={Math.PI / 2}
      transform
      distanceFactor={1}
      style={{
        transformStyle: 'preserve-3d'
      }}
    >
      <div className="modal-container">
        <h3 style={{ 
          fontSize: '100px',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>{projectInfo.title}</h3>
        <p style={{ 
          fontSize: '80px',
          lineHeight: '1.5',
          marginBottom: '30px',
          whiteSpace: 'pre-line'
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