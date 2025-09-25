import React from "react";
import styles from "./App.module.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.confirmationModal}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>{message}</div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={onConfirm} className={styles.deleteConfirmButton}>
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
