import React, { useState, useEffect } from "react";
import styles from "./AdminDashboard.module.css";
import { globalActivityTracker } from "./globalActivityTracker";
import UsersTab from "./UsersTab"; // Assuming UsersTab is in the same directory
import {
  FaArrowLeft,
  FaChartLine,
  FaUser,
  FaUsers,
  FaCheckCircle,
  FaShieldAlt,
  FaCog,
  FaUserFriends,
  FaCrown,
  FaBolt,
  FaBell,
  FaExclamationTriangle,
  FaBullhorn,
  FaThumbtack,
  FaClock,
  FaHdd,
  FaLink,
  FaLock,
  FaKey,
  FaHistory,
  FaTimesCircle,
  FaTools,
  FaTrashAlt,
  FaClipboardList,
  FaHourglassHalf,
  FaFire,
  FaDownload,
  FaTimes,
} from "react-icons/fa";
import { getAllTeams } from "./services/teamService";
import type { Activity } from "./globalActivityTracker";
import type { Team } from "./types/team";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  regularUsers: number;
  lastUpdated: string;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriorityTasks: number;
  overdueTasks: number;
}

interface SystemHealth {
  uptime: string;
  memoryUsage: number;
  activeConnections: number;
  responseTime: number;
  status: "healthy" | "warning" | "critical";
}

interface SecurityEvent {
  id: string;
  type: "login_attempt" | "failed_login" | "permission_change" | "data_access";
  user: string;
  timestamp: string;
  details: string;
  severity: "low" | "medium" | "high";
}

const AdminDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [notifications] = useState<string[]>([
    "⚠ Security Alert: Multiple failed login attempts detected.",
    "✅ Backup completed successfully at 3:00 AM.",
    "📊 Weekly analytics report is ready for review.",
    "🔄 System maintenance scheduled for tonight at 2:00 AM.",
  ]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "teams" | "tasks" | "security" | "system"
  >("overview");
  const [activityLog, setActivityLog] = useState<Activity[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
    const token = localStorage.getItem("authToken");
    const headers = new Headers(init?.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    const res = await fetch(input, { ...init, headers });
    return res;
  }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await authFetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setError("Failed to load users");
      }
    } catch (e) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await authFetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to load stats:", e);
    }
  };

  const loadTeams = async () => {
    try {
      const allTeams = await getAllTeams();
      setTeams(allTeams);
    } catch (e) {
      console.error("Failed to load teams:", e);
    }
  };

  const loadTaskStats = async () => {
    try {
      // Mock task statistics - in real app, this would come from API
      const mockTaskStats: TaskStats = {
        totalTasks: 156,
        completedTasks: 89,
        pendingTasks: 67,
        highPriorityTasks: 23,
        overdueTasks: 12,
      };
      setTaskStats(mockTaskStats);
    } catch (e) {
      console.error("Failed to load task stats:", e);
    }
  };

  const loadSystemHealth = async () => {
    try {
      // Mock system health data - in real app, this would come from system monitoring API
      const mockHealth: SystemHealth = {
        uptime: "15 days, 8 hours",
        memoryUsage: 67,
        activeConnections: 42,
        responseTime: 145,
        status: "healthy",
      };
      setSystemHealth(mockHealth);
    } catch (e) {
      console.error("Failed to load system health:", e);
    }
  };

  const loadSecurityEvents = async () => {
    try {
      // Mock security events - in real app, this would come from security monitoring API
      const mockEvents: SecurityEvent[] = [
        {
          id: "1",
          type: "failed_login",
          user: "unknown@example.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          details: "Multiple failed login attempts from IP 192.168.1.100",
          severity: "high",
        },
        {
          id: "2",
          type: "permission_change",
          user: "admin@test.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          details: "User role changed from user to admin",
          severity: "medium",
        },
        {
          id: "3",
          type: "data_access",
          user: "user@test.com",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          details: "Accessed sensitive user data export",
          severity: "low",
        },
      ];
      setSecurityEvents(mockEvents);
    } catch (e) {
      console.error("Failed to load security events:", e);
    }
  };

  useEffect(() => {
    // Load current user profile
    const loadCurrentUser = async () => {
      try {
        const res = await authFetch("/api/users/me");
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);

          // Activity service connection
          console.log("Admin user loaded:", userData.email);
        }
      } catch (e) {
        console.error("Failed to load current user:", e);
      }
    };

    // Debug: Check if user has admin access
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Admin Dashboard - User role:", payload.role);
        if (payload.role !== "admin") {
          console.warn("Non-admin user attempting to access admin dashboard");
        }
      } catch (e) {
        console.error("Error parsing token:", e);
      }
    }

    loadCurrentUser();
    loadUsers();
    loadStats();
    loadTeams();
    loadTaskStats();
    loadSystemHealth();
    loadSecurityEvents();

    // Set up auto-refresh for real-time data
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const interval = setInterval(() => {
      loadStats();
      loadSystemHealth();
      loadSecurityEvents();
    }, 30000); // Refresh every 30 seconds

    setRefreshInterval(interval);

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Set up activity listeners
    globalActivityTracker.onNewActivity((activity: Activity) => {
      setActivityLog((prev) => [activity, ...prev.slice(0, 99)]); // Keep last 100 activities
    });

    // Load recent activities
    const recentActivities = globalActivityTracker.getRecentActivities();
    setActivityLog(recentActivities);

    // Cleanup on unmount
    return () => {
      globalActivityTracker.removeAllListeners();
    };
  }, []);

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setShowUserModal(true);
  };

  const handleAddUser = () => {
    setEditingUser({
      id: "",
      email: "",
      name: "",
      role: "user",
      isActive: true,
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const isNewUser = !editingUser.id;
      const res = await authFetch(
        `/api/admin/users/${editingUser.id || "new"}`,
        {
          method: isNewUser ? "POST" : "PATCH",
          body: JSON.stringify({
            email: editingUser.email,
            name: editingUser.name,
            role: editingUser.role,
            isActive: editingUser.isActive,
          }),
        }
      );

      if (res.ok) {
        await loadUsers();
        await loadStats();
        setEditingUser(null);
        setShowUserModal(false);

        // Track activity
        globalActivityTracker.trackActivity({
          action: isNewUser
            ? `Created new user: ${editingUser.email}`
            : `Updated user: ${editingUser.email}`,
          user: currentUser?.email || "admin",
          target: editingUser.email,
          details: `Role: ${editingUser.role}, Status: ${
            editingUser.isActive ? "Active" : "Inactive"
          }`,
          type: "admin",
        });

        const action = isNewUser ? "User created" : "User updated";
        // addActivityLog(action, "admin", editingUser.email);
      } else {
        setError("Failed to save user");
      }
    } catch (e) {
      setError("Failed to save user");
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const res = await authFetch(`/api/admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadUsers();
        await loadStats();

        globalActivityTracker.trackActivity({
          action: `Deleted user: ${userToDelete.email}`,
          user: currentUser?.email || "admin",
          target: userToDelete.email,
          details: `User permanently removed from system`,
          type: "admin",
        });
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to delete user");
      }
    } catch (e) {
      setError("Failed to delete user");
    } finally {
      setUserToDelete(null);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ["Email", "Name", "Role", "Status", "Last Login", "Created"],
      ...users.map((user) => [
        user.email,
        user.name || "",
        user.role,
        user.isActive ? "Active" : "Inactive",
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "",
        user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.header}>
          <button onClick={onBack} className={styles.backButton}>
            <FaArrowLeft /> Back
          </button>
          <h1 className={styles.title}>Admin Dashboard</h1>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.adminContainer} ${isVisible ? styles.fadeIn : ""}`}
    >
      {/* Enhanced Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={onBack} className={styles.backButton}>
            <FaArrowLeft /> Back
          </button>
          <div className={styles.headerTitle}>
            <h1 className={styles.title}>Admin Dashboard</h1>
            <p className={styles.subtitle}>
              Comprehensive system management and analytics
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.systemStatus}>
            <span
              className={`${styles.statusIndicator} ${
                systemHealth?.status === "healthy"
                  ? styles.healthy
                  : styles.warning
              }`}
            ></span>
            <span className={styles.statusText}>
              System {systemHealth?.status || "Unknown"}
            </span>
          </div>
          <div className={styles.lastUpdated}>
            Last updated:{" "}
            {lastUpdated ? lastUpdated.toLocaleTimeString() : "N/A"}
          </div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.dashboardLayout}>
        {/* Sidebar Navigation */}
        <nav className={styles.sidebar}>
          {[
            { id: "overview", label: "Overview", icon: <FaChartLine /> },
            { id: "users", label: "Users", icon: <FaUser /> },
            { id: "teams", label: "Teams", icon: <FaUsers /> },
            { id: "tasks", label: "Tasks", icon: <FaCheckCircle /> },
            { id: "security", label: "Security", icon: <FaShieldAlt /> },
            { id: "system", label: "System", icon: <FaCog /> },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`${styles.sidebarButton} ${
                activeTab === tab.id ? styles.active : ""
              }`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className={styles.sidebarIcon}>{tab.icon}</span>
              <span className={styles.sidebarLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <div className={styles.tabContent}>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className={styles.overviewLayout} key="overview">
                <div className={styles.overviewMain}>
                  {/* Enhanced Statistics Grid */}
                  <div className={styles.sectionContainer}>
                    <h2>
                      <FaChartLine /> At a Glance
                    </h2>
                    {stats && taskStats && teams && (
                      <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <FaUserFriends />
                          </div>
                          <div className={styles.statContent}>
                            <h3>Total Users</h3>
                            <div className={styles.statNumber}>
                              {stats.totalUsers}
                            </div>
                          </div>
                        </div>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <FaCheckCircle />
                          </div>
                          <div className={styles.statContent}>
                            <h3>Active Users</h3>
                            <div className={styles.statNumber}>
                              {stats.activeUsers}
                            </div>
                          </div>
                        </div>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <FaCrown />
                          </div>
                          <div className={styles.statContent}>
                            <h3>Admins</h3>
                            <div className={styles.statNumber}>
                              {stats.adminUsers}
                            </div>
                          </div>
                        </div>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <FaUsers />
                          </div>
                          <div className={styles.statContent}>
                            <h3>Teams</h3>
                            <div className={styles.statNumber}>
                              {teams.length}
                            </div>
                          </div>
                        </div>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <FaCheckCircle />
                          </div>
                          <div className={styles.statContent}>
                            <h3>Total Tasks</h3>
                            <div className={styles.statNumber}>
                              {taskStats?.totalTasks || 0}
                            </div>
                          </div>
                        </div>
                        <div className={styles.statCard}>
                          <div className={styles.statIcon}>
                            <FaChartLine />
                          </div>
                          <div className={styles.statContent}>
                            <h3>Activities (24h)</h3>
                            <div className={styles.statNumber}>
                              {activityLog.length}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className={styles.quickActions}>
                    <h2>
                      <FaBolt /> Quick Actions
                    </h2>
                    <div className={styles.actionGrid}>
                      <button
                        className={styles.actionCard}
                        onClick={handleAddUser}
                      >
                        <div className={styles.actionIcon}>
                          <FaUser />
                        </div>
                        <div className={styles.actionContent}>
                          <h3>Add User</h3>
                          <p>Create a new user account</p>
                        </div>
                      </button>
                      <button
                        className={styles.actionCard}
                        onClick={() => setActiveTab("teams")}
                      >
                        <div className={styles.actionIcon}>
                          <FaUsers />
                        </div>
                        <div className={styles.actionContent}>
                          <h3>Manage Teams</h3>
                          <p>View and organize teams</p>
                        </div>
                      </button>
                      <button
                        className={styles.actionCard}
                        onClick={exportUsers}
                      >
                        <div className={styles.actionIcon}>
                          <FaDownload />
                        </div>
                        <div className={styles.actionContent}>
                          <h3>Export Data</h3>
                          <p>Download user reports</p>
                        </div>
                      </button>
                      <button
                        className={styles.actionCard}
                        onClick={() => setActiveTab("security")}
                      >
                        <div className={styles.actionIcon}>
                          <FaShieldAlt />
                        </div>
                        <div className={styles.actionContent}>
                          <h3>Security Logs</h3>
                          <p>View security events</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Notifications Section */}
                  <div className={styles.notificationsSection}>
                    <h2>
                      <FaBell /> System Alerts
                    </h2>
                    <div className={styles.notificationsList}>
                      {notifications.slice(0, 4).map((note, i) => (
                        <div key={i} className={styles.notificationItem}>
                          <div className={styles.notificationIcon}>
                            {note.includes("⚠") && (
                              <FaExclamationTriangle
                                className={styles.iconWarning}
                              />
                            )}
                            {note.includes("✅") && (
                              <FaCheckCircle className={styles.iconSuccess} />
                            )}
                            {note.includes("📊") && (
                              <FaChartLine className={styles.iconInfo} />
                            )}
                            {note.includes("🔄") && (
                              <FaCog className={styles.iconSystem} />
                            )}
                            {!["⚠", "✅", "📊", "🔄"].some((icon) =>
                              note.includes(icon)
                            ) && <FaBullhorn />}
                          </div>
                          <div className={styles.notificationContent}>
                            <p>{note.replace(/^[⚠✅📊🔄]\s*/, "")}</p>
                            <small>{new Date().toLocaleTimeString()}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.overviewSidebar}>
                  {/* Recent Activity Section */}
                  <div className={styles.activitySection}>
                    <h2>
                      <FaThumbtack /> Recent Activity
                    </h2>
                    <div className={styles.activityList}>
                      {activityLog.length === 0 ? (
                        <div className={styles.noActivity}>
                          <div className={styles.emptyIcon}>
                            <FaCheckCircle />
                          </div>
                          <p>No recent activity</p>
                          <small>
                            Activities will appear here in real-time
                          </small>
                        </div>
                      ) : (
                        activityLog.slice(0, 5).map((log) => (
                          <div key={log.id} className={styles.activityItem}>
                            <div className={styles.activityIcon}>
                              {log.type === "task" && <FaCheckCircle />}
                              {log.type === "admin" && <FaCrown />}
                              {log.type === "team" && <FaUsers />}
                              {log.type === "system" && <FaCog />}
                              {!["task", "admin", "team", "system"].includes(
                                log.type
                              ) && "📌"}
                            </div>
                            <div className={styles.activityContent}>
                              <div className={styles.activityAction}>
                                {log.action}
                              </div>
                              <div className={styles.activityMeta}>
                                <span className={styles.activityUser}>
                                  {log.user}
                                </span>
                                <span className={styles.activityTime}>
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      {activityLog.length > 5 && (
                        <button
                          className={styles.viewAllButton}
                          onClick={() => setActiveTab("system")}
                        >
                          View All Activities →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* System Health Overview */}
                  {systemHealth && (
                    <div className={styles.systemHealthOverview}>
                      <h2>
                        <FaBolt /> System Health
                      </h2>
                      <div className={styles.healthGrid}>
                        <div className={styles.healthCard}>
                          <div className={styles.healthIcon}>
                            <FaClock />
                          </div>
                          <div className={styles.healthContent}>
                            <h4>Uptime</h4>
                            <div className={styles.healthValue}>
                              {systemHealth.uptime}
                            </div>
                          </div>
                        </div>
                        <div className={styles.healthCard}>
                          <div className={styles.healthIcon}>
                            <FaHdd />
                          </div>
                          <div className={styles.healthContent}>
                            <h4>Memory Usage</h4>
                            <div className={styles.healthValue}>
                              {systemHealth.memoryUsage}%
                            </div>
                            <div className={styles.healthBar}>
                              <div
                                className={styles.healthBarFill}
                                style={{
                                  width: `${systemHealth.memoryUsage}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <div className={styles.healthCard}>
                          <div className={styles.healthIcon}>
                            <FaLink />
                          </div>
                          <div className={styles.healthContent}>
                            <h4>Active Connections</h4>
                            <div className={styles.healthValue}>
                              {systemHealth.activeConnections}
                            </div>
                          </div>
                        </div>
                        <div className={styles.healthCard}>
                          <div className={styles.healthIcon}>
                            <FaBolt />
                          </div>
                          <div className={styles.healthContent}>
                            <h4>Response Time</h4>
                            <div className={styles.healthValue}>
                              {systemHealth.responseTime}ms
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <UsersTab
                key="users"
                users={users}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={(userId) =>
                  handleDeleteUser(users.find((u) => u.id === userId)!)
                }
                onDataChange={() => {
                  loadUsers();
                  loadStats();
                }}
                authFetch={authFetch}
              />
            )}

            {/* Teams Tab */}
            {activeTab === "teams" && (
              <div className={styles.usersTabContainer} key="teams">
                <div className={styles.teamsHeader}>
                  <h2>
                    <FaUsers /> Team Management
                  </h2>
                  <p>Manage teams, members, and team-based analytics</p>
                </div>

                <div className={styles.controls}>
                  <div className={styles.searchSection}>
                    {/* Future search or filter controls can go here */}
                  </div>
                  <div className={styles.actionSection}>
                    <button className={styles.addButton}>+ Create Team</button>
                  </div>
                </div>
                <div className={styles.teamsGrid}>
                  {teams.map((team) => (
                    <div key={team.id} className={styles.teamCard}>
                      <div className={styles.teamHeader}>
                        <h3>{team.name}</h3>
                        <span className={styles.memberCount}>
                          {team.members?.length || 0} members
                        </span>
                      </div>
                      <div className={styles.teamContent}>
                        <p>{team.description || "No description available"}</p>
                        <div className={styles.teamMeta}>
                          <div className={styles.teamOwner}>
                            <strong>Owner:</strong>{" "}
                            {team.members.find((m) => m.role === "owner")
                              ?.name || "N/A"}
                          </div>
                          <div className={styles.teamCreated}>
                            <strong>Created:</strong>{" "}
                            {new Date(team.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={styles.teamStats}>
                          <div className={styles.teamStat}>
                            <span className={styles.statValue}>25</span>
                            <span className={styles.statLabel}>
                              Total Tasks
                            </span>
                          </div>
                          <div className={styles.teamStat}>
                            <span className={styles.statValue}>12</span>
                            <span className={styles.statLabel}>Open Tasks</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.teamActions}>
                        <button className={styles.viewTeamButton}>
                          View Details
                        </button>
                        <button className={styles.editTeamButton}>
                          Edit Team
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {teams.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>
                      <FaUsers />
                    </div>
                    <h3>No Teams Found</h3>
                    <p>Teams will appear here when users create them</p>
                  </div>
                )}
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
              <div className={styles.sectionContainer} key="tasks">
                <div className={styles.tasksHeader}>
                  <h2>
                    <FaCheckCircle /> Task Analytics
                  </h2>
                  <p>Monitor task performance and project insights</p>
                </div>

                {taskStats && (
                  <div className={styles.taskStatsGrid}>
                    <div className={styles.taskStatCard}>
                      <div className={styles.taskStatIcon}>
                        <FaChartLine />
                      </div>
                      <div className={styles.taskStatContent}>
                        <h3>Total Tasks</h3>
                        <div className={styles.taskStatNumber}>
                          {taskStats.totalTasks}
                        </div>
                        <div className={styles.taskStatProgress}>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progressFill}
                              style={{
                                width: `${
                                  (taskStats.completedTasks /
                                    taskStats.totalTasks) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <span>
                            {Math.round(
                              (taskStats.completedTasks /
                                taskStats.totalTasks) *
                                100
                            )}
                            % Complete
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.taskStatCard}>
                      <div className={styles.taskStatIcon}>
                        <FaCheckCircle />
                      </div>
                      <div className={styles.taskStatContent}>
                        <h3>Completed</h3>
                        <div className={styles.taskStatNumber}>
                          {taskStats.completedTasks}
                        </div>
                        <div className={styles.taskStatTrend}>
                          +{Math.floor(Math.random() * 10)} this week
                        </div>
                      </div>
                    </div>

                    <div className={styles.taskStatCard}>
                      <div className={styles.taskStatIcon}>
                        <FaHourglassHalf />
                      </div>
                      <div className={styles.taskStatContent}>
                        <h3>Pending</h3>
                        <div className={styles.taskStatNumber}>
                          {taskStats.pendingTasks}
                        </div>
                        <div className={styles.taskStatTrend}>
                          -{Math.floor(Math.random() * 5)} from last week
                        </div>
                      </div>
                    </div>

                    <div className={styles.taskStatCard}>
                      <div className={styles.taskStatIcon}>
                        <FaFire />
                      </div>
                      <div className={styles.taskStatContent}>
                        <h3>High Priority</h3>
                        <div className={styles.taskStatNumber}>
                          {taskStats.highPriorityTasks}
                        </div>
                        <div className={styles.taskStatTrend}>
                          Needs attention
                        </div>
                      </div>
                    </div>

                    <div className={styles.taskStatCard}>
                      <div className={styles.taskStatIcon}>
                        <FaExclamationTriangle />
                      </div>
                      <div className={styles.taskStatContent}>
                        <h3>Overdue</h3>
                        <div className={styles.taskStatNumber}>
                          {taskStats.overdueTasks}
                        </div>
                        <div className={styles.taskStatTrend}>
                          Requires immediate action
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.taskInsights}>
                  <h3>
                    <FaChartLine /> Task Insights
                  </h3>
                  <div className={styles.insightGrid}>
                    <div className={styles.insightCard}>
                      <h4>Most Active Teams</h4>
                      <div className={styles.insightList}>
                        <div className={styles.insightItem}>
                          <span>Development Team</span>
                          <span className={styles.insightValue}>45 tasks</span>
                        </div>
                        <div className={styles.insightItem}>
                          <span>Design Team</span>
                          <span className={styles.insightValue}>32 tasks</span>
                        </div>
                        <div className={styles.insightItem}>
                          <span>Marketing Team</span>
                          <span className={styles.insightValue}>28 tasks</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.insightCard}>
                      <h4>Task Distribution</h4>
                      <div className={styles.chartPlaceholder}>
                        <div className={styles.pieChart}>
                          <div
                            className={styles.pieSlice}
                            style={{
                              background:
                                "conic-gradient(#10b981 0deg 180deg, #f59e0b 180deg 270deg, #ef4444 270deg 360deg)",
                            }}
                          ></div>
                        </div>
                        <div className={styles.chartLegend}>
                          <div className={styles.legendItem}>
                            <span
                              className={styles.legendColor}
                              style={{ backgroundColor: "#10b981" }}
                            ></span>
                            <span>Completed (57%)</span>
                          </div>
                          <div className={styles.legendItem}>
                            <span
                              className={styles.legendColor}
                              style={{ backgroundColor: "#f59e0b" }}
                            ></span>
                            <span>In Progress (28%)</span>
                          </div>
                          <div className={styles.legendItem}>
                            <span
                              className={styles.legendColor}
                              style={{ backgroundColor: "#ef4444" }}
                            ></span>
                            <span>Overdue (15%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className={styles.sectionContainer} key="security">
                <div className={styles.securityHeader}>
                  <h2>
                    <FaLock /> Security & Audit Logs
                  </h2>
                  <p>Monitor security events and system access</p>
                </div>

                <div className={styles.securityOverview}>
                  <div className={styles.securityCard}>
                    <div className={styles.securityIcon}>
                      <FaShieldAlt />
                    </div>
                    <div className={styles.securityContent}>
                      <h3>Security Status</h3>
                      <div className={styles.securityStatus}>
                        <span className={styles.statusGood}>Good</span>
                        <p>No critical security issues detected</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.securityCard}>
                    <div className={styles.securityIcon}>
                      <FaKey />
                    </div>
                    <div className={styles.securityContent}>
                      <h3>Failed Logins</h3>
                      <div className={styles.securityMetric}>
                        <span className={styles.metricNumber}>3</span>
                        <p>In the last 24 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.securityCard}>
                    <div className={styles.securityIcon}>
                      <FaUserFriends />
                    </div>
                    <div className={styles.securityContent}>
                      <h3>Active Sessions</h3>
                      <div className={styles.securityMetric}>
                        <span className={styles.metricNumber}>
                          {systemHealth?.activeConnections || 0}
                        </span>
                        <p>Currently online</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.securityEvents}>
                  <h3>
                    <FaHistory /> Recent Security Events
                  </h3>
                  <div className={styles.eventsList}>
                    {securityEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`${styles.eventItem} ${
                          styles[event.severity]
                        }`}
                      >
                        <div className={styles.eventHeader}>
                          <span className={styles.eventType}>
                            {event.type === "failed_login" && <FaTimesCircle />}
                            {event.type === "login_attempt" && <FaKey />}
                            {event.type === "permission_change" && <FaCog />}
                            {event.type === "data_access" && <FaChartLine />}
                            {event.type.replace("_", " ").toUpperCase()}
                          </span>
                          <span className={styles.eventTime}>
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.eventContent}>
                          <div className={styles.eventUser}>
                            User: {event.user}
                          </div>
                          <div className={styles.eventDetails}>
                            {event.details}
                          </div>
                        </div>
                        <div className={styles.eventSeverity}>
                          <span
                            className={`${styles.severityBadge} ${
                              styles[event.severity]
                            }`}
                          >
                            {event.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* System Tab */}
            {activeTab === "system" && (
              <div className={styles.sectionContainer} key="system">
                <div className={styles.systemHeader}>
                  <h2>
                    <FaCog /> System Health & Monitoring
                  </h2>
                  <p>Real-time system performance and health metrics</p>
                </div>

                {systemHealth && (
                  <div className={styles.systemHealthGrid}>
                    <div className={styles.healthMetricCard}>
                      <div className={styles.healthIcon}>
                        <FaClock />
                      </div>
                      <div className={styles.healthContent}>
                        <h3>System Uptime</h3>
                        <div className={styles.healthValue}>
                          {systemHealth.uptime}
                        </div>
                        <div className={styles.healthStatus}>Excellent</div>
                      </div>
                    </div>

                    <div className={styles.healthMetricCard}>
                      <div className={styles.healthIcon}>
                        <FaHdd />
                      </div>
                      <div className={styles.healthContent}>
                        <h3>Memory Usage</h3>
                        <div className={styles.healthValue}>
                          {systemHealth.memoryUsage}%
                        </div>
                        <div className={styles.healthProgressBar}>
                          <div
                            className={styles.healthProgress}
                            style={{
                              width: `${systemHealth.memoryUsage}%`,
                              backgroundColor:
                                systemHealth.memoryUsage > 80
                                  ? "#ef4444"
                                  : systemHealth.memoryUsage > 60
                                  ? "#f59e0b"
                                  : "#10b981",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.healthMetricCard}>
                      <div className={styles.healthIcon}>
                        <FaLink />
                      </div>
                      <div className={styles.healthContent}>
                        <h3>Active Connections</h3>
                        <div className={styles.healthValue}>
                          {systemHealth.activeConnections}
                        </div>
                        <div className={styles.healthStatus}>Normal</div>
                      </div>
                    </div>

                    <div className={styles.healthMetricCard}>
                      <div className={styles.healthIcon}>
                        <FaBolt />
                      </div>
                      <div className={styles.healthContent}>
                        <h3>Response Time</h3>
                        <div className={styles.healthValue}>
                          {systemHealth.responseTime}ms
                        </div>
                        <div className={styles.healthStatus}>
                          {systemHealth.responseTime < 200
                            ? "Excellent"
                            : systemHealth.responseTime < 500
                            ? "Good"
                            : "Needs Attention"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className={styles.systemActions}>
                  <h3>
                    <FaTools /> System Actions
                  </h3>
                  <div className={styles.actionButtonGrid}>
                    <button className={styles.systemActionButton}>
                      <span className={styles.actionIcon}>
                        <FaCog />
                      </span>
                      <div className={styles.actionContent}>
                        <h4>Restart Services</h4>
                        <p>Restart system services</p>
                      </div>
                    </button>

                    <button className={styles.systemActionButton}>
                      <span className={styles.actionIcon}>
                        <FaTrashAlt />
                      </span>
                      <div className={styles.actionContent}>
                        <h4>Clear Cache</h4>
                        <p>Clear system cache</p>
                      </div>
                    </button>

                    <button className={styles.systemActionButton}>
                      <span className={styles.actionIcon}>
                        <FaHdd />
                      </span>
                      <div className={styles.actionContent}>
                        <h4>Backup Data</h4>
                        <p>Create system backup</p>
                      </div>
                    </button>

                    <button className={styles.systemActionButton}>
                      <span className={styles.actionIcon}>
                        <FaChartLine />
                      </span>
                      <div className={styles.actionContent}>
                        <h4>Generate Report</h4>
                        <p>System health report</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className={styles.systemLogs}>
                  <h3>
                    <FaClipboardList /> System Logs
                  </h3>
                  <div className={styles.logContainer}>
                    <div className={styles.logEntry}>
                      <span className={styles.logTime}>
                        {new Date().toLocaleTimeString()}
                      </span>
                      <span className={styles.logLevel}>INFO</span>
                      <span className={styles.logMessage}>
                        System health check completed successfully
                      </span>
                    </div>
                    <div className={styles.logEntry}>
                      <span className={styles.logTime}>
                        {new Date(Date.now() - 300000).toLocaleTimeString()}
                      </span>
                      <span className={styles.logLevel}>WARN</span>
                      <span className={styles.logMessage}>
                        Memory usage approaching 70% threshold
                      </span>
                    </div>
                    <div className={styles.logEntry}>
                      <span className={styles.logTime}>
                        {new Date(Date.now() - 600000).toLocaleTimeString()}
                      </span>
                      <span className={styles.logLevel}>INFO</span>
                      <span className={styles.logMessage}>
                        Database connection pool optimized
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* User Management Modal */}
      {showUserModal && editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.userModal}>
            <div className={styles.modalHeader}>
              <h3>{editingUser.id ? "Edit User" : "Add New User"}</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  disabled={!!editingUser.id}
                  className={styles.modalInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className={styles.modalInput}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Role:</label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value as "user" | "admin",
                    })
                  }
                  className={styles.modalSelect}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>
                  <input
                    className={styles.modalCheckbox}
                    type="checkbox"
                    checked={editingUser.isActive}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowUserModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button onClick={handleSaveUser} className={styles.saveButton}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationModal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Deletion</h3>
              <button
                onClick={() => setUserToDelete(null)}
                className={styles.closeButton}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to permanently delete the user{" "}
                <strong>{userToDelete.email}</strong>?
              </p>
              <p className={styles.warningText}>
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setUserToDelete(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className={styles.deleteConfirmButton}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
