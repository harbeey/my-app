import React, { useState, useRef, useEffect } from "react";
import HeaderMenu from "./HeaderMenu";
import ListComposer from "./ListComposer";
import TaskCard from "./TaskCard";
import Footer from "./Footer";
import Profile from "./Profile";
import AdminDashboard from "./AdminDashboard";
import TeamManagement from "./TeamManagement";
import About from "./About";
import Services from "./Services";
import Contact from "./Contact";
import ActivityFeed from "./ActivityFeed";
import OverviewPanel from "./OverviewPanel";
import Login from "./Login";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import CookiePolicy from "./CookiePolicy";
import styles from "./App.module.css";
import {
  FaPlus,
  FaSearch,
  FaStar,
  FaRegStar,
  FaTrash,
  FaUsers,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaPencilAlt,
  FaGripVertical,
  FaComment,
  FaCheck,
  FaAlignLeft,
  FaArchive,
  FaFileAlt,
  FaPaperclip,
  FaClipboardList,
} from "react-icons/fa";

type TeamMember = {
  id: string;
  name: string;
  avatar: string;
  email: string;
};

type Comment = {
  id: string;
  authorId: string;
  text: string;
  createdAt: Date;
};

type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
};

type SubTask = {
  id: string;
  text: string;
  completed: boolean;
};

type Task = {
  id: string;
  text: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  priority?: "high" | "medium" | "low";
  assignedTo?: string[];
  dueDate?: string;
  lastUpdatedAt?: Date;
  subTasks?: SubTask[];
  comments?: Comment[];
  attachments?: Attachment[];
};
type List = { id: string; title: string; tasks: Task[] };

type ArchivedTask = Task & { originalListId: string; archivedAt: Date };
type ArchivedList = List & { archivedAt: Date };

type Activity = {
  id: string;
  type:
    | "CREATE_TASK"
    | "DELETE_TASK"
    | "COMPLETE_TASK"
    | "MOVE_TASK"
    | "RENAME_TASK"
    | "ADD_COMMENT";
  user: { id: string; name: string } | null;
  details: string;
  timestamp: Date;
  taskId?: string;
  listId?: string;
};

const ARCHIVE_VIEW_ID = "archive";
const DEFAULT_LIST_ID_FOR_RESTORE = "list_default";

function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function timeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  return "just now";
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "profile"
    | "admin"
    | "teams"
    | "about"
    | "services"
    | "contact"
    | "login"
    | "privacy"
    | "terms"
    | "cookies"
  >("login");

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    role?: string;
  } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Replace useState for lists with useReducer
  const [lists, setLists] = useState<List[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const dragRef = useRef<{
    listId: string;
    taskId: string;
    taskIndex: number;
  } | null>(null);
  const subTaskDragRef = useRef<{
    listId: string;
    taskId: string;
    subTaskIndex: number;
  } | null>(null);
  const [sortBy, setSortBy] = useState<"priority" | "date" | "alphabetical">(
    "priority"
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showTeamDropdown, setShowTeamDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });
  const [dragOverListId, setDragOverListId] = useState<string | null>(null);
  // State for the "Add Task" modal
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addingToListId, setAddingToListId] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] =
    useState<Task["priority"]>("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  // State for delete confirmation modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    listId: string;
    taskId: string;
    taskText: string;
  } | null>(null);
  // State for priority editor popover
  const [editingPriority, setEditingPriority] = useState<{
    listId: string;
    taskId: string;
  } | null>(null);
  // State for task modal (add/edit)
  const [editingTask, setEditingTask] = useState<{
    listId: string;
    task: Task;
  } | null>(null);
  // State for finished panel collapse
  const [isFinishedPanelCollapsed, setIsFinishedPanelCollapsed] =
    useState(false);
  // State for search
  const [searchTerm, setSearchTerm] = useState("");
  // State for viewing a finished task
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  // State for toggling comments
  const [activeCommentsTaskId, setActiveCommentsTaskId] = useState<
    string | null
  >(null);
  // State for team assignment modal
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<{
    listId: string;
    task: Task;
  } | null>(null);
  const [teamModalSearch, setTeamModalSearch] = useState("");
  const teamDropdownRef = useRef<HTMLDivElement>(null);
  // State for editing a comment
  const [editingComment, setEditingComment] = useState<{
    listId: string;
    taskId: string;
    comment: Comment;
  } | null>(null);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [editCommentText, setEditCommentText] = useState("");
  // State for archived items
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([
    {
      id: "archived_task_1",
      text: "Review old project specs",
      completed: true,
      originalListId: "list_default",
      archivedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
  ]);
  const [archivedLists, setArchivedLists] = useState<ArchivedList[]>([
    {
      id: "archived_list_1",
      title: "Old Q4 Goals",
      tasks: [],
      archivedAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
    },
  ]);
  // State for the archive modal
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  // State for fade-in animation
  const [isVisible, setIsVisible] = useState(false);
  // State for activity feed
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const handleProfileUpdate = () => {
      // Refetch user data when profile is updated elsewhere
      refetchUserData();
    };

    const defaultLists: List[] = [
      {
        id: generateId("list"),
        title: "Today",
        tasks: [
          {
            id: generateId("task"),
            text: "Start adding Task",
            completed: false,
            assignedTo: [],
          },
        ],
      },
      { id: generateId("list"), title: "This Week", tasks: [] },
      { id: generateId("list"), title: "This Month", tasks: [] },
      { id: generateId("list"), title: "Do Later", tasks: [] },
    ];
    // Instead of setLists, dispatch an action
    setLists(defaultLists);

    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const refetchUserData = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name || payload.email,
          role: payload.role,
          avatarUrl: payload.avatarUrl,
        };
        setCurrentUser(userData);
      } catch (error) {
        console.error("Failed to refetch user data", error);
      }
    }
  };

  // Check authentication on app load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name || payload.email,
          role: payload.role,
          avatarUrl: payload.avatarUrl,
        };
        setCurrentUser(userData);
        setIsAuthenticated(true);
        setCurrentView("dashboard");
      } catch (error) {
        localStorage.removeItem("authToken");
        setCurrentView("login");
      }
    }

    // Listen for user data updates from HeaderMenu
    const handleUserDataUpdate = (event: CustomEvent) => {
      console.log("App: Received userDataUpdated event:", event.detail);
      setCurrentUser(event.detail);
    };

    window.addEventListener(
      "userDataUpdated",
      handleUserDataUpdate as EventListener
    );
    return () => {
      window.removeEventListener(
        "userDataUpdated",
        handleUserDataUpdate as EventListener
      );
    };
  }, []);

  // Scroll to top on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  // Effect for fade-in animation on view change
  useEffect(() => {
    setIsVisible(false); // Reset to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 50); // Small delay to allow re-render before animation
    return () => clearTimeout(timer);
  }, [currentView]);

  // Effect to fetch team members
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3001/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const users = await response.json();
        // Filter for users with the 'user' role and map to TeamMember type
        const members = users
          .filter((u: any) => u.role === "user")
          .map((u: any) => ({
            id: u._id,
            name: u.name,
            avatar: u.avatarUrl || "👤",
            email: u.email,
          }));
        setTeamMembers(members);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // Effect to handle clicks outside of popovers/dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        teamDropdownRef.current &&
        !teamDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTeamDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = (userData: any) => {
    const user = userData.user || userData;
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView("login");
  };

  const handleUserUpdate = (updatedUser: any) => {
    console.log("App: Updating user data:", updatedUser);
    setCurrentUser(updatedUser);
  };

  // Check if user is admin
  const isAdmin = currentUser?.role === "admin";

  // Activity Logger
  const logActivity = (
    type: Activity["type"],
    details: string,
    taskId?: string,
    listId?: string
  ) => {
    const newActivity: Activity = {
      id: generateId("activity"),
      type,
      details,
      user: currentUser ? { id: currentUser.id, name: currentUser.name } : null,
      timestamp: new Date(),
      taskId,
      listId,
    };
    setActivities((prev) => [newActivity, ...prev].slice(0, 50)); // Keep last 50 activities
  };

  // Sorting function
  const sortTasks = (tasks: Task[], sortType: typeof sortBy): Task[] => {
    return [...tasks].sort((a, b) => {
      switch (sortType) {
        case "alphabetical":
          return a.text.localeCompare(b.text);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            (priorityOrder[b.priority || "medium"] || 2) -
            (priorityOrder[a.priority || "medium"] || 2)
          );
        case "date":
          return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
        default:
          return 0;
      }
    });
  };

  // Task Manager Functions
  const addTask = (
    listId: string,
    text: string,
    priority: Task["priority"],
    dueDate?: string
  ) => {
    const now = new Date();
    const newTask: Task = {
      id: generateId("task"),
      text,
      description: newTaskDescription,
      completed: false,
      assignedTo: [],
      priority,
      createdAt: now,
      lastUpdatedAt: now,
      dueDate,
      subTasks: [],
      comments: [],
    };
    // dispatch({ type: 'ADD_TASK', payload: { listId, task: newTask } });
    // For brevity, I'll leave the setLists implementation, but this is where you'd dispatch.
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, tasks: [...l.tasks, newTask] } : l
      )
    );
    logActivity("CREATE_TASK", `created task "${text}"`, newTask.id, listId);
  };

  const updateTask = (
    listId: string,
    taskId: string,
    updates: Partial<Task>
  ) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              tasks: l.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, ...updates, lastUpdatedAt: new Date() }
                  : t
              ),
            }
          : l
      )
    );
  };

  const toggleTaskCompletion = (listId: string, taskId: string) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isCompleting = !task.completed;
    if (isCompleting) {
      logActivity(
        "COMPLETE_TASK",
        `completed task "${task.text}"`,
        taskId,
        listId
      );
    }
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              tasks: l.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, completed: !t.completed, lastUpdatedAt: new Date() }
                  : t
              ),
            }
          : l
      )
    );
  };

  const renameTask = (listId: string, taskId: string, newText: string) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (task && task.text !== newText) {
      logActivity(
        "RENAME_TASK",
        `renamed task from "${task.text}" to "${newText}"`,
        taskId,
        listId
      );
    }
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              tasks: l.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, text: newText, lastUpdatedAt: new Date() }
                  : t
              ),
            }
          : l
      )
    );
  };

  const deleteTask = (listId: string, taskId: string) => {
    let taskToArchive: Task | undefined;
    setLists((prev) =>
      prev.map((l) => {
        if (l.id === listId) {
          taskToArchive = l.tasks.find((t) => t.id === taskId);
          return { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) };
        }
        return l;
      })
    );

    if (taskToArchive) {
      const archivedTask: ArchivedTask = {
        ...taskToArchive,
        originalListId: listId,
        archivedAt: new Date(),
      };
      logActivity(
        "DELETE_TASK",
        `deleted task "${archivedTask.text}"`,
        taskId,
        listId
      );
      setArchivedTasks((prev) => [...prev, archivedTask]);
    }
  };

  const setTaskPriority = (
    listId: string,
    taskId: string,
    priority: Task["priority"]
  ) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              tasks: l.tasks.map((t) =>
                t.id === taskId
                  ? { ...t, priority, lastUpdatedAt: new Date() }
                  : t
              ),
            }
          : l
      )
    );
  };

  const assignTaskToMember = (
    listId: string,
    taskId: string,
    memberId: string
  ) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              tasks: l.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      assignedTo: t.assignedTo?.includes(memberId)
                        ? t.assignedTo.filter((id) => id !== memberId)
                        : [...(t.assignedTo || []), memberId],
                      lastUpdatedAt: new Date(),
                    }
                  : t
              ),
            }
          : l
      )
    );
  };

  const addSubTask = (listId: string, taskId: string, text: string) => {
    if (!text.trim()) return;
    const newSubTask: SubTask = {
      id: generateId("sub"),
      text,
      completed: false,
    };
    updateTask(listId, taskId, {
      subTasks: [
        ...(lists
          .find((l) => l.id === listId)
          ?.tasks.find((t) => t.id === taskId)?.subTasks || []),
        newSubTask,
      ],
    });
  };

  const toggleSubTask = (listId: string, taskId: string, subTaskId: string) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task || !task.subTasks) return;

    const newSubTasks = task.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(listId, taskId, { subTasks: newSubTasks });
  };

  const deleteSubTask = (listId: string, taskId: string, subTaskId: string) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task || !task.subTasks) return;

    const newSubTasks = task.subTasks.filter((st) => st.id !== subTaskId);
    updateTask(listId, taskId, { subTasks: newSubTasks });
  };

  const editSubTask = (
    listId: string,
    taskId: string,
    subTaskId: string,
    newText: string
  ) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task || !task.subTasks) return;

    const newSubTasks = task.subTasks.map((st) =>
      st.id === subTaskId ? { ...st, text: newText } : st
    );
    updateTask(listId, taskId, { subTasks: newSubTasks });
  };

  const addList = (title: string) => {
    const newList = { id: generateId("list"), title, tasks: [] };
    setLists((prev) => [...prev, newList]);
  };

  const renameList = (listId: string, newTitle: string) => {
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, title: newTitle } : l))
    );
  };

  const deleteList = (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (list) {
      const archivedList: ArchivedList = { ...list, archivedAt: new Date() };
      setArchivedLists((prev) => [...prev, archivedList]);
      setLists((prev) => prev.filter((l) => l.id !== listId));
    }
  };

  // Archive Functions
  const restoreTask = (taskToRestore: ArchivedTask) => {
    setArchivedTasks((prev) => prev.filter((t) => t.id !== taskToRestore.id));

    const { archivedAt, originalListId, ...restoredTask } = taskToRestore;

    setLists((prevLists) => {
      const listExists = prevLists.some((l) => l.id === originalListId);
      const targetListId = listExists
        ? originalListId
        : prevLists[0]?.id || null;

      if (!targetListId) {
        // If no lists exist, create a new one
        const newList: List = {
          id: generateId("list"),
          title: "Restored Tasks",
          tasks: [restoredTask],
        };
        return [newList];
      }

      return prevLists.map((l) => {
        if (l.id === targetListId) {
          return { ...l, tasks: [...l.tasks, restoredTask] };
        }
        return l;
      });
    });
  };

  const permanentlyDeleteTask = (taskId: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this task? This cannot be undone."
      )
    ) {
      setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const restoreList = (listToRestore: ArchivedList) => {
    setArchivedLists((prev) => prev.filter((l) => l.id !== listToRestore.id));
    const { archivedAt, ...restoredList } = listToRestore;
    setLists((prev) => [...prev, restoredList]);
  };

  const permanentlyDeleteList = (listId: string) => {
    if (
      confirm(
        "Are you sure you want to permanently delete this list? This cannot be undone."
      )
    ) {
      setArchivedLists((prev) => prev.filter((l) => l.id !== listId));
    }
  };

  const handleOpenArchiveModal = () => {
    setShowArchiveModal(true);
  };

  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false);
  };

  const handleSubTaskDrop = (
    targetListId: string,
    targetTaskId: string,
    targetIndex: number
  ) => {
    if (!subTaskDragRef.current) return;
    const {
      listId: sourceListId,
      taskId: sourceTaskId,
      subTaskIndex: sourceIndex,
    } = subTaskDragRef.current;

    // For now, only allow reordering within the same task
    if (sourceListId !== targetListId || sourceTaskId !== targetTaskId) return;

    const task = lists
      .find((l) => l.id === sourceListId)
      ?.tasks.find((t) => t.id === sourceTaskId);
    if (!task || !task.subTasks) return;

    const newSubTasks = [...task.subTasks];
    const [draggedItem] = newSubTasks.splice(sourceIndex, 1);
    newSubTasks.splice(targetIndex, 0, draggedItem);

    updateTask(sourceListId, sourceTaskId, { subTasks: newSubTasks });
    subTaskDragRef.current = null;
  };

  const addComment = (listId: string, taskId: string, text: string) => {
    if (!text.trim() || !currentUser) return;
    const newComment: Comment = {
      id: generateId("comment"),
      authorId: currentUser.id,
      text,
      createdAt: new Date(),
    };
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTask(listId, taskId, {
      comments: [...(task.comments || []), newComment],
    });
    logActivity(
      "ADD_COMMENT",
      `commented on task "${task.text}"`,
      taskId,
      listId
    );
  };

  const deleteComment = (listId: string, taskId: string, commentId: string) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task || !task.comments) return;

    const newComments = task.comments.filter((c) => c.id !== commentId);
    updateTask(listId, taskId, { comments: newComments });
  };

  const editComment = (
    listId: string,
    taskId: string,
    commentId: string,
    newText: string
  ) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task || !task.comments) return;

    const newComments = task.comments.map((c) =>
      c.id === commentId ? { ...c, text: newText } : c
    );
    updateTask(listId, taskId, { comments: newComments });
  };

  const handleOpenEditCommentModal = (
    listId: string,
    taskId: string,
    comment: Comment
  ) => {
    setEditingComment({ listId, taskId, comment });
    setEditCommentText(comment.text);
    setShowEditCommentModal(true);
  };

  const handleCloseEditCommentModal = () => {
    setShowEditCommentModal(false);
    setEditingComment(null);
    setEditCommentText("");
  };

  const handleConfirmEditComment = () => {
    if (editingComment && editCommentText.trim()) {
      editComment(
        editingComment.listId,
        editingComment.taskId,
        editingComment.comment.id,
        editCommentText
      );
    }
    handleCloseEditCommentModal();
  };
  const addAttachment = (listId: string, taskId: string, file: File) => {
    // Basic validation for file size (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    const newAttachment: Attachment = {
      id: generateId("att"),
      name: file.name,
      url: URL.createObjectURL(file), // Creates a temporary local URL
      type: file.type,
      size: file.size,
    };

    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTask(listId, taskId, {
      attachments: [...(task.attachments || []), newAttachment],
    });
  };

  const deleteAttachment = (
    listId: string,
    taskId: string,
    attachmentId: string
  ) => {
    const task = lists
      .find((l) => l.id === listId)
      ?.tasks.find((t) => t.id === taskId);
    if (!task || !task.attachments) return;

    // Revoke the object URL to free up memory
    const attachmentToDelete = task.attachments.find(
      (a) => a.id === attachmentId
    );
    if (attachmentToDelete) {
      URL.revokeObjectURL(attachmentToDelete.url);
    }

    const newAttachments = task.attachments.filter(
      (a) => a.id !== attachmentId
    );
    updateTask(listId, taskId, { attachments: newAttachments });
  };

  // Drag and Drop Functions
  const onDragStart = (listId: string, taskId: string, taskIndex: number) => {
    dragRef.current = { listId, taskId, taskIndex };
    setDraggedTaskId(taskId);
  };

  const onDragEnd = () => {
    dragRef.current = null;
    setDraggedTaskId(null);
    setDragOverListId(null);
  };

  const handleDrop = (targetListId: string, targetIndex: number) => {
    if (!dragRef.current) return;
    const { listId: sourceListId, taskId } = dragRef.current;

    const task = lists
      .find((l) => l.id === sourceListId)
      ?.tasks.find((t) => t.id === taskId);
    const sourceList = lists.find((l) => l.id === sourceListId);
    const targetList = lists.find((l) => l.id === targetListId);
    if (task && sourceList && targetList && sourceListId !== targetListId) {
      logActivity(
        "MOVE_TASK",
        `moved task "${task.text}" from "${sourceList.title}" to "${targetList.title}"`,
        taskId,
        targetListId
      );
    }

    setLists((prev) => {
      const sourceList = prev.find((l) => l.id === sourceListId);
      const task = sourceList?.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      // Create a new list of lists where the task is removed from its source
      const listsWithoutTask = prev.map((l) => {
        if (l.id === sourceListId) {
          return { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) };
        }
        return l;
      });

      // Find the target list in the new array of lists
      const targetList = listsWithoutTask.find((l) => l.id === targetListId);
      if (targetList) {
        const newTasks = [...targetList.tasks];
        newTasks.splice(targetIndex, 0, task);
        // Return a new list of lists with the task inserted in the target
        return listsWithoutTask.map((l) =>
          l.id === targetListId ? { ...l, tasks: newTasks } : l
        );
      }
      return prev; // Should not happen
    });
  };

  const onDropToFinished = () => {
    if (!dragRef.current) return;
    const { listId: sourceListId, taskId } = dragRef.current;

    const sourceList = lists.find((l) => l.id === sourceListId);
    const task = sourceList?.tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    // This will mark the task as complete and trigger a re-render,
    // which will move it to the "Finished Tasks" panel.
    toggleTaskCompletion(sourceListId, taskId);
  };

  // Modal handlers
  const handleOpenAddTaskModal = (listId: string) => {
    setEditingTask(null);
    setAddingToListId(listId);
    setShowAddTaskModal(true);
  };

  const handleOpenEditTaskModal = (listId: string, task: Task) => {
    setEditingTask({ listId, task });
    setNewTaskText(task.text);
    setNewTaskDescription(task.description || "");
    setNewTaskPriority(task.priority || "medium");
    setNewTaskDueDate(task.dueDate || "");
    setShowAddTaskModal(true);
  };

  const handleCloseAddTaskModal = () => {
    setShowAddTaskModal(false);
    setAddingToListId(null);
    setNewTaskText("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setNewTaskDueDate("");
    setEditingTask(null);
  };

  const handleCreateTask = () => {
    if (editingTask) {
      updateTask(editingTask.listId, editingTask.task.id, {
        text: newTaskText,
        description: newTaskDescription,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
      });
    } else if (newTaskText.trim() && addingToListId) {
      addTask(addingToListId, newTaskText, newTaskPriority, newTaskDueDate);
    }

    handleCloseAddTaskModal();
  };

  const handleOpenTeamModal = (listId: string, task: Task) => {
    setTaskToAssign({ listId, task });
    setShowTeamModal(true);
  };

  const handleCloseTeamModal = () => {
    setShowTeamModal(false);
    setTaskToAssign(null);
    setTeamModalSearch("");
  };

  // Delete Confirmation Modal Handlers
  const handleOpenDeleteConfirmModal = (
    listId: string,
    taskId: string,
    taskText: string
  ) => {
    setTaskToDelete({ listId, taskId, taskText });
    setShowDeleteConfirmModal(true);
  };

  const handleCloseDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setTaskToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.listId, taskToDelete.taskId);
      handleCloseDeleteConfirmModal();
    }
  };

  const handleOpenViewTaskModal = (task: Task) => {
    setTaskToView(task);
  };

  const handleCloseViewTaskModal = () => {
    setTaskToView(null);
  };

  const isOverdue = (dueDate: string | undefined): boolean => {
    if (!dueDate) return false;

    // Get today's date at midnight (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // The input type="date" provides a string in "YYYY-MM-DD" format.
    // new Date() will parse this as UTC midnight. To avoid timezone issues,
    // we add 'T00:00:00' to ensure it's parsed in the local timezone.
    const dueDateObj = new Date(`${dueDate}T00:00:00`);

    return dueDateObj < today;
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "profile":
        return (
          <Profile
            currentUser={currentUser}
            onUpdateUser={handleUserUpdate}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "admin":
        if (!isAdmin) {
          setCurrentView("dashboard");
          return null;
        }
        return <AdminDashboard onBack={() => setCurrentView("dashboard")} />; // AdminDashboard already handles its own fade-in
      case "teams":
        return (
          <TeamManagement
            currentUser={currentUser || undefined}
            teamMembers={teamMembers}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      case "about":
        return <About />; // About already handles its own fade-in
      case "services":
        return <Services />; // Services already handles its own fade-in
      case "contact":
        return <Contact />; // Contact already handles its own fade-in
      case "privacy":
        return <PrivacyPolicy onBack={() => setCurrentView("dashboard")} />;
      case "terms":
        return <TermsOfService onBack={() => setCurrentView("dashboard")} />;
      case "cookies":
        return <CookiePolicy onBack={() => setCurrentView("dashboard")} />;
      case "dashboard":
      default:
        return (
          <div
            className={`${styles.projectBoard} ${
              isVisible ? styles.fadeIn : ""
            }`}
          >
            {" "}
            {/* Apply fadeIn here */}
            <div className={styles.boardHeader}>
              <div className={styles.boardTitleSection}>
                <h1 className={styles.pageTitle}>My Project Board</h1>{" "}
                {/* Use new pageTitle */}
                <p className={styles.pageSubtitle}>
                  {" "}
                  {/* Use new pageSubtitle */}
                  Organize and track your tasks efficiently
                </p>
              </div>
              <div className={styles.boardControlsRow}>
                <div className={styles.boardActions}>
                  <div className={styles.searchBar}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>
                </div>
                <div className={styles.boardStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {lists.reduce((acc, list) => acc + list.tasks.length, 0)}
                    </span>
                    <span className={styles.statLabel}>Total Tasks</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {lists.reduce(
                        (acc, list) =>
                          acc + list.tasks.filter((t) => t.completed).length,
                        0
                      )}
                    </span>
                    <span className={styles.statLabel}>Completed</span>
                  </div>
                </div>
                <div className={styles.sortControls}>
                  <label htmlFor="sortSelect" className={styles.sortLabel}>
                    Sort by:
                  </label>
                  <select
                    id="sortSelect"
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  >
                    <option value="none">Default</option>
                    <option value="alphabetical">A-Z</option>
                    <option value="priority">Priority</option>
                    <option value="date">Date Created</option>
                  </select>
                </div>
              </div>
            </div>
            <div className={styles.boardGrid}>
              <div
                className={styles.boardContentWrapper}
                data-testid="board-content"
              >
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={styles.boardColumn}
                    onDragEnter={() => setDragOverListId(list.id)}
                    onDragLeave={() => setDragOverListId(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => setDragOverListId(null)}
                  >
                    <div className={styles.columnHeader}>
                      <div className={styles.columnTitle}>
                        <input
                          className={styles.columnTitleInput}
                          value={list.title}
                          onChange={(e) => renameList(list.id, e.target.value)}
                        />
                        <div className={styles.columnActions}>
                          <button
                            className={styles.columnButton}
                            onClick={() => {
                              handleOpenAddTaskModal(list.id);
                            }}
                          >
                            <FaPlus /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className={styles.columnContent}>
                      <DropZone onDrop={() => handleDrop(list.id, 0)} />
                      {sortTasks(list.tasks, sortBy)
                        .filter(
                          (task) =>
                            !searchTerm ||
                            task.text
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                        )
                        .map(
                          (task, index) =>
                            !task.completed && (
                              <React.Fragment key={task.id}>
                                <TaskCard
                                  task={task}
                                  listId={list.id}
                                  teamMembers={teamMembers}
                                  currentUser={currentUser}
                                  onDragStart={() =>
                                    onDragStart(list.id, task.id, index)
                                  }
                                  onDragEnd={onDragEnd}
                                  onToggleCompletion={toggleTaskCompletion}
                                  onRename={renameTask}
                                  onOpenEditModal={handleOpenEditTaskModal}
                                  onOpenDeleteModal={
                                    handleOpenDeleteConfirmModal
                                  }
                                  onSetPriority={setTaskPriority}
                                  onOpenTeamModal={handleOpenTeamModal}
                                  onAddSubTask={addSubTask}
                                  onToggleSubTask={toggleSubTask}
                                  onEditSubTask={editSubTask}
                                  onDeleteSubTask={deleteSubTask}
                                  onAddComment={addComment}
                                  onEditComment={editComment}
                                  onDeleteComment={deleteComment}
                                  onAddAttachment={addAttachment}
                                  onDeleteAttachment={deleteAttachment}
                                />
                                <DropZone
                                  onDrop={() => handleDrop(list.id, index + 1)}
                                />
                              </React.Fragment>
                            )
                        )}
                    </div>
                  </div>
                ))}
                <div className={styles.addColumnButton}>
                  <ListComposer onAdd={(title) => addList(title)} />
                </div>
              </div>
              <OverviewPanel lists={lists} data-testid="overview-panel" />
              <ActivityFeed
                activities={activities}
                data-testid="activity-feed"
              />
              <div
                className={`${styles.finishedTasksPanel} ${
                  isFinishedPanelCollapsed ? styles.collapsed : ""
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDropToFinished}
                data-testid="finished-tasks"
              >
                <div className={styles.panelHeader}>
                  {!isFinishedPanelCollapsed && (
                    <h3 className={styles.panelTitle}>Finished Tasks</h3>
                  )}
                  <button
                    className={styles.collapseButton}
                    onClick={() => setIsFinishedPanelCollapsed((prev) => !prev)}
                    title={isFinishedPanelCollapsed ? "Expand" : "Collapse"}
                  >
                    {isFinishedPanelCollapsed ? (
                      <FaChevronLeft />
                    ) : (
                      <FaChevronRight />
                    )}
                  </button>
                </div>
                {!isFinishedPanelCollapsed && (
                  <div className={styles.panelContent}>
                    {lists.flatMap((l) => l.tasks).filter((t) => t.completed)
                      .length === 0 ? (
                      <p className={styles.noTasksMessage}>
                        Drag tasks here to complete them.
                      </p>
                    ) : (
                      lists.map((list) => {
                        const completedTasks = list.tasks.filter(
                          (task) => task.completed
                        );
                        if (completedTasks.length === 0) return null;
                        return (
                          <div
                            key={`finished-group-${list.id}`}
                            className={styles.finishedTaskGroup}
                          >
                            <h4 className={styles.finishedTaskListTitle}>
                              {list.title}
                            </h4>
                            {completedTasks.map((task) => (
                              <div
                                key={task.id}
                                className={styles.finishedTask}
                                onClick={() => handleOpenViewTaskModal(task)}
                              >
                                <span className={styles.finishedTaskText}>
                                  {task.text}
                                </span>
                                <span className={styles.checkIcon}>
                                  <FaCheck />
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
                {!isFinishedPanelCollapsed && (
                  <div className={styles.panelFooter}>
                    <button
                      className={styles.archiveButton}
                      onClick={handleOpenArchiveModal}
                    >
                      <FaArchive /> View Archived Items
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.app}>
      <HeaderMenu
        onProfileClick={() => setCurrentView("profile")}
        onAdminClick={() => setCurrentView("admin")}
        onTeamsClick={() => setCurrentView("teams")}
        onAboutClick={() => setCurrentView("about")}
        onHomeClick={() => setCurrentView("dashboard")}
        onServicesClick={() => setCurrentView("services")}
        onContactClick={() => setCurrentView("contact")}
        onLogout={handleLogout}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />
      <main className={styles.main}>{renderCurrentView()}</main>
      {showAddTaskModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{editingTask ? "Edit Task" : "Add New Task"}</h3>
              <button
                onClick={handleCloseAddTaskModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Task Description</label>
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  className={styles.formInput}
                  placeholder="e.g., Design the new homepage"
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Details (Optional)</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className={styles.formTextarea}
                  placeholder="Add more details about the task..."
                  rows={4}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) =>
                    setNewTaskPriority(e.target.value as Task["priority"])
                  }
                  className={styles.formSelect}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className={styles.formInput}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleCloseAddTaskModal}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className={styles.createButton}
                disabled={!newTaskText.trim()}
              >
                {editingTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirmModal && taskToDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmationModal}>
            <div className={styles.modalHeader}>
              <h3>Confirm Deletion</h3>
              <button
                onClick={handleCloseDeleteConfirmModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>
                Are you sure you want to permanently delete the task:{" "}
                <strong>"{taskToDelete.taskText}"</strong>?
              </p>
              <p className={styles.warningText}>
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleCloseDeleteConfirmModal}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className={styles.deleteConfirmButton}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
      {taskToView && (
        <div className={styles.modalOverlay} onClick={handleCloseViewTaskModal}>
          <div
            className={styles.viewTaskModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Task Details</h3>
              <button
                onClick={handleCloseViewTaskModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <h4 className={styles.viewTaskTitle}>{taskToView.text}</h4>
              {taskToView.description && (
                <div className={styles.viewTaskSection}>
                  <p className={styles.viewTaskDescription}>
                    {taskToView.description}
                  </p>
                </div>
              )}

              <div className={styles.viewTaskMetaGrid}>
                {taskToView.priority && (
                  <div className={styles.viewTaskMetaItem}>
                    <span className={styles.viewTaskMetaLabel}>Priority</span>
                    <span
                      className={`${styles.priorityBadge} ${
                        styles[taskToView.priority]
                      }`}
                    >
                      {taskToView.priority}
                    </span>
                  </div>
                )}
                {taskToView.dueDate && (
                  <div className={styles.viewTaskMetaItem}>
                    <span className={styles.viewTaskMetaLabel}>Due Date</span>
                    <span>
                      {new Date(taskToView.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {taskToView.createdAt && (
                  <div className={styles.viewTaskMetaItem}>
                    <span className={styles.viewTaskMetaLabel}>Created</span>
                    <span>{timeSince(new Date(taskToView.createdAt))}</span>
                  </div>
                )}
                {taskToView.lastUpdatedAt && (
                  <div className={styles.viewTaskMetaItem}>
                    <span className={styles.viewTaskMetaLabel}>Updated</span>
                    <span>{timeSince(new Date(taskToView.lastUpdatedAt))}</span>
                  </div>
                )}
              </div>

              {taskToView.assignedTo && taskToView.assignedTo.length > 0 && (
                <div className={styles.viewTaskSection}>
                  <h5>Assigned To</h5>
                  <div className={styles.assignedMembers}>
                    {taskToView.assignedTo.map((memberId) => {
                      const member = teamMembers.find((m) => m.id === memberId);
                      return member ? (
                        <div key={memberId} className={styles.viewTaskMember}>
                          <span
                            className={styles.memberAvatar}
                            title={member.name}
                          >
                            {member.avatar}
                          </span>
                          <span>{member.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {taskToView.subTasks && taskToView.subTasks.length > 0 && (
                <div className={styles.viewTaskSection}>
                  <h5>Checklist</h5>
                  <div className={styles.checklist}>
                    {taskToView.subTasks.map((subTask) => (
                      <div key={subTask.id} className={styles.checklistItem}>
                        <input
                          type="checkbox"
                          checked={subTask.completed}
                          readOnly
                        />
                        <span
                          className={`${styles.subTaskInput} ${
                            subTask.completed ? styles.completed : ""
                          }`}
                        >
                          {subTask.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {taskToView.attachments && taskToView.attachments.length > 0 && (
                <div className={styles.viewTaskSection}>
                  <h5>Attachments</h5>
                  <div className={styles.attachmentsList}>
                    {taskToView.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={styles.attachmentItem}
                      >
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.attachmentLink}
                          title={`${attachment.name} (${(
                            attachment.size / 1024
                          ).toFixed(2)} KB)`}
                        >
                          <FaPaperclip />
                          <span>{attachment.name}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {taskToView.comments && taskToView.comments.length > 0 && (
                <div className={styles.viewTaskSection}>
                  <h5>Comments</h5>
                  <div className={styles.commentsList}>
                    {taskToView.comments.map((comment) => {
                      const author = teamMembers.find(
                        (m) => m.id === comment.authorId
                      );
                      return (
                        <div key={comment.id} className={styles.comment}>
                          <span
                            className={styles.memberAvatar}
                            title={author?.name}
                          >
                            {author?.avatar || "?"}
                          </span>
                          <div className={styles.commentBody}>
                            <p className={styles.commentText}>{comment.text}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {showTeamModal && taskToAssign && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Assign Members</h3>
              <button
                onClick={handleCloseTeamModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div
                className={styles.searchBar}
                style={{ marginBottom: "20px" }}
              >
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={teamModalSearch}
                  onChange={(e) => setTeamModalSearch(e.target.value)}
                  className={styles.searchInput}
                  style={{
                    color: "#2d3748",
                    background: "rgba(255,255,255,0.9)",
                  }}
                />
              </div>
              <div className={styles.membersList}>
                {teamMembers
                  .filter((member) =>
                    member.name
                      .toLowerCase()
                      .includes(teamModalSearch.toLowerCase())
                  )
                  .map((member) => {
                    const isAssigned = taskToAssign.task.assignedTo?.includes(
                      member.id
                    );
                    return (
                      <div
                        key={member.id}
                        className={`${styles.memberOption} ${
                          isAssigned ? styles.assigned : ""
                        }`}
                        onClick={() =>
                          assignTaskToMember(
                            taskToAssign.listId,
                            taskToAssign.task.id,
                            member.id
                          )
                        }
                      >
                        <div className={styles.memberInfo}>
                          <span className={styles.memberAvatar}>
                            {member.avatar}
                          </span>
                          <span className={styles.memberName}>
                            {member.name}
                          </span>
                        </div>
                        {isAssigned && (
                          <FaCheck className={styles.assignedIcon} />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleCloseTeamModal}
                className={styles.createButton}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditCommentModal && editingComment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Edit Comment</h3>
              <button
                onClick={handleCloseEditCommentModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <textarea
                  value={editCommentText}
                  onChange={(e) => setEditCommentText(e.target.value)}
                  className={styles.formTextarea}
                  rows={4}
                  autoFocus
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleCloseEditCommentModal}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEditComment}
                className={styles.createButton}
                disabled={!editCommentText.trim()}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {showArchiveModal && (
        <div className={styles.modalOverlay}>
          <div
            className={styles.modal}
            style={{
              maxWidth: "800px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className={styles.modalHeader}>
              <h3>
                <FaArchive /> Archived Items
              </h3>
              <button
                onClick={handleCloseArchiveModal}
                className={styles.closeButton}
              >
                &times;
              </button>
            </div>
            <div className={styles.modalBody} style={{ overflowY: "auto" }}>
              <div className={styles.archiveSection}>
                <h4>Archived Lists ({archivedLists.length})</h4>
                {archivedLists.length > 0 ? (
                  <div className={styles.archivedItemsGrid}>
                    {archivedLists.map((list) => (
                      <div key={list.id} className={styles.archivedItemCard}>
                        <div className={styles.archivedItemInfo}>
                          <span className={styles.archivedItemTitle}>
                            {list.title}
                          </span>
                          <span className={styles.archivedItemMeta}>
                            Archived on:{" "}
                            {new Date(list.archivedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={styles.archivedItemActions}>
                          <button onClick={() => restoreList(list)}>
                            Restore
                          </button>
                          <button
                            onClick={() => permanentlyDeleteList(list.id)}
                            className={styles.deleteConfirmButton}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noItemsMessage}>No archived lists.</p>
                )}
              </div>
              {/* ... (similar structure for archived tasks) ... */}
            </div>
          </div>
        </div>
      )}
      <Footer
        onDashboardClick={() => setCurrentView("dashboard")}
        onAboutClick={() => setCurrentView("about")}
        onServicesClick={() => setCurrentView("services")}
        onContactClick={() => setCurrentView("contact")}
        onPrivacyClick={() => setCurrentView("privacy")}
        onTermsClick={() => setCurrentView("terms")}
        onCookiesClick={() => setCurrentView("cookies")}
      />
    </div>
  );
};

const DropZone: React.FC<{ onDrop: () => void }> = ({ onDrop }) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        onDrop();
        setIsOver(false);
      }}
      className={`${styles.dropZone} ${isOver ? styles.dropZoneOver : ""}`}
    />
  );
};

const SubTaskDropZone: React.FC<{ onDrop: () => void }> = ({ onDrop }) => {
  const [isOver, setIsOver] = useState(false);
  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => {
        onDrop();
        setIsOver(false);
      }}
      className={`${styles.subTaskDropZone} ${
        isOver ? styles.subTaskDropZoneOver : ""
      }`}
    />
  );
};

export default App;
