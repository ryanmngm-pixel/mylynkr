
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.jsx";

import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfUse from "./pages/TermsOfUse.jsx";
import EmailPreferences from "./pages/EmailPreferences.jsx";
import AdminNews from "./pages/AdminNews.jsx";

import {
  NewsroomPage,
  NewsArticlePage,
} from "./components/Newsroom.jsx";

import "./index.css";
import "./components/Newsroom.css";

const path =
  window.location.pathname.replace(/\/+$/, "") || "/";

function Root() {
  if (path === "/privacy") {
    return <PrivacyPolicy />;
  }

  if (path === "/terms") {
    return <TermsOfUse />;
  }

  if (path === "/email-preferences") {
    return <EmailPreferences />;
  }

  if (path === "/admin/news") {
    return <AdminNews />;
  }

  if (path === "/news") {
    return <NewsroomPage />;
  }

  if (path.startsWith("/news/")) {
    const slug = path.slice("/news/".length);

    if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return <NewsArticlePage slug={slug} />;
    }
  }

  return <App />;
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
