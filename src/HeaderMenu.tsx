import React, { useState, useRef, useEffect } from "react";
import styles from "./HeaderMenu.module.css";
import logo from "./assets/logo.jpg";
import {
  FaUserCircle,
  FaCog,
  FaUsers,
  FaShieldAlt,
  FaInfoCircle,
  FaTools,
  FaEnvelope,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const HeaderMenu: React.FC<{
  onProfileClick?: () => void;
  onAdminClick?: () => void;
  onTeamsClick?: () => void;
  onAboutClick?: () => void;
  onHomeClick?: () => void;
  onServicesClick?: () => void;
  onContactClick?: () => void;
  onLogout?: () => void;
  currentUser?: {
    id: string;
    email: string;
    name: string;
    role?: string;
    avatarUrl?: string;
  } | null;
  isAdmin?: boolean;
}> = ({
  onProfileClick,
  onAdminClick,
  onTeamsClick,
  onAboutClick,
  onHomeClick,
  onServicesClick,
  onContactClick,
  onLogout,
  currentUser,
  isAdmin,
}) => {
  const [open, setOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("authToken");
      window.location.reload();
    }
  }

  return (
    <div className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <img src={logo} alt="AyaSync Logo" className={styles.logoIcon} />
          <span className={styles.logoText}>AyaSync</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <nav className={styles.centerSection}>
          <a
            href="#"
            className={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              onHomeClick?.();
            }}
          >
            Dashboard
          </a>
          <a
            href="#"
            className={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              onAboutClick?.();
            }}
          >
            About
          </a>
          <a
            href="#"
            className={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              onServicesClick?.();
            }}
          >
            Services
          </a>
          <a
            href="#"
            className={styles.navLink}
            onClick={(e) => {
              e.preventDefault();
              onContactClick?.();
            }}
          >
            Contact
          </a>
        </nav>
        <button
          className={styles.hamburgerButton}
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={styles.profileWrapper} ref={dropdownRef}>
          <button
            className={`${styles.profileButton} ${open ? styles.active : ""}`}
            onClick={() => setOpen(!open)}
          >
            <div className={styles.profileAvatar}>
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt="Profile"
                  className={styles.avatarImage}
                />
              ) : (
                <FaUserCircle className={styles.avatarIcon} />
              )}
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileEmail}>{currentUser?.email}</span>
            </div>
            <div className={styles.dropdownArrow}>
              <span className={`${styles.arrow} ${open ? styles.arrowUp : ""}`}>
                ▼
              </span>
            </div>
          </button>

          {/* Settings Dropdown */}
          {open && (
            <div className={`${styles.dropdown} ${styles.dropdownAnimate}`}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownUserInfo}>
                  <span className={styles.dropdownUsername}>
                    {currentUser?.name ||
                      currentUser?.email?.split("@")[0] ||
                      "User"}
                  </span>
                  <span className={styles.dropdownEmail}>
                    {currentUser?.email}
                  </span>
                </div>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onProfileClick?.();
                  setOpen(false);
                }}
              >
                <FaCog /> Profile Settings
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onTeamsClick?.();
                  setOpen(false);
                }}
              >
                <FaUsers /> Team Management
              </a>
              {(isAdmin || currentUser?.role === "admin") && (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onAdminClick?.();
                    setOpen(false);
                  }}
                >
                  <FaShieldAlt /> Admin Dashboard
                </a>
              )}
              <div className={styles.dropdownDivider} />
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  logout();
                  setOpen(false);
                }}
                className={styles.signOutLink}
              >
                <FaSignOutAlt /> Sign Out
              </a>
            </div>
          )}
        </div>
        <a href="#" className={styles.link}></a>
      </div>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`${styles.mobileMenu} ${
          isMobileMenuOpen ? styles.mobileMenuOpen : ""
        }`}
      >
        <a
          href="#"
          className={styles.mobileNavLink}
          onClick={(e) => {
            e.preventDefault();
            onHomeClick?.();
            setMobileMenuOpen(false);
          }}
        >
          Dashboard
        </a>
        <a
          href="#"
          className={styles.mobileNavLink}
          onClick={(e) => {
            e.preventDefault();
            onAboutClick?.();
            setMobileMenuOpen(false);
          }}
        >
          About
        </a>
        <a
          href="#"
          className={styles.mobileNavLink}
          onClick={(e) => {
            e.preventDefault();
            onServicesClick?.();
            setMobileMenuOpen(false);
          }}
        >
          Services
        </a>
        <a
          href="#"
          className={styles.mobileNavLink}
          onClick={(e) => {
            e.preventDefault();
            onContactClick?.();
            setMobileMenuOpen(false);
          }}
        >
          Contact
        </a>
      </div>
    </div>
  );
};

export default HeaderMenu;
