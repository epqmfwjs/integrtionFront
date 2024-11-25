import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { PlayerControls } from './PlayerControls';
import { SearchBar } from './SearchBar';
import { formatTime } from '../utils/spotifyUtils';
import {
  modalContainerStyle,
  closeButtonStyle,
  albumArtworkStyle,
  trackInfoContainerStyle,
  trackTitleStyle,
  artistNameStyle,
  progressBarContainerStyle,
  progressBarStyle,
  timeInfoStyle,
  tabStyle,
  tabsContainerStyle,
  playlistControlsContainerStyle,
  playlistButtonStyle,
  repeatButtonStyle,
  playlistContainerStyle
} from '../styles/modalStyles';

// 중단점 설정 추가
const breakpoints = {
  mobile: 480,    // 모바일
  tablet: 768,    // 태블릿
  laptop: 1024,   // 노트북
  desktop: 1200,  // 데스크탑
  wide: 1440     // 와이드 스크린
};

export const PlayerModal = ({ 
  onClose, 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNextTrack, 
  onPrevTrack,
  onTrackSelect,
  onPlayTrackFromPlaylist,
  onRemoveFromPlaylist,
  onAddToPlaylist,
  onStartPlaylist,
  isPlaylistRepeat,
  onToggleRepeat,
  currentPlaylistIndex,
  token,
  recentTracks = [],
  playlist = []
}) => {
  const [activeTab, setActiveTab] = useState('player');
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 모바일 뷰 판단 (CharacterSelection과 동일한 로직)
  const isMobileView = screenSize.width <= breakpoints.tablet || screenSize.height <= 500;

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return (
          <SearchBar 
            token={token} 
            onTrackSelect={(uri) => {
              onTrackSelect(uri);
              setActiveTab('player');
            }}
            onAddToPlaylist={onAddToPlaylist}
          />
        );
      
      case 'queue':
        return (
          <div style={{ maxHeight: isMobileView ? '250px' : '300px', overflowY: 'auto' }}>
            {recentTracks.map((track, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #333',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onClick={() => onTrackSelect(track.uri)}
              >
                {track.album?.images[2] && (
                  <img
                    src={track.album.images[2].url}
                    alt={track.album.name}
                    style={{ width: '40px', height: '40px', borderRadius: '4px' }}
                  />
                )}
                <div>
                  <div style={{ color: 'white', fontSize: '14px' }}>{track.name}</div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    {track.artists?.map(artist => artist.name).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'playlist':
        return (
          <>
            <div style={playlistControlsContainerStyle}>
              <button
                onClick={onToggleRepeat}
                style={repeatButtonStyle(isPlaylistRepeat)}
              >
                {isPlaylistRepeat ? 'Repeat On' : 'Repeat Off'}
              </button>
            </div>
            <div style={{ ...playlistContainerStyle, maxHeight: isMobileView ? '250px' : '300px' }}>
              {playlist.map((track, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                    onClick={() => onPlayTrackFromPlaylist(index)}
                  >
                    {track.album?.images[2] && (
                      <img
                        src={track.album.images[2].url}
                        alt={track.album.name}
                        style={{ width: '40px', height: '40px', borderRadius: '4px' }}
                      />
                    )}
                    <div>
                      <div style={{ color: 'white', fontSize: '14px' }}>{track.name}</div>
                      <div style={{ color: '#999', fontSize: '12px' }}>
                        {track.artists?.map(artist => artist.name).join(', ')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {currentPlaylistIndex === index && isPlaying && (
                      <span style={{ color: '#1DB954', fontSize: '12px' }}>Playing</span>
                    )}
                    <button
                      onClick={() => onRemoveFromPlaylist(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff4444',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      default:
        return (
          <>
            {currentTrack?.album?.images?.[0]?.url && !isMobileView && (
              <img 
                src={currentTrack.album.images[0].url}
                alt="Album artwork"
                style={albumArtworkStyle}
              />
            )}

            <div style={trackInfoContainerStyle}>
              <h3 style={trackTitleStyle}>
                {currentTrack?.name || 'No track playing'}
              </h3>
              <p style={artistNameStyle}>
                {currentTrack?.artists?.map(a => a.name).join(', ')}
              </p>
            </div>

            <PlayerControls
              isPlaying={isPlaying}
              onPlayPause={onPlayPause}
              onPrevTrack={onPrevTrack}
              onNextTrack={onNextTrack}
            />

            <div style={progressBarContainerStyle}>
              <div style={progressBarStyle((currentTrack?.progress_ms / currentTrack?.duration_ms) * 100)} />
            </div>

            <div style={timeInfoStyle}>
              <span>{formatTime(currentTrack?.progress_ms)}</span>
              <span>{formatTime(currentTrack?.duration_ms)}</span>
            </div>
          </>
        );
    }
  };

  return (
    <Html center position={[0, 0, 0]}>
      <div style={modalContainerStyle}>
        <button onClick={onClose} style={closeButtonStyle}>×</button>

        <div style={tabsContainerStyle}>
          <button 
            style={{
              ...tabStyle,
              backgroundColor: activeTab === 'player' ? '#1DB954' : 'transparent'
            }}
            onClick={() => setActiveTab('player')}
          >
            재생곡
          </button>
          <button 
            style={{
              ...tabStyle,
              backgroundColor: activeTab === 'search' ? '#1DB954' : 'transparent'
            }}
            onClick={() => setActiveTab('search')}
          >
            검색
          </button>
          <button 
            style={{
              ...tabStyle,
              backgroundColor: activeTab === 'queue' ? '#1DB954' : 'transparent'
            }}
            onClick={() => setActiveTab('queue')}
          >
            최근재생
          </button>
          <button 
            style={{
              ...tabStyle,
              backgroundColor: activeTab === 'playlist' ? '#1DB954' : 'transparent'
            }}
            onClick={() => setActiveTab('playlist')}
          >
            리스트 ({playlist.length})
          </button>
        </div>

        {renderContent()}
      </div>
    </Html>
  );
};

export default PlayerModal;