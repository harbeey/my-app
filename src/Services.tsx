import React, { useState, useEffect } from "react";
import styles from "./Services.module.css";
import { FaCalendarAlt, FaUsers, FaChartBar } from "react-icons/fa";

const serviceList = [
  {
    icon: <FaCalendarAlt />,
    title: "Project Scheduling",
    desc: "Plan, schedule, and track project timelines with Gantt charts and calendar views. Ensure every milestone is met and resources are allocated efficiently.",
  },
  {
    icon: <FaUsers />,
    title: "Team Collaboration",
    desc: "Enable seamless communication and file sharing among project members. Assign tasks, set priorities, and keep everyone aligned with real-time updates.",
  },
  {
    icon: <FaChartBar />,
    title: "Progress & Reporting",
    desc: "Monitor project health with dashboards and custom reports. Visualize progress, identify bottlenecks, and share insights with stakeholders.",
  },
];

const Services: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main
      className={`${styles.servicesPage} ${isVisible ? styles.fadeIn : ""}`}
    >
      {/* Centered Header */}
      <section className={styles.hero}>
        <h1 className={styles.pageTitle}>Our Services</h1>
        <p className={styles.pageSubtitle}>
          Easily create, assign, and track tasks for every project. Our
          intuitive interface lets you set deadlines, prioritize tasks, and
          monitor progress in real time. Gain a clear overview of who is doing
          what and when, eliminating communication gaps and keeping everyone
          aligned.
        </p>
      </section>

      {/* Services List - Each service in its own row container */}
      <section className={styles.servicesGrid}>
        {serviceList.map((service) => (
          <div className={styles.serviceCard} key={service.title}>
            <div className={styles.serviceIcon}>{service.icon}</div>
            <h3 className={styles.serviceTitle}>{service.title}</h3>
            <p className={styles.serviceDescription}>{service.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
};

export default Services;
