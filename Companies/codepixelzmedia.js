const puppeteer = require("puppeteer");

async function scrapeCodePixelzMedia() {
  const url = "https://codepixelzmedia.com/careers/";
  const jobSelector = ".eael-accordion-tab-title"; // Updated selector

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

    const jobsData = await page.$$eval(jobSelector, (jobDivs) =>
      jobDivs.map((job) => ({
        jobName: job.textContent.trim(),
        jobUrl: "https://codepixelzmedia.com/careers/", // No individual URLs provided
      }))
    );

    return {
      companyName: "CodePixelzMedia",
      totalJobs: jobsData,
    };
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}
module.exports = {
  scrapeCodePixelzMedia,
};
