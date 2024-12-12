export const NPCStyles = `
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
`;