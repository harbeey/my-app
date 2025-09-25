import React, { useState, useRef } from "react";
import styles from "./App.module.css"; // Assuming styles are shared for now
import {
  FaPencilAlt,
  FaGripVertical,
  FaComment,
  FaCheck,
  FaAlignLeft,
  FaFileAlt,
  FaPaperclip,
  FaClipboardList,
  FaStar,
  FaRegStar,
  FaTrash,
  FaUsers,
  FaCalendarAlt,
} from "react-icons/fa";

interface TaskCardProps {
  task: Task;
  listId: string;
  teamMembers: TeamMember[];
  currentUser: { id: string; name: string } | null;
  // Drag and Drop
  onDragStart: () => void;
  onDragEnd: () => void;
  onToggleCompletion: (listId: string, taskId: string) => void;
  onRename: (listId: string, taskId: string, newText: string) => void;
  onOpenEditModal: (listId: string, task: Task) => void;
  onOpenDeleteModal: (listId: string, taskId: string, taskText: string) => void;
  onSetPriority: (
    listId: string,
    taskId: string,
    priority: Task["priority"]
  ) => void;
  onOpenTeamModal: (listId: string, task: Task) => void;
  // Sub-tasks
  onAddSubTask: (listId: string, taskId: string, text: string) => void;
  onToggleSubTask: (listId: string, taskId: string, subTaskId: string) => void;
  onEditSubTask: (
    listId: string,
    taskId: string,
    subTaskId: string,
    newText: string
  ) => void;
  // Comments
  onDeleteSubTask: (listId: string, taskId: string, subTaskId: string) => void;
  onAddComment: (listId: string, taskId: string, text: string) => void;
  onEditComment: (
    listId: string,
    taskId: string,
    commentId: string,
    newText: string
  ) => void;
  // Attachments
  onDeleteComment: (listId: string, taskId: string, commentId: string) => void;
  onAddAttachment: (listId: string, taskId: string, file: File) => void;
  onDeleteAttachment: (
    listId: string,
    taskId: string,
    attachmentId: string
  ) => void;
}
type Task = {
  id: string;
  text: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  priority?: "high" | "medium" | "low";
  assignedTo?: string[];
  dueDate?: string;
  lastUpdatedAt?: Date;
  subTasks?: any[]; // Replace with actual SubTask type
  comments?: any[]; // Replace with actual Comment type
  attachments?: any[]; // Replace with actual Attachment type
};

type TeamMember = any; // Replace with actual TeamMember type

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  listId,
  teamMembers,
  currentUser,
  onDragStart,
  onDragEnd,
  onToggleCompletion,
  onRename,
  onOpenEditModal,
  onOpenDeleteModal,
  onSetPriority,
  onOpenTeamModal,
  onAddSubTask,
  onToggleSubTask,
  onEditSubTask,
  onDeleteSubTask,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddAttachment,
  onDeleteAttachment,
}) => {
  const [editingPriority, setEditingPriority] = useState<{
    listId: string;
    taskId: string;
  } | null>(null);
  const [activeComments, setActiveComments] = useState(false);
  const [activeCommentsTaskId, setActiveCommentsTaskId] = useState<
    string | null
  >(null);

  const isOverdue = (dueDate: string | undefined): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(`${dueDate}T00:00:00`);
    return dueDateObj < today;
  };

  return (
    <div // The outer div with dragging logic will be in App.tsx
      className={styles.taskCard}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className={styles.taskCardHeader}>
        <button
          className={`${styles.checkButton} ${
            task.completed ? styles.checked : ""
          }`}
          onClick={() => onToggleCompletion(listId, task.id)}
          title={task.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed && <FaCheck />}
        </button>
        <input
          className={`${styles.taskCardTitle} ${
            task.completed ? styles.completed : ""
          }`}
          value={task.text}
          onChange={(e) => onRename(listId, task.id, e.target.value)}
        />
      </div>
      <div className={styles.taskCardContent}>
        {task.description && (
          <FaAlignLeft
            className={styles.descriptionIcon}
            title="This task has a description"
          />
        )}
        <button
          className={styles.editTaskButton}
          onClick={() => onOpenEditModal(listId, task)}
        >
          <FaPencilAlt />
        </button>
        <div className={styles.taskProgress}>
          {task.subTasks && task.subTasks.length > 0 && (
            <div className={styles.checklistProgress}>
              <div
                className={styles.checklistProgressBar}
                style={{
                  width: `${
                    (task.subTasks.filter((st) => st.completed).length /
                      task.subTasks.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          )}
        </div>
        {/* Sub-tasks Section */}
        <div className={styles.checklistContainer}>
          <div className={styles.checklist}>
            {task.subTasks?.map((subTask) => (
              <div key={subTask.id} className={styles.checklistItem}>
                <div className={styles.dragHandle}>
                  {" "}
                  <FaGripVertical />{" "}
                </div>
                <input
                  type="checkbox"
                  checked={subTask.completed}
                  onChange={() => onToggleSubTask(listId, task.id, subTask.id)}
                />
                <input
                  type="text"
                  value={subTask.text}
                  onChange={(e) =>
                    onEditSubTask(listId, task.id, subTask.id, e.target.value)
                  }
                  className={`${styles.subTaskInput} ${
                    subTask.completed ? styles.completed : ""
                  }`}
                />
                <button
                  className={styles.deleteSubTaskButton}
                  onClick={() => onDeleteSubTask(listId, task.id, subTask.id)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="+ Add a sub-task"
            className={styles.addSubTaskInput}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                onAddSubTask(listId, task.id, e.currentTarget.value);
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
        {/* Attachments Section */}
        <div className={styles.attachmentsContainer}>
          <div className={styles.attachmentsList}>
            {task.attachments?.map((attachment) => (
              <div key={attachment.id} className={styles.attachmentItem}>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.attachmentLink}
                >
                  <FaPaperclip /> <span>{attachment.name}</span>
                </a>
                <button
                  className={styles.deleteAttachmentButton}
                  onClick={() =>
                    onDeleteAttachment(listId, task.id, attachment.id)
                  }
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <label className={styles.addAttachmentButton}>
            <FaPaperclip /> Add Attachment
            <input
              type="file"
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onAddAttachment(listId, task.id, e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
        {/* Comments Section */}
        {activeCommentsTaskId === task.id && (
          <div className={styles.commentsContainer}>
            <div className={styles.commentsList}>
              {task.comments?.map((comment) => {
                const author = teamMembers.find(
                  (m) => m.id === comment.authorId
                );
                return (
                  <div key={comment.id} className={styles.comment}>
                    <span className={styles.memberAvatar} title={author?.name}>
                      {author?.avatar || "?"}
                    </span>
                    <div className={styles.commentBody}>
                      <p className={styles.commentText}>{comment.text}</p>
                      {currentUser?.id === comment.authorId && (
                        <div className={styles.commentActions}>
                          <button
                            onClick={() => {
                              const newText = prompt(
                                "Edit comment:",
                                comment.text
                              );
                              if (newText)
                                onEditComment(
                                  listId,
                                  task.id,
                                  comment.id,
                                  newText
                                );
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              onDeleteComment(listId, task.id, comment.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.addComment}>
              <textarea
                placeholder="Write a comment..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onAddComment(listId, task.id, e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task Actions Footer */}
      <div className={styles.taskCardActions}>
        <div className={styles.teamSection}>
          <div className={styles.assignedMembers}>
            {task.assignedTo?.map((memberId) => {
              const member = teamMembers.find((m) => m.id === memberId);
              return member ? (
                <span
                  key={memberId}
                  className={styles.memberAvatar}
                  title={member.name}
                >
                  {member.avatar}
                </span>
              ) : null;
            })}
          </div>
        </div>
        <div className={styles.taskActions}>
          {task.dueDate && (
            <div
              className={`${styles.dueDate} ${
                isOverdue(task.dueDate) && !task.completed ? styles.overdue : ""
              }`}
              title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
            >
              <FaCalendarAlt />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <button
            className={`${styles.starButton} ${
              styles[task.priority || "medium"]
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setEditingPriority({ listId, taskId: task.id });
            }}
          >
            {task.priority === "high" && <FaStar />}
            {task.priority === "medium" && <FaRegStar />}
            {task.priority === "low" && <FaRegStar style={{ opacity: 0.5 }} />}
            {!task.priority && <FaRegStar />}
          </button>
          {editingPriority && (
            <div className={styles.priorityPopover}>
              {(["high", "medium", "low"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onSetPriority(listId, task.id, p);
                    setEditingPriority(null);
                  }}
                  className={task.priority === p ? styles.activePriority : ""}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setEditingPriority(null)}
                className={styles.closePopover}
              >
                &times;
              </button>
            </div>
          )}
          <button
            className={`${styles.actionButton} ${
              activeCommentsTaskId === task.id ? styles.active : ""
            }`}
            onClick={() =>
              setActiveCommentsTaskId(
                activeCommentsTaskId === task.id ? null : task.id
              )
            }
          >
            <FaComment />
            {task.comments && task.comments.length > 0 && (
              <span>{task.comments.length}</span>
            )}
          </button>
          <button
            className={styles.deleteTaskButton}
            onClick={() => onOpenDeleteModal(listId, task.id, task.text)}
          >
            <FaTrash />
          </button>
          <div className={styles.teamAssignmentContainer}>
            <button
              className={styles.assignButton}
              onClick={() => onOpenTeamModal(listId, task)}
              title="Assign Team Members"
            >
              <FaUsers />
              <span>Team</span>
              {task.assignedTo && task.assignedTo.length > 0 && (
                <span className={styles.assignedCount}>
                  {task.assignedTo.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
