// src/components/building/Lighting.js
export const Lighting = () => (
    <>
      <spotLight
        position={[0, 9, 0]}
        angle={Math.PI / 4}
        penumbra={0.5}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
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
      <ambientLight intensity={0.6} />
    </>
  );