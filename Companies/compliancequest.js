const puppeteer = require("puppeteer");

async function scrapeComplianceQuest() {
  const url = "https://www.compliancequest.com/careers/";
  const viewAllSelector = ".mt-expand-btn1 .text"; // "View All Jobs" button
  const jobContainerSelector = ".job-container .openings-sec";

  const browser = await puppeteer.launch({
    args: ["--disable-setuid-sandbox", "--no-sandbox"],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Click the "View All Jobs" button if it exists
    const viewAllButton = await page.$(viewAllSelector);
    if (viewAllButton) {
      await viewAllButton.click();
      // Wait for the job container to appear after clicking
      await page.waitForSelector(jobContainerSelector, { timeout: 5000 });
    }

    // Grab all jobs for Lalitpur, Nepal
    const jobsData = await page.$$eval(jobContainerSelector, (jobs) =>
      jobs
        .filter(
          (job) =>
            job.querySelector(".location") &&
            job.querySelector(".location").textContent.includes("Lalitpur, Nepal")
        )
        .map((job) => ({
          jobName: job.querySelector(".title")?.textContent.trim() || "",
          location: job.querySelector(".location")?.textContent.trim() || "",
          jobUrl: "https://www.compliancequest.com/careers/",
        }))
    );

    return {
      companyName: "Compliance Quest",
      totalJobs: jobsData,
    };
  } catch (error) {
    console.error("Error scraping Compliance Quest:", error);
    return { companyName: "Compliance Quest", totalJobs: [] };
  } finally {
    await browser.close();
  }
}

module.exports = {
  scrapeComplianceQuest,
};
