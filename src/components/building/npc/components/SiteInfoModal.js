import { Html } from "@react-three/drei";
import { SiteInfoStyles } from '../styles/SiteInfoStyles';

export function SiteInfoModal({ isOpen, onClose, position }) {
  if (!isOpen) return null;

  return (
    <Html position={[position[0], position[1] + 3, position[2]]}>
      <style>{SiteInfoStyles}</style>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '500px',
      }}>
        <h3 className="title">KwanghyunWorld</h3>
        <div className="content-container">
          <div className="spec-section">
            <div><strong>OS : </strong>Linux Ubuntu 22.04</div> 
            <div><strong>Backend : </strong>Java / SpringBoot / JPA / Gradle</div>
            <div><strong>Frontend : </strong>React.js / Three.js / JavaScript / CSS </div>
            <div><strong>Database : </strong>MySQL</div>
            <div><strong>Protocol : </strong>WebSocket / STOMP / HTTPS </div>
            <div><strong>** Nginx - </strong> Reverse proxy 활용하여 SSL/TLS 지원 / 정적 콘텐츠와 API 요청 분리 / WebSocket 지원 </div>
            <div><strong>** APP - </strong> ReactNative로 관리자 앱을 구현하여 Mobile 과 Desktop 을 통해 관리 중 입니다.</div>
          </div>
          
          <div className="description-section">
            <p>
              포트폴리오 or 프로젝트 개념으로 보기보단,
              개인 공부 및 놀이터 개념으로 지속적으로 개발 및 관리중인 사이트
              입니다. 개발은 구글링과 공식문서 참고 및 ai(ChatGPT,Claude)
              등을 사용하여 진행하였습니다.
            </p>
            
            <ul className="feature-list">
              <li>액자로 걸린 프로젝트를 클릭 하여 각 프로젝트 사이트 이동</li>
              <li>스피커 모델링과 상호작용 음악감상(spotify api) 가능</li>
              <li>WebSocket 기반으로 실시간 사용자 만남 및 채팅 기능 활용</li>
              <li>NPC 메뉴 중 관리자 호출을 사용하여 관리자와 소통가능</li>
            </ul>
          </div>
        </div>
        <div className="button-container">
          <button className="site-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </Html>
  );
}