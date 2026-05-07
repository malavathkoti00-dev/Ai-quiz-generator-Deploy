import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, History, PlusCircle, Gamepad2, LogOut, Menu, X, Trophy, Home } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { label: "Home", path: "/home", icon: Home },
  { label: "Create", path: "/create", icon: PlusCircle },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "History", path: "/history", icon: History },
  { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
  { label: "Game Mode", path: "/game", icon: Gamepad2 },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, logout, loading } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  // Only show Home to guests; show all links to logged-in users
  const filteredLinks = isLoggedIn 
    ? navLinks 
    : navLinks.filter(link => link.path === "/home" || link.path === "/");

  if (loading) return <nav className="navbar"><div className="container"></div></nav>;

  return (
    <nav className="navbar">
      <div className="container" style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <Link to="/home" className="navbar-brand">
            <div className="navbar-brand-icon">🧠</div>
            <span className="navbar-brand-text">
              <span className="text-gradient"> Quiz AI</span>
            </span>
          </Link>

          <div className="navbar-links hide-mobile">
            {filteredLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? "active" : ""}`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="navbar-actions">
          <ThemeToggle />
          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              className="btn btn-primary btn-sm" 
              style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          ) : (
            <div style={{ display: "flex", gap: 12 }}>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        {filteredLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={() => setMobileOpen(false)}
            className={`navbar-link ${location.pathname === link.path ? "active" : ""}`}
          >
            <link.icon size={18} />
            {link.label}
          </Link>
        ))}
        {isLoggedIn ? (
          <button onClick={handleLogout} className="btn btn-ghost" style={{ justifyContent: "flex-start", color: "var(--error)", gap: 12 }}>
            <LogOut size={18} /> Log Out
          </button>
        ) : (
          <>
            <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>Log In</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="btn btn-primary">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
