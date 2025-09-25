import React, { useState, useEffect } from "react";
import styles from "./LegalPage.module.css";
import { FaArrowLeft } from "react-icons/fa";

const CookiePolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation
    setIsVisible(true);
  }, []);

  const handleBackClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      onBack();
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`${styles.legalPage} ${
        isExiting ? styles.fadeOut : isVisible ? styles.fadeIn : ""
      }`}
    >
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={handleBackClick} className={styles.backButton}>
            <FaArrowLeft /> Back
          </button>
          <div className={styles.headerTitle}>
            <h1 className={styles.title}>Cookie Policy</h1>
            <p className={styles.subtitle}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <h2>What Are Cookies</h2>
        <p>
          As is common practice with almost all professional websites this site
          uses cookies, which are tiny files that are downloaded to your
          computer, to improve your experience.
        </p>
        {/* Add more sections as needed */}
        <h2>How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. Unfortunately
          in most cases there are no industry standard options for disabling
          cookies without completely disabling the functionality and features
          they add to this site. It is recommended that you leave on all cookies
          if you are not sure whether you need them or not in case they are used
          to provide a service that you use.
        </p>
        <h2>Disabling Cookies</h2>
        <p>
          You can prevent the setting of cookies by adjusting the settings on
          your browser (see your browser Help for how to do this). Be aware that
          disabling cookies will affect the functionality of this and many other
          websites that you visit. Disabling cookies will usually result in also
          disabling certain functionality and features of this site. Therefore
          it is recommended that you do not disable cookies.
        </p>
      </div>
    </div>
  );
};

export default CookiePolicy;
