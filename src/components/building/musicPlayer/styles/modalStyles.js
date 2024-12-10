// 모달 공통 컨테이너 스타일
export const modalContainerStyle = {
    position: 'absolute',
    top: '-150px',
    left: '-200px',
    width: '400px',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
   };
   
   // 닫기 버튼 스타일
   export const closeButtonStyle = {
    position: 'absolute',
    right: '10px',
    top: '10px',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '20px',
    cursor: 'pointer'
   };
   
   // 앨범 아트워크 스타일
   export const albumArtworkStyle = {
    width: '100%',
    height: 'auto',
    borderRadius: '8px',
    marginBottom: '5px'
   };
   
   // 트랙 정보 컨테이너 스타일
   export const trackInfoContainerStyle = {
    marginBottom: '20px',
    textAlign: 'center'
   };
   
   // 트랙 제목 스타일
   export const trackTitleStyle = {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '5px'
   };
   
   // 아티스트 이름 스타일
   export const artistNameStyle = {
    color: '#999'
   };
   
   // 플레이어 컨트롤 컨테이너 스타일
   export const controlsContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px'
   };
   
   // 컨트롤 버튼 기본 스타일
   export const controlButtonStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer'
   };
   
   // 프로그레스 바 컨테이너 스타일
   export const progressBarContainerStyle = {
    width: '100%',
    height: '4px',
    backgroundColor: '#4f4f4f',
    borderRadius: '2px',
    marginTop: '20px'
   };
   
   // 프로그레스 바 진행 스타일
   export const progressBarStyle = (progress) => ({
    width: `${progress || 0}%`,
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: '2px',
    transition: 'width 0.1s ease'
   });
   
   // 시간 정보 컨테이너 스타일
   export const timeInfoStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#999',
    fontSize: '12px',
    marginTop: '5px'
   };
   
   // Auth 모달 관련 스타일
   export const authContentStyle = {
    textAlign: 'center',
    padding: '20px'
   };
   
   export const authTitleStyle = {
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px'
   };
   
   export const authDescriptionStyle = {
    color: '#999',
    marginBottom: '30px',
    fontSize: '14px'
   };
   
   export const spotifyButtonStyle = {
    backgroundColor: '#1DB954',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '25px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    width: '100%'
   };
   
   // 호버 상태를 위한 스타일
   export const spotifyButtonHoverStyle = {
    backgroundColor: '#1ed760'
   };
   
   // 검색 영역 스타일
   export const searchContainerStyle = {
    marginTop: '15px'
   };
   
   export const searchInputStyle = {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #333',
    backgroundColor: '#1a1a1a',
    color: 'white',
    marginBottom: '10px'
   };
   
   export const searchResultsStyle = {
    maxHeight: '200px',
    overflowY: 'auto',
    backgroundColor: '#1a1a1a',
    borderRadius: '4px'
   };
   
   export const searchResultItemStyle = {
    padding: '10px',
    borderBottom: '1px solid #333',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#252525'
    }
   };

   export const tabsContainerStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  };
  
  export const tabStyle = {
    padding: '8px 16px',
    borderRadius: '20px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s'
  };

  export const playlistControlsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    marginBottom: '15px'
   };
   
   export const playlistButtonStyle = {
    background: '#1DB954',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease'
   };
   
   export const repeatButtonStyle = (isActive) => ({
    background: isActive ? '#1DB954' : 'transparent',
    color: 'white',
    border: '1px solid #1DB954',
    padding: '8px 16px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    ':hover': {
      background: isActive ? '#1ed760' : 'rgba(29, 185, 84, 0.1)'
    }
   });
   
   export const playlistContainerStyle = {
    maxHeight: '300px',
    overflowY: 'auto',
    borderRadius: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
   };

   