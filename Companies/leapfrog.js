const puppeteer = require("puppeteer");

async function scrapeLeapFrog() {
  let url = "https://career.lftechnology.com/";
  let jobSelector = ".sc-uzptka-1.dFOnQG"; // job card container

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

    const jobData = await page.$$eval(jobSelector, (jobs) => {
      return jobs
        .map((job) => {
          const jobName = job.querySelector(".eJyqCF")?.textContent?.trim();
          const jobUrl =
            "https://career.lftechnology.com" +
            job.querySelector(".eJyqCF")?.getAttribute("href");

          const locationEl = job.querySelector(
            "[data-testid='styled-location-list-item'] .custom-css-style-job-location-city"
          );
          const location = locationEl ? locationEl.textContent.trim() : "";

          return { jobName, jobUrl, location };
        })
        .filter((job) => job.location === "Kathmandu"); // ✅ only Kathmandu
    });

    return {
      companyName: "Leapfrog",
      totalJobs: jobData,
    };
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

module.exports = {
  scrapeLeapFrog,
};
