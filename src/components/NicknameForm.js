import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // SweetAlert2 import
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
      Swal.fire({
        icon: 'warning',
        title: '닉네임 입력',
        text: '닉네임을 입력해주세요.',
        confirmButtonColor: '#fdbb2d',
      });
      return;
    }

    setIsChecking(true);
    try {
      const response = await axios.post('/api/member/check-nickname', {
        nickname: nickname
      });

      if (response.data.available) {
        Swal.fire({
          icon: 'success',
          title: '사용 가능',
          text: '사용 가능한 닉네임입니다!',
          confirmButtonColor: '#fdbb2d',
        });
        setIsAvailable(true);
        setIsChecked(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: '중복된 닉네임',
          text: '이미 사용 중인 닉네임입니다.',
          confirmButtonColor: '#dc3545',
        });
        setIsAvailable(false);
        setIsChecked(true);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: '닉네임 중복 확인 중 오류가 발생했습니다.',
        confirmButtonColor: '#dc3545',
      });
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!isChecked || !isAvailable) {
      Swal.fire({
        icon: 'warning',
        title: '확인 필요',
        text: '닉네임 중복 확인이 필요합니다.',
        confirmButtonColor: '#fdbb2d',
      });
      return;
    }
    setShowCharacterSelection(true);
  };

  const handleCharacterSelect = async (character) => {
    try {
      const response = await axios.post('/api/member/join', {
        nickname: nickname,
        characterId: character.id,
        modelPath: character.modelPath,
      });

      if (response.data && response.data.nickname) {
        localStorage.setItem('nickname', response.data.nickname);
        Swal.fire({
          icon: 'success',
          title: '입장 준비 완료!',
          text: '즐거운 시간되세요!.',
          confirmButtonColor: '#fdbb2d',
        }).then(() => {
          window.location.href = '/';
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: '입장 실패',
          text: '입장에 실패 하였습니다.',
          confirmButtonColor: '#dc3545',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: error.response?.data || '로그인에 실패했습니다.',
        confirmButtonColor: '#dc3545',
      });
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
      minHeight: '90%',
      background: 'linear-gradient(120deg, #1a2a6c, #b21f1f, #fdbb2d)',
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 15s ease infinite',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 3D 효과를 위한 원소 추가 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        filter: 'blur(120px)',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>
  
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '32px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        zIndex: 1
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '16px',
          color: '#ffffff',
          textShadow: '0 0 10px rgba(0, 0, 0, 0.8)'
        }}>닉네임 등록</h2>
        
        <p style={{
          color: 'rgba(0, 0, 0, 0.8)',
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '14px'
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
                fontSize: '16px',
                backgroundColor: '#222',
                color: '#fff'
              }}
            />
            <button
              type="button"
              onClick={checkNickname}
              disabled={isChecking}
              style={{
                padding: '12px 20px',
                backgroundColor: 'transparent',
                border: '2px solid #6c757d',
                color: '#6c757d',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: isChecking ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease',
              }}
              onMouseOver={(e) => {
                if (!isChecking) {
                  e.target.style.backgroundColor = '#6c757d';
                  e.target.style.color = 'white';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6c757d';
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
              backgroundColor: isAvailable ? '#82c995' : '#f19299 ',
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
              backgroundColor: 'transparent',
              border: `2px solid ${isAvailable ? '#6c757d' : '#6c757d'}`,
              color: isAvailable ? '#6c757d' : '#6c757d',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: isAvailable ? 'pointer' : 'not-allowed',
              marginTop: '16px',
              transition: 'all 0.3s ease',
            }}
            onMouseOver={(e) => {
              if (isAvailable) {
                e.target.style.backgroundColor = '#6c757d';
                e.target.style.color = 'white';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = isAvailable ? '#6c757d' : '#6c757d';
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