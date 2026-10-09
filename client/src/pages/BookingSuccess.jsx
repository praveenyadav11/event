import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { format } from "date-fns";

export default function BookingSuccess() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/bookings/${bookingId}`)
      .then((res) => setBooking(res.data))
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading)
    return (
      <div className="page">
        <Navbar />
        <div
          className="flex-center"
          style={{ minHeight: "80vh", flexDirection: "column", gap: "16px" }}
        >
          <div style={{ fontSize: "48px" }}>⏳</div>
          <p>Loading your ticket...</p>
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
          {/* Success header */}
          <div style={s.successHeader}>
            <div style={s.successIcon}>🎉</div>
            <h1 style={s.successTitle}>Booking Confirmed!</h1>
            <p style={s.successSub}>Your ticket has been booked successfully</p>
          </div>

          {/* Digital Ticket */}
          <div style={s.ticket}>
            {/* Ticket header */}
            <div style={s.ticketHeader}>
              <div style={s.ticketBrand}>⚡ EventFlow</div>
              <div style={s.ticketRef}>{booking?.bookingRef}</div>
            </div>

            {/* Event info */}
            <div style={s.ticketBody}>
              <h2 style={s.ticketEventName}>{booking?.event?.title}</h2>
              <div style={s.ticketMeta}>
                <div style={s.ticketMetaItem}>
                  <div style={s.ticketMetaLabel}>DATE</div>
                  <div style={s.ticketMetaVal}>
                    {booking?.event?.date &&
                      format(new Date(booking.event.date), "EEE, MMM d yyyy")}
                  </div>
                </div>
                <div style={s.ticketMetaItem}>
                  <div style={s.ticketMetaLabel}>TIME</div>
                  <div style={s.ticketMetaVal}>
                    {booking?.event?.date &&
                      format(new Date(booking.event.date), "h:mm a")}
                  </div>
                </div>
                <div style={s.ticketMetaItem}>
                  <div style={s.ticketMetaLabel}>VENUE</div>
                  <div style={s.ticketMetaVal}>{booking?.event?.location}</div>
                </div>
                <div style={s.ticketMetaItem}>
                  <div style={s.ticketMetaLabel}>TICKET</div>
                  <div style={s.ticketMetaVal}>
                    {booking?.ticketTier} × {booking?.quantity}
                  </div>
                </div>
              </div>
            </div>

            {/* Perforated line */}
            <div style={s.perforation}>
              <div style={s.perforationCircleLeft} />
              <div style={s.perforationLine} />
              <div style={s.perforationCircleRight} />
            </div>

            {/* QR code section */}
            <div style={s.qrSection}>
              <div style={s.qrWrap}>
                <QRCodeSVG
                  value={JSON.stringify({
                    bookingRef: booking?.bookingRef,
                    eventId: booking?.event?._id,
                    userId: booking?.user?._id,
                  })}
                  size={160}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p style={s.qrNote}>Show this QR at the entrance</p>
              <div
                style={{
                  ...s.statusBadge,
                  background: booking?.isCheckedIn ? "#D1FAE5" : "#EEF2FF",
                  color: booking?.isCheckedIn ? "#065F46" : "#4338CA",
                }}
              >
                {booking?.isCheckedIn ? "✅ Checked In" : "🎟 Valid Ticket"}
              </div>
            </div>

            {/* Payment info */}
            <div style={s.ticketFooter}>
              <span>
                {booking?.paymentStatus === "free"
                  ? "🆓 Free Registration"
                  : `💳 ₹${booking?.totalAmount} paid`}
              </span>
              <span style={s.paymentId}>
                {booking?.razorpayPaymentId &&
                  `ID: ${booking.razorpayPaymentId.slice(-8)}`}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={s.actions}>
            <Link to="/my-tickets" className="btn btn-primary btn-full">
              View All My Tickets
            </Link>
            <Link
              to={`/events/${booking?.event?._id}`}
              className="btn btn-secondary btn-full"
            >
              Back to Event
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  successHeader: { textAlign: "center", marginBottom: "2rem" },
  successIcon: { fontSize: "64px", marginBottom: "16px" },
  successTitle: { fontSize: "28px", fontWeight: 800, marginBottom: "8px" },
  successSub: { fontSize: "15px", color: "var(--text-secondary)" },

  // Ticket
  ticket: {
    background: "var(--bg-card)",
    borderRadius: "var(--r-xl)",
    overflow: "hidden",
    boxShadow: "var(--shadow-xl)",
    border: "1px solid var(--border)",
    marginBottom: "20px",
  },
  ticketHeader: {
    background: "var(--gradient-primary)",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ticketBrand: {
    fontFamily: "'Poppins',sans-serif",
    fontWeight: 700,
    color: "#fff",
    fontSize: "16px",
  },
  ticketRef: {
    fontSize: "12px",
    color: "rgba(255,255,255,.8)",
    fontWeight: 600,
    letterSpacing: ".05em",
  },
  ticketBody: { padding: "20px" },
  ticketEventName: {
    fontSize: "18px",
    fontWeight: 700,
    marginBottom: "16px",
    lineHeight: 1.3,
  },
  ticketMeta: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  ticketMetaItem: {},
  ticketMetaLabel: {
    fontSize: "10px",
    fontWeight: 700,
    color: "var(--text-tertiary)",
    letterSpacing: ".08em",
    textTransform: "uppercase",
    marginBottom: "2px",
  },
  ticketMetaVal: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)",
  },

  // Perforated divider
  perforation: {
    display: "flex",
    alignItems: "center",
    padding: "0 -1px",
    position: "relative",
    margin: "0 -1px",
  },
  perforationCircleLeft: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    marginLeft: "-10px",
    flexShrink: 0,
  },
  perforationCircleRight: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "var(--bg)",
    border: "1px solid var(--border)",
    marginRight: "-10px",
    flexShrink: 0,
  },
  perforationLine: { flex: 1, borderTop: "2px dashed var(--border)" },

  // QR
  qrSection: { padding: "20px", textAlign: "center" },
  qrWrap: {
    display: "inline-block",
    padding: "12px",
    background: "#fff",
    borderRadius: "var(--r-md)",
    border: "1px solid var(--border)",
    marginBottom: "12px",
  },
  qrNote: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginBottom: "10px",
  },
  statusBadge: {
    display: "inline-block",
    fontSize: "13px",
    fontWeight: 600,
    padding: "6px 16px",
    borderRadius: "99px",
  },

  ticketFooter: {
    background: "var(--bg-secondary)",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "var(--text-secondary)",
  },
  paymentId: { fontFamily: "monospace", fontSize: "11px" },

  actions: { display: "flex", flexDirection: "column", gap: "10px" },
};
