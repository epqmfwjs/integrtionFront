import React, { useState, useEffect, useRef } from 'react';
import { setChatting } from '../state/chatState';

const ChatInterface = ({ onSendMessage, chatHistory }) => {
  const [message, setMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isMobile] = useState(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

  // 채팅 상태 변경 시 전역 상태 업데이트
  useEffect(() => {
    setChatting(isChatting);
  }, [isChatting]);

  useEffect(() => {
    // 엔터키 이벤트 리스너
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.repeat) {  // repeat 체크 추가
        if (!isChatting) {
          // 채팅 시작
          setIsChatting(true);
          e.preventDefault();
        }
      } else if (e.key === 'Escape' && isChatting) {
        // ESC로 채팅 취소
        setIsChatting(false);
        setMessage('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isChatting]);

  useEffect(() => {
    // 채팅 활성화시 자동으로 입력창에 포커스
    if (isChatting && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatting]);

  useEffect(() => {
    // 채팅 내역 자동 스크롤
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isMobile) {
      const handleTouchStart = () => {
        if (!isChatting) {
          setIsChatting(true);
        }
      };

      const chatButton = document.querySelector('.chat-button');
      if (chatButton) {
        chatButton.addEventListener('touchstart', handleTouchStart);
        return () => chatButton.removeEventListener('touchstart', handleTouchStart);
      }
    }
  }, [isMobile, isChatting]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsChatting(false); // 메시지 전송 후 채팅 모드 종료
    }
  };

  const styles = {
    container: {
      position: 'fixed',
      left: '50%',
      bottom: '20px',
      transform: 'translateX(-50%)',
      width: '600px',
      zIndex: 1000,
    },
    chatHistory: {
      maxHeight: '150px',
      overflowY: 'auto',
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: '8px',
      color: 'white',
    },
    messageContainer: {
      marginBottom: '4px',
    },
    message: {
      fontSize: '14px',
      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
    },
    selfMessage: {
      color: '#9EE6FF',
    },
    otherMessage: {
      color: '#FFFFFF',
    },
    systemMessage: {
      color: '#FFE666',
    },
    nickname: {
      fontWeight: 'bold',
      marginRight: '8px',
    },
    inputContainer: {
      position: 'relative',
      display: isChatting ? 'block' : 'none',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      borderRadius: '4px',
      color: 'white',
      outline: 'none',
      // 모바일 입력 최적화
      fontSize: isMobile ? '16px' : '14px', // 모바일에서 더 큰 폰트
      WebkitAppearance: 'none', // iOS 스타일 제거
      touchAction: 'manipulation', // 터치 최적화
    },
    placeholder: {
      position: 'fixed',
      left: '50%',
      bottom: '80px',
      transform: 'translateX(-50%)',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '14px',
      display: isChatting ? 'none' : 'block',
      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      padding: '4px 12px',
      borderRadius: '4px',
    },
    mobileButton: {
      position: 'fixed',
      top: '-100px',          // bottom -> top으로 변경
      right: '20px',
      padding: '15px',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      zIndex: 1000,
      fontSize: '20px',
      touchAction: 'manipulation',
      WebkitTapHighlightColor: 'transparent',
    }
  };

  const handleMobileClick = () => {
    setIsChatting(true);
    // 약간의 지연 후 포커스 (키보드 표시 보장)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  return (
    <div style={styles.container}>
      <div ref={chatContainerRef} style={styles.chatHistory}>
        {chatHistory.map((chat, index) => (
          <div key={index} style={styles.messageContainer}>
            <span style={styles.message}>
              <span style={styles.nickname}>
                {chat.isSelf ? '나' : chat.nickname}
              </span>
              <span style={chat.isSelf ? styles.selfMessage : styles.otherMessage}>
                {chat.message}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={styles.input}
            placeholder="메시지를 입력하세요... (ESC: 취소)"
            maxLength={200}
          />
        </form>
      </div>

      <div style={styles.placeholder}>
        채팅을 하려면 Enter 키를 누르세요
      </div>

      {isMobile && (
        <button 
          onClick={handleMobileClick}
          style={styles.mobileButton}
          className="chat-button"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatInterface;