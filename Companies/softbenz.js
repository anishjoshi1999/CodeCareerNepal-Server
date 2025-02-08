const puppeteer = require("puppeteer");

async function scrapeSoftBenz() {
  let url = "https://softbenz.com/career";
  let jobSelector = ".career__card";

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
        return {
          jobName: card.querySelector("h3").textContent.trim(),
          // jobCategory:
          //   card.querySelector(".tags span")?.textContent.trim() || "Unknown",
          // postDate:
          //   card
          //     .querySelector(".date")
          //     ?.textContent.replace("Post Date:", "")
          //     .trim() || "Unknown",
          // jobDescription:
          //   card.querySelector("p")?.textContent.trim() ||
          //   "No description available",
          jobUrl: card.querySelector("a")?.getAttribute("href") || "#",
        };
      });
    });

    let refined = elements.map((job) => {
      return {
        jobName: job.jobName,
        // jobCategory: job.jobCategory,
        // postDate: job.postDate,
        // jobDescription: job.jobDescription,
        jobUrl: `https://softbenz.com${job.jobUrl}`,
      };
    });

    return {
      companyName: "SoftBenz",
      totalJobs: [...refined],
    };
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeSoftBenz };
