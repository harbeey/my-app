import React, { useState, useEffect } from "react";
import styles from "./LegalPage.module.css";
import { FaArrowLeft } from "react-icons/fa";

const TermsOfService: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
            <h1 className={styles.title}>Terms of Service</h1>
            <p className={styles.subtitle}>
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <h2>1. Terms</h2>
        <p>
          By accessing the website at AyaSync, you are agreeing to be bound by
          these terms of service, all applicable laws and regulations, and agree
          that you are responsible for compliance with any applicable local
          laws.
        </p>
        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily download one copy of the
          materials (information or software) on AyaSync's website for personal,
          non-commercial transitory viewing only. This is the grant of a
          license, not a transfer of title, and under this license you may not:
          modify or copy the materials; use the materials for any commercial
          purpose, or for any public display (commercial or non-commercial);
          attempt to decompile or reverse engineer any software contained on
          AyaSync's website.
        </p>
        <h2>3. Disclaimer</h2>
        <p>
          The materials on AyaSync's website are provided on an 'as is' basis.
          AyaSync makes no warranties, expressed or implied, and hereby
          disclaims and negates all other warranties including, without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights.
        </p>
        <h2>4. Limitations</h2>
        <p>
          In no event shall AyaSync or its suppliers be liable for any damages
          (including, without limitation, damages for loss of data or profit, or
          due to business interruption) arising out of the use or inability to
          use the materials on AyaSync's website, even if AyaSync or a AyaSync
          authorized representative has been notified orally or in writing of
          the possibility of such damage.
        </p>
        <h2>5. Governing Law</h2>
        <p>
          These terms and conditions are governed by and construed in accordance
          with the laws of our state and you irrevocably submit to the exclusive
          jurisdiction of the courts in that State or location.
        </p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
};

export default TermsOfService;
