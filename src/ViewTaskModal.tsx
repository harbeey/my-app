import React from "react";
import { Task, TeamMember } from "./types";
import { timeSince } from "./utils";
import styles from "./App.module.css";
import { FaPaperclip } from "react-icons/fa";

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  teamMembers: TeamMember[];
}

const ViewTaskModal: React.FC<ViewTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  teamMembers,
}) => {
  if (!isOpen || !task) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.viewTaskModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Task Details</h3>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <h4 className={styles.viewTaskTitle}>{task.text}</h4>
          {task.description && (
            <div className={styles.viewTaskSection}>
              <p className={styles.viewTaskDescription}>{task.description}</p>
            </div>
          )}

          <div className={styles.viewTaskMetaGrid}>
            {task.priority && (
              <div className={styles.viewTaskMetaItem}>
                <span className={styles.viewTaskMetaLabel}>Priority</span>
                <span
                  className={`${styles.priorityBadge} ${styles[task.priority]}`}
                >
                  {task.priority}
                </span>
              </div>
            )}
            {task.dueDate && (
              <div className={styles.viewTaskMetaItem}>
                <span className={styles.viewTaskMetaLabel}>Due Date</span>
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
            {task.createdAt && (
              <div className={styles.viewTaskMetaItem}>
                <span className={styles.viewTaskMetaLabel}>Created</span>
                <span>{timeSince(new Date(task.createdAt))}</span>
              </div>
            )}
            {task.lastUpdatedAt && (
              <div className={styles.viewTaskMetaItem}>
                <span className={styles.viewTaskMetaLabel}>Updated</span>
                <span>{timeSince(new Date(task.lastUpdatedAt))}</span>
              </div>
            )}
          </div>

          {task.assignedTo && task.assignedTo.length > 0 && (
            <div className={styles.viewTaskSection}>
              <h5>Assigned To</h5>
              <div className={styles.assignedMembers}>
                {task.assignedTo.map((memberId) => {
                  const member = teamMembers.find((m) => m.id === memberId);
                  return member ? (
                    <div key={memberId} className={styles.viewTaskMember}>
                      <span className={styles.memberAvatar} title={member.name}>
                        {member.avatar}
                      </span>
                      <span>{member.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          {task.subTasks && task.subTasks.length > 0 && (
            <div className={styles.viewTaskSection}>
              <h5>Checklist</h5>
              <div className={styles.checklist}>
                {task.subTasks.map((subTask) => (
                  <div key={subTask.id} className={styles.checklistItem}>
                    <input
                      type="checkbox"
                      checked={subTask.completed}
                      readOnly
                    />
                    <span
                      className={`${styles.subTaskInput} ${
                        subTask.completed ? styles.completed : ""
                      }`}
                    >
                      {subTask.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className={styles.viewTaskSection}>
              <h5>Attachments</h5>
              <div className={styles.attachmentsList}>
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className={styles.attachmentItem}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.attachmentLink}
                      title={`${attachment.name} (${(
                        attachment.size / 1024
                      ).toFixed(2)} KB)`}
                    >
                      <FaPaperclip />
                      <span>{attachment.name}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {task.comments && task.comments.length > 0 && (
            <div className={styles.viewTaskSection}>
              <h5>Comments</h5>
              <div className={styles.commentsList}>
                {task.comments.map((comment) => {
                  const author = teamMembers.find(
                    (m) => m.id === comment.authorId
                  );
                  return (
                    <div key={comment.id} className={styles.comment}>
                      <span
                        className={styles.memberAvatar}
                        title={author?.name}
                      >
                        {author?.avatar || "?"}
                      </span>
                      <div className={styles.commentBody}>
                        <p className={styles.commentText}>{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTaskModal;
