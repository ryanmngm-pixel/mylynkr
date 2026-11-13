
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfUse from "./pages/TermsOfUse.jsx";
import EmailPreferences from "./pages/EmailPreferences.jsx";

import "./index.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

function Root() {
  switch (path) {
    case "/privacy":
      return <PrivacyPolicy />;

    case "/terms":
      return <TermsOfUse />;

    case "/email-preferences":
      return <EmailPreferences />;

    default:
      return <App />;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
