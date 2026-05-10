import http from "k6/http"; // This was likely missing or broken
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 20 }, // Let's do a shorter test to debug
  ],
};

export default function () {
  const url = "http://localhost:3000/api/url/shorten";

  const payload = JSON.stringify({
    longUrl: `https://example.com/${Math.random()}`,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "x-load-test": "true",
    },
  };

  const res = http.post(url, payload, params);

  // 🕵️‍♂️ This will print the status of the first few failures to your terminal
  if (res.status !== 201) {
    console.log(`❌ Status: ${res.status} | Body: ${res.body}`);
  }

  check(res, {
    "is status 201": (r) => r.status === 201,
  });

  sleep(0.1);
}
