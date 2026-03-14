import http from "k6/http";
import { check, sleep } from "k6";

// Configuration: Simulate 100 virtual users for 30 seconds
export const options = {
  vus: 100,
  duration: "30s",
};

export default function () {
  // Replace 'V1StGXR' with a valid short code that already exists in your database
  const url = "http://host.docker.internal:5000/JDpO7pk";

  // Send the GET request. Note: We use redirects: 0 to stop k6 from following the 302 redirect
  // We only want to measure OUR server's response time, not Google's.
  const res = http.get(url, { redirects: 0 });

  // Validate that the server successfully returned a 302 or 301 redirect
  check(res, {
    "is status 302 or 301": (r) => r.status === 302 || r.status === 301,
  });

  // Small pause to simulate real user behavior
  sleep(0.1);
}
