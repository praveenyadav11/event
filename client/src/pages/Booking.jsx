import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// Payment steps
const STEP_SELECT = "select"; // select quantity
const STEP_QR = "qr"; // show payment QR
const STEP_CONFIRM = "confirm"; // enter UPI ID to confirm
const STEP_SUCCESS = "success"; // done

export default function Booking() {
  const { eventId } = useParams();
  const [params] = useSearchParams();
  const tierIndex = Number(params.get("tier") || 0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(STEP_SELECT);
  const [paymentData, setPaymentData] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 min timer

  useEffect(() => {
    api
      .get(`/events/${eventId}`)
      .then((res) => setEvent(res.data))
      .catch(() => navigate("/events"))
      .finally(() => setLoading(false));
  }, [eventId]);

  // Countdown timer when QR is shown
  useEffect(() => {
    if (step !== STEP_QR) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const tier = event?.ticketTiers?.[tierIndex];
  const unitPrice = tier?.price || 0;
  const totalAmount = unitPrice * quantity;
  const isFree = totalAmount === 0;

  const handleProceed = async () => {
    setError("");
    try {
      const res = await api.post("/payments/create-order", {
        eventId,
        tierIndex,
        quantity,
      });

      if (res.data.free) {
        navigate(`/booking/success/${res.data.bookingId}`);
        return;
      }

      setPaymentData(res.data);
      setStep(STEP_QR);
      setCountdown(300);
    } catch (err) {
      setError(err.response?.data?.msg || "Something went wrong");
    }
  };

  const handleConfirmPayment = async () => {
    if (!upiId || !upiId.includes("@")) {
      setError("Please enter a valid UPI ID (e.g. yourname@upi)");
      return;
    }
    setConfirming(true);
    setError("");
    try {
      await api.post("/payments/confirm", {
        bookingId: paymentData.bookingId,
        upiId,
      });
      navigate(`/booking/success/${paymentData.bookingId}`);
    } catch (err) {
      setError(err.response?.data?.msg || "Confirmation failed");
    } finally {
      setConfirming(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  if (loading)
    return (
      <div className="page">
        <Navbar />
        <div className="flex-center" style={{ minHeight: "80vh" }}>
          <p>Loading...</p>
        </div>
      </div>
    );

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
          style={{ maxWidth: "480px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          {/* ── STEP 1: Select quantity ── */}
          {step === STEP_SELECT && (
            <div className="fade-in">
              <h1 style={s.title}>Book Tickets</h1>

              {/* Event card */}
              <div style={s.eventCard}>
                <div style={s.eventCardLeft}>
                  <div style={s.eventCardIcon}>🎪</div>
                </div>
                <div style={s.eventCardRight}>
                  <div style={s.eventName}>{event?.title}</div>
                  <div style={s.eventMeta}>
                    📅{" "}
                    {event?.date &&
                      new Date(event.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                  </div>
                  <div style={s.eventMeta}>📍 {event?.location}</div>
                </div>
              </div>

              {/* Tier info */}
              <div style={s.tierCard}>
                <div style={s.tierHeader}>
                  <div>
                    <div style={s.tierName}>{tier?.name || "General"}</div>
                    <div style={s.tierDesc}>{tier?.description}</div>
                  </div>
                  <div style={s.tierPrice}>
                    {unitPrice === 0 ? (
                      <span
                        style={{
                          color: "var(--success)",
                          fontSize: "20px",
                          fontWeight: 700,
                        }}
                      >
                        FREE
                      </span>
                    ) : (
                      <span>
                        ₹{unitPrice}
                        <span
                          style={{
                            fontSize: "13px",
                            color: "var(--text-tertiary)",
                            fontWeight: 400,
                          }}
                        >
                          /ticket
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                {tier?.perks?.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    {tier.perks.map((p) => (
                      <span key={p} style={s.perk}>
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity selector */}
              {!isFree && (
                <div style={s.qtyCard}>
                  <span style={s.qtyLabel}>Number of Tickets</span>
                  <div style={s.qtyControl}>
                    <button
                      style={s.qtyBtn}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span style={s.qtyNum}>{quantity}</span>
                    <button
                      style={s.qtyBtn}
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Total */}
              <div style={s.totalCard}>
                <div style={s.totalRow}>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {unitPrice === 0
                      ? "Registration"
                      : `₹${unitPrice} × ${quantity}`}
                  </span>
                  <span style={s.totalAmt}>
                    {isFree ? "FREE" : `₹${totalAmount}`}
                  </span>
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: "20px" }}
                onClick={handleProceed}
              >
                {isFree ? "🎟 Register Free" : `Proceed to Pay ₹${totalAmount}`}
              </button>
            </div>
          )}

          {/* ── STEP 2: Show Payment QR ── */}
          {step === STEP_QR && paymentData && (
            <div className="fade-in">
              {/* PhonePe/GPay style header */}
              <div style={s.payHeader}>
                <div style={s.payHeaderLogo}>⚡</div>
                <div style={s.payHeaderTitle}>EventFlow Pay</div>
                <div style={s.payHeaderSub}>Scan & Pay with any UPI app</div>
              </div>

              {/* QR Card */}
              <div style={s.qrCard}>
                {/* Merchant info */}
                <div style={s.merchantRow}>
                  <div style={s.merchantAvatar}>EF</div>
                  <div>
                    <div style={s.merchantName}>{paymentData.merchantName}</div>
                    <div style={s.merchantUPI}>{paymentData.merchantUPI}</div>
                  </div>
                  <div style={s.verifiedBadge}>✓ Verified</div>
                </div>

                {/* Amount */}
                <div style={s.amountDisplay}>
                  <div style={s.amountLabel}>Amount to Pay</div>
                  <div style={s.amountValue}>₹{paymentData.totalAmount}</div>
                  <div style={s.amountNote}>{event?.title}</div>
                </div>

                {/* QR Code */}
                <div style={s.qrWrap}>
                  <img
                    src={paymentData.paymentQR}
                    alt="Payment QR"
                    style={{
                      width: "220px",
                      height: "220px",
                      borderRadius: "8px",
                    }}
                  />
                  <div style={s.qrScanText}>
                    📱 Scan with GPay, PhonePe, Paytm or any UPI app
                  </div>
                </div>

                {/* UPI Apps */}
                <div style={s.upiApps}>
                  {[
                    { name: "GPay", emoji: "🟢" },
                    { name: "PhonePe", emoji: "🟣" },
                    { name: "Paytm", emoji: "🔵" },
                    { name: "BHIM", emoji: "🟠" },
                  ].map((app) => (
                    <div key={app.name} style={s.upiApp}>
                      <span style={{ fontSize: "20px" }}>{app.emoji}</span>
                      <span style={s.upiAppName}>{app.name}</span>
                    </div>
                  ))}
                </div>

                {/* Timer */}
                <div
                  style={{
                    ...s.timer,
                    color:
                      countdown < 60
                        ? "var(--danger)"
                        : "var(--text-secondary)",
                  }}
                >
                  ⏱ QR expires in {formatTime(countdown)}
                </div>
              </div>

              {/* OR divider */}
              <div className="divider">or pay using UPI ID</div>

              {/* Direct UPI entry */}
              <div style={s.upiCard}>
                <div style={s.upiTitle}>Pay directly via UPI ID</div>
                <div style={s.upiIdDisplay}>
                  <span style={s.upiIdLabel}>
                    Send ₹{paymentData.totalAmount} to:
                  </span>
                  <span style={s.upiIdValue}>{paymentData.merchantUPI}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: "16px" }}
                onClick={() => setStep(STEP_CONFIRM)}
              >
                I have completed the payment ✓
              </button>

              <button
                className="btn btn-ghost btn-full"
                style={{ marginTop: "8px" }}
                onClick={() => setStep(STEP_SELECT)}
              >
                ← Go back
              </button>
            </div>
          )}

          {/* ── STEP 3: Confirm with UPI ID ── */}
          {step === STEP_CONFIRM && (
            <div className="fade-in">
              <div style={s.confirmHeader}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <h2 style={s.confirmTitle}>Confirm Payment</h2>
                <p style={s.confirmSub}>
                  Enter the UPI ID you used to pay ₹{paymentData?.totalAmount}
                </p>
              </div>

              <div style={s.confirmCard}>
                <div style={s.confirmAmount}>
                  <div style={s.confirmAmtLabel}>Amount Paid</div>
                  <div style={s.confirmAmtVal}>₹{paymentData?.totalAmount}</div>
                </div>
                <div style={s.confirmTo}>
                  <div style={s.confirmToLabel}>Paid to</div>
                  <div style={s.confirmToVal}>{paymentData?.merchantUPI}</div>
                </div>
              </div>

              <div className="input-group" style={{ marginTop: "20px" }}>
                <label className="input-label">Your UPI ID</label>
                <input
                  className="input"
                  placeholder="yourname@upi / yourname@okaxis"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  style={{ fontSize: "16px", padding: "14px" }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-tertiary)",
                    marginTop: "4px",
                  }}
                >
                  e.g. 9876543210@upi, name@okicici, name@paytm
                </div>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                className="btn btn-primary btn-full btn-lg"
                style={{ marginTop: "16px" }}
                onClick={handleConfirmPayment}
                disabled={confirming}
              >
                {confirming ? "Verifying..." : "Confirm & Get Ticket 🎟"}
              </button>

              <button
                className="btn btn-ghost btn-full"
                style={{ marginTop: "8px" }}
                onClick={() => {
                  setStep(STEP_QR);
                  setError("");
                }}
              >
                ← Back to QR
              </button>

              <div style={s.confirmNote}>
                🔒 Your UPI ID is only used for payment reference
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  title: { fontSize: "26px", fontWeight: 800, marginBottom: "1.5rem" },

  // Event card
  eventCard: {
    display: "flex",
    gap: "14px",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "14px",
    marginBottom: "16px",
  },
  eventCardLeft: { flexShrink: 0 },
  eventCardIcon: { fontSize: "36px" },
  eventCardRight: { flex: 1 },
  eventName: { fontSize: "15px", fontWeight: 600, marginBottom: "4px" },
  eventMeta: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "2px",
  },

  // Tier
  tierCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "16px",
    marginBottom: "12px",
  },
  tierHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  tierName: { fontSize: "16px", fontWeight: 600, marginBottom: "2px" },
  tierDesc: { fontSize: "13px", color: "var(--text-secondary)" },
  tierPrice: {
    fontSize: "22px",
    fontWeight: 800,
    color: "var(--primary)",
    flexShrink: 0,
  },
  perk: {
    display: "inline-block",
    fontSize: "12px",
    color: "var(--success)",
    fontWeight: 500,
    marginRight: "10px",
  },

  // Qty
  qtyCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "14px 16px",
    marginBottom: "12px",
  },
  qtyLabel: { fontSize: "14px", fontWeight: 500 },
  qtyControl: { display: "flex", alignItems: "center", gap: "16px" },
  qtyBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "1.5px solid var(--border)",
    background: "var(--bg)",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 500,
    lineHeight: 1,
  },
  qtyNum: {
    fontSize: "20px",
    fontWeight: 700,
    minWidth: "28px",
    textAlign: "center",
  },

  // Total
  totalCard: {
    background: "var(--primary-light)",
    border: "1px solid rgba(99,102,241,.2)",
    borderRadius: "var(--r-lg)",
    padding: "14px 16px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmt: { fontSize: "22px", fontWeight: 800, color: "var(--primary)" },

  // Pay header
  payHeader: { textAlign: "center", marginBottom: "20px" },
  payHeaderLogo: { fontSize: "36px", marginBottom: "4px" },
  payHeaderTitle: {
    fontFamily: "'Poppins',sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    color: "var(--primary)",
  },
  payHeaderSub: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginTop: "4px",
  },

  // QR card
  qrCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-xl)",
    padding: "20px",
    boxShadow: "var(--shadow-lg)",
    marginBottom: "16px",
  },
  merchantRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
    paddingBottom: "16px",
    borderBottom: "1px solid var(--border)",
  },
  merchantAvatar: {
    width: "40px",
    height: "40px",
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
  merchantName: { fontSize: "14px", fontWeight: 600 },
  merchantUPI: { fontSize: "12px", color: "var(--text-secondary)" },
  verifiedBadge: {
    marginLeft: "auto",
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--success)",
    background: "#D1FAE5",
    padding: "3px 10px",
    borderRadius: "99px",
  },
  amountDisplay: { textAlign: "center", marginBottom: "20px" },
  amountLabel: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginBottom: "4px",
  },
  amountValue: {
    fontSize: "36px",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "2px",
  },
  amountNote: { fontSize: "12px", color: "var(--text-tertiary)" },
  qrWrap: { textAlign: "center", marginBottom: "16px" },
  qrScanText: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    marginTop: "10px",
  },
  upiApps: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "16px",
  },
  upiApp: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  upiAppName: { fontSize: "11px", color: "var(--text-secondary)" },
  timer: {
    textAlign: "center",
    fontSize: "13px",
    fontWeight: 500,
    padding: "8px",
    background: "var(--bg-secondary)",
    borderRadius: "var(--r-sm)",
  },

  // UPI direct
  upiCard: {
    background: "var(--bg-secondary)",
    borderRadius: "var(--r-lg)",
    padding: "14px 16px",
    marginBottom: "4px",
  },
  upiTitle: {
    fontSize: "13px",
    fontWeight: 500,
    color: "var(--text-secondary)",
    marginBottom: "8px",
  },
  upiIdDisplay: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  upiIdLabel: { fontSize: "13px", color: "var(--text-secondary)" },
  upiIdValue: { fontSize: "14px", fontWeight: 700, color: "var(--primary)" },

  // Confirm
  confirmHeader: { textAlign: "center", marginBottom: "20px" },
  confirmTitle: { fontSize: "22px", fontWeight: 700, marginBottom: "8px" },
  confirmSub: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
  },
  confirmCard: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
  },
  confirmAmount: {},
  confirmAmtLabel: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    marginBottom: "4px",
  },
  confirmAmtVal: { fontSize: "24px", fontWeight: 800, color: "var(--primary)" },
  confirmTo: { textAlign: "right" },
  confirmToLabel: {
    fontSize: "11px",
    color: "var(--text-tertiary)",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    marginBottom: "4px",
  },
  confirmToVal: { fontSize: "14px", fontWeight: 600 },
  confirmNote: {
    textAlign: "center",
    fontSize: "12px",
    color: "var(--text-tertiary)",
    marginTop: "16px",
  },
};
