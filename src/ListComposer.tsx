import React, { useState } from "react";
import styles from "./App.module.css";
import { FaPlus } from "react-icons/fa";

interface ListComposerProps {
  onAdd: (title: string) => void;
}

const ListComposer: React.FC<ListComposerProps> = ({ onAdd }) => {
  const [isComposing, setIsComposing] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title.trim());
      setTitle("");
      setIsComposing(false);
    }
  };

  if (!isComposing) {
    return (
      <button
        className={styles.openComposerButton}
        onClick={() => setIsComposing(true)}
      >
        <FaPlus /> Add another list
      </button>
    );
  }

  return (
    <div className={styles.listComposer}>
      <input
        className={styles.listInput}
        placeholder="Enter list title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        autoFocus
      />
      <div className={styles.composerActions}>
        <button className={styles.addListButton} onClick={handleAdd}>
          Add List
        </button>
        <button
          className={styles.cancelComposerButton}
          onClick={() => setIsComposing(false)}
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default ListComposer;
