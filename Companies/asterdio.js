const puppeteer = require("puppeteer");

async function scrapeAsterdio() {
  const url = "https://asterdio.com/job-openings/";
  const jobSelector = ".awsm-job-listing-item";

  const browser = await puppeteer.launch({
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
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(jobSelector);

    const jobsData = await page.$$eval(jobSelector, (jobs) => {
      return jobs
        .map((job) => {
          const titleElement = job.querySelector("h2.awsm-job-post-title a");
          const jobName = titleElement ? titleElement.textContent.trim() : null;
          const jobUrl = titleElement ? titleElement.href : null;

          return { jobName, jobUrl };
        })
        .filter((job) => job.jobName && job.jobUrl); // filter out empty results
    });

    return {
      companyName: "Asterdio",
      totalJobs: jobsData,
    };
  } catch (error) {
    console.error("Error scraping Asterdio:", error);
  } finally {
    await browser.close();
  }
}

module.exports = {
  scrapeAsterdio,
};
