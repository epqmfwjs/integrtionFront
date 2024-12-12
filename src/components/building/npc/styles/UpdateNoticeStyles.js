export const UpdateNoticeStyles = `
  .title {
    margin-top: 0;
    text-align: center;
    margin-bottom: 30px;
  }

  .content-container {
    margin-bottom: 20px;
    max-height: 400px;
    overflow-y: auto;
  }

  .content-container::-webkit-scrollbar {
    width: 8px;
  }

  .content-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .content-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 4px;
  }

  .updates-section {
    text-align: left;
    padding: 10px;
  }

  .update-list {
    margin-bottom: 20px;
  }

  .update-title {
    padding: 10px;
    margin-bottom: 8px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .update-title:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .update-title.active {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .update-date {
    font-size: 0.9em;
    color: #8af;
  }

  .update-text {
    margin-left: 10px;
    flex-grow: 1;
  }

  .update-detail {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 0;
    margin-top: 10px;
    margin-bottom: 20px;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s ease-in-out;
  }

  .update-detail.show {
    padding: 15px;
    max-height: 500px; /* 적절한 최대 높이 설정 */
  }

  .pagination {
    display: flex;
    justify-content: center;
    gap: 5px;
    margin-bottom: 10px;
  }

  .page-button {
    padding: 5px 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 3px;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .page-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .page-button.active {
    background-color: rgba(255, 255, 255, 0.3);
    font-weight: bold;
  }

  .update-content {
    line-height: 1.5;
    white-space: pre-line;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease-in-out;
  }

  .update-content.show {
    opacity: 1;
    transform: translateY(0);
  }

  .loading {
    text-align: center;
    padding: 20px;
  }

  .error {
    text-align: center;
    color: #ff6b6b;
    padding: 20px;
  }

  .no-updates {
    text-align: center;
    padding: 20px;
    color: #aaa;
  }

  .button-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }
    
  .update-button {
    display: block;
    width: 100px;
    padding: 8px;
    margin: 5px 0;
    background-color: #4a4a4a;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .update-button:hover {
    background-color: #666666;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .update-button:active {
    transform: translateY(0);
    background-color: #333333;
  }
`;