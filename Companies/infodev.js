const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeInfoDev() {
  const url = "https://infodev.com.np/careers";

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const jobs = [];

    $(".container.mt-6 > .border-b").each((i, el) => {
      const jobTitle = $(el).find("h3.text-blue-900").text().trim();
      const location = $(el).find("div > div.flex.items-center.gap-2 p").first().text().trim();
      const jobType = $(el).find("div > div.flex.items-center.gap-2 p").eq(1).text().trim();
      const department = $(el).find("div > div.flex.items-center.gap-2 p").eq(2).text().trim();
      const summary = $(el).find("div.text-gray-600").text().trim().replace(/\s+/g, " ");

      // Use the Apply button link if needed
      const applyUrl = "https://infodev.com.np/careers"; // no unique link in HTML

      jobs.push({
        jobName: jobTitle,
        location,
        jobType,
        department,
        summary,
        jobUrl: applyUrl,
      });
    });

    return {
      companyName: "Info Developers",
      totalJobs: jobs,
    };
  } catch (error) {
    console.error("Error fetching InfoDev jobs:", error.message);
    return [];
  }
}

// Example usage
(async () => {
  const jobsData = await scrapeInfoDev();
  console.log(jobsData);
})();

module.exports = { scrapeInfoDev };
