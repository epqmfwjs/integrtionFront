// src/hooks/useTextures.js
import { useLoader } from '@react-three/fiber';
import { TextureLoader, RepeatWrapping } from 'three';

export const useTextures = () => {
  const textures = {
    exhibitscape: useLoader(TextureLoader, '/images/ExhibitScape.png'),
    learnway: useLoader(TextureLoader, '/images/LearnWay.jpg'),
    ccm: useLoader(TextureLoader, '/images/CCM.png'),
    marble: useLoader(TextureLoader, '/images/marble.jpg'),
    ceiling: useLoader(TextureLoader, '/images/ceiling.jpg'),
    walls: useLoader(TextureLoader, '/images/walls.jpg'),
    wood: useLoader(TextureLoader, '/images/wood.jpg')
  };

  Object.entries(textures).forEach(([key, texture]) => {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    if (key === 'marble' || key === 'ceiling') {
      texture.repeat.set(10, 10);
    } else {
      texture.repeat.set(1, 1);
    }
  });

  return textures;
};