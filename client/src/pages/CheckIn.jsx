import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// Result types and their styles
const RESULT_STYLES = {
  success: {
    bg: "#064E3B",
    border: "#10B981",
    icon: "✅",
    title: "Check-in Successful!",
    color: "#10B981",
  },
  already_checked_in: {
    bg: "#7C2D12",
    border: "#EF4444",
    icon: "⚠️",
    title: "Already Checked In",
    color: "#EF4444",
  },
  cancelled: {
    bg: "#7C2D12",
    border: "#EF4444",
    icon: "❌",
    title: "Ticket Cancelled",
    color: "#EF4444",
  },
  wrong_event: {
    bg: "#78350F",
    border: "#F59E0B",
    icon: "🎫",
    title: "Wrong Event",
    color: "#F59E0B",
  },
  invalid: {
    bg: "#1E1B4B",
    border: "#6366F1",
    icon: "❓",
    title: "Invalid QR Code",
    color: "#6366F1",
  },
  error: {
    bg: "#7C2D12",
    border: "#EF4444",
    icon: "🔴",
    title: "Error",
    color: "#EF4444",
  },
};

export default function CheckIn() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [activeTab, setActiveTab] = useState("scanner");
  const [manualInput, setManualInput] = useState("");
  const [processing, setProcessing] = useState(false);

  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);

  // Fetch stats on load
  useEffect(() => {
    fetchStats();
  }, [eventId]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/checkin/stats/${eventId}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendees = async () => {
    try {
      const res = await api.get(`/checkin/attendees/${eventId}`);
      setAttendees(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Start camera scanner
  const startScanner = async () => {
    try {
      const html5Qr = new Html5Qrcode("qr-reader");
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: "environment" }, // back camera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          // QR scanned!
          await handleScan(decodedText);
        },
        () => {}, // error callback (ignore)
      );

      setScanning(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert(
        "Could not access camera. Please allow camera permission and try again.",
      );
    }
  };

  // Stop camera scanner
  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop();
        html5QrRef.current = null;
      } catch (err) {
        console.error(err);
      }
    }
    setScanning(false);
  };

  // Process scanned QR data
  const handleScan = async (qrData) => {
    if (processing) return;
    setProcessing(true);

    // Stop scanner while processing
    await stopScanner();

    try {
      const res = await api.post("/checkin/scan", { qrData, eventId });
      setResult({ ...res.data, type: res.data.type || "success" });
      fetchStats(); // refresh counter
    } catch (err) {
      const errData = err.response?.data;
      setResult({
        success: false,
        type: errData?.type || "error",
        msg: errData?.msg || "Something went wrong",
        ...errData,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Manual QR input (for testing without camera)
  const handleManualInput = async () => {
    if (!manualInput.trim()) return;
    await handleScan(manualInput.trim());
    setManualInput("");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const resultStyle = result
    ? RESULT_STYLES[result.type] || RESULT_STYLES.error
    : null;

  return (
    <div className="page" style={{ background: "#0F172A", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ paddingTop: "80px", padding: "80px 1rem 2rem" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          {/* Header */}
          <div style={s.header}>
            <h1 style={s.title}>QR Check-in</h1>
            {stats && <div style={s.eventName}>{stats.eventTitle}</div>}
          </div>

          {/* Stats bar */}
          {stats && (
            <div style={s.statsBar}>
              <div style={s.statItem}>
                <div style={s.statNum}>{stats.checkedIn}</div>
                <div style={s.statLabel}>Checked In</div>
              </div>
              <div style={s.statDivider} />
              <div style={s.statItem}>
                <div style={s.statNum}>{stats.pending}</div>
                <div style={s.statLabel}>Pending</div>
              </div>
              <div style={s.statDivider} />
              <div style={s.statItem}>
                <div style={s.statNum}>{stats.total}</div>
                <div style={s.statLabel}>Total Booked</div>
              </div>
              <div style={s.statDivider} />
              <div style={s.statItem}>
                <div style={{ ...s.statNum, color: "#10B981" }}>
                  {stats.total > 0
                    ? Math.round((stats.checkedIn / stats.total) * 100)
                    : 0}
                  %
                </div>
                <div style={s.statLabel}>Attendance</div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {stats && stats.total > 0 && (
            <div style={s.progressBar}>
              <div
                style={{
                  ...s.progressFill,
                  width: `${Math.round((stats.checkedIn / stats.total) * 100)}%`,
                }}
              />
            </div>
          )}

          {/* Tabs */}
          <div style={s.tabs}>
            {["scanner", "attendees"].map((tab) => (
              <button
                key={tab}
                style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "attendees") {
                    fetchAttendees();
                    stopScanner();
                  }
                  if (tab === "scanner") setResult(null);
                }}
              >
                {tab === "scanner" ? "📷 Scanner" : "👥 Attendees"}
              </button>
            ))}
          </div>

          {/* ── SCANNER TAB ── */}
          {activeTab === "scanner" && (
            <div>
              {/* Result overlay */}
              {result && resultStyle && (
                <div
                  style={{
                    ...s.resultCard,
                    background: resultStyle.bg,
                    borderColor: resultStyle.border,
                  }}
                  className="fade-in"
                >
                  <div style={s.resultIcon}>{resultStyle.icon}</div>
                  <div style={{ ...s.resultTitle, color: resultStyle.color }}>
                    {resultStyle.title}
                  </div>
                  <div style={s.resultMsg}>{result.msg}</div>

                  {result.type === "success" && result.attendee && (
                    <div style={s.attendeeInfo}>
                      <div style={s.attendeeName}>{result.attendee.name}</div>
                      <div style={s.attendeeEmail}>{result.attendee.email}</div>
                      <div style={s.attendeeTier}>
                        🎫 {result.attendee.ticketTier} · Ref:{" "}
                        {result.attendee.bookingRef}
                      </div>
                      {result.checkedInCount !== undefined && (
                        <div style={s.counterBadge}>
                          Total checked in: {result.checkedInCount}
                        </div>
                      )}
                    </div>
                  )}

                  {result.type === "already_checked_in" && (
                    <div style={s.attendeeInfo}>
                      <div style={s.attendeeName}>{result.attendee?.name}</div>
                      <div style={s.attendeeEmail}>
                        Checked in at:{" "}
                        {result.checkedInAt
                          ? new Date(result.checkedInAt).toLocaleTimeString()
                          : "Unknown"}
                      </div>
                    </div>
                  )}

                  <button
                    style={s.scanAgainBtn}
                    onClick={() => {
                      setResult(null);
                      startScanner();
                    }}
                  >
                    📷 Scan Next
                  </button>
                </div>
              )}

              {/* Camera viewfinder */}
              {!result && (
                <div style={s.scannerCard}>
                  {/* QR reader div — html5-qrcode attaches here */}
                  <div
                    id="qr-reader"
                    style={{
                      width: "100%",
                      display: scanning ? "block" : "none",
                    }}
                  />

                  {/* Placeholder when not scanning */}
                  {!scanning && (
                    <div style={s.scannerPlaceholder}>
                      <div style={s.scannerIcon}>📷</div>
                      <p style={s.scannerText}>
                        Point camera at student's ticket QR
                      </p>
                      <p style={s.scannerSubText}>
                        Camera will automatically detect QR codes
                      </p>
                    </div>
                  )}

                  {/* Scanning overlay frame */}
                  {scanning && (
                    <div style={s.scanFrame}>
                      <div style={s.scanCornerTL} />
                      <div style={s.scanCornerTR} />
                      <div style={s.scanCornerBL} />
                      <div style={s.scanCornerBR} />
                    </div>
                  )}
                </div>
              )}

              {/* Scanner controls */}
              {!result && (
                <div style={s.controls}>
                  {!scanning ? (
                    <button
                      className="btn btn-primary btn-full btn-lg"
                      onClick={startScanner}
                      disabled={processing}
                    >
                      📷 Start Camera Scanner
                    </button>
                  ) : (
                    <button
                      className="btn btn-full btn-lg"
                      style={{
                        background: "#EF4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--r-md)",
                        padding: "14px",
                        fontSize: "16px",
                        cursor: "pointer",
                      }}
                      onClick={stopScanner}
                    >
                      ⏹ Stop Scanner
                    </button>
                  )}
                </div>
              )}

              {/* Manual input — for testing */}
              {!result && (
                <div style={s.manualSection}>
                  <div style={s.manualTitle}>
                    Or enter booking reference manually
                  </div>
                  <div style={s.manualRow}>
                    <input
                      style={s.manualInput}
                      placeholder="Paste QR data or booking ref..."
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleManualInput()
                      }
                    />
                    <button style={s.manualBtn} onClick={handleManualInput}>
                      Check
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ATTENDEES TAB ── */}
          {activeTab === "attendees" && (
            <div>
              <div style={s.attendeesList}>
                {attendees.length === 0 ? (
                  <div style={s.emptyAttendees}>
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                      👥
                    </div>
                    <p>No one checked in yet</p>
                  </div>
                ) : (
                  attendees.map((b, i) => (
                    <div key={b._id} style={s.attendeeRow}>
                      <div style={s.attendeeAvatar}>
                        {b.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={s.attendeeNameDark}>{b.user?.name}</div>
                        <div style={s.attendeeEmailDark}>{b.user?.email}</div>
                        <div style={s.attendeeTimeDark}>
                          🎫 {b.ticketTier} ·{" "}
                          {b.checkedInAt
                            ? new Date(b.checkedInAt).toLocaleTimeString()
                            : ""}
                        </div>
                      </div>
                      <div style={s.attendeeNum}>#{i + 1}</div>
                    </div>
                  ))
                )}
              </div>
              <button
                className="btn btn-secondary btn-full"
                style={{ marginTop: "12px" }}
                onClick={fetchAttendees}
              >
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { textAlign: "center", marginBottom: "20px" },
  title: {
    fontSize: "26px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "4px",
  },
  eventName: { fontSize: "14px", color: "#94A3B8" },

  // Stats
  statsBar: {
    display: "grid",
    gridTemplateColumns: "1fr 1px 1fr 1px 1fr 1px 1fr",
    background: "#1E293B",
    borderRadius: "var(--r-lg)",
    padding: "16px",
    marginBottom: "12px",
    border: "1px solid #334155",
  },
  statItem: { textAlign: "center" },
  statNum: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "2px",
  },
  statLabel: {
    fontSize: "11px",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: ".05em",
  },
  statDivider: { width: "1px", background: "#334155" },

  // Progress
  progressBar: {
    height: "6px",
    background: "#1E293B",
    borderRadius: "99px",
    marginBottom: "20px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366F1, #10B981)",
    borderRadius: "99px",
    transition: "width .5s ease",
  },

  // Tabs
  tabs: { display: "flex", gap: "8px", marginBottom: "16px" },
  tab: {
    flex: 1,
    padding: "10px",
    borderRadius: "var(--r-md)",
    border: "1px solid #334155",
    background: "#1E293B",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    color: "#94A3B8",
    transition: "all .2s",
  },
  tabActive: { background: "#6366F1", color: "#fff", borderColor: "#6366F1" },

  // Scanner
  scannerCard: {
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "var(--r-lg)",
    overflow: "hidden",
    marginBottom: "12px",
    minHeight: "280px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  scannerPlaceholder: { textAlign: "center", padding: "2rem" },
  scannerIcon: { fontSize: "48px", marginBottom: "12px" },
  scannerText: {
    fontSize: "15px",
    color: "#E2E8F0",
    fontWeight: 500,
    marginBottom: "6px",
  },
  scannerSubText: { fontSize: "13px", color: "#64748B" },

  // Scan frame corners
  scanFrame: { position: "absolute", inset: 0, pointerEvents: "none" },
  scanCornerTL: {
    position: "absolute",
    top: "30px",
    left: "30px",
    width: "30px",
    height: "30px",
    borderTop: "3px solid #6366F1",
    borderLeft: "3px solid #6366F1",
    borderRadius: "4px 0 0 0",
  },
  scanCornerTR: {
    position: "absolute",
    top: "30px",
    right: "30px",
    width: "30px",
    height: "30px",
    borderTop: "3px solid #6366F1",
    borderRight: "3px solid #6366F1",
    borderRadius: "0 4px 0 0",
  },
  scanCornerBL: {
    position: "absolute",
    bottom: "30px",
    left: "30px",
    width: "30px",
    height: "30px",
    borderBottom: "3px solid #6366F1",
    borderLeft: "3px solid #6366F1",
    borderRadius: "0 0 0 4px",
  },
  scanCornerBR: {
    position: "absolute",
    bottom: "30px",
    right: "30px",
    width: "30px",
    height: "30px",
    borderBottom: "3px solid #6366F1",
    borderRight: "3px solid #6366F1",
    borderRadius: "0 0 4px 0",
  },

  // Result
  resultCard: {
    border: "2px solid",
    borderRadius: "var(--r-xl)",
    padding: "24px",
    textAlign: "center",
    marginBottom: "16px",
  },
  resultIcon: { fontSize: "52px", marginBottom: "12px" },
  resultTitle: { fontSize: "22px", fontWeight: 800, marginBottom: "8px" },
  resultMsg: { fontSize: "14px", color: "#94A3B8", marginBottom: "16px" },
  attendeeInfo: {
    background: "rgba(255,255,255,.05)",
    borderRadius: "var(--r-md)",
    padding: "14px",
    marginBottom: "16px",
    textAlign: "left",
  },
  attendeeName: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#fff",
    marginBottom: "4px",
  },
  attendeeEmail: { fontSize: "13px", color: "#94A3B8", marginBottom: "4px" },
  attendeeTier: { fontSize: "12px", color: "#64748B" },
  counterBadge: {
    display: "inline-block",
    marginTop: "10px",
    background: "#10B981",
    color: "#fff",
    fontSize: "13px",
    fontWeight: 600,
    padding: "4px 14px",
    borderRadius: "99px",
  },
  scanAgainBtn: {
    background: "#6366F1",
    color: "#fff",
    border: "none",
    borderRadius: "var(--r-md)",
    padding: "12px 32px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
  },

  // Controls
  controls: { marginBottom: "16px" },

  // Manual input
  manualSection: {
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "var(--r-lg)",
    padding: "16px",
    marginTop: "12px",
  },
  manualTitle: {
    fontSize: "12px",
    color: "#64748B",
    marginBottom: "10px",
    fontWeight: 500,
  },
  manualRow: { display: "flex", gap: "8px" },
  manualInput: {
    flex: 1,
    background: "#0F172A",
    border: "1px solid #334155",
    borderRadius: "var(--r-sm)",
    padding: "10px 12px",
    fontSize: "13px",
    color: "#E2E8F0",
    outline: "none",
  },
  manualBtn: {
    background: "#6366F1",
    color: "#fff",
    border: "none",
    borderRadius: "var(--r-sm)",
    padding: "10px 16px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  // Attendees list
  attendeesList: { display: "flex", flexDirection: "column", gap: "8px" },
  emptyAttendees: { textAlign: "center", color: "#64748B", padding: "3rem 0" },
  attendeeRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#1E293B",
    border: "1px solid #334155",
    borderRadius: "var(--r-md)",
    padding: "12px 14px",
  },
  attendeeAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "#6366F1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "15px",
    flexShrink: 0,
  },
  attendeeNameDark: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#E2E8F0",
    marginBottom: "2px",
  },
  attendeeEmailDark: {
    fontSize: "12px",
    color: "#64748B",
    marginBottom: "2px",
  },
  attendeeTimeDark: { fontSize: "11px", color: "#475569" },
  attendeeNum: { fontSize: "18px", fontWeight: 700, color: "#334155" },
};
