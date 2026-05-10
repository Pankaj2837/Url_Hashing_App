const { createShortUrl } = require("./models/Url.model");

async function testShortener() {
  try {
    console.log("--- Starting URL Shortening Process ---");

    // Test with a dummy URL
    const longUrl =
      "https://www.google.com/search?q=system+design+interview+prep";
    const result = await createShortUrl(longUrl);

    console.log("✅ Success!");
    console.log("Original URL:", result.longUrl);
    console.log("Reserved ID:", result.id);
    console.log("Generated Short Code:", result.shortCode);

    process.exit(0);
  } catch (err) {
    console.error("❌ Logic Test Failed!");
    console.error(err);
    process.exit(1);
  }
}

testShortener();
