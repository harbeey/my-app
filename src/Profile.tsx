import React, { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import {
  FaArrowLeft,
  FaUser,
  FaCrown,
  FaLink,
  FaKey,
  FaTimes,
  FaRedo,
  FaCropAlt,
  FaSyncAlt,
  FaSun,
  FaMoon,
  FaSearchPlus,
  FaSearchMinus,
} from "react-icons/fa";
import { globalActivityTracker } from "./globalActivityTracker";

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin?: string;
}

interface Connection {
  id: string;
  userId: string;
  connectedUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

interface ProfileProps {
  currentUser: User | null;
  onUpdateUser: (user: User) => void;
  onBack?: () => void;
}

const Profile: React.FC<ProfileProps> = ({
  currentUser,
  onUpdateUser,
  onBack,
}) => {
  const [user, setUser] = useState<User | null>(currentUser);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageForCrop, setOriginalImageForCrop] = useState<
    string | null
  >(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropData, setCropData] = useState({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  });
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [aspectRatio, setAspectRatio] = useState<
    "square" | "circle" | "rectangle"
  >("square");
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [isCropResizing, setIsCropResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropData, setInitialCropData] = useState({
    ...cropData,
  });

  const [activeFilter, setActiveFilter] = useState<string>("none");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Load user profile and connections
  useEffect(() => {
    setUser(currentUser);
    loadConnections();
    loadAllUsers();
  }, [currentUser]);

  async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
    const token = localStorage.getItem("authToken");
    const headers = new Headers(init?.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    // Do not set content-type for FormData, the browser will do it with the correct boundary
    if (!(init?.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
    const res = await fetch(input, { ...init, headers });
    return res;
  }

  async function loadConnections() {
    try {
      const res = await authFetch("/api/users/connections");
      const data = await res.json();
      if (res.ok) {
        setConnections(data);
      }
    } catch (e) {
      console.log("Failed to load connections:", e);
    }
  }

  async function loadAllUsers() {
    try {
      const res = await authFetch("/api/users");
      const data = await res.json();
      if (res.ok) {
        setAllUsers(data);
      }
    } catch (e) {
      console.log("Failed to load users:", e);
    }
  }

  async function updateProfile(updates: Partial<User>) {
    try {
      setLoading(true);
      console.log("Updating profile with:", updates);

      const res = await authFetch("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      console.log("Profile update response:", { ok: res.ok, data });

      if (res.ok) {
        onUpdateUser(data.user); // Update parent state

        // If a new token is returned, update it in localStorage
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        // Track activity
        const updatedFields = Object.keys(updates).join(", ");
        globalActivityTracker.trackActivity({
          action: `Updated profile: ${updatedFields}`,
          user: user?.email || "Unknown",
          details: `Profile fields updated: ${updatedFields}`,
          type: "profile",
        });

        // Trigger profile update event for other components
        console.log("Dispatching profileUpdated event");
        window.dispatchEvent(new CustomEvent("profileUpdated"));
      } else {
        console.error("Profile update failed:", data);
        setError(data?.error || "Failed to update profile");
      }
    } catch (e) {
      console.error("Profile update error:", e);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(formData: FormData) {
    try {
      // setLoading and setIsUploading are set in handleCropConfirm
      setUploadProgress(50); // Simulate progress

      const res = await authFetch("/api/users/me/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onUpdateUser(data.user); // Update parent state
        setUploadProgress(100);

        globalActivityTracker.trackActivity({
          action: "Updated profile avatar",
          user: user?.email || "Unknown",
          type: "profile",
        });
        window.dispatchEvent(new CustomEvent("profileUpdated"));

        // The backend should return a new token with the updated user info
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
      } else {
        setError(data?.error || "Failed to upload avatar");
      }
    } catch (e) {
      setError("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      handleCropCancel();
    }
  }

  async function sendConnectionRequest(userId: string) {
    try {
      const res = await authFetch("/api/users/connections", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        loadConnections();
        setShowAddConnection(false);
        setSearchEmail("");

        // Track activity
        const targetUser = allUsers.find((u) => u.id === userId);
        globalActivityTracker.trackActivity({
          action: `Sent connection request to ${
            targetUser?.email || "Unknown User"
          }`,
          user: user?.email || "Unknown",
          target: targetUser?.email,
          details: `Connection request sent`,
          type: "connection",
        });
      }
    } catch (e) {
      setError("Failed to send connection request");
    }
  }

  async function respondToConnection(
    connectionId: string,
    status: "accepted" | "declined"
  ) {
    try {
      const res = await authFetch(`/api/users/connections/${connectionId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadConnections();

        // Track activity
        const connection = connections.find((c) => c.id === connectionId);
        const targetUser = allUsers.find(
          (u) => u.id === connection?.connectedUserId
        );
        globalActivityTracker.trackActivity({
          action: `${
            status === "accepted" ? "Accepted" : "Declined"
          } connection request from ${targetUser?.email || "Unknown User"}`,
          user: user?.email || "Unknown",
          target: targetUser?.email,
          details: `Connection ${status}`,
          type: "connection",
        });
      }
    } catch (e) {
      setError("Failed to respond to connection");
    }
  }

  async function removeConnection(connectionId: string) {
    try {
      const res = await authFetch(`/api/users/connections/${connectionId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadConnections();

        // Track activity
        const connection = connections.find((c) => c.id === connectionId);
        const targetUser = allUsers.find(
          (u) => u.id === connection?.connectedUserId
        );
        globalActivityTracker.trackActivity({
          action: `Removed connection with ${
            targetUser?.email || "Unknown User"
          }`,
          user: user?.email || "Unknown",
          target: targetUser?.email,
          details: `Connection removed`,
          type: "connection",
        });
      }
    } catch (e) {
      setError("Failed to remove connection");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await authFetch("/api/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordSuccess(data.message || "Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(data?.error || "Failed to change password.");
      }
    } catch (err) {
      setPasswordError("An error occurred. Please try again.");
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(
        `File size must be less than 5MB. Your file is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
      return;
    }

    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
      "image/ico",
    ];

    if (!validImageTypes.includes(file.type.toLowerCase())) {
      setError(
        "Please select a valid image file (JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO)"
      );
      return;
    }

    // Clear any previous errors
    setError(null);
    setSelectedFile(file);

    // Read file and open crop modal
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result;
      if (typeof imageUrl === "string") {
        setOriginalImageForCrop(imageUrl);
        setShowCropModal(true);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the image file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = () => {
    if (!originalImageForCrop || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10); // Initial progress

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Set canvas size based on aspect ratio
      const outputSize = 400; // High-quality output
      canvas.width = outputSize;
      canvas.height =
        aspectRatio === "rectangle" ? outputSize * 0.75 : outputSize;
      if (!ctx) {
        // Check if context is available
        setError("Failed to get canvas context");
        setIsUploading(false);
        return;
      }

      // Calculate the scale factor between displayed image and actual image
      const scaleX = img.naturalWidth / imageDimensions.width;
      const scaleY = img.naturalHeight / imageDimensions.height; // Corrected

      // Convert crop coordinates from display coordinates to actual image coordinates
      const sourceX = cropData.x * scaleX;
      const sourceY = cropData.y * scaleY;
      const sourceWidth = cropData.width * scaleX;
      const sourceHeight = cropData.height * scaleY; // Corrected

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      // Draw the cropped portion of the image
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Apply rotation
      if (rotation !== 0) {
        const rotatedCanvas = document.createElement("canvas");
        const rotatedCtx = rotatedCanvas.getContext("2d");

        if (rotatedCtx) {
          // Check if context is available
          rotatedCanvas.width = canvas.width;
          rotatedCanvas.height = canvas.height;

          rotatedCtx.translate(canvas.width / 2, canvas.height / 2);
          rotatedCtx.rotate((rotation * Math.PI) / 180);
          rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

          // Copy back to original canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(rotatedCanvas, 0, 0);
        }
      } // Corrected

      // Apply additional filters
      if (activeFilter !== "none") {
        applyFilter(ctx, canvas, activeFilter);
      }

      // Convert canvas to blob and upload
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const formData = new FormData();
            const fileName = selectedFile.name || "avatar.png";
            formData.append("avatar", blob, fileName);
            uploadAvatar(formData);
          } else {
            setError("Failed to process image.");
            setIsUploading(false);
          }
        },
        "image/png",
        0.9
      );
    };

    img.src = originalImageForCrop;
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setOriginalImageForCrop(null);
    setSelectedFile(null);
    // Reset customization values
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setZoom(100);
    handleAspectRatioChange("square");
    setActiveFilter("none");
  };

  // Apply image filters
  const applyFilter = (
    ctx: CanvasRenderingContext2D | null,
    canvas: HTMLCanvasElement | null,
    filter: string
  ) => {
    if (!ctx || !canvas) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filter) {
      case "grayscale":
        for (let i = 0; i < data.length; i += 4) {
          const gray =
            data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }
        break;
      case "sepia":
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      case "vintage":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1);
          data[i + 1] = Math.min(255, data[i + 1] * 1.05);
          data[i + 2] = Math.max(0, data[i + 2] * 0.9);
        }
        break;
      case "cool":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, data[i] * 0.9);
          data[i + 1] = Math.min(255, data[i + 1] * 1.1);
          data[i + 2] = Math.min(255, data[i + 2] * 1.1);
        }
        break;
      case "warm":
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1);
          data[i + 1] = Math.min(255, data[i + 1] * 1.05);
          data[i + 2] = Math.max(0, data[i + 2] * 0.9);
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    // Use the image's full resolution for the editor
    const displayWidth = img.naturalWidth;
    const displayHeight = img.naturalHeight;
    setImageDimensions({ width: displayWidth, height: displayHeight });

    let cropSize = Math.min(displayWidth, displayHeight) * 0.6; // 60% of smaller dimension
    let cropWidth = cropSize;
    let cropHeight = cropSize;

    if (aspectRatio === "rectangle") {
      cropSize = Math.min(displayWidth, displayHeight) * 0.8;
      cropWidth = cropSize * 1.5;
      cropHeight = cropSize;
    }

    cropWidth = Math.min(cropWidth, displayWidth);
    cropHeight = Math.min(cropHeight, displayHeight);

    setCropData({
      x: Math.max(0, (displayWidth - cropWidth) / 2),
      y: Math.max(0, (displayHeight - cropHeight) / 2),
      width: cropWidth,
      height: cropHeight,
    });
  };

  const handleAspectRatioChange = (
    newAspectRatio: "square" | "circle" | "rectangle"
  ) => {
    setAspectRatio(newAspectRatio);

    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
      let cropSize =
        Math.min(imageDimensions.width, imageDimensions.height) * 0.6;
      let cropWidth = cropSize;
      let cropHeight = cropSize;

      if (newAspectRatio === "rectangle") {
        cropSize =
          Math.min(imageDimensions.width, imageDimensions.height) * 0.8;
        cropWidth = cropSize * 1.5;
        cropHeight = cropSize;
      }

      cropWidth = Math.min(cropWidth, imageDimensions.width);
      cropHeight = Math.min(cropHeight, imageDimensions.height);

      setCropData((prev) => ({
        x: Math.max(0, Math.min(prev.x, imageDimensions.width - cropWidth)),
        y: Math.max(0, Math.min(prev.y, imageDimensions.height - cropHeight)),
        width: cropWidth,
        height: cropHeight,
      }));
    }
  };

  const handleCropMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCropDragging || isCropResizing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCropData((prev) => ({
      ...prev,
      x: Math.max(
        0,
        Math.min(x - prev.width / 2, imageDimensions.width - prev.width)
      ),
      y: Math.max(
        0,
        Math.min(y - prev.height / 2, imageDimensions.height - prev.height)
      ),
    }));
  };

  const handleCropDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsCropDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCropData({ ...cropData });

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const startCropX = initialCropData.x;
      const startCropY = initialCropData.y;

      setCropData((prev) => ({
        ...prev,
        x: Math.max(
          0,
          Math.min(startCropX + deltaX, imageDimensions.width - prev.width)
        ),
        y: Math.max(
          0,
          Math.min(startCropY + deltaY, imageDimensions.height - prev.height)
        ),
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setIsCropResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleCropResize = (
    e: React.MouseEvent<HTMLDivElement>,
    direction: "nw" | "se"
  ) => {
    e.stopPropagation();
    setIsCropResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialCropData({ ...cropData });

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      const startCropData = initialCropData;

      setCropData((prev) => {
        const newData = { ...prev }; // Create a new object

        if (direction === "nw") {
          // Resize from top-left corner
          newData.width = Math.max(50, startCropData.width - deltaX);
          newData.height = Math.max(50, startCropData.height - deltaY);
          newData.x = Math.max(
            0,
            Math.min(
              startCropData.x + deltaX,
              startCropData.x + startCropData.width - 50
            )
          );
          newData.y = Math.max(
            0,
            Math.min(
              startCropData.y + deltaY,
              startCropData.y + startCropData.height - 50
            )
          );
        } else {
          // Resize from bottom-right corner
          newData.width = Math.max(
            50,
            Math.min(
              startCropData.width + deltaX,
              imageDimensions.width - startCropData.x
            )
          );
          newData.height = Math.max(
            50,
            Math.min(
              startCropData.height + deltaY,
              imageDimensions.height - startCropData.y
            )
          );
        }

        return newData;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setIsCropDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const filteredUsers = allUsers.filter(
    (u) =>
      u.id !== user?.id &&
      !connections.some(
        (c) => c.connectedUserId === u.id || c.userId === u.id
      ) &&
      (searchEmail === "" ||
        u.email.toLowerCase().includes(searchEmail.toLowerCase()))
  );

  return (
    <div className={`${styles.profileContainer} ${styles.fadeIn}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={onBack} className={styles.backButton}>
            <FaArrowLeft />
          </button>
          <div className={styles.headerTitle}>
            <h1 className={styles.title}>Profile & Settings</h1>
            <p className={styles.subtitle}>
              Manage your personal information and connections
            </p>
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.profileLayout}>
        {/* Left Column: Profile Card */}
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaUser style={{ marginRight: "0.5rem" }} /> Profile Information
            </h2>
            <div className={styles.profileCard}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  <img
                    src={user?.avatarUrl || "/default-avatar.svg"}
                    alt="Profile"
                    className={styles.avatar}
                  />
                  {isUploading && (
                    <div className={styles.uploadOverlay}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
                <label className={styles.avatarUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                    hidden
                  />
                  {isUploading ? "Uploading..." : "Change"}
                </label>
              </div>
              <div className={styles.profileInfo}>
                <div className={styles.field}>
                  <label>Name</label>
                  <input
                    type="text"
                    value={user?.name || ""}
                    onChange={(e) =>
                      setUser((prev) =>
                        prev ? { ...prev, name: e.target.value } : null
                      )
                    }
                    onBlur={(e) => updateProfile({ name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className={styles.disabled}
                  />
                </div>
                <div className={styles.field}>
                  <label>Role</label>
                  <div className={styles.roleDisplay}>
                    {user?.role === "admin" ? (
                      <>
                        <FaCrown style={{ marginRight: "0.5rem" }} /> Admin
                      </>
                    ) : (
                      <>
                        <FaUser style={{ marginRight: "0.5rem" }} /> User
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <FaKey style={{ marginRight: "0.5rem" }} /> Change Password
            </h2>
            <form
              onSubmit={handleChangePassword}
              className={styles.passwordForm}
            >
              {passwordSuccess && (
                <div className={styles.success}>{passwordSuccess}</div>
              )}
              {passwordError && (
                <div className={styles.error}>{passwordError}</div>
              )}
              <div className={styles.field}>
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <button type="submit" className={styles.changePasswordButton}>
                Update Password
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Connections */}
        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FaLink style={{ marginRight: "0.5rem" }} /> Connections
              </h2>
              <button
                onClick={() => setShowAddConnection(!showAddConnection)}
                className={styles.addButton}
              >
                {showAddConnection ? "Close" : "+ Add"}
              </button>
            </div>

            {showAddConnection && (
              <div className={styles.addConnection}>
                <input
                  type="email"
                  placeholder="Search by email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className={styles.searchInput}
                />
                <div className={styles.userList}>
                  {filteredUsers.map((u) => (
                    <div key={u.id} className={styles.userItem}>
                      <img
                        src={u.avatarUrl || "/default-avatar.svg"}
                        alt="User"
                        className={styles.userAvatar}
                      />
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{u.name}</div>
                        <div className={styles.userEmail}>{u.email}</div>
                      </div>
                      <button
                        onClick={() => sendConnectionRequest(u.id)}
                        className={styles.connectButton}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && searchEmail && (
                    <div className={styles.noResults}>No users found.</div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.connectionsGrid}>
              {connections.map((conn) => {
                const connectedUser = allUsers.find(
                  (u) => u.id === conn.connectedUserId
                );
                if (!connectedUser) return null;

                return (
                  <div key={conn.id} className={styles.connectionCard}>
                    <img
                      src={connectedUser.avatarUrl || "/default-avatar.svg"}
                      alt="User"
                      className={styles.connectionAvatar}
                    />
                    <div className={styles.connectionName}>
                      {connectedUser.name}
                    </div>
                    <div className={styles.connectionEmail}>
                      {connectedUser.email}
                    </div>
                    <div
                      className={`${styles.connectionStatus} ${
                        styles[conn.status]
                      }`}
                    >
                      {conn.status}
                    </div>
                    <div className={styles.connectionActions}>
                      {conn.status === "pending" &&
                        user?.id === conn.connectedUserId && (
                          <>
                            <button
                              onClick={() =>
                                respondToConnection(conn.id, "accepted")
                              }
                              className={styles.acceptButton}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                respondToConnection(conn.id, "declined")
                              }
                              className={styles.declineButton}
                            >
                              Decline
                            </button>
                          </>
                        )}
                      {conn.status === "accepted" && (
                        <button
                          onClick={() => removeConnection(conn.id)}
                          className={styles.removeButton}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {connections.length === 0 && !showAddConnection && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <FaLink />
                </div>
                <h3>No Connections</h3>
                <p>Add connections to collaborate with others.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Crop Modal */}
      {showCropModal && originalImageForCrop && (
        <div className={styles.modalOverlay}>
          <div className={styles.cropModalContent}>
            <h3>Customize Your Avatar</h3>

            {/* Aspect Ratio Selection */}
            <div className={styles.aspectRatioSection}>
              <h4>Shape</h4>
              <div className={styles.aspectRatioButtons}>
                <button
                  className={`${styles.aspectRatioBtn} ${
                    aspectRatio === "square" ? styles.active : ""
                  }`}
                  onClick={() => handleAspectRatioChange("square")}
                >
                  Square
                </button>
                <button
                  className={`${styles.aspectRatioBtn} ${
                    aspectRatio === "circle" ? styles.active : ""
                  }`}
                  onClick={() => handleAspectRatioChange("circle")}
                >
                  Circle
                </button>
                <button
                  className={`${styles.aspectRatioBtn} ${
                    aspectRatio === "rectangle" ? styles.active : ""
                  }`}
                  onClick={() => handleAspectRatioChange("rectangle")}
                >
                  Rectangle
                </button>
              </div>
            </div>

            {/* Crop Container */}
            <div className={styles.cropContainer}>
              <div
                className={styles.cropImageContainer}
                onClick={handleCropMove}
              >
                <img
                  src={originalImageForCrop}
                  alt="Crop"
                  className={styles.cropImage}
                  onLoad={handleImageLoad}
                  style={{
                    width: imageDimensions.width || "auto",
                    height: imageDimensions.height || "auto",
                    transform: `rotate(${rotation}deg)`,
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                  }}
                />
                <div
                  className={`${styles.cropOverlay} ${
                    aspectRatio === "circle" ? styles.circle : ""
                  }`}
                  style={{
                    left: cropData.x,
                    top: cropData.y,
                    width: cropData.width,
                    height: cropData.height,
                  }}
                  onMouseDown={handleCropDrag}
                >
                  <div
                    className={styles.cropHandle + " " + styles.nw}
                    onMouseDown={(e) => handleCropResize(e, "nw")}
                  />
                  <div
                    className={styles.cropHandle + " " + styles.se}
                    onMouseDown={(e) => handleCropResize(e, "se")}
                  />
                </div>
              </div>
            </div>

            {/* Customization Controls */}
            <div className={styles.customizationControls}>
              {/* Rotation */}
              <div className={styles.controlGroup}>
                <label>Rotation: {rotation}°</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <button
                    className={styles.resetBtn}
                    onClick={() => setRotation(0)}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Brightness */}
              <div className={styles.controlGroup}>
                <label>Brightness: {brightness}%</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <button
                    className={styles.resetBtn}
                    onClick={() => setBrightness(100)}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Contrast */}
              <div className={styles.controlGroup}>
                <label>Contrast: {contrast}%</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <button
                    className={styles.resetBtn}
                    onClick={() => setContrast(100)}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Zoom */}
              <div className={styles.controlGroup}>
                <label>Zoom: {zoom}%</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(parseInt(e.target.value))}
                    className={styles.slider}
                  />
                  <button
                    className={styles.resetBtn}
                    onClick={() => setZoom(100)}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className={styles.previewSection}>
              <h4>Preview</h4>
              <div className={styles.previewContainer}>
                <div className={styles.previewAvatar}>
                  <img
                    src={originalImageForCrop}
                    alt="Preview"
                    className={`${styles.previewImage} ${
                      aspectRatio === "circle" ? styles.circle : ""
                    }`}
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    }}
                  />
                </div>
                <div className={styles.previewInfo}>
                  <p>Shape: {aspectRatio}</p>
                  <p>Rotation: {rotation}°</p>
                  <p>Brightness: {brightness}%</p>
                  <p>Contrast: {contrast}%</p>
                  <p>Filter: {activeFilter}</p>
                </div>
              </div>
            </div>

            {/* Filter Presets */}
            <div className={styles.filterSection}>
              <h4>Filters</h4>
              <div className={styles.filterButtons}>
                <button
                  className={`${styles.filterBtn} ${
                    activeFilter === "none" ? styles.active : ""
                  }`}
                  onClick={() => setActiveFilter("none")}
                >
                  None
                </button>
                <button
                  className={`${styles.filterBtn} ${
                    activeFilter === "grayscale" ? styles.active : ""
                  }`}
                  onClick={() => setActiveFilter("grayscale")}
                >
                  Grayscale
                </button>
                <button
                  className={`${styles.filterBtn} ${
                    activeFilter === "sepia" ? styles.active : ""
                  }`}
                  onClick={() => setActiveFilter("sepia")}
                >
                  Sepia
                </button>
                <button
                  className={`${styles.filterBtn} ${
                    activeFilter === "vintage" ? styles.active : ""
                  }`}
                  onClick={() => setActiveFilter("vintage")}
                >
                  Vintage
                </button>
                <button
                  className={`${styles.filterBtn} ${
                    activeFilter === "cool" ? styles.active : ""
                  }`}
                  onClick={() => setActiveFilter("cool")}
                >
                  Cool
                </button>
                <button
                  className={`${styles.filterBtn} ${
                    activeFilter === "warm" ? styles.active : ""
                  }`}
                  onClick={() => setActiveFilter("warm")}
                >
                  Warm
                </button>
              </div>
            </div>

            <div className={styles.cropInstructions}>
              <p>• Click and drag to move the crop area</p>
              <p>• Drag the corners to resize</p>
              <p>
                • Use sliders to adjust brightness, contrast, rotation, and zoom
              </p>
              <p>• Try different filters for unique looks</p>
            </div>

            {/* Reset All Button */}
            <div className={styles.resetAllSection}>
              <button
                className={styles.resetAllBtn}
                onClick={() => {
                  setRotation(0);
                  setBrightness(100);
                  setContrast(100);
                  setZoom(100);
                  handleAspectRatioChange("square");
                  setActiveFilter("none");
                }}
              >
                <FaRedo /> Reset All
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleCropCancel}
              >
                Cancel
              </button>
              <button
                className={styles.confirmButton}
                onClick={handleCropConfirm}
                disabled={isUploading}
              >
                {isUploading ? "Saving..." : "Apply & Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
