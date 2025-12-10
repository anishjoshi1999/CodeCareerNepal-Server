const puppeteer = require("puppeteer");

async function scrapeFuseMachineJobDetails(url) {
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

    // Wait for the job description <div>
    await page.waitForSelector("#job-description");

    // Extract HTML content
    // const jobDescriptionHTML = await page.$eval(
    //   "#job-description",
    //   (el) => el.innerHTML.trim()
    // );

    // Extract clean text content
    const jobDescriptionText = await page.$eval(
      "#job-description",
      (el) => el.innerText.trim()
    );

    return {
      jobUrl: url,
    //   jobDescriptionHTML,
      jobDescriptionText,
    };

  } catch (error) {
    console.error("Error scraping job details:", error);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeFuseMachineJobDetails };
