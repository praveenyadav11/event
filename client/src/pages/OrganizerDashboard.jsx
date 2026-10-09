import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#6366F1", "#10B981", "#EF4444", "#F59E0B"];

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    Promise.all([api.get("/analytics/organizer"), api.get("/events/my-events")])
      .then(([a, e]) => {
        setData(a.data);
        setEvents(e.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="page">
        <Navbar />
        <div
          className="flex-center"
          style={{ minHeight: "80vh", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ fontSize: "36px" }}>⏳</div>
          <p style={{ color: "var(--text-secondary)" }}>
            Loading your dashboard...
          </p>
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
        {/* Header */}
        <div style={s.header}>
          <div className="container">
            <div style={s.headerInner}>
              <div>
                <h1 style={s.title}>Organizer Dashboard</h1>
                <p style={s.sub}>Welcome back, {user?.name?.split(" ")[0]}!</p>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate("/create-event")}
              >
                + Create Event
              </button>
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: "2rem 1.5rem" }}>
          {/* Summary stats */}
          <div style={s.statsGrid}>
            {[
              {
                icon: "🎪",
                label: "Total Events",
                value: data?.summary?.totalEvents || 0,
                color: "#6366F1",
                sub: "events created",
              },
              {
                icon: "🎫",
                label: "Total Bookings",
                value: data?.summary?.totalBookings || 0,
                color: "#8B5CF6",
                sub: "tickets sold",
              },
              {
                icon: "💰",
                label: "Total Revenue",
                value: `₹${data?.summary?.totalRevenue || 0}`,
                color: "#10B981",
                sub: "earned",
              },
              {
                icon: "✅",
                label: "Check-ins",
                value: data?.summary?.totalCheckedIn || 0,
                color: "#F59E0B",
                sub: "attendees",
              },
              {
                icon: "📊",
                label: "Attendance Rate",
                value: `${data?.summary?.attendanceRate || 0}%`,
                color: "#06B6D4",
                sub: "avg attendance",
              },
            ].map(({ icon, label, value, color, sub }) => (
              <div key={label} style={s.statCard}>
                <div
                  style={{ ...s.statIconWrap, background: color + "15", color }}
                >
                  {icon}
                </div>
                <div style={s.statValue}>{value}</div>
                <div style={s.statLabel}>{label}</div>
                <div style={s.statSub}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={s.tabs}>
            {[
              { key: "overview", label: "📊 Overview" },
              { key: "events", label: "🎪 My Events" },
              { key: "analytics", label: "📈 Analytics" },
            ].map((t) => (
              <button
                key={t.key}
                style={{
                  ...s.tab,
                  ...(activeTab === t.key ? s.tabActive : {}),
                }}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <div className="fade-in">
              <div style={s.chartsGrid}>
                {/* Revenue by event */}
                <div style={s.chartCard}>
                  <div style={s.chartTitle}>Revenue by Event</div>
                  {data?.revenueByEvent?.length === 0 ? (
                    <div style={s.noData}>No revenue data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data?.revenueByEvent}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="var(--border)"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                        />
                        <Tooltip
                          formatter={(val) => [`₹${val}`, "Revenue"]}
                          contentStyle={{
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="#6366F1"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Bookings over time */}
                <div style={s.chartCard}>
                  <div style={s.chartTitle}>Bookings — Last 7 Days</div>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data?.bookingsByDay}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="#8B5CF6"
                        strokeWidth={2}
                        dot={{ fill: "#8B5CF6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ ...s.chartsGrid, marginTop: "20px" }}>
                {/* Ticket status pie */}
                <div style={s.chartCard}>
                  <div style={s.chartTitle}>Ticket Status</div>
                  {data?.ticketStatus?.every((t) => t.value === 0) ? (
                    <div style={s.noData}>No tickets sold yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data?.ticketStatus}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) =>
                            value > 0 ? `${name}: ${value}` : ""
                          }
                        >
                          {data?.ticketStatus?.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Category breakdown */}
                <div style={s.chartCard}>
                  <div style={s.chartTitle}>Events by Category</div>
                  {data?.categoryBreakdown?.length === 0 ? (
                    <div style={s.noData}>No events yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={data?.categoryBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {data?.categoryBreakdown?.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS TAB ── */}
          {activeTab === "events" && (
            <div className="fade-in">
              {events.length === 0 ? (
                <div style={s.emptyEvents}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                    🎪
                  </div>
                  <h3>No events yet</h3>
                  <p
                    style={{ color: "var(--text-secondary)", marginTop: "8px" }}
                  >
                    Create your first event to get started
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: "16px" }}
                    onClick={() => navigate("/create-event")}
                  >
                    + Create Event
                  </button>
                </div>
              ) : (
                <div style={s.eventsTable}>
                  {/* Table header */}
                  <div style={s.tableHeader}>
                    <span style={{ flex: 3 }}>Event</span>
                    <span style={{ flex: 1, textAlign: "center" }}>Date</span>
                    <span style={{ flex: 1, textAlign: "center" }}>
                      Bookings
                    </span>
                    <span style={{ flex: 1, textAlign: "center" }}>
                      Revenue
                    </span>
                    <span style={{ flex: 1, textAlign: "center" }}>Status</span>
                    <span style={{ flex: 1, textAlign: "center" }}>
                      Actions
                    </span>
                  </div>

                  {events.map((ev) => {
                    const evData = data?.revenueByEvent?.find(
                      (r) => r.fullTitle === ev.title,
                    );
                    return (
                      <div key={ev._id} style={s.tableRow}>
                        <div style={{ flex: 3 }}>
                          <div style={s.evTitle}>{ev.title}</div>
                          <div style={s.evCategory}>{ev.category}</div>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {ev.date &&
                            new Date(ev.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--primary)",
                          }}
                        >
                          {evData?.bookings || ev.bookedCount || 0}
                        </div>
                        <div
                          style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "var(--success)",
                          }}
                        >
                          ₹{evData?.revenue || 0}
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                          <span
                            style={{
                              ...s.statusBadge,
                              background:
                                ev.status === "published"
                                  ? "#D1FAE5"
                                  : "#FEF3C7",
                              color:
                                ev.status === "published"
                                  ? "#065F46"
                                  : "#92400E",
                            }}
                          >
                            {ev.status}
                          </span>
                        </div>
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate(`/events/${ev._id}`)}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: "#10B981",
                              color: "#fff",
                              border: "none",
                              borderRadius: "var(--r-sm)",
                              padding: "5px 10px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                            onClick={() => navigate(`/checkin/${ev._id}`)}
                          >
                            QR
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === "analytics" && (
            <div className="fade-in">
              <div style={s.analyticsGrid}>
                {data?.revenueByEvent?.map((ev, i) => (
                  <div key={i} style={s.analyticsCard}>
                    <div style={s.analyticsEventName}>{ev.fullTitle}</div>
                    <div style={s.analyticsStats}>
                      <div style={s.analyticsStat}>
                        <div style={s.analyticsStatVal}>₹{ev.revenue}</div>
                        <div style={s.analyticsStatLabel}>Revenue</div>
                      </div>
                      <div style={s.analyticsStat}>
                        <div style={s.analyticsStatVal}>{ev.bookings}</div>
                        <div style={s.analyticsStatLabel}>Booked</div>
                      </div>
                      <div style={s.analyticsStat}>
                        <div style={s.analyticsStatVal}>{ev.checkedIn}</div>
                        <div style={s.analyticsStatLabel}>Checked In</div>
                      </div>
                      <div style={s.analyticsStat}>
                        <div
                          style={{
                            ...s.analyticsStatVal,
                            color: "var(--success)",
                          }}
                        >
                          {ev.bookings > 0
                            ? Math.round((ev.checkedIn / ev.bookings) * 100)
                            : 0}
                          %
                        </div>
                        <div style={s.analyticsStatLabel}>Attendance</div>
                      </div>
                    </div>
                    {/* Mini progress bar */}
                    <div style={s.miniBar}>
                      <div
                        style={{
                          ...s.miniBarFill,
                          width:
                            ev.bookings > 0
                              ? `${Math.round((ev.checkedIn / ev.bookings) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(!data?.revenueByEvent ||
                  data.revenueByEvent.length === 0) && (
                  <div style={{ ...s.emptyEvents, gridColumn: "1/-1" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                      📊
                    </div>
                    <h3>No analytics yet</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                      Create events and get bookings to see analytics
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
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
  title: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "4px",
  },
  sub: { fontSize: "14px", color: "rgba(255,255,255,.75)" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5,1fr)",
    gap: "14px",
    marginBottom: "24px",
  },
  statCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "18px",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  statIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "var(--r-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    margin: "0 auto 10px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  statLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  statSub: { fontSize: "11px", color: "var(--text-tertiary)" },
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
    transition: "all .2s",
  },
  tabActive: {
    background: "var(--primary)",
    color: "#fff",
    borderColor: "var(--primary)",
  },
  chartsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  chartCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem",
    boxShadow: "var(--shadow-sm)",
  },
  chartTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "16px",
    color: "var(--text-primary)",
  },
  noData: {
    textAlign: "center",
    color: "var(--text-tertiary)",
    padding: "3rem 0",
    fontSize: "14px",
  },
  eventsTable: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 16px",
    background: "var(--bg-secondary)",
    borderBottom: "1px solid var(--border)",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },
  tableRow: {
    display: "flex",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid var(--border-light)",
    transition: "background .15s",
  },
  evTitle: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  evCategory: { fontSize: "11px", color: "var(--text-tertiary)" },
  statusBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "99px",
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  analyticsCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.25rem",
    boxShadow: "var(--shadow-sm)",
  },
  analyticsEventName: {
    fontSize: "14px",
    fontWeight: 600,
    marginBottom: "14px",
    color: "var(--text-primary)",
  },
  analyticsStats: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "8px",
    marginBottom: "12px",
  },
  analyticsStat: { textAlign: "center" },
  analyticsStatVal: {
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--primary)",
    marginBottom: "2px",
  },
  analyticsStatLabel: {
    fontSize: "10px",
    color: "var(--text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: ".05em",
  },
  miniBar: {
    height: "4px",
    background: "var(--bg-secondary)",
    borderRadius: "99px",
    overflow: "hidden",
  },
  miniBarFill: {
    height: "100%",
    background: "var(--gradient-primary)",
    borderRadius: "99px",
    transition: "width .5s ease",
  },
  emptyEvents: { textAlign: "center", padding: "4rem 0" },
};
