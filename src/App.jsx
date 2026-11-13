
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Wifi,
  ShieldCheck,
  House,
  CheckCircle2,
} from "lucide-react";

import "./App.css";

const LOGO = "/images/mylynkr-logo.png";

/* ----------------------------------------
   BRAND
---------------------------------------- */

function Brand({ light = false }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="#top"
      aria-label="MyLynkr home"
    >
      <img
        src={LOGO}
        alt=""
        className="brand-logo"
        style={{
          width: 36,
          height: 36,
          objectFit: "contain",
          flexShrink: 0,
        }}
      />

      <span className="brand-name">mylynkr</span>
    </a>
  );
}

/* ----------------------------------------
   HEADER
---------------------------------------- */

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 30);
    };

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", update);
    };
  }, []);

  return (
    <header
      className={`header ${scrolled ? "header-scrolled" : ""}`}
    >
      <div className="header-inner">
        <Brand />

        <nav
          className={`nav ${open ? "nav-open" : ""}`}
          aria-label="Main navigation"
        >
          <a
            href="#vision"
            onClick={() => setOpen(false)}
          >
            Our Vision
          </a>

          <a
            href="#approach"
            onClick={() => setOpen(false)}
          >
            Our Approach
          </a>

          <a
            className="mobile-join"
            href="#early-access"
            onClick={() => setOpen(false)}
          >
            Get Early Access
          </a>
        </nav>

        <a className="header-cta" href="#early-access">
          Get Early Access
          <ArrowUpRight size={15} />
        </a>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}

/* ----------------------------------------
   GARAGE EXPERIENCE
---------------------------------------- */

function GarageExperience() {
  return (
    <div className="garage-experience">
      <div className="garage-aura" />

      <div className="garage-scene">
        <div className="garage-scene-top">
          <span>MYLYNKR / CONNECTED SPACES</span>

          <span className="garage-scene-live">
            <span />
            CONCEPT 001
          </span>
        </div>

        <div className="garage-art" aria-hidden="true">
          <div className="garage-light garage-light-left" />
          <div className="garage-light garage-light-right" />

          <div className="garage-building">
            <div className="garage-roof" />

            <div className="garage-wall">
              <div className="garage-door-frame">
                <div className="garage-door">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="garage-floor" />
          <div className="garage-floor-light" />

          <div className="garage-connection">
            <span className="garage-connection-ring ring-outer" />
            <span className="garage-connection-ring ring-inner" />

            <span className="garage-connection-core">
              <Wifi size={19} strokeWidth={1.7} />
            </span>
          </div>
        </div>

        <div className="garage-scene-bottom">
          <span>THE EVERYDAY, REIMAGINED.</span>
          <span>01 — 03</span>
        </div>
      </div>

      <div className="garage-status-card">
        <div className="garage-status-icon">
          <House size={19} strokeWidth={1.6} />
        </div>

        <div className="garage-status-copy">
          <span>CONNECTED LIVING</span>
          <strong>It starts at home.</strong>
        </div>

        <span className="garage-status-indicator" />
      </div>

      <div className="garage-security-note">
        <ShieldCheck size={14} />
        <span>DESIGNED FOR EVERYDAY LIFE</span>
      </div>
    </div>
  );
}

/* ----------------------------------------
   HERO
---------------------------------------- */

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-noise" />
      <div className="hero-grid" />

      <div className="hero-content">
        <div className="eyebrow hero-eyebrow">
          <span className="status-dot" />
          INTRODUCING MYLYNKR
        </div>

        <h1>
          YOUR WORLD.
          <br />
          <span>CONNECTED.</span>
        </h1>

        <p className="hero-description">
          A more intuitive way to connect with the spaces
          around you. Starting where every journey begins.
        </p>

        <div className="hero-actions">
          <a
            className="button button-primary"
            href="#early-access"
          >
            Join the Waitlist
            <ArrowUpRight size={17} />
          </a>

          <a className="text-link" href="#vision">
            Explore Our Vision
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      <GarageExperience />

      <div className="hero-bottom">
        <span>THE NEXT CHAPTER OF CONNECTED LIVING</span>

        <span className="hero-bottom-right">
          01 / THE BEGINNING
        </span>
      </div>
    </section>
  );
}

/* ----------------------------------------
   VISION
---------------------------------------- */

function Vision() {
  return (
    <section className="vision section-shell" id="vision">
      <div className="section-index">
        <span>01</span>
        <span>THE VISION</span>
      </div>

      <div className="vision-content">
        <div className="eyebrow">
          A DIFFERENT WAY FORWARD
        </div>

        <h2>
          Technology should
          <br />
          feel <em>effortless.</em>
        </h2>

        <p>
          The best technology doesn't demand your attention.
          It fits naturally into your life, making everyday
          moments simpler, smarter, and more connected.
        </p>

        <p>
          That's the future we're working toward at MyLynkr.
          And we're starting with the garage.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------
   APPROACH
---------------------------------------- */

function Approach() {
  return (
    <section className="approach" id="approach">
      <div className="approach-inner section-shell">
        <div className="section-index">
          <span>02</span>
          <span>OUR PHILOSOPHY</span>
        </div>

        <div className="approach-heading">
          <div className="eyebrow">
            BUILT AROUND WHAT MATTERS
          </div>

          <h2>
            Less complexity.
            <br />
            <span>More possibility.</span>
          </h2>
        </div>

        <div className="principles">
          <div className="principle">
            <span className="principle-number">
              01 /
            </span>

            <h3>Intentional by design.</h3>

            <p>
              Every interaction should have a purpose.
              Nothing unnecessary. Nothing in the way.
            </p>
          </div>

          <div className="principle">
            <span className="principle-number">
              02 /
            </span>

            <h3>Made for real life.</h3>

            <p>
              Technology should adapt to the way people
              live, not the other way around.
            </p>
          </div>

          <div className="principle">
            <span className="principle-number">
              03 /
            </span>

            <h3>Connected thinking.</h3>

            <p>
              We're starting with one everyday space,
              with a vision that extends far beyond it.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------
   EARLY ACCESS / SUPABASE WAITLIST
---------------------------------------- */

function EarlyAccess() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (status === "submitting") return;

    // Honeypot field for automated spam submissions.
    if (website) {
      setStatus("success");
      setMessage("Thanks for your interest.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      setStatus("error");
      setMessage(
        "Registration isn't configured yet. Please try again later."
      );
      return;
    }

    setStatus("submitting");
    setMessage("");
    setShowPreferences(false);

    try {
      const response = await fetch(
        `${supabaseUrl.replace(/\/$/, "")}/rest/v1/waitlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            email: normalizedEmail,
          }),
        }
      );

      if (response.status === 409) {
        setStatus("existing");
        setShowPreferences(true);
        setMessage(
          "This email may already be registered. If you've unsubscribed, you can securely rejoin through Email Preferences."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Signup failed: ${response.status}`
        );
      }

      setStatus("success");
      setMessage(
        "You're on the list. We'll be in touch."
      );
      setEmail("");
    } catch (error) {
      console.error(
        "Waitlist submission error:",
        error
      );

      setStatus("error");
      setMessage(
        "We couldn't submit your email. Please try again."
      );
    }
  }

  function resetForm() {
    setStatus("idle");
    setMessage("");
    setShowPreferences(false);
    setEmail("");
    setWebsite("");
  }

  return (
    <section
      className="early-access"
      id="early-access"
    >
      <div className="early-access-glow" />

      <div className="early-access-inner">
        <div className="eyebrow">
          <span className="status-dot" />
          SOMETHING NEW IS TAKING SHAPE
        </div>

        <h2>
          The beginning
          <br />
          of <span>something bigger.</span>
        </h2>

        <p>
          MyLynkr is in development. Join the waitlist
          to hear about our progress and early-access
          opportunities.
        </p>

        {status === "success" || status === "existing" ? (
          <div
            role="status"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              padding: "24px 16px",
              color: "#e6edf2",
              textAlign: "center",
            }}
          >
            <CheckCircle2 size={25} />

            <span
              style={{
                maxWidth: 480,
                lineHeight: 1.8,
              }}
            >
              {message}
            </span>

            {showPreferences && (
              <a
                href="/email-preferences"
                className="button button-primary"
                style={{
                  marginTop: 8,
                  textDecoration: "none",
                }}
              >
                Manage Email Preferences
                <ArrowUpRight size={17} />
              </a>
            )}

            <button
              type="button"
              onClick={resetForm}
              style={{
                background: "transparent",
                border: "none",
                color: "#aab3bd",
                fontSize: 12,
                cursor: "pointer",
                padding: 10,
              }}
            >
              Use another email
            </button>
          </div>
        ) : (
          <form
            className="signup-form"
            onSubmit={handleSubmit}
          >
            <label
              className="sr-only"
              htmlFor="signup-email"
            >
              Email address
            </label>

            <input
              id="signup-email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              maxLength={254}
              disabled={status === "submitting"}
            />

            <input
              type="text"
              name="website"
              value={website}
              onChange={(event) =>
                setWebsite(event.target.value)
              }
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-9999px",
                width: 1,
                height: 1,
              }}
            />

            <button
              type="submit"
              disabled={status === "submitting"}
              style={{
                cursor:
                  status === "submitting"
                    ? "wait"
                    : "pointer",
                opacity: 1,
              }}
            >
              {status === "submitting"
                ? "Joining..."
                : "Join Waitlist"}

              <ArrowUpRight size={17} />
            </button>
          </form>
        )}

        {status === "error" && (
          <p
            role="alert"
            style={{
              color: "#f1a5a5",
              fontSize: 12,
              margin: "14px auto 0",
            }}
          >
            {message}
          </p>
        )}

        <span className="signup-note">
          By joining, you agree to receive MyLynkr
          development and launch updates.{" "}
          <a
            href="/privacy"
            style={{
              color: "#c4cbd2",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Privacy Policy
          </a>
          {" · "}
          <a
            href="/terms"
            style={{
              color: "#c4cbd2",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Terms of Use
          </a>
        </span>
      </div>
    </section>
  );
}

/* ----------------------------------------
   FOOTER
---------------------------------------- */

function Footer() {
  const footerLinks = [
    {
      label: "Privacy Policy",
      href: "/privacy",
    },
    {
      label: "Terms of Use",
      href: "/terms",
    },
    {
      label: "Email Preferences",
      href: "/email-preferences",
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <Brand light />

        <p>Connecting what matters.</p>
      </div>

      <div
        className="footer-bottom"
        style={{
          flexWrap: "wrap",
          rowGap: 20,
        }}
      >
        <span>
          © {new Date().getFullYear()} MyLynkr.
          All rights reserved.
        </span>

        <nav
          aria-label="Legal navigation"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            columnGap: 22,
            rowGap: 12,
          }}
        >
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                color: "#aab3bd",
                fontSize: 11,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a href="mailto:hello@mylynkr.com">
          Get in Touch
          <ArrowUpRight size={13} />
        </a>
      </div>
    </footer>
  );
}

/* ----------------------------------------
   MAIN APPLICATION
---------------------------------------- */

export default function App() {
  useEffect(() => {
    const elements = document.querySelectorAll(
      ".vision-content, .approach-heading, .principle, .early-access-inner"
    );

    if (!("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    elements.forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />

      <main>
        <Hero />
        <Vision />
        <Approach />
        <EarlyAccess />
      </main>

      <Footer />
    </>
  );
}
