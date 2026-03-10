import "./App.css";

function App() {
  return (
    <main className="page">
      <div className="bg-grid" />

      <header className="topbar">
        <p className="brand">SnapLink</p>
        <nav>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Dashboard</a>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Shorten. Share. Measure.</p>
        <h1>Build smarter links with style and speed.</h1>
        <p className="subtitle">
          Turn long URLs into memorable short links and track every click from
          one beautiful dashboard.
        </p>

        <div className="shortener-panel">
          <label htmlFor="urlInput">Paste your long URL</label>
          <div className="input-row">
            <input
              id="urlInput"
              type="url"
              placeholder="https://example.com/very/long/link/to-share"
            />
            <button type="button">Shorten URL</button>
          </div>
          <div className="custom-row">
            <input type="text" placeholder="Custom alias (optional)" />
            <select defaultValue="30 days">
              <option>7 days</option>
              <option>30 days</option>
              <option>Never expire</option>
            </select>
          </div>
        </div>

        <article className="result-card">
          <p className="result-label">Preview</p>
          <p className="result-link">https://snplnk.app/summer-sale-2026</p>
          <div className="result-meta">
            <span>Status: Ready</span>
            <span>QR: Enabled</span>
            <span>Clicks: 0</span>
          </div>
        </article>
      </section>

      <section className="metrics">
        <article>
          <p className="metric-value">58K+</p>
          <p className="metric-label">Links Generated</p>
        </article>
        <article>
          <p className="metric-value">97.9%</p>
          <p className="metric-label">Uptime</p>
        </article>
        <article>
          <p className="metric-value">142</p>
          <p className="metric-label">Countries Reached</p>
        </article>
      </section>

      <section className="features">
        <article>
          <h3>Advanced Analytics</h3>
          <p>
            Track click location, device trends, and referrers in real time.
          </p>
        </article>
        <article>
          <h3>Branded Links</h3>
          <p>Create clean, custom aliases that match your brand voice.</p>
        </article>
        <article>
          <h3>Team Spaces</h3>
          <p>
            Manage campaigns with role-based access and shared link libraries.
          </p>
        </article>
      </section>
    </main>
  );
}

export default App;
