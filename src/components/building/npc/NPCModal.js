import { Html } from "@react-three/drei";
import { AIChat } from './components/AIChat';
import { SiteInfo } from './components/SiteInfo';
import { UpdateNotice } from './components/UpdateNotice';
import { AdminCall } from './components/AdminCall';
import { NPCStyles } from './styles/NPCStyles';

export function NPCModal({ isOpen, onClose, position, playerData }) {
  if (!isOpen) return null;

  return (
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
        <SiteInfo onClose={onClose} />
        <UpdateNotice onClose={onClose} />
        <AdminCall onClose={onClose} playerData={playerData} />
        <button className="npc-button" onClick={onClose}>
          닫기
        </button>
      </div>
    </Html>
  );
}