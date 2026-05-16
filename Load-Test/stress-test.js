import http from "k6/http";
import { check, sleep } from "k6";

// 1. Configuration Options
export const options = {
  stages: [
    { duration: "30s", target: 50 }, // Ramp-up: 0 to 50 virtual users
    { duration: "1m", target: 50 }, // Stress: Stay at 50 users
    { duration: "30s", target: 0 }, // Ramp-down: Back to 0
  ],
  thresholds: {
    http_req_duration: ["p(95)<200"], // 95% of requests must be under 200ms
    http_req_failed: ["rate<0.01"], // Error rate must be less than 1%
  },
};

export default function () {
  // 2. Setup Request Data
  const url = "http://localhost/api/url/shorten";

  const payload = JSON.stringify({
    longUrl: `https://dubaiculture.gov.ae/test/${Math.random()}`,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc3ODkxNjYwOCwiZXhwIjoxNzc4OTIwMjA4fQ.sL8cmrTYltBhEOm-W7M9BdPui9oTYWjV77jIR20YdGw",
    },
  };

  // 3. Execute the Request
  const res = http.post(url, payload, params);

  // 4. Validate the Results
  // 4. Validate the Results safely
  check(res, {
    "status is 200/201": (r) => r.status === 200 || r.status === 201,
    "has short_code": (r) => {
      try {
        return r.json() && r.json().short_code !== undefined;
      } catch (e) {
        return false;
      }
    },
    "correct long_url": (r) => {
      try {
        return (
          r.json() &&
          r.json().long_url &&
          r.json().long_url.includes("dubaiculture.gov.ae")
        );
      } catch (e) {
        return false;
      }
    },
  });

  // 5. User Pacing
  sleep(1);
}
