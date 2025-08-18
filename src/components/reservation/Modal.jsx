import React from 'react';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="rs-modal-backdrop" onMouseDown={(e)=> e.target.classList.contains("rs-modal-backdrop") && onClose()}>
      <div className="rs-modal-panel">
        <button className="rs-modal-close" onClick={onClose} aria-label="닫기">✕</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;