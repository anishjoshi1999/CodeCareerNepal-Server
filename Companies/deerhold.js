const puppeteer = require("puppeteer");

async function scrapeDeerhold() {
  let url = "https://www.deerhold.com/careers";
  let jobSelector = ".career-row";
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
      let uri = "https://www.deerhold.com";
      return jobs.map((job) => {
        const columns = job.querySelectorAll("td");
        const jobName = columns[0].textContent.trim();
        // const openings = columns[1].textContent.trim();
        // const deadline = columns[2].textContent.trim();
        const jobUrl = uri + columns[3].querySelector("a").getAttribute("href");

        return {
          jobName,
          jobUrl,
          //   deadline,
          //   url,
        };
      });
    });

    return {
      companyName: "Deerhold",
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
//   const scrapedData = await scrapeDeerhold();
//   console.log(scrapedData);
// })();

module.exports = {
  scrapeDeerhold,
};
