import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, isPast } from "date-fns";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";


// Countdown timer component
function Countdown({ date }) {
  const [timeLeft, setTimeLeft] = useState({});
const navigate = useNavigate();

  useEffect(() => {
    const calc = () => {
      const diff = new Date(date) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [date]);

  if (timeLeft.expired)
    return (
      <div style={s.countdownWrap}>
        <span style={{ color: "var(--danger)", fontWeight: 600 }}>
          Event has ended
        </span>
      </div>
    );

  return (
    <div style={s.countdownWrap}>
      <div style={s.countdownLabel}>Event starts in</div>
      <div style={s.countdownGrid}>
        {[
          { val: timeLeft.days, label: "Days" },
          { val: timeLeft.hours, label: "Hours" },
          { val: timeLeft.minutes, label: "Mins" },
          { val: timeLeft.seconds, label: "Secs" },
        ].map(({ val, label }) => (
          <div key={label} style={s.countdownBox}>
            <div style={s.countdownNum}>{String(val).padStart(2, "0")}</div>
            <div style={s.countdownUnit}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data);
        if (user) setBookmarked(res.data.bookmarks?.includes(user.id));
      })
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookmark = async () => {
    if (!user) return navigate("/login");
    try {
      const res = await api.post(`/events/${id}/bookmark`);
      setBookmarked(res.data.bookmarked);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="page">
        <Navbar />
        <div style={{ padding: "8rem 0", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <p style={{ color: "var(--text-secondary)" }}>Loading event...</p>
        </div>
      </div>
    );

  if (!event) return null;

  const spotsLeft = event.capacity - event.bookedCount;
  const isFull = spotsLeft <= 0;
  const isPastEvent = isPast(new Date(event.date));
  const cheapestTier =
    event.ticketTiers?.length > 0
      ? Math.min(...event.ticketTiers.map((t) => t.price))
      : 0;

  return (
    <div className="page">
      <Navbar />

      {/* Banner */}
      <div style={s.banner}>
        {event.banner ? (
          <img src={event.banner} alt={event.title} style={s.bannerImg} />
        ) : (
          <div style={s.bannerPlaceholder}>
            <span style={{ fontSize: "80px" }}>🎪</span>
          </div>
        )}
        <div style={s.bannerOverlay} />
        <div style={s.bannerContent}>
          <span style={s.categoryBadge}>{event.category}</span>
          <h1 style={s.bannerTitle}>{event.title}</h1>
          <div style={s.bannerMeta}>
            <span>
              📅 {format(new Date(event.date), "EEE, MMM d yyyy · h:mm a")}
            </span>
            <span>📍 {event.location}</span>
            <span>👁 {event.views} views</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <div style={s.layout}>
          {/* Left — event info */}
          <div style={{ flex: 1 }}>
            {/* Tabs */}
            <div style={s.tabs}>
              {["about", "schedule", "speakers"].map((tab) => (
                <button
                  key={tab}
                  style={{
                    ...s.tab,
                    ...(activeTab === tab ? s.tabActive : {}),
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* About */}
            {activeTab === "about" && (
              <div className="fade-in">
                <div style={s.card}>
                  <h3 style={s.cardTitle}>About this event</h3>
                  <p style={s.desc}>{event.description}</p>

                  {/* Tags */}
                  {event.tags?.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginTop: "16px",
                      }}
                    >
                      {event.tags.map((tag) => (
                        <span key={tag} className="badge badge-primary">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event details */}
                <div style={{ ...s.card, marginTop: "16px" }}>
                  <h3 style={s.cardTitle}>Event Details</h3>
                  <div style={s.detailGrid}>
                    {[
                      {
                        icon: "📅",
                        label: "Date",
                        value: format(
                          new Date(event.date),
                          "EEEE, MMMM d, yyyy",
                        ),
                      },
                      {
                        icon: "⏰",
                        label: "Time",
                        value:
                          format(new Date(event.date), "h:mm a") +
                          (event.endDate
                            ? ` – ${format(new Date(event.endDate), "h:mm a")}`
                            : ""),
                      },
                      {
                        icon: "📍",
                        label: "Venue",
                        value: event.venue || event.location,
                      },
                      {
                        icon: "🎟",
                        label: "Capacity",
                        value: `${event.capacity} total · ${spotsLeft} spots left`,
                      },
                      {
                        icon: "👥",
                        label: "Team Size",
                        value:
                          event.teamSize > 1
                            ? `Up to ${event.teamSize} members`
                            : "Individual",
                      },
                      { icon: "🏷", label: "Category", value: event.category },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={s.detailItem}>
                        <span style={s.detailIcon}>{icon}</span>
                        <div>
                          <div style={s.detailLabel}>{label}</div>
                          <div style={s.detailValue}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organizer */}
                <div style={{ ...s.card, marginTop: "16px" }}>
                  <h3 style={s.cardTitle}>Organizer</h3>
                  <div style={s.organizer}>
                    <div style={{ ...s.orgAvatar }}>
                      {event.organizer?.avatar ? (
                        <img
                          src={event.organizer.avatar}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        event.organizer?.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <div style={s.orgName}>{event.organizer?.name}</div>
                      {event.organizer?.college && (
                        <div style={s.orgCollege}>
                          🎓 {event.organizer.college}
                        </div>
                      )}
                      {event.organizer?.bio && (
                        <p style={s.orgBio}>{event.organizer.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}
            {activeTab === "schedule" && (
              <div className="fade-in">
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Event Schedule</h3>
                  {event.schedule?.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                      }}
                    >
                      Schedule not yet published.
                    </p>
                  ) : (
                    <div style={s.timeline}>
                      {event.schedule?.map((item, i) => (
                        <div key={i} style={s.timelineItem}>
                          <div style={s.timelineDot} />
                          {i < event.schedule.length - 1 && (
                            <div style={s.timelineLine} />
                          )}
                          <div style={s.timelineContent}>
                            <div style={s.timelineTime}>{item.time}</div>
                            <div style={s.timelineTitle}>{item.title}</div>
                            {item.speaker && (
                              <div style={s.timelineSpeaker}>
                                🎤 {item.speaker}
                              </div>
                            )}
                            {item.description && (
                              <div style={s.timelineDesc}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Speakers */}
            {activeTab === "speakers" && (
              <div className="fade-in">
                <div style={s.card}>
                  <h3 style={s.cardTitle}>Speakers</h3>
                  {event.speakers?.length === 0 ? (
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                      }}
                    >
                      Speakers not yet announced.
                    </p>
                  ) : (
                    <div style={s.speakersGrid}>
                      {event.speakers?.map((sp, i) => (
                        <div key={i} style={s.speakerCard}>
                          <div style={s.speakerAvatar}>
                            {sp.avatar ? (
                              <img
                                src={sp.avatar}
                                alt={sp.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              sp.name?.charAt(0)
                            )}
                          </div>
                          <div style={s.speakerName}>{sp.name}</div>
                          <div style={s.speakerRole}>{sp.role}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right — booking sidebar */}

          <div style={s.sidebar}>
            {/* Countdown */}
            {!isPastEvent && <Countdown date={event.date} />}

            {/* Ticket tiers */}
            <div style={s.bookingCard}>
              <div style={s.bookingHeader}>
                <div>
                  <div style={s.price}>
                    {event.isFree ? (
                      <span style={{ color: "var(--success)" }}>FREE</span>
                    ) : (
                      <>
                        ₹{cheapestTier}
                        <span style={s.priceSub}> onwards</span>
                      </>
                    )}
                  </div>
                  <div style={s.spotsLeft}>
                    {isFull ? (
                      <span style={{ color: "var(--danger)" }}>
                        🔴 Sold out
                      </span>
                    ) : (
                      <span
                        style={{
                          color:
                            spotsLeft < 20
                              ? "var(--warning)"
                              : "var(--success)",
                        }}
                      >
                        🟢 {spotsLeft} spots left
                      </span>
                    )}
                  </div>
                </div>
                <div style={s.shareBtn}>
                  <button
                    style={s.iconActionBtn}
                    onClick={handleBookmark}
                    title={bookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    {bookmarked ? "🔖" : "🏷️"}
                  </button>
                  <button
                    style={s.iconActionBtn}
                    onClick={() =>
                      navigator.share?.({
                        title: event.title,
                        url: window.location.href,
                      })
                    }
                    title="Share"
                  >
                    📤
                  </button>
                </div>
              </div>

              {/* Ticket tier selector */}
              {event.ticketTiers?.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={s.tierLabel}>Select ticket type</div>
                  {event.ticketTiers.map((tier, i) => {
                    const tierSpotsLeft = tier.quantity - tier.sold;
                    return (
                      <div
                        key={i}
                        style={{
                          ...s.tierCard,
                          ...(selectedTier === i ? s.tierCardActive : {}),
                          ...(tierSpotsLeft === 0 ? s.tierCardFull : {}),
                        }}
                        onClick={() => tierSpotsLeft > 0 && setSelectedTier(i)}
                      >
                        <div style={s.tierInfo}>
                          <div style={s.tierName}>{tier.name}</div>
                          <div style={s.tierDesc}>{tier.description}</div>
                          {tier.perks?.map((perk) => (
                            <div key={perk} style={s.tierPerk}>
                              ✓ {perk}
                            </div>
                          ))}
                        </div>
                        <div style={s.tierRight}>
                          <div style={s.tierPrice}>
                            {tier.price === 0 ? "FREE" : `₹${tier.price}`}
                          </div>
                          <div style={s.tierSpots}>
                            {tierSpotsLeft === 0
                              ? "Sold out"
                              : `${tierSpotsLeft} left`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Book button */}
              {isPastEvent ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                    padding: "12px",
                  }}
                >
                  This event has already ended
                </div>
              ) : isFull ? (
                <button
                  className="btn btn-full"
                  style={{
                    background: "var(--bg-secondary)",
                    color: "var(--text-tertiary)",
                    cursor: "not-allowed",
                    padding: "14px",
                  }}
                  disabled
                >
                  Sold Out
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={() => {
                    if (!user) return navigate("/login");
                    navigate(`/booking/${event._id}?tier=${selectedTier}`);
                  }}
                >
                  {event.isFree ? "🎟 Register Free" : "🎟 Book Tickets"}
                </button>
              )}

              <div style={s.bookingNote}>🔒 Secure checkout via Razorpay</div>

              {/* ADD THIS BLOCK RIGHT HERE */}
              {user && String(event.organizer?._id) === String(user.id) && (
                <button
                  className="btn btn-full"
                  style={{
                    background: "#10B981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--r-md)",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                  onClick={() => navigate(`/checkin/${event._id}`)}
                >
                  📷 Open QR Scanner
                </button>
              )}
            </div>

            {/* Location */}
            {!event.isOnline && event.location && (
              <div style={s.locationCard}>
                <h4 style={s.locationTitle}>📍 Location</h4>
                <p style={s.locationText}>
                  {event.venue && `${event.venue}, `}
                  {event.location}
                </p>

                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.venue + " " + event.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: "10px", display: "inline-flex" }}
                >
                  Open in Maps →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const s = {
  // Banner
  banner: {
    position: "relative",
    height: "420px",
    overflow: "hidden",
    marginTop: "68px",
  },
  bannerImg: { width: "100%", height: "100%", objectFit: "cover" },
  bannerPlaceholder: {
    width: "100%",
    height: "100%",
    background: "var(--gradient-hero)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(0,0,0,.8) 0%, rgba(0,0,0,.2) 60%, transparent 100%)",
  },
  bannerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "2rem 3rem",
  },
  categoryBadge: {
    display: "inline-block",
    background: "var(--primary)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "99px",
    marginBottom: "12px",
  },
  bannerTitle: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "12px",
    lineHeight: 1.25,
  },
  bannerMeta: {
    display: "flex",
    gap: "20px",
    color: "rgba(255,255,255,.8)",
    fontSize: "13px",
    flexWrap: "wrap",
  },

  // Layout
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "2rem",
    alignItems: "start",
  },

  // Tabs
  tabs: {
    display: "flex",
    gap: "4px",
    marginBottom: "20px",
    background: "var(--bg-secondary)",
    padding: "4px",
    borderRadius: "var(--r-md)",
    width: "fit-content",
  },
  tab: {
    padding: "8px 20px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: "transparent",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all .2s",
  },
  tabActive: {
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    boxShadow: "var(--shadow-sm)",
  },

  // Cards
  card: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem",
  },
  cardTitle: { fontSize: "18px", fontWeight: 600, marginBottom: "16px" },
  desc: { fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.8 },

  // Details
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  detailItem: { display: "flex", alignItems: "flex-start", gap: "10px" },
  detailIcon: { fontSize: "18px", flexShrink: 0 },
  detailLabel: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".05em",
    marginBottom: "2px",
  },
  detailValue: {
    fontSize: "13px",
    color: "var(--text-primary)",
    fontWeight: 500,
  },

  // Organizer
  organizer: { display: "flex", gap: "14px", alignItems: "flex-start" },
  orgAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "var(--gradient-primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "20px",
    flexShrink: 0,
  },
  orgName: { fontSize: "16px", fontWeight: 600, marginBottom: "2px" },
  orgCollege: {
    fontSize: "12px",
    color: "var(--text-tertiary)",
    marginBottom: "6px",
  },
  orgBio: { fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6 },

  // Timeline
  timeline: { position: "relative" },
  timelineItem: {
    display: "flex",
    gap: "16px",
    paddingBottom: "24px",
    position: "relative",
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "var(--primary)",
    flexShrink: 0,
    marginTop: "4px",
  },
  timelineLine: {
    position: "absolute",
    left: "5px",
    top: "16px",
    bottom: "0",
    width: "2px",
    background: "var(--border)",
  },
  timelineContent: { flex: 1 },
  timelineTime: {
    fontSize: "12px",
    color: "var(--primary)",
    fontWeight: 600,
    marginBottom: "2px",
  },
  timelineTitle: { fontSize: "14px", fontWeight: 600, marginBottom: "2px" },
  timelineSpeaker: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "4px",
  },
  timelineDesc: {
    fontSize: "13px",
    color: "var(--text-tertiary)",
    lineHeight: 1.5,
  },

  // Speakers
  speakersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "16px",
  },
  speakerCard: { textAlign: "center", padding: "16px" },
  speakerAvatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "var(--gradient-primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "24px",
    margin: "0 auto 10px",
  },
  speakerName: { fontSize: "14px", fontWeight: 600, marginBottom: "2px" },
  speakerRole: { fontSize: "12px", color: "var(--text-secondary)" },

  // Sidebar
  sidebar: {
    position: "sticky",
    top: "80px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  // Countdown
  countdownWrap: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.25rem",
    textAlign: "center",
  },
  countdownLabel: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "12px",
    fontWeight: 500,
  },
  countdownGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "8px",
  },
  countdownBox: {
    background: "var(--gradient-primary)",
    borderRadius: "var(--r-sm)",
    padding: "10px 4px",
  },
  countdownNum: { fontSize: "22px", fontWeight: 800, color: "#fff" },
  countdownUnit: {
    fontSize: "10px",
    color: "rgba(255,255,255,.7)",
    textTransform: "uppercase",
    letterSpacing: ".05em",
  },

  // Booking card
  bookingCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem",
    boxShadow: "var(--shadow-md)",
  },
  bookingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  price: { fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" },
  priceSub: {
    fontSize: "14px",
    fontWeight: 400,
    color: "var(--text-tertiary)",
  },
  spotsLeft: { fontSize: "13px", fontWeight: 500, marginTop: "4px" },
  shareBtn: { display: "flex", gap: "6px" },
  iconActionBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--border)",
    background: "var(--bg)",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tierLabel: {
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },
  tierCard: {
    border: "2px solid var(--border)",
    borderRadius: "var(--r-md)",
    padding: "12px 14px",
    marginBottom: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    transition: "all .2s",
  },
  tierCardActive: {
    borderColor: "var(--primary)",
    background: "var(--primary-light)",
  },
  tierCardFull: { opacity: 0.5, cursor: "not-allowed" },
  tierInfo: { flex: 1 },
  tierName: { fontSize: "14px", fontWeight: 600, marginBottom: "2px" },
  tierDesc: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "4px",
  },
  tierPerk: { fontSize: "11px", color: "var(--success)", fontWeight: 500 },
  tierRight: { textAlign: "right", flexShrink: 0, marginLeft: "12px" },
  tierPrice: { fontSize: "16px", fontWeight: 700, color: "var(--primary)" },
  tierSpots: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    marginTop: "2px",
  },
  bookingNote: {
    textAlign: "center",
    fontSize: "12px",
    color: "var(--text-tertiary)",
    marginTop: "12px",
  },

  // Location
  locationCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.25rem",
  },
  locationTitle: { fontSize: "15px", fontWeight: 600, marginBottom: "8px" },
  locationText: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
  },
};
