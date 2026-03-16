import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

import "./App.css";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { API_BASE_URL } from "./config";

function extractShortCode(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    return parsedUrl.pathname.replace(/^\//, "");
  } catch {
    return trimmedValue.replace(/^\//, "");
  }
}

async function copyTextToClipboard(text) {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = text;
  tempTextArea.setAttribute("readonly", "");
  tempTextArea.style.position = "absolute";
  tempTextArea.style.left = "-9999px";
  document.body.appendChild(tempTextArea);
  tempTextArea.select();

  const copySucceeded = document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  if (!copySucceeded) {
    throw new Error("Clipboard API is unavailable");
  }
}

function normalizeReturnedShortUrl(shortUrl) {
  if (!shortUrl || typeof shortUrl !== "string") {
    return "";
  }

  const shortCode = extractShortCode(shortUrl);
  if (!shortCode) {
    return shortUrl;
  }

  return `${API_BASE_URL}/${shortCode}`;
}

function App() {
  const [url1, setURL] = useState({
    originalUrl: "",
  });
  const [shortCode, setShortCode] = useState("");
  const [analyticsCode, setAnalyticsCode] = useState("");
  const [shortedURL, setShortedURL] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy");

  async function HandleURL() {
    try {
      console.log(url1);
      const shortUrlResponse = await axios.post(API_BASE_URL, url1);

      console.log(shortUrlResponse);

      setShortedURL(normalizeReturnedShortUrl(shortUrlResponse.data.shortUrl));

      setURL({
        originalUrl: "",
      }); // clear input URL
      toast.success("successful!");
    } catch (e) {
      const errorMessage =
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        "Request failed";
      toast.error(errorMessage);
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
    if (!shortedURL) {
      toast.error("No short URL to copy.");
      return;
    }

    try {
      await copyTextToClipboard(shortedURL);

      setCopyStatus("Copied!");
      setTimeout(() => {
        setCopyStatus("Copy");
      }, 1500);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Copy failed. Please copy manually.");
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
              value={url1.originalUrl}
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
              placeholder={`${API_BASE_URL}/your-short-code`}
              onChange={(e) => {
                const code = extractShortCode(e.target.value);
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
