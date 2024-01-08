const express = require("express");
const router = express.Router();
const { storeIntoDatabase } = require("../utils/store");
const ScrapeState = require("../Models/scrapeState");

// Import scraping functions for different companies
const scrapingFunctions = [
  { name: "Cotiviti", scrape: require("../Companies/cotiviti").scrapeCotiviti },
  {
    name: "FuseMachine",
    scrape: require("../Companies/fusemachine").scrapeFuseMachine,
  },
  {
    name: "LeapFrog",
    scrape: require("../Companies/leapfrog").scrapeLeapFrog,
  },
  {
    name: "LIS Nepal",
    scrape: require("../Companies/lisnepal").scrapeLISNepal,
  },
  {
    name: "SoftBenz",
    scrape: require("../Companies/softbenz").scrapeSoftBenz,
  },
  {
    name: "Versik",
    scrape: require("../Companies/verisk").scrapeVerisk,
  },
  {
    name: "Eb Pearls",
    scrape: require("../Companies/ebperl").scrapeEbPearls,
  },
  {
    name: "LogPoint Nepal",
    scrape: require("../Companies/logpoint").scrapeLogPoint,
  },
  {
    name: "Info Developers",
    scrape: require("../Companies/infodev").scrapeInfoDev,
  },
  {
    name: "Ekbana",
    scrape: require("../Companies/ekbana").scrapeEkbana,
  },
  {
    name: "Deerhold",
    scrape: require("../Companies/deerhold").scrapeDeerhold,
  },
  {
    name: "Asterdio",
    scrape: require("../Companies/asterdio").scrapeAsterdio,
  },
  // {
  //   name: "UBA Solutions",
  //   scrape: require("../Companies/ubaSolutions").scrapeUBASolutions,
  // },
];

router.get("/", async (req, res) => {
  try {
    // Retrieve the current index from the database
    const state = await ScrapeState.findOne();
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

module.exports = router;
