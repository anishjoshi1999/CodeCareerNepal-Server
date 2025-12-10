const puppeteer = require("puppeteer");

async function scrapeFuseMachine() {
  let url = "https://fusemachines.com/careers/";
  let jobSelector = ".list-group-item";

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
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(jobSelector);

    const elements = await page.$$eval(jobSelector, (elems) => {
      return elems.map((element) => {
        const jobName = element
          .querySelector(".list-group-item-heading a")
          .textContent.trim();

        const jobLocation =
          element
            .querySelector(".list-inline.list-group-item-text li:first-child")
            ?.textContent.trim() || "Not provided";

        const jobUrl =
          element
            .querySelector(".list-group-item-heading a")
            .getAttribute("href") || "";

        return { jobName, jobLocation, jobUrl };
      });
    });

    // Return ALL JOBS
    return {
      companyName: "FuseMachine",
      totalJobs: elements,
      isDirectApply: true,
    };
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeFuseMachine };
