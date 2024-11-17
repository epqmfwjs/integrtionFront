// src/App.js
import React, { useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MetaverseScene } from './components/MetaverseScene';
import NicknameForm from './components/NicknameForm';
import './App.css';

function App() {
  // useCallback을 사용하여 메모이제이션
  const hasNickname = useCallback(() => {
    // localStorage 체크
    return Boolean(localStorage.getItem('nickname'));
  }, []); // 의존성 배열 비움

  return (
    <Router>
      <div className="App">
        <div className="orientation-message">
          <div>📱 화면을 가로로 돌려주세요</div>
          <div style={{ fontSize: '50px', marginTop: '20px' }}>↻</div>
        </div>
        
        <Routes>
          <Route 
            path="/" 
            element={
              hasNickname() ? (
                <Navigate to="/metaverse" replace />
              ) : (
                <NicknameForm />
              )
            } 
          />
          <Route 
            path="/metaverse" 
            element={
              hasNickname() ? (
                <MetaverseScene />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;