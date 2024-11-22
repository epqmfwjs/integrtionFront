// src/components/building/ControlsGuide.js
import { Text } from '@react-three/drei';

export const ControlsGuide = () => (
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
);