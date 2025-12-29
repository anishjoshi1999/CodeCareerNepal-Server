const express = require("express");
const router = express.Router();
const { normalizeJob } = require("../utils/normalize");
const Job = require("../Models/Job");

/* -------------------- SCRAPER REGISTRY -------------------- */

const SCRAPERS = [
  {
    name: "FuseMachine",
    company_link: "https://fusemachines.com",
    company_img_link: "https://newbusinessage.prixacdn.net/uploads/2025/10/fusemachines.jpg",
    scrape: () => require("../Companies/fusemachine").scrapeFuseMachine(),
  },
  {
    name: "EbPearls",
    company_link: "https://ebpearls.com.au",
    company_img_link: "https://ebpearls.com.au/hubfs/logo-ebpearls-new-4.png",
    scrape: () => require("../Companies/ebperl").scrapeEbPearls(),
  },
  {
    name: "Verisk",
    company_link: "https://www.verisk.com",
    company_img_link: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQP8nYOgAsMsakbS5Rzql4ImpRbqJCgUeRuEg&s",
    scrape: () => require("../Companies/verisk").scrapeVerisk(),
  },
  {
    name: "LeapFrog",
    company_link: "https://www.lftechnology.com",
    company_img_link: "https://miro.medium.com/0*87NtEwD_UNbd84HB.jpg",
    scrape: () => require("../Companies/leapfrog").scrapeLeapFrog(),
  },
  {
    name: "Cedargate",
    company_link: "https://www.cedargate.com",
    company_img_link: "https://www.cedargate.com/wp-content/uploads/2022/01/cedargate-yoast-2022.jpg",
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
 * Scrape single company
 */
router.get("/:name", async (req, res) => {
  try {
    const companyScraper = findCompanyScraper(req.params.name);
    console.log("Scraping company:", companyScraper?.name);

    if (!companyScraper) {
      return res.status(404).json({ error: "Company not found" });
    }

    const scrapedResult = await companyScraper.scrape();

    // ✅ IMPORTANT FIX
    const jobsArray = scrapedResult?.totalJobs || [];

    console.log(`Jobs scraped: ${jobsArray.length}`);
    console.log(jobsArray);

    const savedJobs = [];

    for (let i = 0; i < jobsArray.length; i++) {
      const rawJob = jobsArray[i];

      const normalized = normalizeJob({
        ...rawJob,
        company: scrapedResult.companyName,
        company_link: companyScraper.company_link,
        company_img_link: companyScraper.company_img_link,
        job_index: i,
      });

      const job = await Job.findOneAndUpdate(
        { job_id: normalized.job_id || normalized.link },
        { $set: normalized },
        { upsert: true, new: true }
      );

      savedJobs.push(job);
    }

    res.json({
      message: `✅ Scraped ${savedJobs.length} jobs`,
      data: savedJobs,
    });
  } catch (err) {
    console.error(err);
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

    // ✅ Fetch jobs from Job collection
    const jobs = await Job.find({
      company: req.params.name,
    });
    console.log(`Found ${jobs.length} jobs for company ${req.params.name}`);

    if (!jobs.length) {
      return res.status(404).json({ error: "No jobs found for company" });
    }

    let updatedCount = 0;

    for (const job of jobs) {
      // Skip already scraped jobs (optional optimization)
      if (job.description) continue;

      const details = await retryScrape(scrapeJob, job.link);
      // console.log(details);
      if (!details) continue;

      await Job.updateOne(
        { _id: job._id },
        {
          $set: {
            description: details.jobDescriptionText || null,
            link: details.jobLink || job.link,
            scraped_at: new Date(),
          },
        }
      );

      updatedCount++;
    }

    res.json({
      message: "✅ Inside job scraping completed",
      updated: updatedCount,
      total: jobs.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Inside scraping failed" });
  }
});

module.exports = router;
