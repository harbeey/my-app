// src/Login.tsx
import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import emailjs from "@emailjs/browser";
import * as authService from "./services/authService";
import { emailjsConfig } from "./emailjs-config";
import logo from "./assets/logo.jpg";
import {
  FaUser,
  FaCrown,
  FaExclamationTriangle,
  FaFacebook,
  FaGoogle,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";

const Login: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [showRegisterPage, setShowRegisterPage] = useState(false);

  // Registration State
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerUserType, setRegisterUserType] = useState<"user" | "admin">(
    "user"
  );
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerInfo, setRegisterInfo] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Login State
  const [userType, setUserType] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  // UI State
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Modal State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalAnimation, setModalAnimation] = useState(false);

  // Email validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 4) return "Medium";
    if (passwordStrength >= 5) return "Strong";
    return "";
  };

  // Keyboard support for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowForgotPassword(false);
      }
    };

    if (showForgotPassword) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showForgotPassword]);

  // Automatically show forgot password modal after 3 failed attempts
  useEffect(() => {
    if (failedAttempts >= 3) {
      setShowForgotPassword(true);
    }
  }, [failedAttempts]);

  // Modal animations
  useEffect(() => {
    if (showForgotPassword) {
      setModalAnimation(true);
    }
  }, [showForgotPassword]);

  // Handle forgot password
  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    setRegisterError(null);
    setRegisterInfo(null);

    if (!validateEmail(resetEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(resetEmail);

      // For demonstration, we'll just show a success message.
      // A real implementation would send an email with a unique token.
      setRegisterInfo(
        "If an account with that email exists, a password reset link has been sent."
      );
      setResetSent(true);
    } catch (err: any) {
      // Even on error, we might want to show a generic message for security.
      setResetSent(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle login
  async function submitLogin() {
    try {
      const data = await authService.loginUser({ email, password, userType });

      if (!data.token) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        throw new Error("Login failed, please check credentials.");
      }

      // Send login notification email using EmailJS
      try {
        await emailjs.send(
          emailjsConfig.serviceId,
          emailjsConfig.templates.passwordReset, // This is the "login notif" template
          {
            to_name: data.user.name || email.split("@")[0],
            to_email: email,
          },
          emailjsConfig.publicKey
        );
        console.log("Login notification email sent successfully!");
      } catch (emailError) {
        console.error("Failed to send login email:", emailError);
      }

      localStorage.setItem("authToken", data.token);
      setFailedAttempts(0);
      onSuccess();
    } catch (err: any) {
      setError(
        err?.message || "An unexpected error occurred. Please try again."
      );
    }
  }

  // Form submission handler
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await submitLogin();
    } catch (err: any) {
      setError(
        err?.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // Reset form when modal closes
  useEffect(() => {
    if (!showForgotPassword) {
      setResetEmail("");
      setError(null);
      setInfo(null);
      setEmailError("");
      setResetSent(false);
    }
  }, [showForgotPassword]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        {/* Left Panel - Login or Register Form */}
        <div className={styles.loginPanel}>
          <div
            className={styles.formWrapper}
            key={showRegisterPage ? "register" : "login"}
          >
            {!showRegisterPage ? (
              <form onSubmit={onSubmit}>
                <h1 className={styles.title}>Log In</h1>
                <p className={styles.subtitle}>Log in to access your account</p>
                {/* ...existing code for login form... */}
                <div className={styles.userTypeSelector}>
                  <button
                    type="button"
                    onClick={() => setUserType("user")}
                    className={`${styles.userTypeButton} ${
                      userType === "user" ? styles.active : ""
                    }`}
                  >
                    <FaUser /> User
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("admin")}
                    className={`${styles.userTypeButton} ${
                      userType === "admin" ? styles.active : ""
                    }`}
                  >
                    <FaCrown /> Admin
                  </button>
                </div>
                <label htmlFor="login-email" className={styles.formLabel}>
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                  required
                />
                <div className={styles.passwordWrapper}>
                  <label htmlFor="login-password" className={styles.formLabel}>
                    Password
                  </label>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.formInput}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    aria-describedby={error ? "login-error" : undefined}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.showPasswordToggle}
                  >
                    {showPassword ? (
                      <>
                        <FaEyeSlash /> Hide
                      </>
                    ) : (
                      <>
                        <FaEye /> Show
                      </>
                    )}
                  </button>
                </div>
                {failedAttempts >= 3 && (
                  <div className={styles.warningMessage}>
                    <FaExclamationTriangle /> Too many failed attempts. Please
                    use the forgot password option.
                  </div>
                )}
                <div className={styles.formActions}>
                  <div className={styles.rememberMeContainer}>
                    <input
                      type="checkbox"
                      id="remember"
                      style={{ marginRight: 8 }}
                    />
                    <label
                      htmlFor="remember"
                      className={styles.rememberMeLabel}
                    >
                      Remember Me
                    </label>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className={styles.forgotPasswordLink}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                {error && (
                  <div id="login-error" className={styles.errorMessage}>
                    {error}
                  </div>
                )}
                {info && <div className={styles.infoMessage}>{info}</div>}
                <button
                  disabled={loading}
                  type="submit"
                  className={styles.button}
                >
                  {loading ? (
                    <FaSpinner className={styles.spinner} />
                  ) : (
                    "Log In"
                  )}
                </button>
                <div className={styles.socialLoginLabel}>Or sign in with</div>
                <div className={styles.socialButtonsContainer}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.social} ${styles.facebook}`}
                  >
                    <FaFacebook className={styles.socialIcon} />{" "}
                    <span className={styles.srOnly}>Sign in with Facebook</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.social} ${styles.google}`}
                  >
                    <FaGoogle className={styles.socialIcon} />{" "}
                    <span className={styles.srOnly}>Sign in with Google</span>
                  </button>
                </div>
                <div className={styles.switchFormContainer}>
                  <button
                    type="button"
                    onClick={() => setShowRegisterPage(true)}
                    className={styles.switchFormButton}
                  >
                    Don't have an account? Register
                  </button>
                </div>
              </form>
            ) : (
              /* --- Registration Form --- */
              <form
                key="register-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setRegisterError(null);
                  setRegisterInfo(null);
                  setRegisterLoading(true);
                  try {
                    if (!registerName || !registerEmail || !registerPassword) {
                      throw new Error("All fields are required.");
                    }
                    const registrationData = {
                      name: registerName,
                      email: registerEmail,
                      password: registerPassword,
                      role: registerUserType,
                    };
                    await authService.registerUser(registrationData);

                    // Send welcome email using EmailJS
                    try {
                      await emailjs.send(
                        emailjsConfig.serviceId,
                        emailjsConfig.templates.welcome,
                        {
                          to_name: registerName,
                          to_email: registerEmail,
                        },
                        emailjsConfig.publicKey
                      );
                      console.log("Welcome email sent successfully!");
                    } catch (emailError) {
                      console.error(
                        "Failed to send welcome email:",
                        emailError
                      );
                      // We can choose to not block the user flow if email fails
                    }

                    setEmail(registerEmail);
                    setPassword(registerPassword);
                    setRegisterInfo("Account created. Logging you in...");
                    // Automatically log in after registration
                    setTimeout(async () => {
                      setLoading(true);
                      try {
                        const loginData = await authService.loginUser({
                          email: registerEmail,
                          password: registerPassword,
                          userType: registerUserType,
                        });

                        localStorage.setItem("authToken", loginData.token);
                        setFailedAttempts(0);

                        onSuccess();
                      } catch (err: any) {
                        setError(
                          err?.message ||
                            "Auto-login failed. Please log in manually."
                        );
                      } finally {
                        setLoading(false);
                      }
                    }, 500);
                  } catch (err: any) {
                    setRegisterError(
                      err?.message || "An unexpected error occurred."
                    );
                  } finally {
                    setRegisterLoading(false);
                  }
                }}
              >
                <h1 className={styles.title}>Register</h1>
                <p className={styles.subtitle}>
                  Create a new account to access your personalized dashboard
                </p>
                <div className={styles.userTypeSelector}>
                  <button
                    type="button"
                    onClick={() => setRegisterUserType("user")}
                    className={`${styles.userTypeButton} ${
                      registerUserType === "user" ? styles.active : ""
                    }`}
                  >
                    <FaUser /> User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegisterUserType("admin")}
                    className={`${styles.userTypeButton} ${
                      registerUserType === "admin" ? styles.active : ""
                    }`}
                  >
                    <FaCrown /> Admin
                  </button>
                </div>
                <label htmlFor="register-name" className={styles.formLabel}>
                  Name
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter your name"
                  autoComplete="name"
                  aria-invalid={!!registerError}
                  aria-describedby={
                    registerError ? "register-error" : undefined
                  }
                  required
                />
                <label htmlFor="register-email" className={styles.formLabel}>
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className={styles.formInput}
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={!!registerError}
                  aria-describedby={
                    registerError ? "register-error" : undefined
                  }
                  required
                />
                <div className={styles.passwordWrapper}>
                  <label
                    htmlFor="register-password"
                    className={styles.formLabel}
                  >
                    Password
                  </label>
                  <input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={registerPassword}
                    onChange={(e) => {
                      setRegisterPassword(e.target.value);
                      calculatePasswordStrength(e.target.value);
                    }}
                    className={styles.formInput}
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    aria-invalid={!!registerError}
                    aria-describedby={
                      registerError ? "register-error" : undefined
                    }
                    required
                  />
                  {registerPassword.length > 0 && (
                    <div className={styles.passwordStrengthContainer}>
                      <div className={styles.strengthSegments}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div
                            key={index}
                            className={`${styles.strengthSegment} ${
                              passwordStrength > index
                                ? styles[getStrengthText().toLowerCase()]
                                : ""
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`${styles.strengthText} ${
                          styles[getStrengthText().toLowerCase()]
                        }`}
                      >
                        {getStrengthText()}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.showPasswordToggle}
                  >
                    {showPassword ? (
                      <>
                        <FaEyeSlash /> Hide
                      </>
                    ) : (
                      <>
                        <FaEye /> Show
                      </>
                    )}
                  </button>
                </div>
                {registerError && (
                  <div id="register-error" className={styles.errorMessage}>
                    {registerError}
                  </div>
                )}
                {registerInfo && (
                  <div className={styles.infoMessage}>{registerInfo}</div>
                )}
                <button
                  type="submit"
                  disabled={registerLoading}
                  className={styles.button}
                >
                  {registerLoading ? (
                    <FaSpinner className={styles.spinner} />
                  ) : (
                    "Register"
                  )}
                </button>
                <div className={styles.switchFormContainer}>
                  <button
                    type="button"
                    onClick={() => setShowRegisterPage(false)}
                    className={styles.switchFormButton}
                  >
                    Already have an account? Log In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Panel - Info Section */}
        <div className={styles.infoPanel}>
          <div className={styles.infoContent}>
            <img src={logo} alt="AyaSync Logo" className={styles.brandLogo} />
            <h1 className={styles.brandTitle}>AyaSync</h1>
            <div className={styles.brandAccent}></div>
            <p className={styles.brandDescription}>
              Welcome back! Log in to access your personalized dashboard where
              real-time data and tasks are just a click away.
            </p>

            {/* User Type Info Card */}
            <div
              className={`${styles.userInfoCard} ${
                userType === "admin" ? styles.admin : ""
              }`}
            >
              <div className={styles.userInfoIcon}>
                {userType === "admin" ? <FaCrown /> : <FaUser />}
              </div>
              <h3 className={styles.userInfoTitle}>
                {userType === "admin" ? "Admin Access" : "User Access"}
              </h3>
              <p className={styles.userInfoDescription}>
                {userType === "admin"
                  ? "Full system control, user management, analytics, and administrative tools. Any email can be used for admin registration."
                  : "Personal dashboard, task management, and collaboration features."}
              </p>
            </div>
            <h3 className={styles.trustedCompaniesTitle}>
              Our Trusted Companies:
            </h3>
            <div className={styles.trustedCompaniesContainer}>
              <div className={styles.companyInfo}>
                <div className={styles.companyLogo}>S</div>
                <div>
                  <div className={styles.companyName}>MAKERSPACE</div>
                  <div className={styles.companySubtitle}>INNOVHUB</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className={styles.modalOverlay}>
          <div
            className={`${styles.modalContent} ${
              modalAnimation ? styles.show : ""
            }`}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Reset Password</h2>
              <p className={styles.modalDescription}>
                Enter your email and we'll send you a link to reset your
                password.
              </p>
            </div>
            <div className={styles.modalBody}>
              {resetSent ? (
                <div className={styles.resetConfirmation}>
                  <h3 className={styles.confirmationTitle}>Check your email</h3>
                  <p>
                    If an account exists for <strong>{resetEmail}</strong>, you
                    will receive an email with instructions on how to reset your
                    password.
                  </p>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className={styles.button}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <div className={styles.modalFormGroup}>
                    <label htmlFor="reset-email" className={styles.formLabel}>
                      Email Address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setEmailError("");
                      }}
                      className={styles.formInput}
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-invalid={!!emailError}
                      aria-describedby={
                        emailError ? "reset-email-error" : undefined
                      }
                      required
                    />
                    {emailError && (
                      <div
                        id="reset-email-error"
                        className={styles.errorMessage}
                      >
                        {emailError}
                      </div>
                    )}
                  </div>
                  {(error || info) && (
                    <div
                      className={`${styles.messageBox} ${
                        error ? styles.error : styles.success
                      }`}
                    >
                      {error || info}
                    </div>
                  )}
                  <div className={styles.modalFooter}>
                    <div className={styles.modalButtonGroup}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.button} // This was 'button'
                      >
                        {isSubmitting ? "Sending..." : "Send Reset Link"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setError(null);
                          setInfo(null);
                          setEmailError("");
                          setResetSent(false);
                        }}
                        className={`${styles.button} ${styles.secondary}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
