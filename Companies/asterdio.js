const puppeteer = require("puppeteer");

async function scrapeAsterdio() {
  let url = "https://retalent.io/employer/asterdio-inc";
  let jobSelector = ".job-list";
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

    const jobsData = await page.$$eval(jobSelector, (jobs) => {
      return jobs.map((job) => {
        const titleElement = job.querySelector(".job-title a");
        const jobName = titleElement.textContent.trim();
        const jobUrl = titleElement.href;

        return {
          jobName,
          jobUrl,
        };
      });
    });

    return {
      companyName: "Asterdio",
      jobListings: jobsData,
    };
  } catch (error) {
    console.error("Error:", error);
    // Handle the error as needed
  } finally {
    await browser.close();
  }
}

// (async () => {
//   const scrapedData = await scrapeAsterdio();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeAsterdio,
};
