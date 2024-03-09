const puppeteer = require("puppeteer");

async function scrapeLeapFrog() {
  let url = "https://career.lftechnology.com/o";
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
    await page.waitForSelector(".sc-bdVaJa.cowVwF");

    const elements = await page.$$eval(".sc-bdVaJa.cowVwF", (elems) => {
      return elems.map((element) => {
        let uri = "https://career.lftechnology.com";
        return {
          jobName: getJobName(element),
          jobUrl: getJobUrl(element, uri),
          jobPlace: getJobPlace(element),
        };
      });
    });

    let totalNepalJobs = elements.filter((job) => {
      return job.jobPlace === "Kathmandu, Nepal";
    });

    let refined = totalNepalJobs.map((jobs) => {
      return {
        jobName: jobs.jobName,
        jobUrl: jobs.jobUrl,
      };
    });

    return {
      companyName: "LeapFrog",
      totalJobs: [...refined],
    };
  } catch (error) {
    console.error("Error:", error);
    // Handle the error as needed
  } finally {
    await browser.close();
  }
}

function getJobName(element) {
  return element.querySelector(".job-title a").textContent.trim();
}

function getJobUrl(element, uri) {
  return uri + element.querySelector(".job-title a").getAttribute("href");
}

function getJobPlace(element) {
  return element.querySelector(".job-location").textContent.trim();
}

(async () => {
  try {
    let temp = await scrapeLeapFrog();
    console.log(temp);
  } catch (error) {
    console.error("Error during scraping:", error);
  }
})();
