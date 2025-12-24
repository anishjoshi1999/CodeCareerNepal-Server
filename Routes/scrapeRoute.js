const express = require("express");
const router = express.Router();

const { storeIntoDatabase } = require("../utils/store");
const ScrapeState = require("../Models/scrapeState");
const Company = require("../Models/Company");

/* -------------------- SCRAPER REGISTRY -------------------- */

const SCRAPERS = [
  {
    name: "FuseMachine",
    scrape: () => require("../Companies/fusemachine").scrapeFuseMachine(),
  },
  {
    name: "EbPearls",
    scrape: () => require("../Companies/ebperl").scrapeEbPearls(),
  },
  {
    name: "Verisk",
    scrape: () => require("../Companies/verisk").scrapeVerisk(),
  },
  {
    name: "LeapFrog",
    scrape: () => require("../Companies/leapfrog").scrapeLeapFrog(),
  },
  {
    name: "Cedargate",
    scrape: () => require("../Companies/cedargate").scrapeCedargate(),
  },
];

const INSIDE_SCRAPERS = {
  fusemachine: require("../Companies/inside/fusemachine")
    .scrapeFuseMachineJobDetails,
  ebpearls: require("../Companies/inside/ebperl").scrapeEbPearlsJob,
  verisk: require("../Companies/inside/verisk").scrapeInsideVerisk,
  leapfrog: require("../Companies/inside/leapfrog").scrapeLeapFrogJobDetails,
  cedargate: require("../Companies/inside/cedargate").scrapeInsideCedargate,
};

/* -------------------- HELPERS -------------------- */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retryScrape(fn, url, retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn(url);
      if (result) return result;
    } catch (_) {}

    if (i < retries - 1) await sleep(delay);
  }
  return null;
}

const findCompanyScraper = (name) =>
  SCRAPERS.find((c) => c.name.toLowerCase() === name.toLowerCase());

/* -------------------- ROUTES -------------------- */

/**
 * Sequential scrape (state-based)
 */
router.get("/", async (_req, res) => {
  console.log("────────────────────────────────────────");
  console.log("🚀 SCRAPE ROUTE STARTED");
  console.log("🕒 Time:", new Date().toISOString());

  try {
    /* ---------------- STATE ---------------- */
    console.log("📌 Fetching scrape state...");
    const state = await ScrapeState.findOne();
    const index = state?.currentIndex ?? 0;

    console.log(`📍 Current scrape index: ${index}`);

    if (index >= SCRAPERS.length) {
      console.log("🎉 All companies already scraped");
      console.log("🧹 Resetting scrape state...");
      await ScrapeState.deleteOne();

      return res.json({ message: "✅ All companies fully scraped" });
    }

    /* ---------------- COMPANY ---------------- */
    const companyScraper = SCRAPERS[index];
    console.log(`🏢 Target company: ${companyScraper.name}`);

    /* ---------------- COMPANY SCRAPE ---------------- */
    console.log("🔍 Starting company job list scrape...");
    const jobsData = await companyScraper.scrape();

    console.log(
      `📄 Company scrape completed. Jobs found: ${
        jobsData?.totalJobs?.length ?? "unknown"
      }`
    );

    console.log("📦 Storing company jobs into database...");
    await storeIntoDatabase(jobsData);
    console.log("✅ Company jobs stored successfully");

    /* ---------------- FETCH COMPANY FROM DB ---------------- */
    console.log("🔄 Fetching stored company from database...");
    const company = await Company.findOne({
      companyName: companyScraper.name,
    });

    if (!company) {
      console.error("❌ Company NOT found after storing!");
      throw new Error(`Company not found: ${companyScraper.name}`);
    }

    console.log(
      `📊 Total jobs in DB for ${company.companyName}: ${company.totalJobs.length}`
    );

    /* ---------------- INSIDE JOB SCRAPING ---------------- */
    console.log("🧵 Starting inside job scraping...");

    let scraped = 0;
    let skipped = 0;
    let failed = 0;

    for (const [i, job] of company.totalJobs.entries()) {
      console.log(
        `➡️ [${i + 1}/${company.totalJobs.length}] Job: ${job.jobName}`
      );

      if (job.jobDetails) {
        console.log("⚠️ Job already scraped → skipping");
        skipped++;
        continue;
      }

      console.log(`🌐 Scraping job URL: ${job.jobUrl}`);
      const details = await retryScrape(companyScraper.inside, job.jobUrl);

      if (!details) {
        console.log("❌ Failed to scrape job → skipped");
        failed++;
        continue;
      }

      console.log("💾 Saving job details to database...");
      await Company.updateOne(
        { companyName: company.companyName, "totalJobs.jobUrl": job.jobUrl },
        { $set: { "totalJobs.$.jobDetails": details } }
      );

      console.log("✅ Job details saved");
      scraped++;
    }

    console.log("📈 Inside job scrape summary:");
    console.log(`   ✅ Scraped: ${scraped}`);
    console.log(`   ⚠️ Skipped: ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);

    /* ---------------- STATE UPDATE ---------------- */
    console.log("➡️ Moving to next company...");
    await ScrapeState.updateOne(
      {},
      { currentIndex: index + 1, updatedAt: new Date() },
      { upsert: true }
    );

    console.log("✅ Scrape state updated");
    console.log(`🏁 Finished scraping ${companyScraper.name}`);
    console.log("────────────────────────────────────────");

    res.json({
      message: `✅ Fully scraped ${companyScraper.name}`,
      stats: { scraped, skipped, failed },
    });
  } catch (err) {
    console.error("🔥 SCRAPE ROUTE FAILED");
    console.error(err);

    res.status(500).json({
      error: err.message,
      time: new Date().toISOString(),
    });
  }
});

/**
 * Scrape single company
 */
router.get("/:name", async (req, res) => {
  try {
    const company = findCompanyScraper(req.params.name);
    if (!company) return res.status(404).json({ error: "Company not found" });

    const data = await company.scrape();
    await storeIntoDatabase(data);

    res.json({ message: `Scraped ${company.name}`, data });
  } catch {
    res.status(500).json({ error: "Scraping failed" });
  }
});

/**
 * Scrape inside job details
 */
router.get("/:name/inside", async (req, res) => {
  try {
    const name = req.params.name.toLowerCase();
    const scrapeJob = INSIDE_SCRAPERS[name];

    if (!scrapeJob) {
      return res.status(404).json({ error: "Company not supported" });
    }

    const company = await Company.findOne({ companyName: req.params.name });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    for (const job of company.totalJobs) {
      const details = await retryScrape(scrapeJob, job.jobUrl);
      if (!details) continue;

      await Company.updateOne(
        { companyName: req.params.name, "totalJobs.jobUrl": job.jobUrl },
        { $set: { "totalJobs.$.jobDetails": details } }
      );
    }

    res.json({ message: "✅ Inside job scraping completed" });
  } catch {
    res.status(500).json({ error: "Inside scraping failed" });
  }
});

module.exports = router;
