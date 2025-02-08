const puppeteer = require("puppeteer");

async function scrapeCedargate() {
  let url = "https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=9200975014487_2&lang=en_US";
  let jobSelector = ".current-openings-item";

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

    const elements = await page.$$eval(jobSelector, (cards) => {
      return cards.map((card) => {
        const jobTitleElement = card.querySelector("sdf-button[aria-label]");
        const jobUrlElement = card.querySelector(".current-openings-apply sdf-button");
        const locationElement = card.querySelector(".current-opening-location-item");
        const postDateElement = card.querySelector(".current-opening-post-date");
        const workerCategoryElement = card.querySelector(".current-opening-worker-catergory");

        return {
          jobName: jobTitleElement ? jobTitleElement.getAttribute("aria-label") : "N/A",
          jobUrl: jobUrlElement ? `https://workforcenow.adp.com/${jobUrlElement.getAttribute("id")}` : "#",
          location: locationElement ? locationElement.textContent.trim() : "N/A",
          postDate: postDateElement ? postDateElement.textContent.trim() : "N/A",
          workerCategory: workerCategoryElement ? workerCategoryElement.textContent.trim() : "N/A",
        };
      });
    });

    let refined = elements.map((job) => {
      return {
        jobName: job.jobName,
        jobUrl: job.jobUrl,
        location: job.location,
        postDate: job.postDate,
        workerCategory: job.workerCategory,
      };
    });

    return {
      companyName: "Cedar Gate Technologies",
      totalJobs: [...refined],
    };
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeCedargate };