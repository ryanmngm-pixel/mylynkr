
import React from "react";
import "./LegalPages.css";

export default function TermsOfUse() {
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
          <span className="legal-eyebrow">LEGAL / 002</span>
          <h1>Terms of Use<span>.</span></h1>
          <p>
            The terms governing your use of the MyLynkr
            website and early-access waitlist.
          </p>
          <span className="legal-date">
            Draft — November 12, 2026
          </span>
        </div>

        <article className="legal-content">
          <section>
            <h2>01. Acceptance of Terms</h2>
            <p>
              These Terms of Use describe the conditions
              for accessing and using mylynkr.com.
              By using the website, you agree to
              comply with applicable laws and these
              terms.
            </p>
            <p>
              The legal operator of MyLynkr will be
              identified before these terms are
              finalized for publication.
            </p>
          </section>

          <section>
            <h2>02. About MyLynkr</h2>
            <p>
              MyLynkr is a developing connected-technology
              brand. Information on this website may
              describe planned products, features,
              concepts, and future services.
            </p>
            <p>
              Descriptions of future capabilities do not
              constitute a guarantee that any particular
              product or feature will be released.
            </p>
          </section>

          <section>
            <h2>03. Early-Access Waitlist</h2>
            <p>
              Joining the waitlist expresses interest in
              receiving information about MyLynkr.
            </p>
            <p>
              Waitlist registration does not constitute
              a purchase, reservation, investment,
              guarantee of access, or promise of
              product availability.
            </p>
            <p>
              We may change or discontinue the waitlist
              or early-access program.
            </p>
          </section>

          <section>
            <h2>04. Permitted Use</h2>
            <p>
              You agree not to:
            </p>
            <ul>
              <li>
                Attempt to compromise the website
                or its infrastructure.
              </li>
              <li>
                Submit malicious code or interfere
                with normal website operation.
              </li>
              <li>
                Use automated methods to abuse
                the waitlist or registration system.
              </li>
              <li>
                Impersonate another person or
                knowingly submit misleading information.
              </li>
              <li>
                Use the website for unlawful purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2>05. Intellectual Property</h2>
            <p>
              MyLynkr branding, original designs,
              website content, graphics, and other
              original materials are protected by
              applicable intellectual property laws.
            </p>
            <p>
              You may not reproduce or commercially
              exploit protected materials without
              authorization, except as permitted
              by law.
            </p>
          </section>

          <section>
            <h2>06. Website Availability</h2>
            <p>
              We may update, modify, suspend, or
              discontinue parts of the website
              without guaranteeing continuous
              availability.
            </p>
          </section>

          <section>
            <h2>07. Disclaimers</h2>
            <p>
              To the extent permitted by applicable
              law, this website and its informational
              content are provided on an "as available"
              basis without warranties concerning
              uninterrupted operation, accuracy,
              or suitability for a particular purpose.
            </p>
            <p>
              Nothing in these terms excludes warranties
              or consumer rights that cannot legally
              be excluded.
            </p>
          </section>

          <section>
            <h2>08. Limitation of Liability</h2>
            <p>
              To the extent permitted by applicable
              law, the operator of MyLynkr will not
              be responsible for indirect or
              consequential losses arising from
              use of this informational website.
            </p>
            <p>
              This provision does not limit liability
              that cannot legally be limited.
            </p>
          </section>

          <section>
            <h2>09. Third-Party Services</h2>
            <p>
              The website may rely on third-party
              infrastructure or link to external
              websites. Third-party services may
              have their own terms and policies.
            </p>
          </section>

          <section>
            <h2>10. Changes to These Terms</h2>
            <p>
              We may revise these terms as the
              website and MyLynkr services evolve.
              Changes will be posted with an
              updated effective date.
            </p>
          </section>

          <section>
            <h2>11. Contact and Governing Law</h2>
            <p>
              The responsible legal entity, contact
              information, and appropriate governing-law
              provisions will be confirmed before
              publication of the final terms.
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
