import React from "react";
import styles from "./ActivityFeed.module.css";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaArrowRight,
  FaPencilAlt,
  FaComment,
} from "react-icons/fa";

type Activity = {
  id: string;
  type:
    | "CREATE_TASK"
    | "DELETE_TASK"
    | "COMPLETE_TASK"
    | "MOVE_TASK"
    | "RENAME_TASK"
    | "ADD_COMMENT";
  user: { id: string; name: string } | null;
  details: string;
  timestamp: Date;
  taskId?: string;
  listId?: string;
};

function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "now";
}

const activityIcons = {
  CREATE_TASK: <FaPlus />,
  DELETE_TASK: <FaTrash />,
  COMPLETE_TASK: <FaCheck />,
  MOVE_TASK: <FaArrowRight />,
  RENAME_TASK: <FaPencilAlt />,
  ADD_COMMENT: <FaComment />,
};

interface ActivityFeedProps {
  activities: Activity[];
  "data-testid"?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  "data-testid": testId,
}) => {
  return (
    <div className={styles.activityFeed} data-testid={testId}>
      <h3 className={styles.title}>Activity</h3>
      <ul className={styles.activityList}>
        {activities.map((activity) => (
          <li key={activity.id} className={styles.activityItem}>
            <div className={styles.icon}>{activityIcons[activity.type]}</div>
            <div className={styles.content}>
              <p className={styles.details}>
                <strong>{activity.user?.name || "System"}</strong>{" "}
                {activity.details}
              </p>
              <span className={styles.timestamp}>
                {timeSince(activity.timestamp)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;
