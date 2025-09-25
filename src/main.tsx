import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import Login from "./Login.tsx";
import { generateId } from "./utils.ts";
import "./index.css";
import { socket } from "./services/socketService.ts";

declare global {
  interface Window {
    socket: typeof socket;
  }
}

function Root() {
  const getInitialState = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return { authed: false, state: null };
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload && payload.sub && payload.exp * 1000 > Date.now()) {
        const initialState = {
          currentUser: {
            id: payload.sub,
            email: payload.email,
            name: payload.name || payload.email,
            role: payload.role,
          },
          lists: [
            {
              id: generateId("list"),
              title: "Today",
              tasks: [
                {
                  id: generateId("task"),
                  text: "Start adding tasks",
                  completed: false,
                  assignedTo: [],
                  createdAt: new Date(),
                  lastUpdatedAt: new Date(),
                  priority: "medium",
                },
              ],
            },
            { id: generateId("list"), title: "This Week", tasks: [] },
            { id: generateId("list"), title: "This Month", tasks: [] },
          ],
          teamMembers: [],
        };
        return { authed: true, state: initialState };
      }
    } catch {
      localStorage.removeItem("authToken");
    }
    return { authed: false, state: null };
  };

  const [authState, setAuthState] = useState(getInitialState);

  useEffect(() => {
    if (!authState.authed) return;
    window.socket = socket;
    // ... your socket connection logic
    return () => {
      if (socket.connected) {
        socket.close();
      }
    };
  }, [authState.authed]);

  return (
    <React.StrictMode>
      {authState.authed && authState.state ? (
        <App initialState={authState.state} />
      ) : (
        <Login onSuccess={() => setAuthState(getInitialState())} />
      )}
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
