import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//import axios from 'axios';
import axios from '../util/axiosConfig';
import CharacterSelection from './CharacterSelection';

function NicknameForm() {
  const [nickname, setNickname] = useState('');
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();

  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
    setIsAvailable(null);
    setIsChecked(false);
  };

  const checkNickname = async () => {
    if (!nickname.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    setIsChecking(true);
    try {
      //const response = await axios.post('http://localhost:5000/api/member/check-nickname', {
      const response = await axios.post('/api/member/check-nickname', {  
        nickname: nickname
      });
      
      if (response.data.available) {
        setIsAvailable(true);
        setIsChecked(true);
      } else {
        setIsAvailable(false);
        setIsChecked(true);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('닉네임 중복 확인 중 오류가 발생했습니다.');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!isChecked || !isAvailable) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }
    setShowCharacterSelection(true);
  };

  const handleCharacterSelect = async (character) => {
    try {
      //const response = await axios.post('http://localhost:5000/api/member/join', {
      const response = await axios.post('/api/member/join', {
        nickname: nickname,
        characterId: character.id,
        modelPath: character.modelPath,
      });
      
      if (response.data && response.data.nickname) {
        console.log('Server response:', response.data);
        localStorage.setItem('nickname', response.data.nickname);
        //localStorage.setItem('characterId', character.id);
        window.location.href = '/';
      } else {
        alert('로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data) {
        alert(error.response.data);
      } else {
        alert('로그인에 실패했습니다.');
      }
    }
  };

  if (showCharacterSelection) {
    return <CharacterSelection onSelect={handleCharacterSelect} />;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '16px'
        }}>닉네임 등록</h2>
        
        <p style={{
          color: '#666',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          사용하실 닉네임을 입력해주세요.
        </p>
        
        <form onSubmit={handleInitialSubmit}>
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <input
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              placeholder="닉네임을 입력하세요"
              required
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            />
            <button
              type="button"
              onClick={checkNickname}
              disabled={isChecking}
              style={{
                padding: '12px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: isChecking ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {isChecking ? '확인 중...' : '중복 확인'}
            </button>
          </div>
          
          {isChecked && (
            <div style={{
              marginBottom: '16px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: isAvailable ? '#d4edda' : '#f8d7da',
              color: isAvailable ? '#155724' : '#721c24',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {isAvailable ? 
                '사용 가능한 닉네임입니다.' : 
                '이미 사용 중인 닉네임입니다.'}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!isAvailable}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isAvailable ? '#007bff' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              marginTop: '16px'
            }}
          >
            다음
          </button>
        </form>
      </div>
    </div>
  );
}

export default NicknameForm;