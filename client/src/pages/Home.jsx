import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";
import api from "../api/axios";




// ── Sample data (fallback until real events exist in DB) ─


// ── Animated counter hook ─────────────────────────────────
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else setCount(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration])

  useEffect(() => {
    api
      .get("/events/featured")
      .then((res) => {
        if (res.data.length > 0) setFeaturedEvents(res.data);
      })
      .catch(() => {}); // silently fail, show sample data

    api
      .get("/events/trending")
      .then((res) => {
        if (res.data.length > 0) setTrendingEvents(res.data);
      })
      .catch(() => {});
  }, []);

  return [count, ref];
}

// ── Sample data (replaced by API in Phase 3) ─────────────

const SAMPLE_EVENTS = [
  {
    _id: "1",
    title: "TechFest 2024 — National Level Hackathon",
    category: "Tech",
    date: "2024-12-15",
    location: "IIT Hyderabad",
    ticketPrice: 0,
    capacity: 500,
    bookedCount: 423,
    banner: "",
    organizer: { name: "Tech Club" },
  },
  {
    _id: "2",
    title: "EDM Night — College Fest Music Concert",
    category: "Music",
    date: "2024-12-20",
    location: "MRCE Hyderabad",
    ticketPrice: 299,
    capacity: 300,
    bookedCount: 187,
    banner: "",
    organizer: { name: "Cultural Club" },
  },
  {
    _id: "3",
    title: "Startup Summit 2024 — Pitch Your Idea",
    category: "Business",
    date: "2024-12-22",
    location: "T-Hub Hyderabad",
    ticketPrice: 199,
    capacity: 200,
    bookedCount: 156,
    banner: "",
    organizer: { name: "E-Cell" },
  },
  {
    _id: "4",
    title: "AI & ML Workshop — Hands-on Deep Learning",
    category: "Tech",
    date: "2025-01-05",
    location: "JNTU Hyderabad",
    ticketPrice: 499,
    capacity: 100,
    bookedCount: 67,
    banner: "",
    organizer: { name: "AI Club" },
  },
  {
    _id: "5",
    title: "Inter-College Sports Meet 2024",
    category: "Sports",
    date: "2025-01-10",
    location: "LB Stadium",
    ticketPrice: 0,
    capacity: 1000,
    bookedCount: 342,
    banner: "",
    organizer: { name: "Sports Committee" },
  },
  {
    _id: "6",
    title: "Art Exhibition — Student Showcase",
    category: "Art",
    date: "2025-01-15",
    location: "Ravindra Bharathi",
    ticketPrice: 99,
    capacity: 150,
    bookedCount: 43,
    banner: "",
    organizer: { name: "Fine Arts Club" },
  },
];
const CATEGORIES = [
  { name: "Tech", icon: "💻", color: "#6366F1", bg: "#EEF2FF" },
  { name: "Music", icon: "🎵", color: "#8B5CF6", bg: "#F5F3FF" },
  { name: "Sports", icon: "⚽", color: "#10B981", bg: "#ECFDF5" },
  { name: "Art", icon: "🎨", color: "#F59E0B", bg: "#FFFBEB" },
  { name: "Business", icon: "💼", color: "#3B82F6", bg: "#EFF6FF" },
  { name: "Food", icon: "🍕", color: "#EF4444", bg: "#FEF2F2" },
  { name: "Health", icon: "🏋️", color: "#06B6D4", bg: "#ECFEFF" },
  { name: "Comedy", icon: "😂", color: "#F97316", bg: "#FFF7ED" },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "CS Student, IIT H",
    text: "Found my hackathon team through EventFlow and we ended up winning! The QR check-in was super smooth.",
    rating: 5,
    avatar: "P",
  },
  {
    name: "Rahul Mehta",
    role: "Event Organizer",
    text: "Managing 500+ attendees was effortless. The analytics dashboard showed me exactly where my revenue came from.",
    rating: 5,
    avatar: "R",
  },
  {
    name: "Sneha Rao",
    role: "MBA Student",
    text: "Booked 12 events this semester through EventFlow. The digital tickets and reminders are really convenient.",
    rating: 5,
    avatar: "S",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState(SAMPLE_EVENTS);

  const [eventsCount, eventsRef] = useCounter(10000);
  const [studentsCount, studentsRef] = useCounter(50000);
  const [citiesCount, citiesRef] = useCounter(25);
  const [orgsCount, orgsRef] = useCounter(500);

  useEffect(() => {
    api
      .get("/events/featured")
      .then((res) => {
        if (res.data.length > 0) setFeaturedEvents(res.data);
      })
      .catch(() => {});

    api
      .get("/events/trending")
      .then((res) => {
        if (res.data.length > 0) setTrendingEvents(res.data);
      })
      .catch(() => {});
  }, []);

  const filteredEvents =
    activeTab === "All"
      ? trendingEvents
      : trendingEvents.filter((e) => e.category === activeTab);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/events?search=${search}`);
  };


  return (
    <div className="page">
      <Navbar />

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={s.hero}>
        {/* Background blobs */}
        <div style={s.blob1} />
        <div style={s.blob2} />

        <div style={s.heroInner}>
          <div style={s.heroContent}>
            <span style={s.heroBadge}>🎉 500+ Events This Month</span>

            <h1 style={s.heroTitle}>
              Discover & Book
              <br />
              <span className="gradient-text">Amazing Events</span>
              <br />
              Near You
            </h1>

            <p style={s.heroSub}>
              From hackathons to concerts, find events that match your passion.
              Book instantly. Attend confidently.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={s.searchBar}>
              <div style={s.searchInputWrap}>
                <span style={s.searchIcon}>🔍</span>
                <input
                  style={s.searchInput}
                  placeholder="Search events, colleges, cities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select style={s.searchSelect} defaultValue="">
                <option value="" disabled>
                  Category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.name}>{c.name}</option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-lg"
                style={{ borderRadius: "var(--r-md)", padding: "0 28px" }}
              >
                Search
              </button>
            </form>

            {/* Quick tags */}
            <div style={s.quickTags}>
              <span style={s.quickTagLabel}>Popular:</span>
              {["Hackathon", "Music Fest", "Workshop", "Sports Meet"].map(
                (tag) => (
                  <button
                    key={tag}
                    style={s.quickTag}
                    onClick={() => navigate(`/events?search=${tag}`)}
                  >
                    {tag}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Floating event cards */}
          <div style={s.heroVisual} className="hide-mobile">
            <div style={s.floatingCard}>
              <div style={s.fcBanner}>🎪</div>
              <div style={s.fcContent}>
                <div style={s.fcTitle}>TechFest 2024</div>
                <div style={s.fcMeta}>📅 Dec 15 · IIT Hyderabad</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                  }}
                >
                  <span style={s.fcFree}>FREE</span>
                  <span style={s.fcSeats}>77 seats left</span>
                </div>
              </div>
            </div>
            <div
              style={{
                ...s.floatingCard,
                marginTop: "1rem",
                marginLeft: "2rem",
              }}
            >
              <div
                style={{
                  ...s.fcBanner,
                  background: "linear-gradient(135deg,#8B5CF6,#EC4899)",
                }}
              >
                🎵
              </div>
              <div style={s.fcContent}>
                <div style={s.fcTitle}>EDM Night Concert</div>
                <div style={s.fcMeta}>📅 Dec 20 · MRCE</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                  }}
                >
                  <span
                    style={{
                      ...s.fcFree,
                      background: "#FEF3C7",
                      color: "#92400E",
                    }}
                  >
                    ₹299
                  </span>
                  <span style={s.fcSeats}>113 left</span>
                </div>
              </div>
            </div>
            {/* Live badge */}
            <div style={s.liveBadge}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10B981",
                  display: "inline-block",
                  marginRight: "6px",
                  animation: "pulse 1.5s infinite",
                }}
              />
              247 people browsing now
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────── */}
      <section style={s.stats}>
        <div style={s.statsInner}>
          {[
            {
              count: eventsCount,
              ref: eventsRef,
              suffix: "K+",
              label: "Events Hosted",
              icon: "🎪",
              divisor: 1000,
            },
            {
              count: studentsCount,
              ref: studentsRef,
              suffix: "K+",
              label: "Students Joined",
              icon: "🎓",
              divisor: 1000,
            },
            {
              count: citiesCount,
              ref: citiesRef,
              suffix: "+",
              label: "Cities Covered",
              icon: "🏙️",
              divisor: 1,
            },
            {
              count: orgsCount,
              ref: orgsRef,
              suffix: "+",
              label: "Event Organizers",
              icon: "🎯",
              divisor: 1,
            },
          ].map(({ count, ref, suffix, label, icon, divisor }) => (
            <div key={label} style={s.statItem} ref={ref}>
              <div style={s.statIcon}>{icon}</div>
              <div style={s.statNum}>
                {divisor > 1 ? Math.floor(count / divisor) : count}
                {suffix}
              </div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────── */}
      <section style={{ ...s.section, background: "var(--bg)" }}>
        <div className="container">
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>Browse by Category</h2>
              <p style={s.sectionSub}>Find events that match your interests</p>
            </div>
            <Link to="/events" style={s.viewAll}>
              View all →
            </Link>
          </div>
          <div style={s.catGrid}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                style={{ ...s.catCard, background: cat.bg }}
                onClick={() => navigate(`/events?category=${cat.name}`)}
              >
                <span style={s.catIcon}>{cat.icon}</span>
                <span style={{ ...s.catName, color: cat.color }}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED EVENTS ─────────────────────────────── */}
      <section style={s.section}>
        <div className="container">
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>Featured Events</h2>
              <p style={s.sectionSub}>Hand-picked events you'll love</p>
            </div>
            <Link to="/events" style={s.viewAll}>
              See all →
            </Link>
          </div>
          <div style={s.featuredGrid}>
            {(featuredEvents.length > 0 ? featuredEvents : SAMPLE_EVENTS)
              .slice(0, 3)
              .map((ev) => (
                <EventCard key={ev._id} event={ev} size="lg" />
              ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING EVENTS ─────────────────────────────── */}
      <section style={{ ...s.section, background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={s.sectionHeader}>
            <div>
              <h2 style={s.sectionTitle}>🔥 Trending Now</h2>
              <p style={s.sectionSub}>Most booked events this week</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={s.filterTabs}>
            {["All", ...CATEGORIES.slice(0, 5).map((c) => c.name)].map(
              (tab) => (
                <button
                  key={tab}
                  style={{
                    ...s.filterTab,
                    ...(activeTab === tab ? s.filterTabActive : {}),
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ),
            )}
          </div>

          <div style={s.trendingGrid}>
            {filteredEvents.slice(0, 6).map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={s.section}>
        <div className="container">
          <div
            style={{
              ...s.sectionHeader,
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div>
              <h2 style={s.sectionTitle}>How It Works</h2>
              <p style={s.sectionSub}>Get started in 3 simple steps</p>
            </div>
          </div>
          <div style={s.stepsGrid}>
            {[
              {
                step: "01",
                icon: "🔍",
                title: "Discover",
                desc: "Browse thousands of events by category, location, or date. Find what excites you.",
              },
              {
                step: "02",
                icon: "🎫",
                title: "Book",
                desc: "Select your tickets, complete payment securely via Razorpay, and get your digital QR ticket.",
              },
              {
                step: "03",
                icon: "🎉",
                title: "Attend",
                desc: "Show your QR code at the entrance for instant check-in. Enjoy the experience!",
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={s.stepCard}>
                <div style={s.stepNum}>{step}</div>
                <div style={s.stepIcon}>{icon}</div>
                <h3 style={s.stepTitle}>{title}</h3>
                <p style={s.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────── */}
      <section style={{ ...s.section, background: "var(--bg-secondary)" }}>
        <div className="container">
          <div
            style={{
              ...s.sectionHeader,
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <div>
              <h2 style={s.sectionTitle}>What Students Say</h2>
              <p style={s.sectionSub}>
                Trusted by 50,000+ students across India
              </p>
            </div>
          </div>
          <div style={s.testiGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={s.testiCard}>
                <div style={s.stars}>{"⭐".repeat(t.rating)}</div>
                <p style={s.testiText}>"{t.text}"</p>
                <div style={s.testiAuthor}>
                  <div
                    style={{
                      ...s.avatar,
                      width: "40px",
                      height: "40px",
                      fontSize: "16px",
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div style={s.testiName}>{t.name}</div>
                    <div style={s.testiRole}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <h2 style={s.ctaTitle}>
            Ready to find your next
            <br />
            great experience?
          </h2>
          <p style={s.ctaSub}>Join 50,000+ students already using EventFlow</p>
          <div style={s.ctaBtns}>
            <Link
              to="/register"
              className="btn btn-lg"
              style={{
                background: "#fff",
                color: "var(--primary)",
                fontWeight: 600,
                padding: "14px 32px",
              }}
            >
              Get Started Free
            </Link>
            <Link
              to="/events"
              className="btn btn-lg btn-ghost"
              style={{
                color: "#fff",
                border: "2px solid rgba(255,255,255,.4)",
                padding: "14px 32px",
              }}
            >
              Browse Events
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────
const s = {
  // Hero
  hero: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    background: "var(--bg)",
    position: "relative",
    overflow: "hidden",
    paddingTop: "68px",
  },
  blob1: {
    position: "absolute",
    top: "-20%",
    right: "-10%",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,.12) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-10%",
    left: "-5%",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  heroInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "4rem 1.5rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "4rem",
    alignItems: "center",
    width: "100%",
  },
  heroContent: {},
  heroBadge: {
    display: "inline-block",
    background: "var(--primary-light)",
    color: "var(--primary)",
    fontSize: "13px",
    fontWeight: 600,
    padding: "6px 16px",
    borderRadius: "var(--r-full)",
    marginBottom: "1.5rem",
  },
  heroTitle: {
    fontSize: "52px",
    fontWeight: 800,
    lineHeight: 1.15,
    marginBottom: "1.25rem",
    color: "var(--text-primary)",
  },
  heroSub: {
    fontSize: "16px",
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    marginBottom: "2rem",
    maxWidth: "480px",
  },
  searchBar: {
    display: "flex",
    gap: "8px",
    background: "var(--bg-card)",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "8px",
    boxShadow: "var(--shadow-lg)",
    marginBottom: "1rem",
  },
  searchInputWrap: {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: { position: "absolute", left: "12px", fontSize: "16px" },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "8px 12px 8px 36px",
    fontSize: "14px",
    background: "transparent",
    color: "var(--text-primary)",
  },
  searchSelect: {
    border: "none",
    borderLeft: "1px solid var(--border)",
    padding: "8px 12px",
    fontSize: "13px",
    background: "transparent",
    color: "var(--text-secondary)",
    outline: "none",
    cursor: "pointer",
  },
  quickTags: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  quickTagLabel: { fontSize: "13px", color: "var(--text-tertiary)" },
  quickTag: {
    padding: "5px 14px",
    borderRadius: "var(--r-full)",
    border: "1px solid var(--border)",
    fontSize: "13px",
    background: "var(--bg-card)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all .2s",
  },

  // Floating cards
  heroVisual: { position: "relative" },
  floatingCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    boxShadow: "var(--shadow-xl)",
    maxWidth: "280px",
  },
  fcBanner: {
    height: "100px",
    background: "var(--gradient-hero)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
  },
  fcContent: { padding: "14px" },
  fcTitle: { fontSize: "14px", fontWeight: 600, marginBottom: "4px" },
  fcMeta: { fontSize: "12px", color: "var(--text-secondary)" },
  fcFree: {
    fontSize: "12px",
    fontWeight: 700,
    background: "#D1FAE5",
    color: "#065F46",
    padding: "2px 10px",
    borderRadius: "99px",
  },
  fcSeats: { fontSize: "12px", color: "var(--text-tertiary)" },
  liveBadge: {
    position: "absolute",
    bottom: "-16px",
    right: "16px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-full)",
    padding: "6px 14px",
    fontSize: "12px",
    fontWeight: 500,
    boxShadow: "var(--shadow-md)",
    display: "flex",
    alignItems: "center",
  },

  // Stats
  stats: { background: "var(--gradient-primary)", padding: "3rem 0" },
  statsInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    gap: "2rem",
  },
  statItem: { textAlign: "center" },
  statIcon: { fontSize: "28px", marginBottom: "8px" },
  statNum: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "4px",
  },
  statLabel: { fontSize: "13px", color: "rgba(255,255,255,.75)" },

  // Sections
  section: { padding: "5rem 0" },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "2rem",
  },
  sectionTitle: { fontSize: "28px", fontWeight: 700, marginBottom: "4px" },
  sectionSub: { fontSize: "14px", color: "var(--text-secondary)" },
  viewAll: {
    fontSize: "14px",
    color: "var(--primary)",
    fontWeight: 500,
    flexShrink: 0,
  },

  // Categories
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(8,1fr)",
    gap: "12px",
  },
  catCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "20px 12px",
    borderRadius: "var(--r-lg)",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all .2s",
    background: "var(--bg-secondary)",
  },
  catIcon: { fontSize: "28px" },
  catName: { fontSize: "12px", fontWeight: 600 },

  // Featured grid
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "20px",
  },

  // Filter tabs
  filterTabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  filterTab: {
    padding: "7px 18px",
    borderRadius: "var(--r-full)",
    border: "1.5px solid var(--border)",
    background: "var(--bg-card)",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    color: "var(--text-secondary)",
    transition: "all .2s",
  },
  filterTabActive: {
    background: "var(--primary)",
    color: "#fff",
    borderColor: "var(--primary)",
  },

  // Trending grid
  trendingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "16px",
  },

  // Steps
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "2rem",
  },
  stepCard: {
    textAlign: "center",
    padding: "2rem",
    background: "var(--bg-card)",
    borderRadius: "var(--r-xl)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
  },
  stepNum: {
    fontSize: "11px",
    fontWeight: 700,
    color: "var(--primary)",
    letterSpacing: ".1em",
    marginBottom: "16px",
  },
  stepIcon: { fontSize: "40px", marginBottom: "16px" },
  stepTitle: { fontSize: "20px", fontWeight: 700, marginBottom: "12px" },
  stepDesc: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: 1.7,
  },

  // Testimonials
  testiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "20px",
  },
  testiCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.75rem",
    boxShadow: "var(--shadow-sm)",
  },
  stars: { fontSize: "14px", marginBottom: "12px" },
  testiText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    marginBottom: "1.25rem",
    fontStyle: "italic",
  },
  testiAuthor: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    borderRadius: "50%",
    background: "var(--gradient-primary)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    flexShrink: 0,
  },
  testiName: { fontSize: "14px", fontWeight: 600 },
  testiRole: { fontSize: "12px", color: "var(--text-tertiary)" },

  // CTA
  cta: {
    background: "var(--gradient-hero)",
    padding: "6rem 0",
    textAlign: "center",
  },
  ctaInner: { maxWidth: "600px", margin: "0 auto", padding: "0 1.5rem" },
  ctaTitle: {
    fontSize: "40px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "1rem",
    lineHeight: 1.25,
  },
  ctaSub: {
    fontSize: "16px",
    color: "rgba(255,255,255,.8)",
    marginBottom: "2.5rem",
  },
  ctaBtns: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
};
