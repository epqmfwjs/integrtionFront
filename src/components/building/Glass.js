// src/components/building/Glass.js
export const Glass = () => (
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
  );