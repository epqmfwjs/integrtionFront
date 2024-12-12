import axios from '../../../../utils/axiosConfig';
import Swal from 'sweetalert2';

export const AdminCall = ({ onClose, playerData }) => {
  const handleAdminCall = async () => {
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
    <button className="npc-button" onClick={handleAdminCall}>
      관리자호출
    </button>
  );
};