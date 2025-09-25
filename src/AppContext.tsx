import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  Dispatch,
} from "react";
import { List, TeamMember } from "./types";

// 1. Define the shape of our global state
interface AppState {
  lists: List[];
  teamMembers: TeamMember[];
  currentUser: {
    id: string;
    email: string;
    name: string;
    role?: string;
  } | null;
}

// 2. Define the actions that can be dispatched
type Action =
  | { type: "SET_LISTS"; payload: List[] }
  | { type: "SET_TEAM_MEMBERS"; payload: TeamMember[] }
  | { type: "SET_CURRENT_USER"; payload: AppState["currentUser"] };

// 3. Define the initial state
const initialState: AppState = {
  lists: [],
  teamMembers: [],
  currentUser: null,
};

// 4. Create the reducer function to handle actions
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case "SET_LISTS":
      return { ...state, lists: action.payload };
    case "SET_TEAM_MEMBERS":
      return { ...state, teamMembers: action.payload };
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };
    default:
      return state;
  }
};

// 5. Create the context
interface AppContextProps {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppContext = createContext<AppContextProps>({
  state: initialState,
  dispatch: () => null,
});

// 6. Create the Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// 7. Create a custom hook for easy context consumption
export const useAppContext = () => {
  return useContext(AppContext);
};
