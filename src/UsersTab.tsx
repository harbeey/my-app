import React, { useState, useMemo } from "react";
import styles from "./AdminDashboard.module.css";
import { FaDownload, FaPencilAlt, FaTrashAlt, FaPlus } from "react-icons/fa";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface UsersTabProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onDataChange: () => void;
  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onDataChange,
  authFetch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      for (const userId of selectedUsers) {
        if (bulkAction === "delete") {
          await authFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
        } else if (bulkAction === "deactivate") {
          await authFetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive: false }),
          });
        } else if (bulkAction === "activate") {
          await authFetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({ isActive: true }),
          });
        }
      }

      onDataChange();
      setSelectedUsers([]);
      setBulkAction("");
    } catch (e) {
      setError(`Failed to perform bulk ${bulkAction}`);
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

  return (
    <div className={styles.usersTabContainer} key="users">
      <div className={styles.usersHeader}>
        <h2>👤 User Management</h2>
        <p>Manage user accounts, roles, and permissions</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.controls}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "all" | "admin" | "user")
            }
            className={styles.filterSelect}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>

        <div className={styles.actionSection}>
          <button onClick={onAddUser} className={styles.addButton}>
            <FaPlus /> Add User
          </button>
          <button onClick={exportUsers} className={styles.exportButton}>
            <FaDownload /> Export Users
          </button>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className={styles.bulkOperations}>
          <span>Selected: {selectedUsers.length} users</span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className={styles.bulkSelect}
          >
            <option value="">Select Action</option>
            <option value="activate">Activate</option>
            <option value="deactivate">Deactivate</option>
            <option value="delete">Delete</option>
          </select>
          <button onClick={handleBulkAction} className={styles.bulkButton}>
            Execute
          </button>
          <button
            onClick={() => setSelectedUsers([])}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      )}

      <div className={styles.usersListContainer}>
        <div className={styles.usersList}>
          {filteredUsers.map((user) => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUsers([...selectedUsers, user.id]);
                    } else {
                      setSelectedUsers(
                        selectedUsers.filter((id) => id !== user.id)
                      );
                    }
                  }}
                />
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userEmail}>{user.email}</div>
                <div className={styles.userName}>{user.name || "No name"}</div>
                <div className={styles.userRole}>
                  <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                    {user.role}
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      user.isActive ? styles.active : styles.inactive
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className={styles.lastLogin}>
                    Last login: {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className={styles.userActions}>
                <button
                  onClick={() => onEditUser(user)}
                  className={styles.editButton}
                >
                  <FaPencilAlt /> Edit
                </button>
                <button
                  onClick={() => onDeleteUser(user)}
                  className={styles.deleteButton}
                >
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
