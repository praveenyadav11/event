import { Link } from "react-router-dom";

const CATEGORY_COLORS = {
  Tech: { bg: "#EEF2FF", color: "#4338CA" },
  Music: { bg: "#FDF4FF", color: "#7E22CE" },
  Sports: { bg: "#F0FDF4", color: "#15803D" },
  Art: { bg: "#FFF7ED", color: "#C2410C" },
  Business: { bg: "#EFF6FF", color: "#1D4ED8" },
  Food: { bg: "#FEF2F2", color: "#DC2626" },
  default: { bg: "#F8FAFC", color: "#475569" },
};

export default function EventCard({ event, size = "md" }) {
  const isLg = size === "lg";
  const cc = CATEGORY_COLORS[event?.category] || CATEGORY_COLORS.default;
  const spotsLeft = (event?.capacity || 0) - (event?.bookedCount || 0);
  const isFull = spotsLeft <= 0;

  return (
    <Link
      to={`/events/${event?._id || "#"}`}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          ...s.card,
          ...(isLg ? s.cardLg : {}),
        }}
      >
        {/* Banner */}
        <div style={{ ...s.banner, height: isLg ? "220px" : "160px" }}>
          {event?.banner ? (
            <img
              src={event.banner}
              alt={event.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                ...s.bannerPlaceholder,
                background: "var(--gradient-hero)",
              }}
            >
              <span style={{ fontSize: isLg ? "48px" : "36px" }}>🎪</span>
            </div>
          )}
          {/* Category badge */}
          <span
            style={{ ...s.categoryBadge, background: cc.bg, color: cc.color }}
          >
            {event?.category || "Event"}
          </span>
          {/* Price badge */}
          <span style={s.priceBadge}>
            {event?.ticketPrice === 0
              ? "FREE"
              : `₹${event?.ticketPrice || "—"}`}
          </span>
        </div>

        {/* Content */}
        <div style={s.content}>
          <h3 style={{ ...s.title, fontSize: isLg ? "18px" : "15px" }}>
            {event?.title || "Event Title"}
          </h3>

          <div style={s.meta}>
            <span style={s.metaItem}>
              📅{" "}
              {event?.date
                ? new Date(event.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Date TBD"}
            </span>
            <span style={s.metaItem}>
              📍 {event?.location || "Location TBD"}
            </span>
          </div>

          <div style={s.footer}>
            <div style={s.organizer}>
              <div style={{ ...s.orgAvatar }}>
                {event?.organizer?.name?.charAt(0) || "O"}
              </div>
              <span style={s.orgName}>
                {event?.organizer?.name || "Organizer"}
              </span>
            </div>
            <div
              style={{
                ...s.seats,
                color: isFull
                  ? "var(--danger)"
                  : spotsLeft < 20
                    ? "var(--warning)"
                    : "var(--success)",
              }}
            >
              {isFull ? "🔴 Full" : `🟢 ${spotsLeft} left`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

const s = {
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    transition: "all .25s ease",
    cursor: "pointer",
    display: "block",
  },
  cardLg: { boxShadow: "var(--shadow-md)" },
  banner: {
    position: "relative",
    overflow: "hidden",
    background: "var(--bg-secondary)",
  },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    fontSize: "11px",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: "99px",
  },
  priceBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 10px",
    borderRadius: "99px",
    background: "rgba(0,0,0,.6)",
    color: "#fff",
    backdropFilter: "blur(4px)",
  },
  content: { padding: "14px 16px" },
  title: {
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "8px",
    lineHeight: 1.4,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  meta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "12px",
  },
  metaItem: { fontSize: "12px", color: "var(--text-secondary)" },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "10px",
    borderTop: "1px solid var(--border-light)",
  },
  organizer: { display: "flex", alignItems: "center", gap: "6px" },
  orgAvatar: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "var(--gradient-primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 700,
  },
  orgName: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  seats: { fontSize: "12px", fontWeight: 500 },
};
