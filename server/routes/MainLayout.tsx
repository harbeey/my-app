import React from "react";
import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";

const MainLayout: React.FC = () => {
  return (
    <div className={styles.appContainer}>
      {/* Sidebar can be added here */}
      <div className={styles.mainContent}>
        {/* A header can be added here */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
