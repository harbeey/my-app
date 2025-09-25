import React, { useState, useEffect } from "react";
import styles from "./LegalPage.module.css";
import { FaArrowLeft } from "react-icons/fa";

const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
    }, 300); // Match CSS animation duration
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
            <h1 className={styles.title}>Privacy Policy</h1>
            <p className={styles.subtitle}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <h2>1. Information We Collect</h2>
        <p>
          We only ask for personal information when we truly need it to provide
          a service to you. We collect it by fair and lawful means, with your
          knowledge and consent. We also let you know why we’re collecting it
          and how it will be used.
        </p>
        <h2>2. How We Use Your Information</h2>
        <p>
          We use the information we collect in various ways, including to:
          provide, operate, and maintain our website; improve, personalize, and
          expand our website; understand and analyze how you use our website;
          develop new products, services, features, and functionality.
        </p>
        <h2>3. Security of Your Information</h2>
        <p>
          The security of your personal information is important to us, but
          remember that no method of transmission over the Internet, or method
          of electronic storage, is 100% secure. While we strive to use
          commercially acceptable means to protect your personal information, we
          cannot guarantee its absolute security.
        </p>
        <h2>4. Links to Other Sites</h2>
        <p>
          Our Service may contain links to other sites that are not operated by
          us. If you click on a third party link, you will be directed to that
          third party's site. We strongly advise you to review the Privacy
          Policy of every site you visit.
        </p>
        <h2>5. Changes to This Privacy Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page. You are
          advised to review this Privacy Policy periodically for any changes.
        </p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
