import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: { username: string } | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ username: string } | null>(() => {
    const storedUsername = sessionStorage.getItem("quizUsername");
    return storedUsername ? { username: storedUsername } : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = sessionStorage.getItem("quizUserToken");
    return token && sessionStorage.getItem("quizUserLoggedIn") === "true";
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("quizUserToken");
    const loggedIn = sessionStorage.getItem("quizUserLoggedIn") === "true";
    setIsLoggedIn(!!token && loggedIn);
    setLoading(false);
  }, []);

  const login = (token: string, username: string) => {
    sessionStorage.setItem("quizUserToken", token);
    sessionStorage.setItem("quizUserLoggedIn", "true");
    sessionStorage.setItem("quizUsername", username);
    setUser({ username });
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem("quizUserToken");
    sessionStorage.removeItem("quizUserLoggedIn");
    sessionStorage.removeItem("quizUsername");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
