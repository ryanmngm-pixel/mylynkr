
import { useState } from "react";
import "./LegalPages.css";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function EmailPreferences() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function callFunction(payload) {
    if (!SUPABASE_URL) {
      throw new Error("Email preferences are not configured.");
    }

    const response = await fetch(
      `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/email-preferences`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }

  async function requestCode(event) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await callFunction({
        action: "request-code",
        email: email.trim().toLowerCase(),
      });

      setMessage(data.message);
      setStep("verify");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updatePreference(subscribed) {
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await callFunction({
        action: "update-preference",
        email: email.trim().toLowerCase(),
        code: code.trim(),
        subscribed,
      });

      setMessage(data.message);
      setStep("complete");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "17px 18px",
    borderRadius: 12,
    border: "1px solid #353b43",
    background: "#171b20",
    color: "#fff",
    fontSize: 16,
    outline: "none",
  };

  const buttonStyle = {
    padding: "16px 22px",
    borderRadius: 12,
    border: "1px solid #e9edf0",
    background: "#e9edf0",
    color: "#101215",
    fontWeight: 700,
    fontSize: 14,
    cursor: loading ? "wait" : "pointer",
    opacity: loading ? 0.65 : 1,
  };

  return (
    <main className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <a href="/" className="legal-brand">
            <img src="/images/mylynkr-logo.png" alt="" />
            <span>MyLynkr</span>
          </a>

          <a href="/" className="legal-back">
            ← Back to home
          </a>
        </header>

        <div className="legal-heading">
          <span className="legal-eyebrow">
            ACCOUNT / EMAIL PREFERENCES
          </span>

          <h1>
            Your inbox<span>.</span>
            <br />
            Your choice<span>.</span>
          </h1>

          <p>
            Manage the updates you receive from MyLynkr.
            You're always in control.
          </p>
        </div>

        <div
          className="legal-info-panel"
          style={{ marginTop: 65, maxWidth: 620 }}
        >
          {step === "email" && (
            <>
              <span>STEP 01 / VERIFY YOUR EMAIL</span>
              <h3>Let's find your subscription.</h3>
              <p>
                Enter the email address you used to join
                the MyLynkr waitlist.
              </p>

              <form
                onSubmit={requestCode}
                style={{
                  display: "grid",
                  gap: 14,
                  marginTop: 28,
                }}
              >
                <label htmlFor="preferences-email">
                  Email address
                </label>

                <input
                  id="preferences-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  maxLength={254}
                  style={inputStyle}
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={buttonStyle}
                >
                  {loading
                    ? "Sending..."
                    : "Send verification code"}
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <span>STEP 02 / EMAIL VERIFICATION</span>
              <h3>Check your inbox.</h3>
              <p>
                If your address is eligible, we've sent
                a six-digit code to {email}.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 14,
                  marginTop: 28,
                }}
              >
                <label htmlFor="preferences-code">
                  Verification code
                </label>

                <input
                  id="preferences-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="000000"
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    letterSpacing: "0.35em",
                    fontSize: 24,
                  }}
                />

                <button
                  type="button"
                  disabled={loading || code.length !== 6}
                  onClick={() => updatePreference(false)}
                  style={buttonStyle}
                >
                  Unsubscribe from updates
                </button>

                <button
                  type="button"
                  disabled={loading || code.length !== 6}
                  onClick={() => updatePreference(true)}
                  style={{
                    ...buttonStyle,
                    background: "transparent",
                    color: "#e9edf0",
                    border: "1px solid #414952",
                  }}
                >
                  Subscribe to updates
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setCode("");
                    setStep("email");
                    setMessage("");
                    setError("");
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#aab3bd",
                    padding: 12,
                    cursor: "pointer",
                  }}
                >
                  Use a different email
                </button>
              </div>
            </>
          )}

          {step === "complete" && (
            <>
              <span>PREFERENCES UPDATED</span>
              <h3>All set.</h3>
              <p>{message}</p>

              <a
                href="/"
                style={{
                  display: "inline-block",
                  marginTop: 26,
                  color: "#fff",
                  textDecoration: "underline",
                  textUnderlineOffset: 5,
                }}
              >
                Return to MyLynkr
              </a>
            </>
          )}

          {error && (
            <p
              role="alert"
              style={{
                marginTop: 20,
                color: "#ffaaaa",
              }}
            >
              {error}
            </p>
          )}

          {message && step === "verify" && (
            <p role="status" style={{ marginTop: 20 }}>
              {message}
            </p>
          )}
        </div>

        <article className="legal-content">
          <section>
            <h2>About your preferences</h2>
            <p>
              Unsubscribing stops future promotional
              and product-update emails that honor your
              subscription preferences.
            </p>
            <p>
              Subscription preferences are separate
              from requests to delete your personal data.
              Essential administrative messages may
              still be sent when legally permitted.
            </p>
          </section>
        </article>

        <footer className="legal-footer">
          <span>© {new Date().getFullYear()} MyLynkr</span>

          <nav>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/email-preferences">
              Email Preferences
            </a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
