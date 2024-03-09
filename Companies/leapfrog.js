const puppeteer = require("puppeteer");

async function scrapeLeapFrog() {
  let url = "https://career.lftechnology.com/";
  let jobSelector = ".sc-uzptka-1.dFOnQG";

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

    const jobData = await page.$$eval(jobSelector, (jobs) => {
      return jobs.map((job) => {
        const jobName = job.querySelector(".eJyqCF").textContent.trim();
        const jobUrl =
          "https://career.lftechnology.com" +
          job.querySelector(".eJyqCF").getAttribute("href");
        return { jobName, jobUrl };
      });
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

// (async () => {
//   const scrapedData = await scrapeLeapfrog();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeLeapFrog,
};
