const puppeteer = require("puppeteer");

async function scrapeEbPearlsJob(url) {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".page-heading");

    // Main content is inside #contents and .about-role
    const jobDescriptionText = await page.evaluate(() => {
      const parts = [];

      // About role section
      const about = document.querySelector(".about-role");
      if (about) parts.push(about.innerText.trim());

      // Full expandable content section
      const full = document.querySelector("#contents");
      if (full) parts.push(full.innerText.trim());

      return parts.join("\n\n"); // merged text
    });

    return {
      jobUrl: url,
      jobDescriptionText,
    };

  } catch (err) {
    console.error("Error scraping EB Pearls:", err);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeEbPearlsJob };
