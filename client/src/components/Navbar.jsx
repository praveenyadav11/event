import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin";
    if (user.role === "organizer") return "/organizer/dashboard";
    return "/dashboard";
  };

  return (
    <nav
      style={{
        ...s.nav,
        background: scrolled
          ? "var(--glass-bg)"
          : pathname === "/"
            ? "transparent"
            : "var(--glass-bg)",
        backdropFilter: scrolled || pathname !== "/" ? "blur(20px)" : "none",
        borderBottom:
          scrolled || pathname !== "/"
            ? "1px solid var(--glass-border)"
            : "none",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}
    >
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.brand}>
          <span style={s.brandIcon}>⚡</span>
          <span>EventFlow</span>
        </Link>

        {/* Desktop nav */}
        <div style={s.links} className="hide-mobile">
          {[
            { to: "/events", label: "Explore" },
            { to: "/events?category=Tech", label: "Tech" },
            { to: "/events?category=Music", label: "Music" },
            { to: "/events?category=Sports", label: "Sports" },
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={s.link}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={s.right}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            style={s.iconBtn}
            title="Toggle dark mode"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          {user ? (
            <div style={s.userRow}>
              <Link to={getDashLink()} style={s.dashBtn}>
                Dashboard
              </Link>
              <div
                style={{
                  ...s.avatar,
                  width: "34px",
                  height: "34px",
                  fontSize: "14px",
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} style={s.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <div style={s.authBtns}>
              <Link
                to="/login"
                className="btn btn-ghost"
                style={{ padding: "8px 16px" }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ padding: "8px 18px" }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

const s = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    height: "68px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Poppins',sans-serif",
    fontWeight: 700,
    fontSize: "20px",
    color: "var(--primary)",
    textDecoration: "none",
  },
  brandIcon: { fontSize: "22px" },
  links: { display: "flex", alignItems: "center", gap: "4px" },
  link: {
    padding: "7px 14px",
    borderRadius: "var(--r-md)",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    transition: "all .2s",
    textDecoration: "none",
  },
  right: { display: "flex", alignItems: "center", gap: "10px" },
  iconBtn: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-md)",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "16px",
  },
  authBtns: { display: "flex", alignItems: "center", gap: "8px" },
  userRow: { display: "flex", alignItems: "center", gap: "10px" },
  dashBtn: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--primary)",
    padding: "7px 14px",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--primary)",
    textDecoration: "none",
  },
  avatar: {
    borderRadius: "50%",
    background: "var(--gradient-primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    flexShrink: 0,
  },
  logoutBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "7px 10px",
  },
};
