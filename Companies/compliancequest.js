const puppeteer = require("puppeteer");

async function scrapeComplianceQuest() {
  let url = "https://www.compliancequest.com/careers/";
  let jobSelector = ".accordion__item-header.title-6";
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
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(jobSelector);

    const jobsData = await page.$$eval(jobSelector, (jobTitles) => {
      return jobTitles.map((jobTitle) => {
        return {
          jobName: jobTitle.textContent.trim(),
          jobUrl: "https://www.compliancequest.com/careers/",
        };
      });
    });

    return {
      companyName: "Compliance Quest",
      totalJobs: jobsData,
    };
  } catch (error) {
    console.error("Error:", error);
    // Handle the error as needed
  } finally {
    await browser.close();
  }
}

// (async () => {
//   const scrapedData = await scrapeComplianceQuest();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeComplianceQuest,
};
