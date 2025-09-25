import React, { useState, useEffect } from "react";
import styles from "./Contact.module.css";

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className={`${styles.contactPage} ${isVisible ? styles.fadeIn : ""}`}>
      <h1 className={styles.pageTitle}>Contact Us</h1>
      <p className={styles.pageSubtitle}>
        If you have any questions, queries or suggestions please do not hesitate
        to contact us through the form below.
      </p>
      <section className={styles.contactGrid}>
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">
              Name <span className={styles.required}>*</span>
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="First Name"
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="lastName" className={styles.srOnly}>
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Last Name"
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="comment">
              Comment <span className={styles.required}>*</span>
            </label>
            <textarea
              id="comment"
              required
              rows={5}
              className={styles.formTextarea}
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
        <div className={styles.contactInfo}>
          <div className={styles.infoBlock}>
            <h3 className={styles.infoTitle}>Want a quick answer?</h3>
            <p>
              The chances are we have already answered your questions under our
              FAQ or Frequently Asked Questions which can be viewed at the link
              below.
            </p>
            <button className={styles.secondaryButton}>View FAQs</button>
          </div>
        </div>
      </section>
      {submitted && (
        <div className={styles.contactSuccess}>
          <h2>Thank you!</h2>
          <p>Your message has been sent. We’ll be in touch soon.</p>
        </div>
      )}
    </main>
  );
};

export default Contact;
