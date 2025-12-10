const puppeteer = require("puppeteer");

async function scrapeEbPearls() {
  const url = "https://ebpearls.com.au/careers/";
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

    await page.waitForSelector(".job-list-row");

    const jobs = await page.$$eval(".job-list-row", (rows) => {
      let data = [];

      rows.forEach((row) => {
        const team = row.querySelector(".job-title h3")?.textContent.trim();

        const jobItems = row.querySelectorAll(".job-group-item");

        jobItems.forEach((job) => {
          const jobName = job.querySelector(".job-role h3")?.textContent.trim();
          const jobUrl = job.getAttribute("href");
          const jobLocation = job
            .querySelector(".job-location .h3")
            ?.textContent.trim();

          data.push({
            team,
            jobName,
            jobUrl: "https://ebpearls.com.au" + jobUrl,
            jobLocation,
          });
        });
      });

      return data;
    });

    return {
      companyName: "EbPearls",
      totalJobs: jobs,
      isDirectApply: true,
    };
  } catch (error) {
    console.error("Scraping error:", error);
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeEbPearls };
