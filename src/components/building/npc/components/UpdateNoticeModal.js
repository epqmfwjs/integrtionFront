import { Html } from "@react-three/drei";
import { useState, useEffect } from 'react';
import axios from '../../../../utils/axiosConfig';
import { UpdateNoticeStyles } from '../styles/UpdateNoticeStyles';

export function UpdateNoticeModal({ isOpen, onClose, position }) {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (isOpen) {
      fetchUpdates();
    }
  }, [isOpen]);

  const fetchUpdates = async () => {
    try {
      const response = await axios.get('/api/npc/getUpdates');
      setUpdates(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || '업데이트 내역을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = (update) => {
    setSelectedUpdate(selectedUpdate?.id === update.id ? null : update);
  };

  // 페이지 관련 계산
  const totalPages = Math.ceil(updates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = updates.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedUpdate(null); // 페이지 변경 시 선택된 업데이트 초기화
  };

  if (!isOpen) return null;

return (
  <Html position={[position[0], position[1] + 3, position[2]]}>
    <style>{UpdateNoticeStyles}</style>
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      minWidth: '500px',
    }}>
      <h3 className="title">업데이트 내역</h3>
      <div className="content-container">
        {loading ? (
          <div className="loading">로딩 중...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="updates-section">
            {updates.length === 0 ? (
              <div className="no-updates">업데이트 내역이 없습니다.</div>
            ) : (
              <div>
                {!selectedUpdate ? (
                  // 목록 보기
                  <div className="update-list">
                    {currentItems.map((update) => (
                      <div 
                        key={update.id} 
                        className="update-title"
                        onClick={() => handleUpdateClick(update)}
                      >
                        <span className="update-date">{update.date}</span>
                        <span className="update-text">{update.title}</span>
                      </div>
                    ))}
                    <div className="pagination">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`page-button ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // 상세 내용 보기
                  <div>
                    <div 
                      className="update-title active"
                      onClick={() => handleUpdateClick(selectedUpdate)}
                    >
                      <span className="update-date">{selectedUpdate.date}</span>
                      <span className="update-text">{selectedUpdate.title}</span>
                    </div>
                    <div className={`update-detail ${selectedUpdate ? 'show' : ''}`}>
                      <div className={`update-content ${selectedUpdate ? 'show' : ''}`}>
                        {selectedUpdate.content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="button-container">
        <button className="update-button" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  </Html>
);
}