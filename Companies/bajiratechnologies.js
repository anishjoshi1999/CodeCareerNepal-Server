const puppeteer = require("puppeteer");

async function scrapeBajraTechnologies() {
  let url = "https://bajratechnologies.com/jobs#jobs_grid";
  let jobSelector = ".list-unstyled > li.media > div.media-body > a"; // Updated selector
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

    const jobsData = await page.$$eval(jobSelector, (jobLinks) => {
      return jobLinks.map((jobLink) => {
        return {
          jobName: jobLink.querySelector("h4").textContent.trim(),
          jobUrl:
            "https://bajratechnologies.com" + jobLink.getAttribute("href"),
        };
      });
    });

    return {
      companyName: "Bajra Technologies",
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
//   const scrapedData = await scrapeBajraTechnologies();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeBajraTechnologies,
};
