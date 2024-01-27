const puppeteer = require("puppeteer");

async function scrapeCotiviti() {
  let url = "https://www.cotiviti.com.np/jobs";
  let jobSelector = "h3 a";
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
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;

    const elements = await page.$$eval(jobSelector, (elems) => {
      return elems.map((element) => {
        let uri = "https://www.cotiviti.com.np";
        return {
          jobName: element.textContent.trim(),
          jobUrl: uri + element.getAttribute("href"),
        };
      });
    });
    let refined = elements.map((jobs) => {
      return {
        jobName: jobs.jobName,
        jobUrl: jobs.jobUrl,
      };
    });
    return {
      companyName: "Cotiviti",
      totalJobs: [...refined],
    };
  } catch (error) {
    console.error("Error:", error);
    // Handle the error as needed
  } finally {
    await browser.close();
  }
}
// (async () => {
//   const scrapedData = await scrapeCotiviti();
//   console.log(scrapedData);
// })();
module.exports = {
  scrapeCotiviti,
};
