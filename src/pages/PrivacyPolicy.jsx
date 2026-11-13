
import React from "react";
import "./LegalPages.css";

export default function PrivacyPolicy() {
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
          <span className="legal-eyebrow">LEGAL / 001</span>
          <h1>Privacy Policy<span>.</span></h1>
          <p>
            Your privacy matters. Here's how MyLynkr handles
            the information you share with us.
          </p>
          <span className="legal-date">
            Draft — November 12, 2026
          </span>
        </div>

        <article className="legal-content">
          <section>
            <h2>01. Introduction</h2>
            <p>
              MyLynkr ("we," "us," or "our") is developing
              connected technology designed to make everyday
              experiences simpler.
            </p>
            <p>
              This Privacy Policy describes how information
              is collected, used, and handled when you visit
              mylynkr.com or join our early-access waitlist.
            </p>
            <p>
              The legal operator of MyLynkr and its privacy
              contact information will be identified before
              this policy is finalized for publication.
            </p>
          </section>

          <section>
            <h2>02. Information We Collect</h2>
            <p>
              When you voluntarily join our early-access
              waitlist, we collect the email address you
              provide.
            </p>
            <p>
              Our website hosting and infrastructure
              providers may also process technical
              information, such as IP addresses, browser
              details, and request logs, as part of
              delivering and securing the website.
            </p>
            <p>
              We do not currently ask waitlist subscribers
              to provide payment information, home
              addresses, or garage access credentials.
            </p>
          </section>

          <section>
            <h2>03. How We Use Information</h2>
            <p>
              We use the information collected through our
              waitlist to:
            </p>
            <ul>
              <li>Register your interest in MyLynkr.</li>
              <li>Send a signup confirmation.</li>
              <li>
                Send product updates and early-access
                invitations where permitted.
              </li>
              <li>
                Maintain the security and operation of
                our website.
              </li>
              <li>Respond to privacy-related requests.</li>
            </ul>
            <p>
              We do not sell subscriber email addresses.
            </p>
          </section>

          <section>
            <h2>04. Service Providers</h2>
            <p>
              We use third-party service providers to
              operate portions of our website and waitlist.
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> — storage and
                management of waitlist registrations.
              </li>
              <li>
                <strong>Resend</strong> — delivery of
                confirmation and other authorized emails.
              </li>
              <li>
                <strong>Vercel</strong> — website hosting
                and infrastructure.
              </li>
            </ul>
            <p>
              These providers process information in
              connection with the services they provide.
              Their own privacy and security practices
              also apply.
            </p>
          </section>

          <section>
            <h2>05. Email Communications</h2>
            <p>
              Joining our waitlist allows us to send
              messages related to your registration.
              Promotional or ongoing product updates
              will be sent only where we have an
              appropriate basis to do so.
            </p>
            <p>
              Where required, marketing emails will
              include a working unsubscribe method.
              Unsubscribing from marketing messages
              does not necessarily delete your
              waitlist record.
            </p>
          </section>

          <section>
            <h2>06. Data Retention</h2>
            <p>
              We retain waitlist information for as long
              as reasonably necessary for the purposes
              described in this policy, subject to
              applicable legal requirements.
            </p>
            <p>
              A specific retention and deletion process
              will be documented before this policy
              is finalized.
            </p>
          </section>

          <section>
            <h2>07. Data Security</h2>
            <p>
              We use technical and organizational
              safeguards intended to protect information
              against unauthorized access, alteration,
              and disclosure.
            </p>
            <p>
              No online service can guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2>08. Your Privacy Choices</h2>
            <p>
              Depending on your location and applicable
              law, you may have rights to request access
              to, correction of, or deletion of your
              personal information.
            </p>
            <p>
              We will provide a designated privacy
              contact before publishing the final
              version of this policy.
            </p>
          </section>

          <section>
            <h2>09. Children's Privacy</h2>
            <p>
              The MyLynkr waitlist is not intended for
              children under 13. We do not knowingly
              solicit personal information from children
              under 13.
            </p>
          </section>

          <section>
            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy as our
              services evolve. Material changes will
              be communicated where required by law.
            </p>
          </section>
        </article>

        <footer className="legal-footer">
          <span>© 2026 MyLynkr</span>
          <nav>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/email-preferences">Email Preferences</a>
          </nav>
        </footer>
      </div>
    </main>
  );
}
