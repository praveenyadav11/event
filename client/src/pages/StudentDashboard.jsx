import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { format } from "date-fns";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const PIE_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const QUICK_ACTIONS = [
  { icon: "🔍", label: "Browse Events", to: "/events" },
  { icon: "🎫", label: "My Tickets", to: "/my-tickets" },
  { icon: "⭐", label: "Saved Events", to: "/events?saved=true" },
  { icon: "👤", label: "Edit Profile", to: "/profile/edit" },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/student"),
      api.get("/bookings/my-tickets"),
      api.get("/events?sort=date&limit=4"),
    ])
      .then(([s, t, e]) => {
        setStats(s.data);
        setTickets(
          t.data
            .filter(
              (b) =>
                new Date(b.event?.date) > new Date() && b.status === "active",
            )
            .slice(0, 3),
        );
        setEvents(e.data.events || []);
      })
      .finally(() => setLoading(false));
  }, []);

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
        {/* Header */}
        <div style={s.header}>
          <div className="container">
            <div style={s.headerInner}>
              <div>
                <h1 style={s.greeting}>
                  Good{" "}
                  {new Date().getHours() < 12
                    ? "Morning"
                    : new Date().getHours() < 17
                      ? "Afternoon"
                      : "Evening"}
                  , {user?.name?.split(" ")[0]}! 👋
                </h1>
                <p style={s.headerSub}>
                  Here's what's happening with your events
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/events")}
              >
                Browse Events
              </button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: "2rem 1.5rem" }}>
          {/* Stats cards */}
          <div style={s.statsGrid}>
            {[
              {
                icon: "🎫",
                label: "Total Booked",
                value: stats?.totalBooked || 0,
                color: "#6366F1",
              },
              {
                icon: "📅",
                label: "Upcoming Events",
                value: stats?.upcomingCount || 0,
                color: "#8B5CF6",
              },
              {
                icon: "✅",
                label: "Events Attended",
                value: stats?.attendedCount || 0,
                color: "#10B981",
              },
              {
                icon: "💰",
                label: "Total Spent",
                value: `₹${stats?.totalSpent || 0}`,
                color: "#F59E0B",
              },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={s.statCard}>
                <div style={{ ...s.statIcon, background: color + "20", color }}>
                  {icon}
                </div>
                <div style={s.statValue}>{value}</div>
                <div style={s.statLabel}>{label}</div>
              </div>
            ))}
          </div>

          <div style={s.mainGrid}>
            {/* Left column */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Quick actions */}
              <div style={s.card}>
                <div style={s.cardTitle}>Quick Actions</div>
                <div style={s.quickActions}>
                  {QUICK_ACTIONS.map(({ icon, label, to }) => (
                    <Link key={label} to={to} style={s.quickAction}>
                      <span style={s.quickActionIcon}>{icon}</span>
                      <span style={s.quickActionLabel}>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Upcoming tickets */}
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.cardTitle}>Upcoming Tickets</div>
                  <Link to="/my-tickets" style={s.viewAll}>
                    View all →
                  </Link>
                </div>
                {loading ? (
                  <div style={s.loading}>Loading...</div>
                ) : tickets.length === 0 ? (
                  <div style={s.empty}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      🎫
                    </div>
                    <p>No upcoming tickets</p>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: "12px" }}
                      onClick={() => navigate("/events")}
                    >
                      Find Events
                    </button>
                  </div>
                ) : (
                  tickets.map((booking) => (
                    <div
                      key={booking._id}
                      style={s.ticketRow}
                      onClick={() => navigate(`/events/${booking.event?._id}`)}
                    >
                      <div style={s.ticketIcon}>🎪</div>
                      <div style={{ flex: 1 }}>
                        <div style={s.ticketName}>{booking.event?.title}</div>
                        <div style={s.ticketMeta}>
                          📅{" "}
                          {booking.event?.date &&
                            format(new Date(booking.event.date), "MMM d, yyyy")}
                          &nbsp;·&nbsp; 📍 {booking.event?.location}
                        </div>
                        <div style={s.ticketRef}>{booking.bookingRef}</div>
                      </div>
                      <div style={s.ticketStatus}>
                        {booking.totalAmount === 0
                          ? "FREE"
                          : `₹${booking.totalAmount}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right column */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Favourite categories chart */}
              {stats?.favoriteCategories?.length > 0 && (
                <div style={s.card}>
                  <div style={s.cardTitle}>Your Interests</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={stats.favoriteCategories}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {stats.favoriteCategories.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Discover events */}
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.cardTitle}>Discover Events</div>
                  <Link to="/events" style={s.viewAll}>
                    See all →
                  </Link>
                </div>
                {events.slice(0, 3).map((ev) => (
                  <div
                    key={ev._id}
                    style={s.eventRow}
                    onClick={() => navigate(`/events/${ev._id}`)}
                  >
                    <div style={s.eventIcon}>🎪</div>
                    <div style={{ flex: 1 }}>
                      <div style={s.eventName}>{ev.title}</div>
                      <div style={s.eventMeta}>
                        📅 {ev.date && format(new Date(ev.date), "MMM d")}
                        &nbsp;·&nbsp; 📍 {ev.location}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: ev.isFree ? "var(--success)" : "var(--primary)",
                      }}
                    >
                      {ev.isFree
                        ? "FREE"
                        : `₹${ev.ticketTiers?.[0]?.price || 0}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const s = {
  header: { background: "var(--gradient-primary)", padding: "2rem 0" },
  headerInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "4px",
  },
  headerSub: { fontSize: "14px", color: "rgba(255,255,255,.75)" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "20px",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "var(--r-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    margin: "0 auto 12px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "4px",
  },
  statLabel: { fontSize: "12px", color: "var(--text-secondary)" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem",
    boxShadow: "var(--shadow-sm)",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "var(--text-primary)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  viewAll: { fontSize: "13px", color: "var(--primary)", fontWeight: 500 },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  quickAction: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px 12px",
    background: "var(--bg-secondary)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    transition: "all .2s",
    textDecoration: "none",
  },
  quickActionIcon: { fontSize: "24px" },
  quickActionLabel: {
    fontSize: "12px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    textAlign: "center",
  },
  ticketRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid var(--border-light)",
    cursor: "pointer",
  },
  ticketIcon: { fontSize: "24px", flexShrink: 0 },
  ticketName: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  ticketMeta: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    marginBottom: "2px",
  },
  ticketRef: {
    fontSize: "10px",
    color: "var(--primary)",
    fontWeight: 600,
    letterSpacing: ".05em",
  },
  ticketStatus: {
    fontSize: "13px",
    fontWeight: 700,
    color: "var(--primary)",
    flexShrink: 0,
  },
  eventRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderBottom: "1px solid var(--border-light)",
    cursor: "pointer",
  },
  eventIcon: { fontSize: "20px", flexShrink: 0 },
  eventName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  eventMeta: { fontSize: "11px", color: "var(--text-secondary)" },
  loading: {
    textAlign: "center",
    color: "var(--text-secondary)",
    padding: "2rem",
  },
  empty: {
    textAlign: "center",
    color: "var(--text-secondary)",
    padding: "2rem",
  },
};
