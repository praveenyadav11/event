import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // step 1: info, step 2: role
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", form);
      login(res.data.token, res.data.user);
      navigate(
        res.data.user.role === "organizer"
          ? "/organizer/dashboard"
          : "/dashboard",
      );
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.leftInner}>
          <Link to="/" style={s.brand}>
            ⚡ EventFlow
          </Link>
          <h1 style={s.hero}>
            Your next great
            <br />
            experience starts here
          </h1>
          <p style={s.heroSub}>
            Discover, book, and manage events — all in one place.
          </p>
          <div style={s.featureList}>
            {[
              ["🎪", "Browse thousands of events"],
              ["🎫", "Instant ticket booking"],
              ["📱", "Digital QR tickets"],
              ["👥", "Find your team"],
            ].map(([icon, text]) => (
              <div key={text} style={s.feature}>
                <span style={s.featureIcon}>{icon}</span>
                <span
                  style={{ fontSize: "14px", color: "rgba(255,255,255,.85)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.formCard}>
          <h2 style={s.title}>Create account</h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--text-secondary)",
              marginBottom: "24px",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "var(--primary)", fontWeight: 500 }}
            >
              Log in
            </Link>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Role selector */}
            <div style={{ marginBottom: "20px" }}>
              <p className="input-label">I want to join as</p>
              <div style={s.roleGrid}>
                {[
                  {
                    value: "student",
                    icon: "🎓",
                    label: "Student",
                    desc: "Discover & book events",
                  },
                  {
                    value: "organizer",
                    icon: "🎪",
                    label: "Organizer",
                    desc: "Create & manage events",
                  },
                ].map((r) => (
                  <div
                    key={r.value}
                    style={{
                      ...s.roleCard,
                      ...(form.role === r.value ? s.roleCardActive : {}),
                    }}
                    onClick={() => setForm({ ...form, role: r.value })}
                  >
                    <span style={{ fontSize: "24px" }}>{r.icon}</span>
                    <div style={s.roleLabel}>{r.label}</div>
                    <div style={s.roleDesc}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                className="input"
                placeholder="Praveen Yadav"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

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
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : `Create ${form.role} account`}
            </button>
          </form>

          <p
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
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
  leftInner: { maxWidth: "420px" },
  brand: {
    fontFamily: "'Poppins',sans-serif",
    fontWeight: 700,
    fontSize: "22px",
    color: "#fff",
    display: "block",
    marginBottom: "2.5rem",
  },
  hero: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "1rem",
    lineHeight: 1.25,
  },
  heroSub: {
    fontSize: "15px",
    color: "rgba(255,255,255,.75)",
    marginBottom: "2.5rem",
    lineHeight: 1.7,
  },
  featureList: { display: "flex", flexDirection: "column", gap: "14px" },
  feature: { display: "flex", alignItems: "center", gap: "12px" },
  featureIcon: {
    fontSize: "20px",
    width: "36px",
    height: "36px",
    background: "rgba(255,255,255,.15)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "var(--bg)",
  },
  formCard: {
    width: "100%",
    maxWidth: "440px",
    background: "var(--bg-card)",
    borderRadius: "var(--r-xl)",
    padding: "2.5rem",
    boxShadow: "var(--shadow-xl)",
    border: "1px solid var(--border)",
  },
  title: { fontSize: "26px", fontWeight: 700, marginBottom: "4px" },
  roleGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  roleCard: {
    padding: "16px 12px",
    border: "2px solid var(--border)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    textAlign: "center",
    transition: "all .2s",
    background: "var(--bg)",
  },
  roleCardActive: {
    borderColor: "var(--primary)",
    background: "var(--primary-light)",
  },
  roleLabel: {
    fontSize: "14px",
    fontWeight: 600,
    marginTop: "6px",
    color: "var(--text-primary)",
  },
  roleDesc: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    marginTop: "2px",
  },
};
