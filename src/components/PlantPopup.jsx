import React from "react";

const PlantPopup = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>작물 추가하기</h3>
        <input type="text" placeholder="작물 이름 입력" />
        <button>추가</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
};

export default PlantPopup;
