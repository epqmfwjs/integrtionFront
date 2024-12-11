import { useGLTF, useAnimations, Html } from "@react-three/drei";
import { useCallback, useEffect, useState } from "react";

export function NPC({ position, onInteract }) {
 const { scene, animations } = useGLTF("/models/npc.glb");
 const { actions } = useAnimations(animations, scene);
 const [isHovered, setIsHovered] = useState(false);

 useEffect(() => {
   Object.values(actions).forEach(action => action?.stop());
   if (actions.Stop) {
     actions.Stop.play();
     actions.Stop.loop = true;
   }
 }, [actions]);

 const handleClick = useCallback((e) => {
   e.stopPropagation();
   if (document.pointerLockElement) {
     document.exitPointerLock();
   }
   onInteract();
 }, [onInteract]);

 return (
   <group 
     position={position}
     onClick={handleClick}
     onPointerOver={(e) => {
       e.stopPropagation();
       document.body.style.cursor = 'pointer';
       setIsHovered(true);
     }}
     onPointerOut={(e) => {
       e.stopPropagation();
       document.body.style.cursor = 'default';
       setIsHovered(false);
     }}
   >
     <Html
       position={[0, 1.5, 0]}
       center
       distanceFactor={8}
     >
       <div style={{
         color: 'white',
         background: isHovered ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
         padding: '5px 10px',
         borderRadius: '5px',
         whiteSpace: 'nowrap',
         userSelect: 'none',
         transform: isHovered ? 'scale(1.1)' : 'scale(1)',
         transition: 'all 0.3s ease',
         border: isHovered ? '2px solid white' : 'none'
       }}>
         NPC
       </div>
     </Html>
     <primitive 
       object={scene} 
       scale={0.0125}
       rotation={[0, 200, 0]}
     />
   </group>
 );
}