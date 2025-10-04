const puppeteer = require("puppeteer");

async function scrapeVerisk() {
  const url =
    "https://fa-ewmy-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs?location=Nepal&locationId=300000000464166&locationLevel=country&mode=location";
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  });

  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait for job tiles to render
    await page.waitForSelector(".job-grid-item__link");

    const jobs = await page.$$eval(".job-grid-item", (nodes) =>
      nodes.map((node) => {
        const linkEl = node.querySelector(".job-grid-item__link");
        const titleEl = node.querySelector(".job-tile__title");
        const locationEl = node.querySelector(
          ".job-list-item__job-info-label + .job-list-item__job-info-value"
        );
        const dateEl = node.querySelector(
          ".job-list-item__job-info-label--posting-date + .job-list-item__job-info-value"
        );

        return {
          jobName: titleEl?.textContent.trim(),
          jobUrl: linkEl?.href,
          location: locationEl?.textContent.trim() || "Nepal",
          postingDate: dateEl?.textContent.trim(),
        };
      })
    );

    return {
      companyName: "Oracle Cloud (Nepal Jobs)",
      totalJobs: jobs,
    };
  } catch (err) {
    console.error("Scraping error:", err);
  } finally {
    await browser.close();
  }
}
module.exports = {
  scrapeVerisk,
};
