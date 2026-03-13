import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

import "./App.css";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function App() {
  const [url, setURL] = useState({
    originalUrl: "",
  });
  const [shortCode, setShortCode] = useState("");
  const [analyticsCode, setAnalyticsCode] = useState("");
  const [shortedURL, setShortedURL] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy");

  async function HandleURL() {
    try {
      console.log(url);
      const shortUrlResponse = await axios.post(
        import.meta.env.VITE_BACKEND_URL,
        url,
      );

      console.log(shortUrlResponse);

      setShortedURL(shortUrlResponse.data.shortUrl); // http://localhost:5000/UmOEtk2

      setURL({
        originalUrl: "",
      }); // clear input URL
      toast.success("successful!");
    } catch (e) {
      toast.error(e.response.data.message);
    }
  }

  async function HandleShortURL() {
    if (!shortCode) {
      toast.error("Please enter a short URL to analyze.");
      return;
    }
    setAnalyticsCode(shortCode);
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
      <Toaster position="top-right" />
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

        <div className="shortener-panel">
          <label htmlFor="urlInput">Analyze Your Short URL</label>
          <div className="input-row">
            <input
              id="urlInputshort"
              type="url"
              placeholder="http://localhost:5000/sdjlfsdk"
              onChange={(e) => {
                const code = e.target.value.replace(
                  /^https?:\/\/localhost:5000\//,
                  "",
                );
                setShortCode(code);
                setAnalyticsCode(code);
              }}
            />
            <button type="button" className="analyze" onClick={HandleShortURL}>
              Analyze
            </button>
          </div>
          <div>
            {analyticsCode && <AnalyticsDashboard shortCode={analyticsCode} />}
          </div>
        </div>

       
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
