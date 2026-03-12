import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./App.css";

function App() {
  const [url, setURL] = useState({
    originalUrl: "",
  });
  const [shortedURL, setShortedURL] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy");

  async function HandleURL() {
    try {
      console.log(url);
      const shortUrlResponse = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        url,
      );
      setShortedURL(shortUrlResponse.data.shortUrl);
      console.log(shortUrlResponse);
      setURL({
        originalUrl: "",
      });
      toast.success("Login successful!");
    } catch (e) {
      toast.error(e.response.data.message);
    }
  }

  const HandleCopy = async () => {
    try {
      // Use the Clipboard API to write the state value to the clipboard
      await navigator.clipboard.writeText(shortedURL);

      // 3. (Optional) Provide user feedback
      setCopyStatus("Copied!");
      setTimeout(() => {
        setCopyStatus("Copy");
      }, 1500); // Revert button text after 1.5 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
    }
  };

  return (
    <main className="page">
      <div className="bg-grid" />

      <header className="topbar">
        <p className="brand">SnapLink</p>
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
              value={url.originalUrl}
              placeholder="https://example.com/very/long/link/to-share"
              onChange={(e) => {
                setURL({
                  originalUrl: e.target.value,
                });
              }}
            />
            <button type="button" onClick={HandleURL}>
              Shorten URL
            </button>
          </div>
          <br />

          {shortedURL && (
            <>
              <br />
              <label htmlFor="urlInput">Result</label>
              <div className="input-row">
                <input id="urlInput" type="url" value={shortedURL} />
                <button type="button" onClick={HandleCopy}>
                  {copyStatus}
                </button>
              </div>
            </>
          )}
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
