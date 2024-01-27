const puppeteer = require("puppeteer");

async function scrapeAmnilTech() {
  let url = "https://www.amniltech.com/career#vacancies";
  let jobSelector = ".accordion-button.h3";
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
          jobUrl: "https://www.amniltech.com/career#vacancies",
        };
      });
    });

    return {
      companyName: "AmnilTech",
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
//   const scrapedData = await scrapeAmnilTech();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeAmnilTech,
};
