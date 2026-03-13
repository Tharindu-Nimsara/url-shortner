import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsDashboard({ shortCode }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Fetch data from your new Express API
    fetch(
      `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/analytics/${shortCode}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setData(
          (data.timeline ?? []).map((row) => ({
            ...row,
            clicks: parseInt(row.clicks, 10),
          })),
        );
        setTotal(data.totalClicks ?? 0);
      })
      .catch((err) => {
        console.error("Analytics fetch failed:", err);
        setData([]);
        setTotal(0);
      });
  }, [shortCode]);

  return (
    <div
      style={{
        padding: "1rem",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        Total Clicks: {total}
      </h2>

      <div style={{ width: "100%", height: 256 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
