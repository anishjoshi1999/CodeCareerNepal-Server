const puppeteer = require("puppeteer");

async function scrapeMegaBitNepal() {
  let url = "https://jobs.lever.co/docsumo";
  let jobSelector = ".posting"; // Update this selector
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

    const jobsData = await page.$$eval(jobSelector, (jobElements) => {
      return jobElements.map((jobElement) => {
        const jobName = jobElement
          .querySelector("h5[data-qa='posting-name']")
          .textContent.trim();
        const jobUrl = jobElement.querySelector("a.posting-title").href;
        const jobLocation = jobElement
          .querySelector("span.sort-by-location")
          .textContent.trim();
        if (
          jobLocation.toLowerCase().includes("nepal") ||
          jobLocation.toLowerCase().includes("remote")
        ) {
          return {
            jobName,
            jobUrl,
          };
        }
      });
    });

    return {
      companyName: "MegaBit Nepal (Docsumo)",
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

// (async () => {
//   const scrapedData = await scrapeMegaBitNepal();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeMegaBitNepal,
};
