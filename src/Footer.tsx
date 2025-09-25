import React from "react";
import styles from "./Footer.module.css";
import logo from "./assets/logo.jpg";
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

interface FooterProps {
  onDashboardClick: () => void;
  onAboutClick: () => void;
  onServicesClick: () => void;
  onContactClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onCookiesClick: () => void;
}

const NavLink: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  </li>
);

const Footer: React.FC<FooterProps> = (props) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.logoContainer}>
            <img src={logo} alt="AyaSync Logo" className={styles.logo} />
            <span className={styles.logoText}>AyaSync</span>
          </div>
          <p className={styles.description}>
            Empowering teams to achieve more through intelligent project
            management and seamless collaboration.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="LinkedIn">
              <FaLinkedin />
            </a>
            <a href="#" aria-label="Github">
              <FaGithub />
            </a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <ul>
            <NavLink onClick={props.onDashboardClick}>Dashboard</NavLink>
            <NavLink onClick={props.onAboutClick}>About Us</NavLink>
            <NavLink onClick={props.onServicesClick}>Services</NavLink>
            <NavLink onClick={props.onContactClick}>Contact</NavLink>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Legal</h4>
          <ul>
            <NavLink onClick={props.onPrivacyClick}>Privacy Policy</NavLink>
            <NavLink onClick={props.onTermsClick}>Terms of Service</NavLink>
            <NavLink onClick={props.onCookiesClick}>Cookie Policy</NavLink>
          </ul>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} AyaSync. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
