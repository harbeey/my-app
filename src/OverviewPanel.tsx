import React from "react";
import styles from "./OverviewPanel.module.css";
import {
  FaExclamationTriangle,
  FaClock,
  FaTasks,
  FaChartPie,
} from "react-icons/fa";

type Task = {
  id: string;
  text: string;
  dueDate?: string;
  completed?: boolean;
};

type List = {
  id: string;
  title: string;
  tasks: Task[];
};

interface OverviewPanelProps {
  lists: List[];
  "data-testid"?: string;
}

const OverviewPanel: React.FC<OverviewPanelProps> = ({
  lists,
  "data-testid": testId,
}) => {
  const allTasks = lists.flatMap((list) => list.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((task) => task.completed).length;

  const isOverdue = (dueDate: string | undefined): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(`${dueDate}T00:00:00`);
    return dueDateObj < today;
  };

  const isDueSoon = (dueDate: string | undefined): boolean => {
    if (!dueDate) return false;
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDateObj = new Date(`${dueDate}T00:00:00`);
    return dueDateObj >= today && dueDateObj <= tomorrow;
  };

  const overdueTasks = allTasks.filter(
    (task) => !task.completed && isOverdue(task.dueDate)
  ).length;
  const dueSoonTasks = allTasks.filter(
    (task) => !task.completed && isDueSoon(task.dueDate)
  ).length;

  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={styles.overviewPanel} data-testid={testId}>
      <h3 className={styles.title}>
        <FaChartPie /> Project Overview
      </h3>
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.total}`}>
          <FaTasks className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{totalTasks}</span>
            <span className={styles.statLabel}>Total Tasks</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.overdue}`}>
          <FaExclamationTriangle className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{overdueTasks}</span>
            <span className={styles.statLabel}>Overdue</span>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.dueSoon}`}>
          <FaClock className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{dueSoonTasks}</span>
            <span className={styles.statLabel}>Due Soon</span>
          </div>
        </div>
      </div>
      <div className={styles.progressSection}>
        <h4>Completion Progress</h4>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <span className={styles.progressLabel}>{completionPercentage}%</span>
      </div>
      <div className={styles.taskDistribution}>
        <h4>Task Distribution</h4>
        <div className={styles.chartPlaceholder}>
          {lists.map((list) => (
            <div
              key={list.id}
              className={styles.chartSegment}
              title={`${list.title}: ${list.tasks.length} tasks`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
