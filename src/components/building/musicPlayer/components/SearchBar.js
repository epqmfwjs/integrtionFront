import React, { useState } from 'react';
import {
  searchContainerStyle,
  searchInputStyle,
  searchResultsStyle,
  searchResultItemStyle
} from '../styles/modalStyles';

export const SearchBar = ({ token, onTrackSelect, onAddToPlaylist }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=5`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      const data = await response.json();
      setSearchResults(data.tracks.items);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Enter 키 이벤트의 전파를 중단시키고 검색 실행
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSearch();
      return false;
    }
  };

  return (
    <div 
      style={searchContainerStyle}
      onKeyDown={(e) => {
        // 이벤트 버블링 방지를 위해 컨테이너 레벨에서도 처리
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="찾으시는 음악이 있나요?"
          style={searchInputStyle}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          style={{
            ...searchInputStyle,
            width: 'auto',
            minWidth: '80px',
            backgroundColor: '#1DB954',
            cursor: 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? '검색중...' : '검색'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div style={searchResultsStyle}>
          {searchResults.map((track) => (
            <div
              key={track.id}
              style={{
                ...searchResultItemStyle,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {track.album.images[2] && (
                  <img
                    src={track.album.images[2].url}
                    alt={track.album.name}
                    style={{ width: '40px', height: '40px', borderRadius: '4px' }}
                  />
                )}
                <div>
                  <div style={{ color: 'white', fontSize: '14px' }}>{track.name}</div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    {track.artists.map(artist => artist.name).join(', ')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrackSelect(track.uri);
                  }}
                  style={{
                    background: '#1DB954',
                    border: 'none',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  재생
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                  }}
                  style={{
                    background: '#333',
                    border: 'none',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '15px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  담기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;