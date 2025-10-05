const puppeteer = require("puppeteer");

async function scrapeDeerhold() {
   const url = "https://www.deerhold.com/careers";
  const jobSelector = ".career-row";

  const browser = await puppeteer.launch({
    args: ["--disable-setuid-sandbox", "--no-sandbox", "--single-process", "--no-zygote"],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(jobSelector);

    const jobsData = await page.$$eval(jobSelector, (jobs) => {
      const baseUri = "https://www.deerhold.com";
      return jobs.map((job) => {
        const columns = job.querySelectorAll("td");
        const jobName = columns[0].textContent.trim();
        const location = columns[1].textContent.trim();
        const openings = columns[2].textContent.trim();
        const deadline = columns[3].textContent.trim();
        const jobUrl = baseUri + columns[4].querySelector("a").getAttribute("href");

        return { jobName, location, openings, deadline, jobUrl };
      });
    });

    return {
      companyName: "Deerhold",
      totalJobs: jobsData,
    };
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

module.exports = {
  scrapeDeerhold,
};
