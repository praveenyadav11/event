import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const STEPS = [
  "Basic Info",
  "Date & Venue",
  "Tickets",
  "Schedule",
  "Preview & Publish",
];
const CATEGORIES = [
  "Tech",
  "Music",
  "Sports",
  "Art",
  "Business",
  "Food",
  "Health",
  "Comedy",
  "Other",
];

// Step indicator
function StepBar({ current }) {
  return (
    <div style={s.stepBar}>
      {STEPS.map((label, i) => (
        <div key={i} style={s.stepItem}>
          <div
            style={{
              ...s.stepDot,
              background: i <= current ? "var(--primary)" : "var(--border)",
              color: i <= current ? "#fff" : "var(--text-tertiary)",
            }}
          >
            {i < current ? "✓" : i + 1}
          </div>
          <div
            style={{
              ...s.stepLabel,
              color: i === current ? "var(--primary)" : "var(--text-tertiary)",
              fontWeight: i === current ? 600 : 400,
            }}
          >
            {label}
          </div>
          {i < STEPS.length - 1 && (
            <div
              style={{
                ...s.stepLine,
                background: i < current ? "var(--primary)" : "var(--border)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState(null);

  // Form data
  const [basic, setBasic] = useState({
    title: "",
    description: "",
    category: "Tech",
    tags: "",
  });
  const [venue, setVenue] = useState({
    date: "",
    endDate: "",
    time: "",
    venue: "",
    location: "",
    isOnline: false,
    onlineLink: "",
    capacity: 100,
    teamSize: 1,
  });
  const [tickets, setTickets] = useState([
    { name: "General", price: 0, quantity: 100, description: "", perks: "" },
  ]);
  const [schedule, setSchedule] = useState([
    { time: "09:00 AM", title: "Registration", speaker: "", description: "" },
  ]);
  const [banner, setBanner] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [publishStatus, setPublishStatus] = useState("published");

  const addTicketTier = () =>
    setTickets((t) => [
      ...t,
      { name: "", price: 0, quantity: 50, description: "", perks: "" },
    ]);
  const removeTicketTier = (i) =>
    setTickets((t) => t.filter((_, idx) => idx !== i));
  const updateTicket = (i, field, val) =>
    setTickets((t) =>
      t.map((tier, idx) => (idx === i ? { ...tier, [field]: val } : tier)),
    );

  const addScheduleItem = () =>
    setSchedule((s) => [
      ...s,
      { time: "", title: "", speaker: "", description: "" },
    ]);
  const removeScheduleItem = (i) =>
    setSchedule((s) => s.filter((_, idx) => idx !== i));
  const updateSchedule = (i, field, val) =>
    setSchedule((s) =>
      s.map((item, idx) => (idx === i ? { ...item, [field]: val } : item)),
    );

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      // Format data
      const dateStr = `${venue.date}T${venue.time || "09:00"}:00`;
      const ticketTiers = tickets.map((t) => ({
        ...t,
        price: Number(t.price),
        quantity: Number(t.quantity),
        perks: t.perks ? t.perks.split(",").map((p) => p.trim()) : [],
      }));

      const payload = {
        title: basic.title,
        description: basic.description,
        category: basic.category,
        tags: basic.tags ? basic.tags.split(",").map((t) => t.trim()) : [],
        date: dateStr,
        endDate: venue.endDate ? `${venue.endDate}T23:59:00` : undefined,
        venue: venue.venue,
        location: venue.location,
        isOnline: venue.isOnline,
        onlineLink: venue.onlineLink,
        capacity: Number(venue.capacity),
        teamSize: Number(venue.teamSize),
        ticketTiers,
        isFree: tickets.every((t) => Number(t.price) === 0),
        schedule,
        status: publishStatus,
      };

      const res = await api.post("/events", payload);
      const eventId = res.data._id;
      setCreatedId(eventId);

      // Upload banner if selected
      if (banner) {
        const formData = new FormData();
        formData.append("banner", banner);
        await api.post(`/events/${eventId}/banner`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate(`/events/${eventId}`);
    } catch (err) {
      setError(err.response?.data?.msg || "Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div
        style={{
          paddingTop: "88px",
          paddingBottom: "4rem",
          background: "var(--bg)",
        }}
      >
        <div
          style={{ maxWidth: "760px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <h1 style={s.pageTitle}>Create New Event</h1>
          <p style={s.pageSub}>Fill in the details to publish your event</p>

          <StepBar current={step} />

          <div style={s.formCard}>
            {/* STEP 0 — Basic Info */}
            {step === 0 && (
              <div className="fade-in">
                <h2 style={s.stepTitle}>Basic Information</h2>

                <div className="input-group">
                  <label className="input-label">Event Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. TechFest 2024 — National Hackathon"
                    value={basic.title}
                    onChange={(e) =>
                      setBasic({ ...basic, title: e.target.value })
                    }
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Description *</label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="Describe your event — what will attendees experience, learn, or enjoy?"
                    value={basic.description}
                    onChange={(e) =>
                      setBasic({ ...basic, description: e.target.value })
                    }
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="input-group">
                    <label className="input-label">Category *</label>
                    <select
                      className="input"
                      value={basic.category}
                      onChange={(e) =>
                        setBasic({ ...basic, category: e.target.value })
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">
                      Tags (comma separated)
                    </label>
                    <input
                      className="input"
                      placeholder="hackathon, coding, AI"
                      value={basic.tags}
                      onChange={(e) =>
                        setBasic({ ...basic, tags: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Banner upload */}
                <div className="input-group">
                  <label className="input-label">Event Banner</label>
                  <div style={s.bannerUpload}>
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "var(--r-md)",
                        }}
                      />
                    ) : (
                      <div style={s.bannerPlaceholder}>
                        <span style={{ fontSize: "32px" }}>🖼</span>
                        <p
                          style={{
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            marginTop: "8px",
                          }}
                        >
                          Click to upload banner (1200×600px recommended)
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 — Date & Venue */}
            {step === 1 && (
              <div className="fade-in">
                <h2 style={s.stepTitle}>Date & Venue</h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="input-group">
                    <label className="input-label">Start Date *</label>
                    <input
                      className="input"
                      type="date"
                      value={venue.date}
                      onChange={(e) =>
                        setVenue({ ...venue, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Start Time</label>
                    <input
                      className="input"
                      type="time"
                      value={venue.time}
                      onChange={(e) =>
                        setVenue({ ...venue, time: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">End Date (optional)</label>
                    <input
                      className="input"
                      type="date"
                      value={venue.endDate}
                      onChange={(e) =>
                        setVenue({ ...venue, endDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Total Capacity *</label>
                    <input
                      className="input"
                      type="number"
                      min="1"
                      value={venue.capacity}
                      onChange={(e) =>
                        setVenue({ ...venue, capacity: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Online toggle */}
                <div style={s.toggleRow}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500 }}>
                      Online Event
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Event will be held virtually
                    </div>
                  </div>
                  <button
                    style={{
                      ...s.toggle,
                      background: venue.isOnline
                        ? "var(--primary)"
                        : "var(--border)",
                    }}
                    onClick={() =>
                      setVenue({ ...venue, isOnline: !venue.isOnline })
                    }
                  >
                    <div
                      style={{
                        ...s.toggleThumb,
                        transform: venue.isOnline
                          ? "translateX(20px)"
                          : "translateX(2px)",
                      }}
                    />
                  </button>
                </div>

                {venue.isOnline ? (
                  <div className="input-group">
                    <label className="input-label">Online Meeting Link</label>
                    <input
                      className="input"
                      placeholder="https://meet.google.com/..."
                      value={venue.onlineLink}
                      onChange={(e) =>
                        setVenue({ ...venue, onlineLink: e.target.value })
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="input-group">
                      <label className="input-label">Venue Name</label>
                      <input
                        className="input"
                        placeholder="e.g. Main Auditorium, IIT Hyderabad"
                        value={venue.venue}
                        onChange={(e) =>
                          setVenue({ ...venue, venue: e.target.value })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">City / Location *</label>
                      <input
                        className="input"
                        placeholder="e.g. Hyderabad, Telangana"
                        value={venue.location}
                        onChange={(e) =>
                          setVenue({ ...venue, location: e.target.value })
                        }
                      />
                    </div>
                  </>
                )}

                <div className="input-group">
                  <label className="input-label">
                    Team Size (1 = Individual event)
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    max="10"
                    value={venue.teamSize}
                    onChange={(e) =>
                      setVenue({ ...venue, teamSize: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {/* STEP 2 — Tickets */}
            {step === 2 && (
              <div className="fade-in">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ ...s.stepTitle, margin: 0 }}>Ticket Pricing</h2>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={addTicketTier}
                  >
                    + Add Tier
                  </button>
                </div>

                {tickets.map((tier, i) => (
                  <div key={i} style={s.tierForm}>
                    <div style={s.tierFormHeader}>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>
                        Tier {i + 1}
                      </span>
                      {tickets.length > 1 && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeTicketTier(i)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div className="input-group">
                        <label className="input-label">Name</label>
                        <input
                          className="input"
                          placeholder="General / VIP"
                          value={tier.name}
                          onChange={(e) =>
                            updateTicket(i, "name", e.target.value)
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">
                          Price (₹) — 0 = Free
                        </label>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          value={tier.price}
                          onChange={(e) =>
                            updateTicket(i, "price", e.target.value)
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Quantity</label>
                        <input
                          className="input"
                          type="number"
                          min="1"
                          value={tier.quantity}
                          onChange={(e) =>
                            updateTicket(i, "quantity", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Description</label>
                      <input
                        className="input"
                        placeholder="What's included in this tier?"
                        value={tier.description}
                        onChange={(e) =>
                          updateTicket(i, "description", e.target.value)
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">
                        Perks (comma separated)
                      </label>
                      <input
                        className="input"
                        placeholder="Free T-shirt, Front row, Lunch included"
                        value={tier.perks}
                        onChange={(e) =>
                          updateTicket(i, "perks", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 3 — Schedule */}
            {step === 3 && (
              <div className="fade-in">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h2 style={{ ...s.stepTitle, margin: 0 }}>Event Schedule</h2>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={addScheduleItem}
                  >
                    + Add Item
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                    marginBottom: "20px",
                  }}
                >
                  Optional — add your event's timeline so attendees know what to
                  expect
                </p>

                {schedule.map((item, i) => (
                  <div key={i} style={s.tierForm}>
                    <div style={s.tierFormHeader}>
                      <span style={{ fontSize: "14px", fontWeight: 600 }}>
                        Item {i + 1}
                      </span>
                      {schedule.length > 1 && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeScheduleItem(i)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 2fr",
                        gap: "12px",
                      }}
                    >
                      <div className="input-group">
                        <label className="input-label">Time</label>
                        <input
                          className="input"
                          placeholder="09:00 AM"
                          value={item.time}
                          onChange={(e) =>
                            updateSchedule(i, "time", e.target.value)
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Title</label>
                        <input
                          className="input"
                          placeholder="Opening Ceremony"
                          value={item.title}
                          onChange={(e) =>
                            updateSchedule(i, "title", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      <div className="input-group">
                        <label className="input-label">
                          Speaker (optional)
                        </label>
                        <input
                          className="input"
                          placeholder="Dr. Rajesh Kumar"
                          value={item.speaker}
                          onChange={(e) =>
                            updateSchedule(i, "speaker", e.target.value)
                          }
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Description</label>
                        <input
                          className="input"
                          placeholder="Brief description"
                          value={item.description}
                          onChange={(e) =>
                            updateSchedule(i, "description", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 4 — Preview */}
            {step === 4 && (
              <div className="fade-in">
                <h2 style={s.stepTitle}>Preview & Publish</h2>

                {/* Preview card */}
                <div style={s.previewCard}>
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner"
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div style={{ padding: "1.25rem" }}>
                    <span
                      className="badge badge-primary"
                      style={{ marginBottom: "8px" }}
                    >
                      {basic.category}
                    </span>
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        marginBottom: "8px",
                      }}
                    >
                      {basic.title || "Event Title"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        marginBottom: "12px",
                      }}
                    >
                      {basic.description?.slice(0, 150)}
                      {basic.description?.length > 150 ? "..." : ""}
                    </p>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {venue.date && (
                        <span>
                          📅 {venue.date} {venue.time && `at ${venue.time}`}
                        </span>
                      )}
                      {venue.location && (
                        <span>
                          📍 {venue.venue && `${venue.venue}, `}
                          {venue.location}
                        </span>
                      )}
                      <span>
                        🎟 {tickets.length} ticket tier(s) · {venue.capacity}{" "}
                        capacity
                      </span>
                    </div>
                  </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {/* Publish options */}
                <div style={{ marginTop: "20px" }}>
                  <p className="input-label">Publish status</p>
                  <div style={{ display: "flex", gap: "12px" }}>
                    {[
                      {
                        value: "published",
                        label: "🟢 Publish Now",
                        desc: "Visible to everyone",
                      },
                      {
                        value: "draft",
                        label: "📝 Save as Draft",
                        desc: "Only visible to you",
                      },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        style={{
                          ...s.publishOption,
                          ...(publishStatus === opt.value
                            ? s.publishOptionActive
                            : {}),
                        }}
                        onClick={() => setPublishStatus(opt.value)}
                      >
                        <div style={{ fontSize: "14px", fontWeight: 600 }}>
                          {opt.label}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          {opt.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={s.navBtns}>
              {step > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setStep((s) => s - 1)}
                >
                  ← Back
                </button>
              )}
              <div style={{ flex: 1 }} />
              {step < STEPS.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Basic validation
                    if (step === 0 && !basic.title)
                      return setError("Event title is required");
                    if (step === 0 && !basic.description)
                      return setError("Description is required");
                    if (step === 1 && !venue.date)
                      return setError("Event date is required");
                    if (step === 1 && !venue.location && !venue.isOnline)
                      return setError("Location is required");
                    setError("");
                    setStep((s) => s + 1);
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading
                    ? "Publishing..."
                    : publishStatus === "published"
                      ? "🚀 Publish Event"
                      : "💾 Save Draft"}
                </button>
              )}
            </div>
            {error && step < 4 && (
              <div className="alert alert-error" style={{ marginTop: "12px" }}>
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  pageTitle: { fontSize: "28px", fontWeight: 800, marginBottom: "4px" },
  pageSub: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    marginBottom: "2rem",
  },
  stepBar: { display: "flex", alignItems: "center", marginBottom: "2rem" },
  stepItem: { display: "flex", alignItems: "center", flex: 1 },
  stepDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700,
    flexShrink: 0,
    transition: "all .3s",
  },
  stepLabel: {
    fontSize: "12px",
    marginLeft: "8px",
    transition: "all .3s",
    whiteSpace: "nowrap",
  },
  stepLine: { flex: 1, height: "2px", margin: "0 8px", transition: "all .3s" },
  formCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-xl)",
    padding: "2rem",
    boxShadow: "var(--shadow-sm)",
  },
  stepTitle: { fontSize: "20px", fontWeight: 700, marginBottom: "20px" },
  bannerUpload: {
    position: "relative",
    height: "180px",
    border: "2px dashed var(--border)",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "border-color .2s",
  },
  bannerPlaceholder: { textAlign: "center" },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)",
    marginBottom: "16px",
  },
  toggle: {
    width: "44px",
    height: "24px",
    borderRadius: "99px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background .2s",
    flexShrink: 0,
  },
  toggleThumb: {
    position: "absolute",
    top: "2px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    transition: "transform .2s",
    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
  },
  tierForm: {
    background: "var(--bg-secondary)",
    borderRadius: "var(--r-lg)",
    padding: "1.25rem",
    marginBottom: "12px",
    border: "1px solid var(--border)",
  },
  tierFormHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  previewCard: {
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    background: "var(--bg-card)",
  },
  publishOption: {
    flex: 1,
    padding: "14px 16px",
    border: "2px solid var(--border)",
    borderRadius: "var(--r-md)",
    cursor: "pointer",
    transition: "all .2s",
  },
  publishOptionActive: {
    borderColor: "var(--primary)",
    background: "var(--primary-light)",
  },
  navBtns: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid var(--border)",
  },
};
