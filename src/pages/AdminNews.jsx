
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  FileText,
  ImagePlus,
  LogOut,
  Mail,
  Newspaper,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
} from "lucide-react";

import NewsImageUpload from "../components/NewsImageUpload.jsx";
import "../components/NewsImageUpload.css";
import "./AdminNews.css";

const URL = (
  import.meta.env.VITE_SUPABASE_URL || ""
).replace(/\/$/, "");

const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const EMPTY = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  category: "Company Update",
  status: "draft",
  published_at: null,
};

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function request(path, options = {}, token = KEY) {
  const response = await fetch(`${URL}${path}`, {
    ...options,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();
  let data;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error_description ||
      data?.msg ||
      data?.error ||
      `Request failed (${response.status})`
    );
  }

  return data;
}

function errorText(error) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function AdminNews() {
  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);

  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState({ ...EMPTY });
  const [mode, setMode] = useState("list");

  const [busy, setBusy] = useState(false);
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [campaign, setCampaign] = useState(null);
  const [campaignStats, setCampaignStats] = useState(null);
  const [testSent, setTestSent] = useState(false);

  const stopRef = useRef(false);

  function storeSession(value) {
    sessionRef.current = value;
    setSession(value);
  }

  async function token() {
    const current = sessionRef.current;

    if (!current) {
      throw new Error("Sign in again.");
    }

    if (Date.now() < current.expiresAt - 60000) {
      return current.access_token;
    }

    const refreshed = await request(
      "/auth/v1/token?grant_type=refresh_token",
      {
        method: "POST",
        body: JSON.stringify({
          refresh_token: current.refresh_token,
        }),
      }
    );

    const updated = {
      ...refreshed,
      expiresAt:
        Date.now() + refreshed.expires_in * 1000,
    };

    storeSession(updated);
    return updated.access_token;
  }

  async function loadArticles(accessToken) {
    const data = await request(
      "/rest/v1/news_articles?select=*&order=updated_at.desc",
      {},
      accessToken
    );

    setArticles(Array.isArray(data) ? data : []);
  }

  async function newsletterRequest(payload) {
    const accessToken = await token();

    return request(
      "/functions/v1/news-publish",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      accessToken
    );
  }

  async function loadCampaign(articleId, accessToken) {
    if (!articleId) {
      setCampaign(null);
      setCampaignStats(null);
      return null;
    }

    const jobs = await request(
      `/rest/v1/news_email_jobs?select=id,article_id,status,created_at,completed_at&article_id=eq.${articleId}&limit=1`,
      {},
      accessToken
    );

    const job = jobs?.[0] || null;
    setCampaign(job);

    if (!job) {
      setCampaignStats(null);
      return null;
    }

    // These count requests depend on admin SELECT
    // policies for news_email_deliveries.
    const deliveries = await request(
      `/rest/v1/news_email_deliveries?select=status&job_id=eq.${job.id}`,
      {},
      accessToken
    );

    const stats = {
      total: deliveries.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      pending: 0,
      processing: 0,
    };

    for (const delivery of deliveries) {
      if (stats[delivery.status] !== undefined) {
        stats[delivery.status]++;
      }
    }

    setCampaignStats(stats);
    return job;
  }

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const result = await request(
        "/auth/v1/token?grant_type=password",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const membership = await request(
        `/rest/v1/news_admins?select=user_id&user_id=eq.${result.user.id}&limit=1`,
        {},
        result.access_token
      );

      if (!membership?.length) {
        throw new Error(
          "Administrator access required."
        );
      }

      const current = {
        ...result,
        expiresAt:
          Date.now() + result.expires_in * 1000,
      };

      await loadArticles(current.access_token);
      storeSession(current);

      setAuthorized(true);
      setPassword("");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    stopRef.current = true;

    if (sessionRef.current?.access_token) {
      request(
        "/auth/v1/logout",
        { method: "POST" },
        sessionRef.current.access_token
      ).catch(() => {});
    }

    storeSession(null);
    setAuthorized(false);
    setArticles([]);
    setArticle({ ...EMPTY });
    setCampaign(null);
    setCampaignStats(null);
    setTestSent(false);
    setMode("list");
    setError("");
    setMessage("");
  }

  function update(field, value) {
    setArticle((current) => {
      const next = {
        ...current,
        [field]: value,
      };

      if (
        field === "title" &&
        !current.id &&
        (!current.slug ||
          current.slug === slugify(current.title))
      ) {
        next.slug = slugify(value);
      }

      return next;
    });
  }

  function resetNewsletter() {
    stopRef.current = true;
    setCampaign(null);
    setCampaignStats(null);
    setTestSent(false);
  }

  function newArticle() {
    resetNewsletter();
    setArticle({ ...EMPTY });
    setMode("editor");
    setError("");
    setMessage("");
  }

  async function editArticle(item) {
    resetNewsletter();

    setArticle({
      ...EMPTY,
      ...item,
      cover_image: item.cover_image || "",
    });

    setMode("editor");
    setError("");
    setMessage("");

    try {
      const accessToken = await token();
      await loadCampaign(item.id, accessToken);
    } catch (err) {
      // Article editing should remain available
      // even if campaign metadata cannot be read.
      console.error("Campaign lookup:", err);
    }
  }

  async function persistArticle(publish) {
    const title = article.title.trim();
    const slug = slugify(article.slug);
    const content = article.content.trim();
    const excerpt = article.excerpt.trim();

    if (!title || !slug || !content) {
      throw new Error(
        "Title, slug, and content are required."
      );
    }

    if (publish && !excerpt) {
      throw new Error(
        "Add a short description before publishing."
      );
    }

    if (!publish && article.status === "published") {
      throw new Error(
        "This article is already published. Use Publish Changes."
      );
    }

    const accessToken = await token();

    const payload = {
      title,
      slug,
      content,
      excerpt,
      cover_image: article.cover_image || null,
      category: article.category,
      status: publish ? "published" : "draft",
      published_at: publish
        ? article.published_at ||
          new Date().toISOString()
        : null,
    };

    if (!article.id) {
      payload.author_id =
        sessionRef.current.user.id;
    }

    const path = article.id
      ? `/rest/v1/news_articles?id=eq.${article.id}&select=*`
      : "/rest/v1/news_articles?select=*";

    const data = await request(
      path,
      {
        method: article.id ? "PATCH" : "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify(payload),
      },
      accessToken
    );

    if (!data?.[0]) {
      throw new Error(
        "Article save was not confirmed."
      );
    }

    const saved = {
      ...EMPTY,
      ...data[0],
      cover_image: data[0].cover_image || "",
    };

    setArticle(saved);
    await loadArticles(accessToken);

    return saved;
  }

  async function save(publish = false) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const saved = await persistArticle(publish);

      setMessage(
        publish
          ? "Article published successfully."
          : "Draft saved successfully."
      );

      if (saved.id) {
        const accessToken = await token();
        await loadCampaign(saved.id, accessToken);
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    if (!article.id) {
      setError(
        "Publish and save this article before testing."
      );
      return;
    }

    if (article.status !== "published") {
      setError(
        "The article must be published first."
      );
      return;
    }

    if (
      !window.confirm(
        `Send one test newsletter to your administrator email (${sessionRef.current?.user?.email || "signed-in account"})?\n\nUnsaved editor changes will not be included.`
      )
    ) {
      return;
    }

    setNewsletterBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await newsletterRequest({
        action: "test",
        article_id: article.id,
      });

      setTestSent(true);

      setMessage(
        `Test email accepted by Resend for ${result.recipient}. Check your inbox and test the unsubscribe link.`
      );
    } catch (err) {
      setError(
        `${errorText(err)} Check Resend before trying again; the email may have been accepted.`
      );
    } finally {
      setNewsletterBusy(false);
    }
  }

  async function startCampaign() {
    if (!article.id || article.status !== "published") {
      setError(
        "Publish the article before starting a campaign."
      );
      return;
    }

    if (campaign) {
      setError(
        "This article already has an email campaign."
      );
      return;
    }

    if (
      !window.confirm(
        "START LIVE MYLYNKR NEWSLETTER?\n\nThis queues all currently subscribed waitlist members. You must process the queue to send emails.\n\nOnly continue after verifying the test email and unsubscribe flow."
      )
    ) {
      return;
    }

    setNewsletterBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await newsletterRequest({
        action: "start",
        article_id: article.id,
      });

      const accessToken = await token();

      await loadCampaign(article.id, accessToken);

      setMessage(
        `${result.recipients} subscribers queued. No emails have been sent yet.`
      );
    } catch (err) {
      setError(
        `${errorText(err)} Refresh the campaign status before attempting to create another campaign.`
      );
    } finally {
      setNewsletterBusy(false);
    }
  }

  async function processNextBatch() {
    if (!campaign?.id || !article.id) {
      setError("No active campaign found.");
      return;
    }

    setNewsletterBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await newsletterRequest({
        action: "process",
        article_id: article.id,
        job_id: campaign.id,
      });

      const accessToken = await token();
      await loadCampaign(article.id, accessToken);

      setMessage(
        `Batch processed: ${result.sent || 0} sent, ${result.failed || 0} failed, ${result.skipped || 0} skipped. ${result.remaining ?? "Unknown"} pending.`
      );
    } catch (err) {
      setError(
        `${errorText(err)} Review campaign status before processing again.`
      );
    } finally {
      setNewsletterBusy(false);
    }
  }

  async function refreshCampaign() {
    if (!article.id) return;

    setNewsletterBusy(true);
    setError("");

    try {
      const accessToken = await token();
      await loadCampaign(article.id, accessToken);
      setMessage("Campaign status refreshed.");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setNewsletterBusy(false);
    }
  }

  async function removeArticle() {
    if (!article.id) return;

    if (campaign) {
      setError(
        "This article has a newsletter campaign. Keep it for delivery history rather than deleting it."
      );
      return;
    }

    if (
      !window.confirm(
        "Permanently delete this article?"
      )
    ) {
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      const accessToken = await token();

      await request(
        `/rest/v1/news_articles?id=eq.${article.id}`,
        { method: "DELETE" },
        accessToken
      );

      await loadArticles(accessToken);

      resetNewsletter();
      setArticle({ ...EMPTY });
      setMode("list");
      setMessage("Article deleted.");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    document.title = "Newsroom Admin | MyLynkr";

    return () => {
      stopRef.current = true;
      document.title = "MyLynkr";
    };
  }, []);

  const locked = busy || newsletterBusy;
  const published =
    article.status === "published" &&
    Boolean(article.id);

  const stats = campaignStats;

  const remaining = stats
    ? stats.pending + stats.processing
    : null;

  if (!authorized || !session) {
    return (
      <div className="news-admin">
        <header className="news-admin-topbar">
          <a href="/" className="news-admin-brand">
            <Newspaper size={21} />
            mylynkr
            <span>ADMIN</span>
          </a>

          <a href="/" className="news-admin-back">
            <ArrowLeft size={16} />
            Website
          </a>
        </header>

        <main className="news-admin-login-wrap">
          <form
            className="news-admin-login"
            onSubmit={signIn}
          >
            <div className="news-admin-icon">
              <Newspaper size={26} />
            </div>

            <span className="news-admin-kicker">
              MYLYNKR / PRIVATE ACCESS
            </span>

            <h1>Welcome back.</h1>
            <p>Sign in to manage your newsroom.</p>

            <label htmlFor="admin-email">
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <label htmlFor="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

            {error && (
              <div className="news-admin-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="news-admin-primary"
              disabled={busy}
            >
              {busy ? "Signing in..." : "Sign In"}
              <ArrowUpRight size={17} />
            </button>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="news-admin">
      <header className="news-admin-topbar">
        <a href="/" className="news-admin-brand">
          <Newspaper size={21} />
          mylynkr
          <span>NEWSROOM</span>
        </a>

        <div className="news-admin-top-actions">
          <a
            href="/news"
            target="_blank"
            rel="noreferrer"
          >
            View Newsroom
            <ArrowUpRight size={15} />
          </a>

          <button
            type="button"
            onClick={signOut}
            disabled={locked}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </header>

      <main className="news-admin-main">
        <div className="news-admin-heading">
          <div>
            <span className="news-admin-kicker">
              CONTENT MANAGEMENT
            </span>

            <h1>
              {mode === "list"
                ? "Your newsroom."
                : article.id
                  ? "Edit article."
                  : "New article."}
            </h1>

            <p>
              Create, manage, and publish
              MyLynkr updates.
            </p>
          </div>

          {mode === "list" ? (
            <button
              className="news-admin-primary"
              type="button"
              onClick={newArticle}
            >
              <Plus size={18} />
              New Article
            </button>
          ) : (
            <button
              className="news-admin-secondary"
              type="button"
              disabled={locked}
              onClick={() => {
                resetNewsletter();
                setMode("list");
              }}
            >
              <ArrowLeft size={17} />
              All Articles
            </button>
          )}
        </div>

        {error && (
          <div
            className="news-admin-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            className="news-admin-success"
            role="status"
          >
            <Check size={17} />
            {message}
          </div>
        )}

        {mode === "list" ? (
          <section className="news-admin-list">
            <div className="news-admin-list-head">
              <span>ALL ARTICLES</span>
              <span>
                {articles.length} TOTAL
              </span>
            </div>

            {articles.length === 0 ? (
              <div className="news-admin-empty">
                <FileText size={34} />
                <h2>No articles yet.</h2>
                <p>
                  Create your first announcement.
                </p>
              </div>
            ) : (
              articles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="news-admin-list-item"
                  onClick={() => editArticle(item)}
                >
                  <div className="news-admin-list-copy">
                    <span className="news-admin-category">
                      {item.category}
                    </span>
                    <h2>{item.title}</h2>
                    <p>{item.excerpt}</p>
                  </div>

                  <div className="news-admin-list-side">
                    <span
                      className={`news-admin-status ${item.status}`}
                    >
                      {item.status}
                    </span>
                    <ArrowUpRight size={18} />
                  </div>
                </button>
              ))
            )}
          </section>
        ) : (
          <div className="news-admin-editor-layout">
            <section className="news-admin-editor">
              <div className="news-admin-field">
                <label htmlFor="news-title">
                  Article title
                </label>

                <input
                  id="news-title"
                  value={article.title}
                  onChange={(e) =>
                    update("title", e.target.value)
                  }
                  placeholder="Introducing MyLynkr"
                />
              </div>

              <div className="news-admin-field">
                <label htmlFor="news-slug">
                  Article URL
                </label>

                <div className="news-admin-slug">
                  <span>
                    mylynkr.com/news/
                  </span>

                  <input
                    id="news-slug"
                    value={article.slug}
                    onChange={(e) =>
                      update("slug", e.target.value)
                    }
                    placeholder="introducing-mylynkr"
                  />
                </div>
              </div>

              <div className="news-admin-field">
                <label htmlFor="news-excerpt">
                  Short description
                </label>

                <textarea
                  id="news-excerpt"
                  rows={3}
                  value={article.excerpt}
                  onChange={(e) =>
                    update("excerpt", e.target.value)
                  }
                  placeholder="A short summary of your announcement..."
                />
              </div>

              <div className="news-admin-field">
                <label htmlFor="news-content">
                  Article content
                </label>

                <textarea
                  id="news-content"
                  className="news-admin-content-input"
                  rows={18}
                  value={article.content}
                  onChange={(e) =>
                    update("content", e.target.value)
                  }
                  placeholder="Write your article here..."
                />

                <small>
                  Use the image uploader to insert
                  an image reference into your article.
                </small>
              </div>

              <div className="news-admin-field">
                <label>
                  <ImagePlus size={16} />
                  Article image
                </label>

                <NewsImageUpload
                  value=""
                  accessToken={session.access_token}
                  logoUrl="/images/mylynkr-logo.png"
                  onChange={(url) => {
                    if (!url) return;

                    setArticle((current) => ({
                      ...current,
                      content:
                        current.content.trimEnd() +
                        `\n\n![Article image](${url})\n\n`,
                    }));

                    setMessage(
                      "Image reference added to article."
                    );
                  }}
                />
              </div>
            </section>

            <aside className="news-admin-sidebar">
              <div className="news-admin-side-card">
                <span className="news-admin-kicker">
                  PUBLICATION
                </span>

                <div className="news-admin-current-status">
                  <span>Status</span>
                  <span
                    className={`news-admin-status ${article.status}`}
                  >
                    {article.status}
                  </span>
                </div>

                {article.status !== "published" && (
                  <button
                    type="button"
                    className="news-admin-secondary"
                    disabled={locked}
                    onClick={() => save(false)}
                  >
                    <Save size={17} />
                    Save Draft
                  </button>
                )}

                <button
                  type="button"
                  className="news-admin-primary"
                  disabled={locked}
                  onClick={() => save(true)}
                >
                  <ArrowUpRight size={17} />
                  {article.status === "published"
                    ? "Publish Changes"
                    : "Publish Only"}
                </button>

                {published && (
                  <a
                    className="news-admin-preview"
                    href={`/news/${article.slug}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Published Article
                    <ArrowUpRight size={15} />
                  </a>
                )}
              </div>

              <div className="news-admin-side-card">
                <span className="news-admin-kicker">
                  EMAIL NEWSLETTER
                </span>

                <p className="news-admin-hint">
                  From: new@mylynkr.com
                </p>

                <button
                  type="button"
                  className="news-admin-secondary"
                  disabled={locked || !published}
                  onClick={sendTest}
                >
                  <Mail size={17} />
                  {newsletterBusy
                    ? "Working..."
                    : "Send Test Email"}
                </button>

                {testSent && (
                  <p className="news-admin-hint">
                    Test accepted by Resend.
                    Confirm delivery and unsubscribe
                    before starting the campaign.
                  </p>
                )}

                {!campaign ? (
                  <button
                    type="button"
                    className="news-admin-primary"
                    disabled={
                      locked ||
                      !published ||
                      !testSent
                    }
                    onClick={startCampaign}
                  >
                    <Send size={17} />
                    Publish & Email
                  </button>
                ) : (
                  <>
                    <div className="news-admin-current-status">
                      <span>Campaign</span>
                      <span>{campaign.status}</span>
                    </div>

                    {stats && (
                      <div className="news-admin-field">
                        <p>
                          <strong>{stats.total}</strong>
                          {" "}queued recipients
                        </p>
                        <p>
                          {stats.sent} sent
                          {" · "}
                          {stats.failed} failed
                          {" · "}
                          {stats.skipped} skipped
                        </p>
                        <p>
                          {stats.pending} pending
                          {" · "}
                          {stats.processing} processing
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      className="news-admin-secondary"
                      disabled={locked}
                      onClick={refreshCampaign}
                    >
                      <RefreshCw size={16} />
                      Refresh Status
                    </button>

                    {campaign.status !== "completed" &&
                      remaining !== 0 && (
                        <button
                          type="button"
                          className="news-admin-primary"
                          disabled={locked}
                          onClick={processNextBatch}
                        >
                          <Send size={16} />
                          Send Next 5
                        </button>
                      )}
                  </>
                )}

                <p className="news-admin-hint">
                  Live campaigns are queued first.
                  Each batch sends up to five emails.
                  Test delivery and unsubscribe
                  before sending to subscribers.
                </p>
              </div>

              <div className="news-admin-side-card">
                <span className="news-admin-kicker">
                  COVER IMAGE
                </span>

                <NewsImageUpload
                  value={article.cover_image}
                  accessToken={session.access_token}
                  logoUrl="/images/mylynkr-logo.png"
                  onChange={(url) =>
                    update("cover_image", url)
                  }
                />
              </div>

              <div className="news-admin-side-card">
                <span className="news-admin-kicker">
                  ARTICLE DETAILS
                </span>

                <div className="news-admin-field">
                  <label htmlFor="news-category">
                    Category
                  </label>

                  <select
                    id="news-category"
                    value={article.category}
                    onChange={(e) =>
                      update("category", e.target.value)
                    }
                  >
                    <option>Company Update</option>
                    <option>Announcement</option>
                    <option>Development</option>
                    <option>Product News</option>
                    <option>Behind the Scenes</option>
                  </select>
                </div>
              </div>

              {article.id && (
                <button
                  type="button"
                  className="news-admin-delete"
                  disabled={locked || Boolean(campaign)}
                  onClick={removeArticle}
                >
                  <Trash2 size={16} />
                  Delete Article
                </button>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
