import React, { useEffect, useRef, useState } from 'react';
import '../styles/TouchControls.css';

export const TouchControls = () => {
  const emitKey = (key, isDown) => {
    window.dispatchEvent(new KeyboardEvent(isDown ? 'keydown' : 'keyup', { code: key }));
  };

  return (
    <div className="touch-controls">
      <div className="direction-pad">
        <button
          className="direction-btn up"
          onTouchStart={() => emitKey('KeyW', true)}
          onTouchEnd={() => emitKey('KeyW', false)}
        >↑</button>
        <button
          className="direction-btn left"
          onTouchStart={() => emitKey('KeyA', true)}
          onTouchEnd={() => emitKey('KeyA', false)}
        >←</button>
        <button
          className="direction-btn down"
          onTouchStart={() => emitKey('KeyS', true)}
          onTouchEnd={() => emitKey('KeyS', false)}
        >↓</button>
        <button
          className="direction-btn right"
          onTouchStart={() => emitKey('KeyD', true)}
          onTouchEnd={() => emitKey('KeyD', false)}
        >→</button>
      </div>
      
      <div className="action-buttons">
        <button
          className="control-btn jump"
          onTouchStart={() => emitKey('Space', true)}
          onTouchEnd={() => emitKey('Space', false)}
        >점프</button>
        <button
          className="control-btn run"
          onTouchStart={() => emitKey('ShiftLeft', true)}
          onTouchEnd={() => emitKey('ShiftLeft', false)}
        >달리기</button>
      </div>
    </div>
  );
};