const puppeteer = require("puppeteer");

async function scrapeLogPoint() {
  const url = "https://www.logpoint.com/en/about-us/career-opportunities/";
  const jobSelector = ".BambooHR-ATS-Jobs-Item";

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(jobSelector);

    const jobs = await page.$$eval(jobSelector, (elements) => {
      // Only keep jobs in Kathmandu or Remote
      const allowedLocations = ["Kathmandu, Bagmati Pradesh", "Remote"];
      return elements
        .map((job) => {
          const jobName = job.querySelector("a")?.textContent.trim();
          const jobUrl = job.querySelector("a")?.href;
          const location = job
            .querySelector(".BambooHR-ATS-Location")
            ?.textContent.trim();
          return { jobName, jobUrl, location };
        })
        .filter((job) => allowedLocations.includes(job.location));
    });

    return {
      companyName: "LogPoint",
      totalJobs: jobs,
    };
  } catch (error) {
    console.error("Error scraping LogPoint:", error);
    return { companyName: "LogPoint", jobs: [] };
  } finally {
    await browser.close();
  }
}

module.exports = {
  scrapeLogPoint,
};
