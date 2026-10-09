import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { format } from "date-fns";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function MyTickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/bookings/my-tickets")
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Cancel this ticket? This cannot be undone.")) return;
    try {
      await api.post(`/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.msg || "Error cancelling ticket");
    }
  };

  const now = new Date();
  const filtered = bookings.filter((b) => {
    const eventDate = new Date(b.event?.date);
    if (tab === "upcoming") return eventDate >= now && b.status === "active";
    if (tab === "past") return eventDate < now || b.status === "used";
    if (tab === "cancelled") return b.status === "cancelled";
    return true;
  });

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
          style={{ maxWidth: "680px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <h1 style={s.title}>My Tickets</h1>

          {/* Tabs */}
          <div style={s.tabs}>
            {[
              { key: "upcoming", label: "Upcoming" },
              { key: "past", label: "Past" },
              { key: "cancelled", label: "Cancelled" },
            ].map((t) => (
              <button
                key={t.key}
                style={{ ...s.tab, ...(tab === t.key ? s.tabActive : {}) }}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span style={s.tabCount}>
                  {
                    bookings.filter((b) => {
                      const d = new Date(b.event?.date);
                      if (t.key === "upcoming")
                        return d >= now && b.status === "active";
                      if (t.key === "past")
                        return d < now || b.status === "used";
                      if (t.key === "cancelled")
                        return b.status === "cancelled";
                    }).length
                  }
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex-center" style={{ padding: "4rem" }}>
              <p>Loading tickets...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={s.empty}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎟</div>
              <h3>No {tab} tickets</h3>
              <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
                {tab === "upcoming"
                  ? "You haven't booked any upcoming events yet."
                  : `No ${tab} tickets found.`}
              </p>
              {tab === "upcoming" && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "16px" }}
                  onClick={() => navigate("/events")}
                >
                  Browse Events
                </button>
              )}
            </div>
          ) : (
            filtered.map((booking) => {
              const isExpanded = expandedId === booking._id;
              const isPast = new Date(booking.event?.date) < now;

              return (
                <div key={booking._id} style={s.ticketCard}>
                  {/* Ticket header */}
                  <div style={s.ticketTop}>
                    <div style={s.ticketBanner}>
                      {booking.event?.banner ? (
                        <img
                          src={booking.event.banner}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            background: "var(--gradient-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "24px",
                          }}
                        >
                          🎪
                        </div>
                      )}
                    </div>
                    <div style={s.ticketInfo}>
                      <div style={s.ticketRef}>{booking.bookingRef}</div>
                      <div
                        style={s.ticketEventName}
                        onClick={() =>
                          navigate(`/events/${booking.event?._id}`)
                        }
                      >
                        {booking.event?.title}
                      </div>
                      <div style={s.ticketMeta}>
                        📅{" "}
                        {booking.event?.date &&
                          format(
                            new Date(booking.event.date),
                            "MMM d, yyyy · h:mm a",
                          )}
                      </div>
                      <div style={s.ticketMeta}>
                        📍 {booking.event?.location}
                      </div>
                      <div style={s.ticketMeta}>
                        🎫 {booking.ticketTier} × {booking.quantity} ·&nbsp;
                        <strong>
                          {booking.totalAmount === 0
                            ? "FREE"
                            : `₹${booking.totalAmount}`}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Status row */}
                  <div style={s.statusRow}>
                    <span
                      style={{
                        ...s.statusBadge,
                        background:
                          booking.status === "cancelled"
                            ? "#FEE2E2"
                            : booking.isCheckedIn
                              ? "#D1FAE5"
                              : "#EEF2FF",
                        color:
                          booking.status === "cancelled"
                            ? "#991B1B"
                            : booking.isCheckedIn
                              ? "#065F46"
                              : "#4338CA",
                      }}
                    >
                      {booking.status === "cancelled"
                        ? "❌ Cancelled"
                        : booking.isCheckedIn
                          ? "✅ Checked In"
                          : "🎟 Valid"}
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : booking._id)
                        }
                      >
                        {isExpanded ? "Hide QR" : "Show QR"}
                      </button>
                      {booking.status === "active" &&
                        !isPast &&
                        !booking.isCheckedIn && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(booking._id)}
                          >
                            Cancel
                          </button>
                        )}
                    </div>
                  </div>

                  {/* Expanded QR */}
                  {isExpanded && (
                    <div style={s.qrExpanded} className="fade-in">
                      <div style={s.qrBox}>
                        <QRCodeSVG
                          value={JSON.stringify({
                            bookingRef: booking.bookingRef,
                            eventId: booking.event?._id,
                          })}
                          size={180}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      <p style={s.qrNote}>
                        Show this QR code at the entrance for check-in
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { fontSize: "28px", fontWeight: 800, marginBottom: "1.5rem" },
  tabs: { display: "flex", gap: "8px", marginBottom: "1.5rem" },
  tab: {
    padding: "8px 18px",
    borderRadius: "var(--r-full)",
    border: "1.5px solid var(--border)",
    background: "var(--bg-card)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all .2s",
  },
  tabActive: {
    background: "var(--primary)",
    color: "#fff",
    borderColor: "var(--primary)",
  },
  tabCount: {
    background: "rgba(255,255,255,.25)",
    borderRadius: "99px",
    padding: "1px 7px",
    fontSize: "11px",
  },
  empty: { textAlign: "center", padding: "4rem 0" },
  ticketCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    marginBottom: "16px",
    overflow: "hidden",
    boxShadow: "var(--shadow-sm)",
  },
  ticketTop: { display: "flex", gap: "0", overflow: "hidden" },
  ticketBanner: { width: "100px", flexShrink: 0, minHeight: "120px" },
  ticketInfo: { flex: 1, padding: "16px" },
  ticketRef: {
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--primary)",
    letterSpacing: ".08em",
    marginBottom: "4px",
  },
  ticketEventName: {
    fontSize: "15px",
    fontWeight: 700,
    marginBottom: "6px",
    cursor: "pointer",
    color: "var(--text-primary)",
  },
  ticketMeta: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "3px",
  },
  statusRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    borderTop: "1px solid var(--border-light)",
    background: "var(--bg-secondary)",
  },
  statusBadge: {
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "99px",
  },
  qrExpanded: {
    padding: "20px",
    textAlign: "center",
    borderTop: "1px solid var(--border)",
  },
  qrBox: {
    display: "inline-block",
    padding: "12px",
    background: "#fff",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    marginBottom: "10px",
  },
  qrNote: { fontSize: "13px", color: "var(--text-secondary)" },
};
