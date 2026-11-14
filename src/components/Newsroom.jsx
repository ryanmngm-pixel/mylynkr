
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Newspaper,
} from "lucide-react";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchNews({ slug, limit } = {}) {
  if (!URL || !KEY) {
    throw new Error("Supabase is not configured.");
  }

  const params = new URLSearchParams({
    select:
      "id,slug,title,excerpt,content,cover_image,category,published_at",
    status: "eq.published",
    order: "published_at.desc",
  });

  if (slug) params.set("slug", `eq.${slug}`);
  if (limit) params.set("limit", String(limit));

  const response = await fetch(
    `${URL.replace(/\/$/, "")}/rest/v1/news_articles?${params}`,
    {
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load newsroom articles.");
  }

  return response.json();
}

function useNews(options) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const slug = options?.slug;
  const limit = options?.limit;

  useEffect(() => {
    let active = true;

    fetchNews({ slug, limit })
      .then((data) => {
        if (active) setArticles(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, limit]);

  return { articles, loading, error };
}

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function ArticleImage({ article }) {
  return article.cover_image ? (
    <img
      src={article.cover_image}
      alt=""
      loading="lazy"
      className="news-cover"
    />
  ) : (
    <div className="news-cover-placeholder">
      <Newspaper size={44} strokeWidth={1} />
      <span>MYLYNKR NEWSROOM</span>
    </div>
  );
}

export function LatestNews() {
  const { articles, loading, error } = useNews({
    limit: 1,
  });

  const article = articles[0];

  return (
    <aside className="latest-news-panel">
      <div className="latest-news-header">
        <span>MYLYNKR / NEWSROOM</span>
        <span className="news-live">
          <span className="news-live-dot" />
          LATEST NEWS
        </span>
      </div>

      {loading ? (
        <div className="latest-news-empty">
          Loading latest updates...
        </div>
      ) : error ? (
        <div className="latest-news-empty">
          News is temporarily unavailable.
        </div>
      ) : article ? (
        <a
          href={`/news/${article.slug}`}
          className="latest-news-feature"
        >
          <ArticleImage article={article} />

          <div className="latest-news-content">
            <span className="news-meta">
              {article.category} ·{" "}
              {formatDate(article.published_at)}
            </span>

            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>

            <span className="news-read-link">
              Read the story
              <ArrowUpRight size={17} />
            </span>
          </div>
        </a>
      ) : (
        <div className="latest-news-empty">
          <Newspaper size={32} strokeWidth={1.2} />
          <h3>Something is coming.</h3>
          <p>
            Our first official update is on the way.
          </p>
        </div>
      )}

      <div className="latest-news-footer">
        <span>THE MYLYNKR JOURNAL</span>

        <a href="/news">
          ALL NEWS
          <ArrowUpRight size={15} />
        </a>
      </div>
    </aside>
  );
}

export function NewsroomPage() {
  const { articles, loading, error } = useNews();

  return (
    <div className="news-page">
      <header className="news-site-header">
        <a href="/" className="news-site-brand">
          <img
            src="/images/mylynkr-logo.png"
            alt=""
          />
          mylynkr
        </a>

        <a href="/" className="news-back">
          <ArrowLeft size={16} />
          Back to Home
        </a>
      </header>

      <main className="news-page-inner">
        <div className="news-page-intro">
          <span className="news-kicker">
            MYLYNKR / OFFICIAL UPDATES
          </span>

          <h1>
            The MyLynkr
            <br />
            <span>Newsroom.</span>
          </h1>

          <p>
            Announcements, progress, and a closer look
            at what we're building.
          </p>
        </div>

        {loading ? (
          <p className="news-message">
            Loading articles...
          </p>
        ) : error ? (
          <p className="news-message" role="alert">
            We couldn't load the newsroom right now.
          </p>
        ) : articles.length === 0 ? (
          <div className="news-empty-state">
            <Newspaper size={38} strokeWidth={1} />
            <h2>Our story is just beginning.</h2>
            <p>
              Check back for the first official MyLynkr
              announcement.
            </p>
          </div>
        ) : (
          <div className="news-article-grid">
            {articles.map((article) => (
              <a
                className="news-article-card"
                href={`/news/${article.slug}`}
                key={article.id}
              >
                <ArticleImage article={article} />

                <div className="news-article-card-body">
                  <span className="news-meta">
                    {article.category} ·{" "}
                    {formatDate(article.published_at)}
                  </span>

                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>

                  <span className="news-read-link">
                    Read article
                    <ArrowRight size={16} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="news-page-footer">
        <span>
          © {new Date().getFullYear()} MyLynkr
        </span>

        <a href="/email-preferences">
          Email Preferences
        </a>
      </footer>
    </div>
  );
}

export function NewsArticlePage({ slug }) {
  const { articles, loading, error } = useNews({
    slug,
    limit: 1,
  });

  const article = articles[0];

  return (
    <div className="news-page">
      <header className="news-site-header">
        <a href="/" className="news-site-brand">
          <img
            src="/images/mylynkr-logo.png"
            alt=""
          />
          mylynkr
        </a>

        <a href="/news" className="news-back">
          <ArrowLeft size={16} />
          All News
        </a>
      </header>

      <main className="news-page-inner">
        {loading ? (
          <p className="news-message">
            Loading article...
          </p>
        ) : error ? (
          <p className="news-message" role="alert">
            This article couldn't be loaded.
          </p>
        ) : !article ? (
          <div className="news-empty-state">
            <h1>Article not found.</h1>
            <a href="/news">Return to newsroom</a>
          </div>
        ) : (
          <article className="news-full-article">
            <span className="news-kicker">
              {article.category} ·{" "}
              {formatDate(article.published_at)}
            </span>

            <h1>{article.title}</h1>
            <p className="news-article-excerpt">
              {article.excerpt}
            </p>

            <ArticleImage article={article} />

            <div className="news-article-content">
              {article.content
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            <a href="/news" className="news-back">
              <ArrowLeft size={16} />
              Back to Newsroom
            </a>
          </article>
        )}
      </main>

      <footer className="news-page-footer">
        <span>
          © {new Date().getFullYear()} MyLynkr
        </span>

        <a href="/email-preferences">
          Email Preferences
        </a>
      </footer>
    </div>
  );
}
