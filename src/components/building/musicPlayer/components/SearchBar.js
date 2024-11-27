import React, { useState } from 'react';
import  axios from '../../../../utils/axiosConfig';
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
        // 검색어 전처리
        const processedQuery = searchQuery.trim();
        //log.info("Searching for:", processedQuery);

        const response = await axios.get('/api/spotify/search', {
            params: {
                query: processedQuery,
                type: 'track',
                limit: 10,
                market: 'KR'
            }
        });
        
        if (response.data && response.data.tracks) {
            setSearchResults(response.data.tracks.items);
            if (response.data.tracks.items.length === 0) {
                console.log("검색 결과가 없습니다.");
            }
        }
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
              {/* 트랙 정보 영역 - 최대 너비 제한 */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                maxWidth: 'calc(100% - 140px)', // 버튼 영역 너비만큼 제외
                flexShrink: 1 
              }}>
                {track.album.images[2] && (
                  <img
                    src={track.album.images[2].url}
                    alt={track.album.name}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '4px',
                      flexShrink: 0 // 이미지 크기 고정
                    }}
                  />
                )}
                <div style={{ minWidth: 0 }}> {/* 텍스트 오버플로우를 위한 설정 */}
                  <div style={{ 
                    color: 'white', 
                    fontSize: '14px',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap'
                  }}>{track.name}</div>
                  <div style={{ 
                    color: '#999', 
                    fontSize: '12px',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap'
                  }}>
                    {track.artists.map(artist => artist.name).join(', ')}
                  </div>
                </div>
              </div>

              {/* 버튼 영역 - 고정 너비 */}
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                flexShrink: 0, // 버튼 영역 크기 고정
                width: '120px' // 버튼 영역 고정 너비
              }}>
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
                    fontSize: '12px',
                    width: '50px', // 버튼 너비 고정
                    height: '28px', // 버튼 높이 고정
                    flexShrink: 0
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
                    fontSize: '12px',
                    width: '50px', // 버튼 너비 고정
                    height: '28px', // 버튼 높이 고정
                    flexShrink: 0
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