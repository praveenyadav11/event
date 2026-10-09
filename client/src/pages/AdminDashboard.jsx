import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [s, u, e, b] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/events"),
        api.get("/admin/bookings"),
      ]);
      setStats(s.data);
      setUsers(u.data.users);
      setEvents(e.data.events);
      setBookings(b.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setMsg("User deleted");
    } catch (err) {
      alert(err.response?.data?.msg);
    }
  };

  const handleToggleUser = async (id, isActive) => {
    try {
      const res = await api.put(`/admin/users/${id}`, { isActive: !isActive });
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
      setMsg(`User ${!isActive ? "activated" : "suspended"}`);
    } catch (err) {
      alert(err.response?.data?.msg);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event and all its bookings?")) return;
    try {
      await api.delete(`/admin/events/${id}`);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setMsg("Event deleted");
    } catch (err) {
      alert(err.response?.data?.msg);
    }
  };

  const handleFeatureEvent = async (id, isFeatured) => {
    try {
      const res = await api.put(`/admin/events/${id}`, {
        isFeatured: !isFeatured,
      });
      setEvents((prev) => prev.map((e) => (e._id === id ? res.data : e)));
    } catch (err) {
      alert(err.response?.data?.msg);
    }
  };

  const handleEventStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/events/${id}`, { status });
      setEvents((prev) => prev.map((e) => (e._id === id ? res.data : e)));
    } catch (err) {
      alert(err.response?.data?.msg);
    }
  };

  if (loading)
    return (
      <div className="page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: "80vh" }}>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );

  return (
    <div className="page">
      <Navbar />
      <div
        style={{
          paddingTop: "80px",
          background: "var(--bg)",
          minHeight: "100vh",
        }}
      >
        <div style={s.header}>
          <div className="container">
            <h1 style={s.title}>🛡 Admin Panel</h1>
            <p style={s.sub}>EventFlow platform management</p>
          </div>
        </div>

        <div className="container" style={{ padding: "2rem 1.5rem" }}>
          {msg && (
            <div
              className="alert alert-success"
              style={{ marginBottom: "16px" }}
            >
              {msg}{" "}
              <button style={s.dismissBtn} onClick={() => setMsg("")}>
                ×
              </button>
            </div>
          )}

          <div style={s.statsGrid}>
            {[
              {
                icon: "👥",
                label: "Total Users",
                value: stats?.totalUsers,
                color: "#6366F1",
              },
              {
                icon: "🎓",
                label: "Students",
                value: stats?.totalStudents,
                color: "#8B5CF6",
              },
              {
                icon: "🎪",
                label: "Organizers",
                value: stats?.totalOrganizers,
                color: "#06B6D4",
              },
              {
                icon: "📅",
                label: "Total Events",
                value: stats?.totalEvents,
                color: "#F59E0B",
              },
              {
                icon: "🎫",
                label: "Total Bookings",
                value: stats?.totalBookings,
                color: "#10B981",
              },
              {
                icon: "💰",
                label: "Platform Revenue",
                value: `₹${stats?.totalRevenue || 0}`,
                color: "#EF4444",
              },
              {
                icon: "✅",
                label: "Total Check-ins",
                value: stats?.checkedIn,
                color: "#06B6D4",
              },
              {
                icon: "📢",
                label: "Live Events",
                value: stats?.publishedEvents,
                color: "#6366F1",
              },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={s.statCard}>
                <div style={{ fontSize: "24px", marginBottom: "6px" }}>
                  {icon}
                </div>
                <div style={{ ...s.statValue, color }}>{value}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>

          <div style={s.tabs}>
            {[
              { key: "overview", label: "📊 Overview" },
              { key: "users", label: "👥 Users" },
              { key: "events", label: "🎪 Events" },
              { key: "bookings", label: "🎫 Bookings" },
            ].map((t) => (
              <button
                key={t.key}
                style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="fade-in">
              <div style={s.overviewGrid}>
                <div style={s.overviewCard}>
                  <div style={s.cardTitle}>Recent Users</div>
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} style={s.miniRow}>
                      <div style={s.miniAvatar}>{u.name?.charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={s.miniName}>{u.name}</div>
                        <div style={s.miniSub}>{u.email}</div>
                      </div>
                      <span
                        style={{
                          ...s.roleBadge,
                          background:
                            u.role === "organizer"
                              ? "#EEF2FF"
                              : u.role === "admin"
                                ? "#FEF3C7"
                                : "#F0FDF4",
                          color:
                            u.role === "organizer"
                              ? "#4338CA"
                              : u.role === "admin"
                                ? "#92400E"
                                : "#166534",
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={s.overviewCard}>
                  <div style={s.cardTitle}>Recent Events</div>
                  {events.slice(0, 5).map((ev) => (
                    <div key={ev._id} style={s.miniRow}>
                      <div style={{ fontSize: "20px" }}>🎪</div>
                      <div style={{ flex: 1 }}>
                        <div style={s.miniName}>{ev.title}</div>
                        <div style={s.miniSub}>
                          {ev.organizer?.name} · {ev.category}
                        </div>
                      </div>
                      <span
                        style={{
                          ...s.roleBadge,
                          background:
                            ev.status === "published" ? "#D1FAE5" : "#FEF3C7",
                          color:
                            ev.status === "published" ? "#065F46" : "#92400E",
                        }}
                      >
                        {ev.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "users" && (
            <div className="fade-in">
              <div style={s.tableWrap}>
                <div style={s.tableHeader}>
                  <span style={{ flex: 3 }}>User</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Role</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Status</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Joined</span>
                  <span style={{ flex: 2, textAlign: "center" }}>Actions</span>
                </div>
                {users.map((u) => (
                  <div key={u._id} style={s.tableRow}>
                    <div
                      style={{
                        flex: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div style={s.tableAvatar}>{u.name?.charAt(0)}</div>
                      <div>
                        <div style={s.tableName}>{u.name}</div>
                        <div style={s.tableSub}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span
                        style={{
                          ...s.roleBadge,
                          background:
                            u.role === "organizer"
                              ? "#EEF2FF"
                              : u.role === "admin"
                                ? "#FEF3C7"
                                : "#F0FDF4",
                          color:
                            u.role === "organizer"
                              ? "#4338CA"
                              : u.role === "admin"
                                ? "#92400E"
                                : "#166534",
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span
                        style={{
                          ...s.roleBadge,
                          background: u.isActive ? "#D1FAE5" : "#FEE2E2",
                          color: u.isActive ? "#065F46" : "#991B1B",
                        }}
                      >
                        {u.isActive ? "Active" : "Suspended"}
                      </span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {u.createdAt &&
                        format(new Date(u.createdAt), "MMM d, yyyy")}
                    </div>
                    <div
                      style={{
                        flex: 2,
                        display: "flex",
                        justifyContent: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {u._id !== user?.id ? (
                        <>
                          <button
                            style={{
                              ...s.actionBtn,
                              background: u.isActive ? "#FEF3C7" : "#D1FAE5",
                              color: u.isActive ? "#92400E" : "#065F46",
                            }}
                            onClick={() => handleToggleUser(u._id, u.isActive)}
                          >
                            {u.isActive ? "Suspend" : "Activate"}
                          </button>
                          <button
                            style={{
                              ...s.actionBtn,
                              background: "#FEE2E2",
                              color: "#991B1B",
                            }}
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          You
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "events" && (
            <div className="fade-in">
              <div style={s.tableWrap}>
                <div style={s.tableHeader}>
                  <span style={{ flex: 3 }}>Event</span>
                  <span style={{ flex: 2 }}>Organizer</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Bookings</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Status</span>
                  <span style={{ flex: 2, textAlign: "center" }}>Actions</span>
                </div>
                {events.map((ev) => (
                  <div key={ev._id} style={s.tableRow}>
                    <div style={{ flex: 3 }}>
                      <div style={s.tableName}>{ev.title}</div>
                      <div style={s.tableSub}>
                        {ev.category} ·{" "}
                        {ev.date && format(new Date(ev.date), "MMM d, yyyy")}
                        {ev.isFeatured && (
                          <span style={s.featuredBadge}>⭐ Featured</span>
                        )}
                      </div>
                    </div>
                    <div style={{ flex: 2 }}>
                      <div style={s.tableName}>{ev.organizer?.name}</div>
                      <div style={s.tableSub}>{ev.organizer?.email}</div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontWeight: 600,
                        color: "var(--primary)",
                      }}
                    >
                      {ev.bookedCount || 0}
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span
                        style={{
                          ...s.roleBadge,
                          background:
                            ev.status === "published"
                              ? "#D1FAE5"
                              : ev.status === "draft"
                                ? "#FEF3C7"
                                : "#FEE2E2",
                          color:
                            ev.status === "published"
                              ? "#065F46"
                              : ev.status === "draft"
                                ? "#92400E"
                                : "#991B1B",
                        }}
                      >
                        {ev.status}
                      </span>
                    </div>
                    <div
                      style={{
                        flex: 2,
                        display: "flex",
                        justifyContent: "center",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        style={{
                          ...s.actionBtn,
                          background: "#EEF2FF",
                          color: "#4338CA",
                        }}
                        onClick={() => navigate(`/events/${ev._id}`)}
                      >
                        View
                      </button>
                      <button
                        style={{
                          ...s.actionBtn,
                          background: "#FEF3C7",
                          color: "#92400E",
                        }}
                        onClick={() =>
                          handleFeatureEvent(ev._id, ev.isFeatured)
                        }
                      >
                        {ev.isFeatured ? "Unfeature" : "⭐ Feature"}
                      </button>
                      {ev.status !== "published" ? (
                        <button
                          style={{
                            ...s.actionBtn,
                            background: "#D1FAE5",
                            color: "#065F46",
                          }}
                          onClick={() => handleEventStatus(ev._id, "published")}
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          style={{
                            ...s.actionBtn,
                            background: "#FEF3C7",
                            color: "#92400E",
                          }}
                          onClick={() => handleEventStatus(ev._id, "draft")}
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        style={{
                          ...s.actionBtn,
                          background: "#FEE2E2",
                          color: "#991B1B",
                        }}
                        onClick={() => handleDeleteEvent(ev._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "bookings" && (
            <div className="fade-in">
              <div style={s.tableWrap}>
                <div style={s.tableHeader}>
                  <span style={{ flex: 2 }}>Booking Ref</span>
                  <span style={{ flex: 3 }}>Event</span>
                  <span style={{ flex: 2 }}>Student</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Amount</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Status</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Check-in</span>
                </div>
                {bookings.map((b) => (
                  <div key={b._id} style={s.tableRow}>
                    <div style={{ flex: 2 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--primary)",
                        }}
                      >
                        {b.bookingRef}
                      </div>
                      <div style={s.tableSub}>
                        {b.createdAt &&
                          format(new Date(b.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <div style={{ flex: 3 }}>
                      <div style={s.tableName}>{b.event?.title}</div>
                      <div style={s.tableSub}>
                        {b.ticketTier} × {b.quantity}
                      </div>
                    </div>
                    <div style={{ flex: 2 }}>
                      <div style={s.tableName}>{b.user?.name}</div>
                      <div style={s.tableSub}>{b.user?.email}</div>
                    </div>
                    <div
                      style={{ flex: 1, textAlign: "center", fontWeight: 600 }}
                    >
                      {b.totalAmount === 0 ? "FREE" : `₹${b.totalAmount}`}
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span
                        style={{
                          ...s.roleBadge,
                          background:
                            b.paymentStatus === "paid"
                              ? "#D1FAE5"
                              : b.paymentStatus === "free"
                                ? "#EEF2FF"
                                : b.status === "cancelled"
                                  ? "#FEE2E2"
                                  : "#FEF3C7",
                          color:
                            b.paymentStatus === "paid"
                              ? "#065F46"
                              : b.paymentStatus === "free"
                                ? "#4338CA"
                                : b.status === "cancelled"
                                  ? "#991B1B"
                                  : "#92400E",
                        }}
                      >
                        {b.status === "cancelled"
                          ? "Cancelled"
                          : b.paymentStatus}
                      </span>
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      {b.isCheckedIn ? (
                        <span style={{ color: "var(--success)" }}>✅</span>
                      ) : (
                        <span style={{ color: "var(--text-tertiary)" }}>
                          ⏳
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  header: {
    background: "linear-gradient(135deg,#1E1B4B,#312E81)",
    padding: "2rem 0",
  },
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "4px",
  },
  sub: { fontSize: "14px", color: "rgba(255,255,255,.7)" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "12px",
    marginBottom: "24px",
  },
  statCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "16px",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  statValue: { fontSize: "26px", fontWeight: 800, marginBottom: "4px" },
  statLabel: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  tabs: { display: "flex", gap: "8px", marginBottom: "20px" },
  tab: {
    padding: "9px 20px",
    borderRadius: "var(--r-md)",
    border: "1.5px solid var(--border)",
    background: "var(--bg-card)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    color: "var(--text-secondary)",
  },
  tabActive: {
    background: "var(--primary)",
    color: "#fff",
    borderColor: "var(--primary)",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  overviewCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem",
  },
  cardTitle: { fontSize: "15px", fontWeight: 600, marginBottom: "16px" },
  miniRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid var(--border-light)",
  },
  miniAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "var(--gradient-primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "13px",
    flexShrink: 0,
  },
  miniName: { fontSize: "13px", fontWeight: 500 },
  miniSub: { fontSize: "11px", color: "var(--text-tertiary)" },
  roleBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "99px",
    whiteSpace: "nowrap",
  },
  tableWrap: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    overflow: "auto",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 16px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border)",
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border-light)",
  },
  tableAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "var(--gradient-primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "14px",
    flexShrink: 0,
  },
  tableName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  tableSub: { fontSize: "11px", color: "var(--text-tertiary)" },
  actionBtn: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "var(--r-sm)",
    border: "none",
    cursor: "pointer",
  },
  featuredBadge: {
    marginLeft: "6px",
    fontSize: "10px",
    fontWeight: 600,
    color: "#92400E",
    background: "#FEF3C7",
    padding: "1px 6px",
    borderRadius: "99px",
  },
  dismissBtn: {
    float: "right",
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "inherit",
  },
};
