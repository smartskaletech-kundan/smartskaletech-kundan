import { useMultiOwnerAuth } from "@/hooks/useMultiOwnerAuth";
import { useState } from "react";

const DARK_BG = "#0f172a";
const GOLD = "#d4a843";
const CARD_BG = "#1e293b";
const BORDER = "#334155";

export default function SignupPage() {
  const { signupOwner } = useMultiOwnerAuth();
  const [form, setForm] = useState({
    hotelName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.hotelName.trim()) errs.hotelName = "Hotel name is required.";
    if (!form.ownerName.trim()) errs.ownerName = "Owner name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    else if (!/^\d{10,15}$/.test(form.phone.replace(/[\s\-+]/g, "")))
      errs.phone = "Enter a valid phone number.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const result = signupOwner({
      hotelName: form.hotelName.trim(),
      ownerName: form.ownerName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(result.error || "Registration failed. Please try again.");
    }
  };

  const fieldStyle = {
    width: "100%",
    background: "#0f172a",
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    padding: "10px 14px",
    color: "#f1f5f9",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const fieldErrStyle = { ...fieldStyle, border: "1px solid #ef4444" };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: DARK_BG,
        }}
      >
        <div
          style={{
            background: CARD_BG,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "3rem 2.5rem",
            textAlign: "center",
            maxWidth: 420,
            width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
          <h2
            style={{
              color: GOLD,
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Registration Submitted!
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            Your registration is awaiting super admin approval. You'll be
            notified once approved and can then log in to access all features.
          </p>
          <a
            href="/admin"
            style={{
              display: "inline-block",
              background: GOLD,
              color: "#000",
              fontWeight: 700,
              padding: "10px 28px",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: DARK_BG,
        padding: "24px 16px",
      }}
      data-ocid="signup.page"
    >
      <div
        style={{
          background: CARD_BG,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: "2.5rem 2rem",
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>🏨</div>
          <h2
            style={{
              color: GOLD,
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.6rem",
              fontWeight: 700,
              margin: "0 0 6px",
            }}
          >
            Hotel KDM Palace
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
            Register as a Hotel Owner — pending approval from Super Admin
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <div>
            <label
              htmlFor="hotelName"
              style={{
                color: "#cbd5e1",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Hotel Name *
            </label>
            <input
              id="hotelName"
              type="text"
              placeholder="e.g. Hotel KDM Palace"
              value={form.hotelName}
              onChange={(e) =>
                setForm((p) => ({ ...p, hotelName: e.target.value }))
              }
              style={errors.hotelName ? fieldErrStyle : fieldStyle}
              data-ocid="signup.input"
            />
            {errors.hotelName && (
              <p
                style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 4 }}
              >
                {errors.hotelName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ownerName"
              style={{
                color: "#cbd5e1",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Owner Name *
            </label>
            <input
              id="ownerName"
              type="text"
              placeholder="Full name"
              value={form.ownerName}
              onChange={(e) =>
                setForm((p) => ({ ...p, ownerName: e.target.value }))
              }
              style={errors.ownerName ? fieldErrStyle : fieldStyle}
              data-ocid="signup.input"
            />
            {errors.ownerName && (
              <p
                style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 4 }}
              >
                {errors.ownerName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              style={{
                color: "#cbd5e1",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              placeholder="owner@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              style={errors.email ? fieldErrStyle : fieldStyle}
              data-ocid="signup.input"
            />
            {errors.email && (
              <p
                style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 4 }}
              >
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              style={{
                color: "#cbd5e1",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
              style={errors.phone ? fieldErrStyle : fieldStyle}
              data-ocid="signup.input"
            />
            {errors.phone && (
              <p
                style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 4 }}
              >
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                color: "#cbd5e1",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Password *
            </label>
            <input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              style={errors.password ? fieldErrStyle : fieldStyle}
              data-ocid="signup.input"
            />
            {errors.password && (
              <p
                style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 4 }}
              >
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              style={{
                color: "#cbd5e1",
                fontSize: "0.8rem",
                fontWeight: 600,
                display: "block",
                marginBottom: 4,
              }}
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm((p) => ({ ...p, confirmPassword: e.target.value }))
              }
              style={errors.confirmPassword ? fieldErrStyle : fieldStyle}
              data-ocid="signup.input"
            />
            {errors.confirmPassword && (
              <p
                style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: 4 }}
              >
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {submitError && (
            <div
              style={{
                background: "#450a0a",
                border: "1px solid #ef4444",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fca5a5",
                fontSize: "0.85rem",
              }}
              data-ocid="signup.error_state"
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            style={{
              background: GOLD,
              color: "#000",
              fontWeight: 700,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: "0.95rem",
              marginTop: 4,
            }}
            data-ocid="signup.submit_button"
          >
            Submit Registration Request
          </button>

          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginTop: 4,
            }}
          >
            <a
              href="/admin"
              style={{
                color: GOLD,
                fontSize: "0.8rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
              data-ocid="signup.link"
            >
              Already approved? Login here
            </a>
            <a
              href="/"
              style={{
                color: "#64748b",
                fontSize: "0.8rem",
                textDecoration: "none",
              }}
            >
              ← Back to Hotel Website
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
