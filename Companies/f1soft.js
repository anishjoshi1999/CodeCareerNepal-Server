const puppeteer = require("puppeteer");

async function scrapeF1Soft() {
  const baseUrl = "https://career.f1soft.com/jobs";
  const jobSelector = ".features-job.cl2";
  const nextSelector = ".pagination li a[rel='next']";

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();
  let allJobs = [];
  let currentPage = 1;
  let hasNext = true;

  try {
    while (hasNext) {
      console.log(`🟩 Scraping page ${currentPage}...`);
      await page.goto(`${baseUrl}?page=${currentPage}`, {
        waitUntil: "domcontentloaded",
        timeout: 0,
      });

      await page.waitForSelector(jobSelector, { timeout: 10000 });

      const jobsOnPage = await page.$$eval(jobSelector, (elems) =>
        elems.map((el) => {
          const jobTitle = el.querySelector("h3 a")?.textContent?.trim() || "";
          const jobUrl = el.querySelector("h3 a")?.href || "";

          const companyName =
            el.querySelector(".fw-600.text-f1.small")?.textContent?.trim() ||
            "F1Soft International";

          const location =
            el.querySelector(".icon-map-pin + span")?.textContent?.trim() || "";
          const postedDate =
            el.querySelector(".icon-calendar + span")?.textContent?.trim() ||
            "";
          const jobType =
            el
              .querySelector(".job-tag li:nth-child(1) a")
              ?.textContent?.trim() || "";
          const level =
            el
              .querySelector(".job-tag li:nth-child(2) a")
              ?.textContent?.trim() || "";
          const category =
            el
              .querySelector(".job-tag li:nth-child(3) a")
              ?.textContent?.trim() || "";
          const deadline =
            el.querySelector(".days span:last-child")?.textContent?.trim() ||
            "";

          return {
            jobName: `${jobTitle} at ${companyName}`,
            jobUrl,
          };
        })
      );

      allJobs.push(...jobsOnPage);

      // Check for "Next" page
      const nextBtn = await page.$(nextSelector);
      if (nextBtn) {
        currentPage++;
        await new Promise((resolve) => setTimeout(resolve, 1500)); // ✅ replaced waitForTimeout
      } else {
        hasNext = false;
      }
    }

    console.log(`✅ Total jobs scraped from F1Soft: ${allJobs.length}`);

    return {
      companyName: "F1Soft Group",
      totalJobs: allJobs,
    };
  } catch (error) {
    console.error("❌ Error while scraping F1Soft careers:", error);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeF1Soft };
