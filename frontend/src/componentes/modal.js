/* eslint-disable */
import React from "react";

const Modal = ({ isOpen, close, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={close}>Cerrar</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
