// components/building/NPCModal.js
import { Html } from "@react-three/drei";
import  axios from '../../../utils/axiosConfig';
import Swal from 'sweetalert2';

export function NPCModal({ isOpen, onClose, position, playerData }) {
    if (!isOpen) return null;
  
    const adminCall = async () => {
      console.log('adminCall');
      try {
        onClose();
        const response = await axios.get('/api/npc/adminCall', {
          params: {
            playerNickname: playerData.nickname,
          }
        });
       
        await Swal.fire({
            title: '관리자 호출',
            text: response.data,
            icon: 'success',
            confirmButtonText: '확인',
            background: 'rgba(0, 0, 0)',
            color: '#fff',
            iconColor: '#4BB543',
            confirmButtonColor: '#4a4a4a',
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            },
            customClass: {
              confirmButton: 'npc-swal-button'
            }
          });
          
          return null;
        } catch (error) {
          console.error('Failed to call admin:', error);

          onClose();

          await Swal.fire({
            title: '오류',
            text: '관리자 호출 중 오류가 발생했습니다.',
            icon: 'error',
            confirmButtonText: '확인',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#fff',
            iconColor: '#FF0000',
            confirmButtonColor: '#4a4a4a',
            showClass: {
              popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutUp'
            },
            customClass: {
              confirmButton: 'npc-swal-button'
            }
          });
        }
      };

  return (
    <Html position={[position[0], position[1] + 2, position[2]]}>
      <style>
        {`
          .npc-button {
            display: block;
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            background-color: #4a4a4a;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .npc-button:hover {
            background-color: #666666;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .npc-button:active {
            transform: translateY(0);
            background-color: #333333;
          }

          /* SweetAlert2 커스텀 스타일 */
          .npc-swal-button {
            padding: 8px 20px !important;
            background-color: #4a4a4a !important;
            border: none !important;
            border-radius: 5px !important;
            color: white !important;
            transition: all 0.3s ease !important;
          }

          .npc-swal-button:hover {
            background-color: #666666 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
          }

          .npc-swal-button:active {
            transform: translateY(0) !important;
            background-color: #333333 !important;
          }

          /* SweetAlert2 팝업 자체의 스타일 */
          .swal2-popup {
            border-radius: 15px !important;
            padding: 2em !important;
          }

          .swal2-title {
            font-size: 1.5em !important;
          }

          .swal2-html-container {
            font-size: 1.1em !important;
          }
        `}
      </style>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        minWidth: '200px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0 }}>NPC 메뉴</h3>
        <button className="npc-button" onClick={() => console.log('대화하기')}>
          AI 대화하기(미구현)
        </button>
        <button className="npc-button" onClick={() => console.log('퀘스트받기')}>
          사이트 설명(미구현)
        </button>
        <button className="npc-button" onClick={() => console.log('업데이트 공지')}>
          업데이트 공지(미구현)
        </button>
        <button className="npc-button" onClick={adminCall}>
          관리자호출
        </button>
        <button className="npc-button" onClick={onClose}>
          닫기
        </button>
      </div>
    </Html>
  );
}
