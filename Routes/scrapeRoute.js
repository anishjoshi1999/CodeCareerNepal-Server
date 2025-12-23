const express = require("express");
const router = express.Router();
const { storeIntoDatabase } = require("../utils/store");
const ScrapeState = require("../Models/scrapeState");
const Company = require("../Models/Company");

// Full scraping functions list
const scrapingFunctions = [
  // // { name: "Cotiviti", scrape: require("../Companies/cotiviti").scrapeCotiviti },
  {
    name: "FuseMachine",
    scrape: require("../Companies/fusemachine").scrapeFuseMachine,
  },
  { name: "EbPearls", scrape: require("../Companies/ebperl").scrapeEbPearls },
  { name: "Verisk", scrape: require("../Companies/verisk").scrapeVerisk },
  { name: "LeapFrog", scrape: require("../Companies/leapfrog").scrapeLeapFrog },
    { name: "Cedargate", scrape: require("../Companies/cedargate").scrapeCedargate },
  // { name: "LISNepal", scrape: require("../Companies/lisnepal").scrapeLISNepal },
  // { name: "SoftBenz", scrape: require("../Companies/softbenz").scrapeSoftBenz },
  // {
  //   name: "Cedargate",
  //   scrape: require("../Companies/cedargate").scrapeCedargate,
  // },
  // {
  //   name: "LogPointNepal",
  //   scrape: require("../Companies/logpoint").scrapeLogPoint,
  // },
  // {
  //   name: "InfoDevelopers",
  //   scrape: require("../Companies/infodev").scrapeInfoDev,
  // },
  // { name: "Ekbana", scrape: require("../Companies/ekbana").scrapeEkbana },
  // // { name: "Deerhold", scrape: require("../Companies/deerhold").scrapeDeerhold },
  // { name: "Asterdio", scrape: require("../Companies/asterdio").scrapeAsterdio },
  // { name: "Amnil", scrape: require("../Companies/amnil").scrapeAmnilTech },
  // // {
  // //   name: "BajiraTechnolgoies",
  // //   scrape: require("../Companies/bajiratechnologies").scrapeBajraTechnologies,
  // // },
  // { name: "Clusus", scrape: require("../Companies/clusus").scrapeClusus },
  // {
  //   name: "CodePixelzMedia",
  //   scrape: require("../Companies/codepixelzmedia").scrapeCodePixelzMedia,
  // },
  // {
  //   name: "ComplianceQuest",
  //   scrape: require("../Companies/compliancequest").scrapeComplianceQuest,
  // },
  // {
  //   name: "MegaBitNepalDocsumo",
  //   scrape: require("../Companies/Docsumo").scrapeMegaBitNepal,
  // },
  // {
  //   name: "F1SoftGroup",
  //   scrape: require("../Companies/f1soft").scrapeF1Soft,
  // },
  //   {
  //   name: "UBASolutions",
  //   scrape: require("../Companies/ubaSolutions").scrapeUBASolutions,
  // },
];
// Full scraping inside functions list
const scrapingInsideFunctions = [
  {
    name: "FuseMachine",
    scrape: require("../Companies/inside/fusemachine")
      .scrapeFuseMachineJobDetails,
  },
  {
    name: "EbPearls",
    scrape: require("../Companies/inside/ebperl").scrapeEbPearlsJob,
  },
  {
    name: "Verisk",
    scrape: require("../Companies/inside/verisk").scrapeInsideVerisk,
  },
    {
    name: "LeapFrog",
    scrape: require("../Companies/inside/leapfrog").scrapeLeapFrogJobDetails,
  },
   {
    name: "Cedargate",
    scrape: require("../Companies/inside/cedargate").scrapeInsideCedargate,
  },
];
router.get("/", async (req, res) => {
  try {
    // Retrieve the current index from the database
    const state = await ScrapeState.findOne();
    console.log(state);
    const currentScrapeIndex = state ? state.currentIndex : 0;

    if (currentScrapeIndex < scrapingFunctions.length) {
      const company = scrapingFunctions[currentScrapeIndex];
      let temp = await company.scrape();
      console.log(temp);
      await storeIntoDatabase(temp);

      console.log(`Scraping completed for ${company.name}`);

      if (scrapingFunctions.length !== currentScrapeIndex + 1) {
        // Update the index in the database
        await ScrapeState.updateOne(
          {},
          { currentIndex: currentScrapeIndex + 1, updatedAt: new Date() }, // Update updatedAt field
          { upsert: true }
        );
      } else {
        await ScrapeState.deleteOne();
        console.log("Scrape State Reset");
      }

      // Redirect to the same endpoint to trigger the next scraping request
      res.redirect("/");
    } else {
      console.log(`Scraping completed for all the IT Companies`);

      // Reset the index to 0 after scraping all companies
      await ScrapeState.updateOne({}, { currentIndex: 0 }, { upsert: true });

      res.redirect("/");
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while scraping companies." });
  }
});

router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`Scraping request for company: ${name}`);

    const company = scrapingFunctions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    console.log(company);
    if (!company) {
      return res.status(404).json({ error: `Company '${name}' not found.` });
    }

    const data = await company.scrape();
    await storeIntoDatabase(data);

    console.log(`✅ Scraping completed for ${company.name}`);
    res.json({ message: `Scraping completed for ${company.name}`, data });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error occurred while scraping by name." });
  }
});
router.get("/:name/inside", async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`Scraping inside each job for company: ${name}`);

    const companyData = await Company.findOne({ companyName: name });
    if (!companyData) {
      return res.status(404).json({ error: `Company '${name}' not found.` });
    }

    const company = scrapingInsideFunctions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    console.log("Hello", company);
    if (!company) {
      return res.status(404).json({ error: `Company '${name}' not found.` });
    }

    // Sequential loop (WAIT for each scrape)
    for (const job of companyData.totalJobs) {
      console.log(`Scraping job: ${job.jobName} at ${job.jobUrl}`);

      const jobDetails = await retryScrape(company.scrape, job.jobUrl);

      if (!jobDetails) {
        console.log(`⚠ Skipping job (failed to scrape): ${job.jobName}`);
        continue;
      }

      console.log(`✔ Scraped: ${job.jobName}`);

      await Company.updateOne(
        { companyName: name, "totalJobs.jobUrl": job.jobUrl },
        { $set: { "totalJobs.$.jobDetails": jobDetails } }
      );
    }

    console.log("🎉 All inside job scrapes completed!");

    return res.json({
      message: `Inside job scraping completed for ${name}`,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: "Error occurred while scraping jobs." });
  }
});

// Helper function for retry with delay
async function retryScrape(scrapeFn, url, retries = 3, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      console.log(`Attempt ${i} scraping: ${url}`);
      const result = await scrapeFn(url);

      if (result) return result; // success
    } catch (err) {
      console.log(`❌ Error on attempt ${i} for ${url}`, err);
    }

    if (i < retries) {
      console.log(`⏳ Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.log(`❌ Failed after ${retries} retries: ${url}`);
  return null;
}

module.exports = router;
