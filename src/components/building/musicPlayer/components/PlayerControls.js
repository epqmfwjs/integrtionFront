// src/components/building/musicPlayer/components/PlayerControls.js

import React from 'react';
import {
 controlsContainerStyle,
 controlButtonStyle
} from '../styles/modalStyles';

export const PlayerControls = ({ isPlaying, onPlayPause, onPrevTrack, onNextTrack }) => {
 return (
   <div style={controlsContainerStyle}>
     {/* 이전 트랙 버튼 */}
     <button 
       onClick={onPrevTrack}
       style={controlButtonStyle}
       aria-label="Previous track"
     >
       <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
         <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
       </svg>
     </button>

     {/* 재생/일시정지 버튼 */}
     <button 
       onClick={onPlayPause}
       style={controlButtonStyle}
       aria-label={isPlaying ? "Pause" : "Play"}
     >
       {isPlaying ? (
         <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
           <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
         </svg>
       ) : (
         <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
           <path d="M8 5v14l11-7z"/>
         </svg>
       )}
     </button>

     {/* 다음 트랙 버튼 */}
     <button 
       onClick={onNextTrack}
       style={controlButtonStyle}
       aria-label="Next track"
     >
       <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
         <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
       </svg>
     </button>
   </div>
 );
};

export default PlayerControls;