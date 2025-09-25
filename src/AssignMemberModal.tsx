import React, { useState } from "react";
import { Task, TeamMember } from "./types";
import styles from "./App.module.css";
import { FaSearch, FaCheck } from "react-icons/fa";

interface AssignMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToAssign: { listId: string; task: Task } | null;
  teamMembers: TeamMember[];
  onAssign: (listId: string, taskId: string, memberId: string) => void;
}

const AssignMemberModal: React.FC<AssignMemberModalProps> = ({
  isOpen,
  onClose,
  taskToAssign,
  teamMembers,
  onAssign,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen || !taskToAssign) return null;

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Assign Members</h3>
          <button onClick={onClose} className={styles.closeButton}>
            &times;
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.searchBar} style={{ marginBottom: "20px" }}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              style={{ color: "#2d3748", background: "rgba(255,255,255,0.9)" }}
            />
          </div>
          <div className={styles.membersList}>
            {filteredMembers.map((member) => {
              const isAssigned = taskToAssign.task.assignedTo?.includes(
                member.id
              );
              return (
                <div
                  key={member.id}
                  className={`${styles.memberOption} ${
                    isAssigned ? styles.assigned : ""
                  }`}
                  onClick={() =>
                    onAssign(
                      taskToAssign.listId,
                      taskToAssign.task.id,
                      member.id
                    )
                  }
                >
                  <div className={styles.memberInfo}>
                    <span className={styles.memberAvatar}>{member.avatar}</span>
                    <span className={styles.memberName}>{member.name}</span>
                  </div>
                  {isAssigned && <FaCheck className={styles.assignedIcon} />}
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.createButton}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMemberModal;
