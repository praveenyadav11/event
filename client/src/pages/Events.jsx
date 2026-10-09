import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const CATEGORIES = [
  "All",
  "Tech",
  "Music",
  "Sports",
  "Art",
  "Business",
  "Food",
  "Health",
  "Comedy",
];
const SORT_OPTIONS = [
  { value: "date", label: "Upcoming" },
  { value: "popular", label: "Most Popular" },
  { value: "newest", label: "Newest First" },
  { value: "featured", label: "Featured" },
];

export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [sort, setSort] = useState("date");
  const [isFree, setIsFree] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (isFree) params.isFree = true;

      const res = await api.get("/events", { params });
      setEvents(res.data.events);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
//new
useEffect(() => {
  const urlCategory = searchParams.get("category");
  const urlSearch = searchParams.get("search");
  if (urlCategory) setCategory(urlCategory);
  if (urlSearch) setSearch(urlSearch);
}, [searchParams]);

useEffect(() => {
  const urlCategory = searchParams.get("category");
  setCategory(urlCategory || "All");
}, [searchParams]);

useEffect(() => {
  fetchEvents();
}, [category, sort, isFree, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="page">
      <Navbar />

      {/* Header */}
      <div style={s.header}>
        <div className="container">
          <h1 style={s.title}>Explore Events</h1>
          <p style={s.sub}>Discover {total}+ events happening around you</p>

          {/* Search */}
          <form onSubmit={handleSearch} style={s.searchBar}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search events, colleges, cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="btn btn-primary"
              style={{ borderRadius: "var(--r-md)", padding: "0 24px" }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container" style={{ padding: "2rem 1.5rem" }}>
        <div style={s.layout}>
          {/* Sidebar filters */}
          <aside style={s.sidebar}>
            <div style={s.filterCard}>
              <div style={s.filterTitle}>Categories</div>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  style={{
                    ...s.filterBtn,
                    ...(category === cat ? s.filterBtnActive : {}),
                  }}
                  onClick={() => {
                    setCategory(cat);
                    setPage(1);
                  }}
                >
                  {cat}
                  {category === cat && <span style={s.checkmark}>✓</span>}
                </button>
              ))}
            </div>

            <div style={s.filterCard}>
              <div style={s.filterTitle}>Sort By</div>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  style={{
                    ...s.filterBtn,
                    ...(sort === opt.value ? s.filterBtnActive : {}),
                  }}
                  onClick={() => setSort(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div style={s.filterCard}>
              <div style={s.filterTitle}>Price</div>
              <label style={s.checkLabel}>
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                />
                <span>Free events only</span>
              </label>
            </div>
          </aside>

          {/* Events grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={s.grid}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{ borderRadius: "var(--r-lg)", overflow: "hidden" }}
                  >
                    <div className="skeleton" style={{ height: "160px" }} />
                    <div
                      style={{
                        padding: "14px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                        borderTop: "none",
                        borderRadius: "0 0 var(--r-lg) var(--r-lg)",
                      }}
                    >
                      <div
                        className="skeleton"
                        style={{ height: "16px", marginBottom: "8px" }}
                      />
                      <div
                        className="skeleton"
                        style={{ height: "12px", width: "60%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div style={s.empty}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                <h3>No events found</h3>
                <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
                  Try adjusting your search or filters
                </p>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: "16px" }}
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setIsFree(false);
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div style={s.resultsRow}>
                  <span
                    style={{ fontSize: "14px", color: "var(--text-secondary)" }}
                  >
                    Showing {events.length} of {total} events
                  </span>
                </div>
                <div style={s.grid}>
                  {events.map((ev) => (
                    <EventCard key={ev._id} event={ev} />
                  ))}
                </div>

                {/* Pagination */}
                {total > 12 && (
                  <div style={s.pagination}>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      ← Prev
                    </button>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Page {page}
                    </span>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={events.length < 12}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const s = {
  header: {
    background: "var(--gradient-primary)",
    paddingTop: "100px",
    paddingBottom: "3rem",
  },
  title: {
    fontSize: "36px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "8px",
  },
  sub: {
    fontSize: "15px",
    color: "rgba(255,255,255,.8)",
    marginBottom: "2rem",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#fff",
    borderRadius: "var(--r-lg)",
    padding: "8px 8px 8px 16px",
    maxWidth: "600px",
    boxShadow: "var(--shadow-lg)",
  },
  searchIcon: { fontSize: "16px", color: "var(--text-tertiary)" },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "var(--text-primary)",
    background: "transparent",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr",
    gap: "2rem",
    alignItems: "start",
  },
  sidebar: {
    position: "sticky",
    top: "80px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  filterCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.25rem",
  },
  filterTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },
  filterBtn: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "8px 10px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: "transparent",
    fontSize: "13px",
    color: "var(--text-secondary)",
    cursor: "pointer",
    textAlign: "left",
    marginBottom: "2px",
    transition: "all .15s",
  },
  filterBtnActive: {
    background: "var(--primary-light)",
    color: "var(--primary)",
    fontWeight: 500,
  },
  checkmark: { color: "var(--primary)", fontWeight: 700 },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px" },
  resultsRow: { marginBottom: "16px" },
  empty: { textAlign: "center", padding: "4rem 0" },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "2rem",
  },
};
