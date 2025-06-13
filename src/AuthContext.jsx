import { createContext, useContext, useState, useEffect } from "react";

const API = "https://fsa-jwt-practice.herokuapp.com";
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [location, setLocation] = useState("GATE");
  const [users, setUsers] = useState("");

  // ✅ Fetch user (optional basic call)
  useEffect(() => {
    const getPerson = async () => {
      try {
        const response = await fetch(API);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    getPerson();
  }, []);

  // ✅ LogIn (signup)
  const LogIn = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "some-username",
          password: "super-secret-999",
        }),
      });

      const tokenObj = await response.json();
      if (tokenObj.access_token) {
        localStorage.setItem("token", tokenObj.access_token);
        setToken(tokenObj.access_token);
      } else {
        console.error("No token returned.");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  // ✅ Authenticate (only runs if token exists)
  useEffect(() => {
    const authenticate = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${API}/authenticate`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Authentication failed:", error);
      }
    };

    authenticate();
  }, [token]);

  const value = { location, users, LogIn };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within an AuthProvider");
  return context;
}
