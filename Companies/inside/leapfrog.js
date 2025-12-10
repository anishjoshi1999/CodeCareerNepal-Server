const puppeteer = require("puppeteer");

async function scrapeLeapFrogJobDetails(url) {
  const browser = await puppeteer.launch({
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const jobDescriptionText = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h2"));

      const getSectionText = (title) => {
        const heading = headings.find(h => h.textContent.trim().toLowerCase() === title.toLowerCase());
        return heading?.nextElementSibling?.innerText.trim() || "";
      };

      const description = getSectionText("job description");
      const requirements = getSectionText("job requirements");

      return `${description}\n\n${requirements}`;
    });

    return { jobUrl: url, jobDescriptionText };

  } catch (error) {
    console.error("Error scraping job details:", error);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeLeapFrogJobDetails };
