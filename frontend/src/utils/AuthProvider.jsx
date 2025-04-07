import PropTypes from "prop-types";
import { createContext, useContext, useReducer } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
const authContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: JSON.parse(localStorage.getItem("loggedInUser")) || null,
};

function reducer(state, action) {
  switch (action.type) {
    case "register":
    case "login":
      localStorage.setItem("loggedInUser", JSON.stringify(action.payload));
      return { ...state, user: action.payload, isAuthenticated: true };

    case "log-out":
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("chatPartner");
      return {
        ...state,
        user: null,

        isAuthenticated: false,
      };

    default:
      return state;
  }
}

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isAuthenticated, user } = state;

  const queryClient = useQueryClient();

  const register = useMutation({
    mutationFn: async ({ name, mobileNumber }) => {
      const res = await fetch("http://localhost:3000/register/registerUser", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobileNumber }),
      });

      return res.json();
    },

    onSuccess: (data) => {
      if (data.success) {
        // localStorage.setItem("token", data.token);

        dispatch({
          type: "register",
          payload: { name: data.name, mobileNumber: data.mobileNumber },
        });
        queryClient.invalidateQueries(["users"]);
      }
    },
  });
  const login = async (mobileNumber) => {
    const res = await fetch(
      `http://localhost:3000/register/getUser?mobileNumber=${mobileNumber}`,
      {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);

      dispatch({ type: "login", payload: data });
      queryClient.invalidateQueries(["user"]);
    }
  };

  const value = {
    ...state,
    register,
    login,

    isAuthenticated,
    user,
  };

  return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

const useAuth = () => {
  const context = useContext(authContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthProvider, useAuth };
