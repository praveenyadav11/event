import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        {/* Top row */}
        <div style={s.top}>
          {/* Brand */}
          <div style={s.brand}>
            <div style={s.brandName}>⚡ EventFlow</div>
            <p style={s.brandDesc}>
              Discover, book, and manage events seamlessly. Built for students
              and organizers.
            </p>
            <div style={s.socials}>
              {["🐦", "💼", "📸", "▶️"].map((icon, i) => (
                <button key={i} style={s.socialBtn}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: "Explore",
              links: ["Events", "Categories", "Trending", "Near Me"],
            },
            {
              title: "Organize",
              links: ["Create Event", "Pricing", "Analytics", "QR Scanner"],
            },
            {
              title: "Support",
              links: ["Help Center", "Contact Us", "Privacy Policy", "Terms"],
            },
          ].map((col) => (
            <div key={col.title}>
              <div style={s.colTitle}>{col.title}</div>
              {col.links.map((link) => (
                <Link key={link} to="#" style={s.footerLink}>
                  {link}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div style={s.newsletter}>
          <div>
            <div style={s.newsletterTitle}>Stay in the loop 📬</div>
            <div style={s.newsletterSub}>
              Get the latest events delivered to your inbox
            </div>
          </div>
          <div style={s.newsletterForm}>
            <input
              style={s.newsletterInput}
              placeholder="your@email.com"
              type="email"
            />
            <button
              className="btn btn-primary"
              style={{ padding: "10px 20px", borderRadius: "var(--r-md)" }}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div style={s.bottom}>
          <span>© 2024 EventFlow. All rights reserved.</span>
          <span>Made with ❤️ for students</span>
        </div>
      </div>
    </footer>
  );
}

const s = {
  footer: {
    background: "var(--bg-secondary)",
    borderTop: "1px solid var(--border)",
    marginTop: "5rem",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "3rem 1.5rem 1.5rem",
  },
  top: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: "2rem",
    marginBottom: "2.5rem",
  },
  brand: {},
  brandName: {
    fontFamily: "'Poppins',sans-serif",
    fontWeight: 700,
    fontSize: "20px",
    color: "var(--primary)",
    marginBottom: "12px",
  },
  brandDesc: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: 1.7,
    marginBottom: "16px",
    maxWidth: "240px",
  },
  socials: { display: "flex", gap: "8px" },
  socialBtn: {
    width: "34px",
    height: "34px",
    borderRadius: "var(--r-sm)",
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  colTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: "12px",
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },
  footerLink: {
    display: "block",
    fontSize: "13px",
    color: "var(--text-secondary)",
    marginBottom: "8px",
    textDecoration: "none",
    transition: "color .15s",
  },
  newsletter: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: "var(--r-lg)",
    padding: "1.5rem 2rem",
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "2rem",
    flexWrap: "wrap",
  },
  newsletterTitle: { fontSize: "16px", fontWeight: 600, marginBottom: "4px" },
  newsletterSub: { fontSize: "13px", color: "var(--text-secondary)" },
  newsletterForm: { display: "flex", gap: "8px", flexShrink: 0 },
  newsletterInput: {
    padding: "10px 14px",
    border: "1.5px solid var(--border)",
    borderRadius: "var(--r-md)",
    fontSize: "14px",
    background: "var(--bg)",
    color: "var(--text-primary)",
    outline: "none",
    width: "220px",
  },
  bottom: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "var(--text-tertiary)",
    paddingTop: "1.5rem",
    borderTop: "1px solid var(--border)",
    flexWrap: "wrap",
    gap: "8px",
  },
};
