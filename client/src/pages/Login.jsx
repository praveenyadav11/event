import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "organizer") navigate("/organizer/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <div style={s.leftInner}>
          <Link to="/" style={s.brand}>
            ⚡ EventFlow
          </Link>
          <h1 style={s.hero}>Welcome back!</h1>
          <p style={s.heroSub}>
            Log in to access your tickets, manage events, and discover what's
            happening near you.
          </p>
          <div style={s.statsRow}>
            {[
              ["10K+", "Events"],
              ["50K+", "Students"],
              ["500+", "Organizers"],
            ].map(([num, label]) => (
              <div key={label} style={s.stat}>
                <div style={s.statNum}>{num}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.formCard}>
          <h2 style={s.title}>Log in</h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginBottom: "24px",
            }}
          >
            New here?{" "}
            <Link
              to="/register"
              style={{ color: "var(--primary)", fontWeight: 500 }}
            >
              Create a free account
            </Link>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="divider">or continue with</div>

          <button
            className="btn btn-secondary btn-full"
            style={{ gap: "10px" }}
            onClick={() => alert("Google OAuth coming in next update!")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <p
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            Admin?{" "}
            <Link to="/admin/login" style={{ color: "var(--primary)" }}>
              Admin login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr" },
  left: {
    background: "var(--gradient-hero)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem",
  },
  leftInner: { maxWidth: "380px" },
  brand: {
    fontFamily: "'Poppins',sans-serif",
    fontWeight: 700,
    fontSize: "22px",
    color: "#fff",
    display: "block",
    marginBottom: "2.5rem",
  },
  hero: {
    fontSize: "40px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "1rem",
  },
  heroSub: {
    fontSize: "15px",
    color: "rgba(255,255,255,.75)",
    marginBottom: "2.5rem",
    lineHeight: 1.7,
  },
  statsRow: { display: "flex", gap: "24px" },
  stat: { textAlign: "center" },
  statNum: { fontSize: "24px", fontWeight: 700, color: "#fff" },
  statLabel: { fontSize: "12px", color: "rgba(255,255,255,.6)" },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "var(--bg)",
  },
  formCard: {
    width: "100%",
    maxWidth: "420px",
    background: "var(--bg-card)",
    borderRadius: "var(--r-xl)",
    padding: "2.5rem",
    boxShadow: "var(--shadow-xl)",
    border: "1px solid var(--border)",
  },
  title: { fontSize: "26px", fontWeight: 700, marginBottom: "4px" },
};
