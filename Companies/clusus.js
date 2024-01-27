const puppeteer = require("puppeteer");

async function scrapeClusus() {
  let url = "https://www.clusus.com/careers";
  let jobSelector = ".card-body";

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

    const jobsData = await page.$$eval(jobSelector, (jobCards) => {
      return jobCards.map((jobCard) => {
        const jobTitle = jobCard
          .querySelector("h4.text-primary")
          .textContent.trim();
        const location = jobCard
          .querySelector("div.text-secondary span")
          .textContent.trim();
        const jobUrl = jobCard.querySelector("a.btn-primary").href;
        if (location.includes("Nepal")) {
          return {
            jobName: jobTitle,
            jobUrl: jobUrl,
          };
        }
      });
    });

    return {
      companyName: "Clusus",
      totalJobs: jobsData.filter((e) => {
        return e != null;
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    // Handle the error as needed
  } finally {
    await browser.close();
  }
}

(async () => {
  const scrapedData = await scrapeClusus();
  console.log(scrapedData);
})();
// module.exports = {
//   scrapeClusus,
// };
