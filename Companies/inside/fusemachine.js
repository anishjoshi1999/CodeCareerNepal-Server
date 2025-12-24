const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

async function scrapeFuseMachineJobDetails(url) {
  console.log("🚀 Starting FuseMachine job scrape");
  console.log("🔗 Job URL:", url);
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");

  let browser;

  try {
    console.log("🧠 Launching browser...");

    browser = await puppeteer.launch({
      headless: "new", // run headful to bypass bot detection
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
        "--disable-blink-features=AutomationControlled",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    console.log("✅ Browser launched");

    const page = await browser.newPage();
    console.log("📄 New page created");

    // Spoof user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    // Optional: log page console messages
    page.on("console", msg => console.log("🖥️ PAGE LOG:", msg.text()));
    page.on("pageerror", err => console.error("🔥 PAGE ERROR:", err.message));

    // Navigate with retries
    const maxRetries = 2;
    let success = false;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🌐 Navigating to job page (attempt ${attempt + 1})...`);
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
        success = true;
        console.log("✅ Page loaded successfully");
        break;
      } catch (err) {
        console.warn(`⚠️ Navigation attempt ${attempt + 1} failed: ${err.message}`);
        if (attempt === maxRetries) throw err;
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log("⏳ Waiting for job description (#job-description)...");
    await page.waitForSelector("#job-description", { timeout: 15000 });
    console.log("✅ Job description element found");

    console.log("📥 Extracting job description text...");
    const jobDescriptionText = await page.$eval(
      "#job-description",
      el => el.innerText.trim()
    );
    console.log(`📝 Job description extracted (${jobDescriptionText.length} characters)`);

    console.log("🎯 Scraping completed successfully");
    return {
      jobUrl: url,
      jobDescriptionText,
    };

  } catch (error) {
    console.error("❌ Error scraping job details");
    console.error("🔍 URL:", url);
    console.error("🧨 Error message:", error.message);

    // Take screenshot for debugging
    try {
      const screenshotPath = path.join(__dirname, "fusemachine-error.png");
      if (browser) {
        const pages = await browser.pages();
        if (pages.length > 0) {
          await pages[0].screenshot({ path: screenshotPath, fullPage: true });
          console.log("📸 Screenshot saved at", screenshotPath);
        }
      }
    } catch (screenshotErr) {
      console.error("⚠️ Failed to take screenshot:", screenshotErr.message);
    }

    return null;
  } finally {
    if (browser) {
      console.log("🧹 Closing browser...");
      await browser.close();
      console.log("✅ Browser closed");
    }
  }
}

module.exports = { scrapeFuseMachineJobDetails };
