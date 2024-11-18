import React, { useEffect, useState, useMemo } from 'react';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

const RoundedRectangle = ({ width, height, radius }) => {
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    
    const x = -width / 2;
    const y = -height / 2;
    
    // 시작점 (좌측 하단 모서리)
    shape.moveTo(x + radius, y);
    
    // 아래쪽 선
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    
    // 오른쪽 선
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    
    // 위쪽 선
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    
    // 왼쪽 선
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    
    return shape;
  }, [width, height, radius]);

  return (
    <mesh>
      <shapeGeometry args={[shape]} />
    </mesh>
  );
};

const ChatBubble = ({ message, position, height }) => {
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0);
  console.log('채팅 메시지:', message);
  console.log('ChatBubble 받은 데이터:', {
    message,
    position,
    height
  });
  useEffect(() => {
    // 메시지가 변경될 때마다 새로운 타이머 설정
    if (!message) {
      setVisible(false);
      setScale(0);
      return;
    }
    
    // 이전 상태 초기화
    setVisible(true);
    setScale(0);

    // 팝업 애니메이션
    const showTimer = setTimeout(() => {
      setScale(1);
    }, 50);

    // 사라지는 애니메이션
    const hideTimer = setTimeout(() => {
      setScale(0);
      setTimeout(() => setVisible(false), 300);
    }, 4700);
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [message]);
  
  if (!visible || !message) return null;

  const width = Math.min(message.length * 0.15 + 0.6, 4);
  const height_box = 0.5;
  
  return (
    <group position={[position[0], position[1] + height + 0.8, position[2]]}>
      <Billboard
        follow={true}
        lockX={true}
        lockY={false}
        lockZ={true}
      >
        <group scale={[scale, scale, scale]}>
          {/* 그림자 */}
          <group position={[0, -0.02, -0.03]}>
            <RoundedRectangle 
              width={width + 0.1} 
              height={height_box + 0.1} 
              radius={0.1}
            />
            <meshBasicMaterial 
              color="black" 
              opacity={0.2} 
              transparent
            />
          </group>

          {/* 메인 배경 */}
          <group position={[0, 0, -0.01]}>
            <RoundedRectangle 
              width={width} 
              height={height_box} 
              radius={0.08}
            />
            <meshBasicMaterial 
              color={new THREE.Color('#ffffff')}
              opacity={0.95} 
              transparent
            />
          </group>
          
          {/* 테두리 */}
          <group position={[0, 0, -0.015]}>
            <RoundedRectangle 
              width={width + 0.04} 
              height={height_box + 0.04} 
              radius={0.1}
            />
            <meshBasicMaterial 
              color={new THREE.Color('#2196f3')}
              opacity={0.3} 
              transparent
            />
          </group>
          
          {/* 말풍선 꼬리 */}
          <mesh position={[0, -0.35, -0.02]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([
                  -0.1, 0, 0,
                  0.1, 0, 0,
                  0, -0.15, 0
                ])}
                count={3}
                itemSize={3}
              />
            </bufferGeometry>
            <meshBasicMaterial 
              color={new THREE.Color('#ffffff')}
              opacity={0.95} 
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* 메시지 텍스트 */}
          <Text
            fontSize={0.2}
            maxWidth={width - 0.2}
            color="black"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#ffffff"
          >
            {message}
          </Text>
        </group>
      </Billboard>
    </group>
  );
};

export default ChatBubble;