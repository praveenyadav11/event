import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const SKILLS = [
  "React",
  "Node.js",
  "Python",
  "JavaScript",
  "TypeScript",
  "MongoDB",
  "Machine Learning",
  "Figma",
  "Flutter",
  "Java",
  "C++",
  "SQL",
  "Firebase",
  "Docker",
  "AWS",
  "TensorFlow",
  "Next.js",
  "Django",
];

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "MBA",
  "BBA",
  "Arts",
  "Commerce",
  "Other",
];

const YEARS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Postgraduate",
  "Alumni",
];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    college: "",
    department: "",
    year: "",
    skills: [],
    upiId: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      const u = res.data;
      setForm({
        name: u.name || "",
        phone: u.phone || "",
        bio: u.bio || "",
        college: u.college || "",
        department: u.department || "",
        year: u.year || "",
        skills: u.skills || [],
        upiId: u.upiId || "",
      });
    });
  }, []);

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.skills.includes(s))
      setForm((f) => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMsg("");
    try {
      const res = await api.put("/auth/update-profile", form);
      updateUser(res.data);
      setMsg("Profile updated successfully!");
      setTimeout(
        () =>
          navigate(
            user?.role === "organizer" ? "/organizer/dashboard" : "/dashboard",
          ),
        1200,
      );
    } catch (err) {
      setError(err.response?.data?.msg || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div
        style={{
          paddingTop: "100px",
          paddingBottom: "4rem",
          background: "var(--bg)",
        }}
      >
        <div
          style={{ maxWidth: "620px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <h1 style={s.title}>Edit Profile</h1>
          <p style={s.sub}>Keep your profile updated to get better matches</p>

          {msg && <div className="alert alert-success">{msg}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Basic info */}
            <div style={s.section}>
              <div style={s.sectionTitle}>Basic Information</div>
              <div style={s.grid2}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <input
                    className="input"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Bio</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Tell others about yourself..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            {/* Academic info */}
            <div style={s.section}>
              <div style={s.sectionTitle}>Academic Details</div>
              <div className="input-group">
                <label className="input-label">College / University</label>
                <input
                  className="input"
                  placeholder="e.g. MRCE Hyderabad"
                  value={form.college}
                  onChange={(e) =>
                    setForm({ ...form, college: e.target.value })
                  }
                />
              </div>
              <div style={s.grid2}>
                <div className="input-group">
                  <label className="input-label">Department</label>
                  <select
                    className="input"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Year</label>
                  <select
                    className="input"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  >
                    <option value="">Select year</option>
                    {YEARS.map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div style={s.section}>
              <div style={s.sectionTitle}>Skills</div>
              <div style={s.skillsWrap}>
                {form.skills.map((skill) => (
                  <span key={skill} style={s.skillChip}>
                    {skill}
                    <span
                      style={s.skillRemove}
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </span>
                  </span>
                ))}
              </div>
              <div style={s.skillInputRow}>
                <input
                  className="input"
                  style={{ flex: 1, marginBottom: 0 }}
                  placeholder="Type a skill and press Add"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addSkill(skillInput))
                  }
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => addSkill(skillInput)}
                >
                  Add
                </button>
              </div>
              <div style={{ marginTop: "10px" }}>
                {SKILLS.filter((s) => !form.skills.includes(s)).map((skill) => (
                  <span
                    key={skill}
                    style={s.skillSuggestion}
                    onClick={() => addSkill(skill)}
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* UPI ID — organizers only */}
            {user?.role === "organizer" && (
              <div style={s.section}>
                <div style={s.sectionTitle}>Payment Settings</div>
                <div className="input-group">
                  <label className="input-label">
                    Your UPI ID
                    <span
                      style={{
                        color: "var(--text-tertiary)",
                        fontWeight: 400,
                        marginLeft: "6px",
                      }}
                    >
                      (students pay directly to this UPI)
                    </span>
                  </label>
                  <input
                    className="input"
                    placeholder="yourname@upi / 9876543210@upi"
                    value={form.upiId}
                    onChange={(e) =>
                      setForm({ ...form, upiId: e.target.value })
                    }
                  />
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text-tertiary)",
                      marginTop: "4px",
                    }}
                  >
                    When students book your events, QR code will be generated
                    with this UPI ID
                  </div>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { fontSize: "28px", fontWeight: 800, marginBottom: "4px" },
  sub: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginBottom: "24px",
  },
  section: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".07em",
    color: "var(--text-tertiary)",
    marginBottom: "16px",
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  skillsWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "12px",
    minHeight: "32px",
  },
  skillChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "var(--primary-light)",
    color: "var(--primary)",
    padding: "4px 12px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: 500,
  },
  skillRemove: {
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "14px",
    opacity: 0.7,
  },
  skillInputRow: { display: "flex", gap: "8px", alignItems: "center" },
  skillSuggestion: {
    display: "inline-block",
    fontSize: "12px",
    color: "var(--primary)",
    background: "var(--primary-light)",
    borderRadius: "99px",
    padding: "3px 10px",
    margin: "3px",
    cursor: "pointer",
    fontWeight: 500,
  },
};
