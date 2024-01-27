const puppeteer = require("puppeteer");

async function scrapeCodePixelzMedia() {
  let url = "https://codepixelzmedia.com/careers/";
  let jobSelector = ".elementor-tab-title a"; // Update the selector to match the job titles

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
          jobUrl: "https://codepixelzmedia.com/careers/",
        };
      });
    });

    return {
      companyName: "CodePixelzMedia",
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
//   const scrapedData = await scrapeCodePixelzMedia();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeCodePixelzMedia,
};
