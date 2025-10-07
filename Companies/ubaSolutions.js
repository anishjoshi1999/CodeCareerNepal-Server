const puppeteer = require("puppeteer");

async function scrapeUBASolutions() {
  const url = "https://uba-solutions.com/career/"; // Fixed URL
  const jobSelector = ".uba-list__list-item";

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

  try {
    // Load full page (wait for network activity to settle)
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    // Wait for the section with animation to be visible
    await page.waitForSelector("#job-openning", { timeout: 30000 });

    // Wait for job list items to be rendered
    await page.waitForSelector(jobSelector, { timeout: 30000 });

    const jobs = await page.$$eval(jobSelector, (items) =>
      items.map((item) => {
        const titleElem = item.querySelector(".uba-list--career__title a");
        const typeElem = item.querySelector(".uba-list--career__job-type");

        return {
          jobName: titleElem ? titleElem.textContent.trim() : null,
          jobUrl: titleElem ? titleElem.href : null,
          jobType: typeElem ? typeElem.textContent.trim() : null,
        };
      })
    );

    // Filter out any null entries
    const validJobs = jobs.filter(job => job.jobName && job.jobUrl);

    return {
      companyName: "UBA Solutions",
      totalJobs: validJobs,
    };
  } catch (error) {
    console.error("Error scraping UBA Solutions:", error);
    return {
      companyName: "UBA Solutions",
      totalJobs: [],
      error: error.message,
    };
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeUBASolutions };