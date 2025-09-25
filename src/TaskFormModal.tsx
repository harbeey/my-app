import React, { useState, useEffect } from "react";
import { Task } from "./types";
import styles from "./TaskFormModal.module.css";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    text: string;
    description: string;
    priority: Task["priority"];
    dueDate: string;
  }) => void;
  editingTask: { listId: string; task: Task } | null;
  onDelete?: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingTask,
  onDelete,
}) => {
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editingTask) {
      setText(editingTask.task.text);
      setDescription(editingTask.task.description || "");
      setPriority(editingTask.task.priority || "medium");
      setDueDate(editingTask.task.dueDate || "");
    } else {
      setText("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
    }
  }, [editingTask, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit({ text, description, priority, dueDate });
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>{editingTask ? "Edit Task" : "Add New Task"}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label>Task Description</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={styles.formInput}
              placeholder="e.g., Design the new homepage"
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label>Details (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.formTextarea}
              placeholder="Add more details about the task..."
              rows={4}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task["priority"])}
              className={styles.formSelect}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={styles.formInput}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={styles.createButton}
            disabled={!text.trim()}
          >
            {editingTask ? "Save Changes" : "Create Task"}
          </button>
          {editingTask && onDelete && (
            <button onClick={onDelete} className={styles.deleteButton}>
              Delete Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
