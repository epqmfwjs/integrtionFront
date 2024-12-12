export const SiteInfoStyles = `
  .title {
    margin-top: 0;
    text-align: center;
    margin-bottom: 30px;
  }

  .content-container {
    margin-bottom: 20px;
  }

  .spec-section {
    text-align: left;
    margin-bottom: 5px;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
  }

  .spec-section div {
    margin: 8px 0;
  }

  .description-section {
    text-align: left;
    padding: 10px;
  }

  .description-section p {
    margin-bottom: 5px;
    line-height: 1.5;
  }

  .feature-list {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
  }

  .feature-list li {
    margin: 8px 0;
    padding-left: 20px;
    position: relative;
  }

  .feature-list li:before {
    content: "•";
    position: absolute;
    left: 5px;
  }

  .button-container {
    display: flex;
    justify-content: center;
    width: 100%;
  }
    
  .site-button {
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

  .site-button:hover {
    background-color: #666666;
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .site-button:active {
    transform: translateY(0);
    background-color: #333333;
  }
`;