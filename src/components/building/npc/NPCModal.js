import React, { useState } from "react";
import { Html } from "@react-three/drei";
import { AIChat } from './components/AIChat';
import { SiteInfoModal } from './components/SiteInfoModal';
import { UpdateNoticeModal } from './components/UpdateNoticeModal';
import { AdminCall } from './components/AdminCall';
import { NPCStyles } from './styles/NPCStyles';

export function NPCModal({ isOpen, onClose, position, playerData }) {
  const [showSiteInfo, setShowSiteInfo] = React.useState(false);
  const [showUpdateNotice, setShowUpdateNotice] = useState(false);

  const handleUpdateNoticeClick = () => {
    onClose();
    setShowUpdateNotice(true);
  };

  const handleUpdateNoticeClose = () => {
    setShowUpdateNotice(false);
  };

  const handleSiteInfoClick = () => {
    onClose();
    setShowSiteInfo(true);
  };

  const handleSiteInfoClose = () => {
    setShowSiteInfo(false);
  };

  if (!isOpen && !showSiteInfo && !showUpdateNotice) return null;

  return (
    <>
      {isOpen && (
        <Html position={[position[0], position[1] + 2, position[2]]}>
          <style>{NPCStyles}</style>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            minWidth: '200px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginTop: 0 }}>NPC 메뉴</h3>
            <AIChat onClose={onClose} />
            <button className="npc-button" onClick={handleSiteInfoClick}>
              사이트 설명
            </button>
            <button className="npc-button" onClick={handleUpdateNoticeClick}>
              업데이트 공지
            </button>
            <AdminCall onClose={onClose} playerData={playerData} />
            <button className="npc-button" onClick={onClose}>
              닫기
            </button>
          </div>
        </Html>
      )}
      
      <SiteInfoModal
        isOpen={showSiteInfo}
        onClose={handleSiteInfoClose}
        position={position}
      />

      <UpdateNoticeModal
        isOpen={showUpdateNotice}
        onClose={handleUpdateNoticeClose}
        position={position}
      />
    </>
  );
}