const express = require("express");
const router = express.Router();
const { storeIntoDatabase } = require("../utils/store");
const ScrapeState = require("../Models/scrapeState");

// Full scraping functions list
const scrapingFunctions = [
  { name: "Cotiviti", scrape: require("../Companies/cotiviti").scrapeCotiviti }, // completed
  { name: "FuseMachine", scrape: require("../Companies/fusemachine").scrapeFuseMachine }, // completed
  { name: "LeapFrog", scrape: require("../Companies/leapfrog").scrapeLeapFrog }, // completed
  { name: "LISNepal", scrape: require("../Companies/lisnepal").scrapeLISNepal }, // completed
  { name: "SoftBenz", scrape: require("../Companies/softbenz").scrapeSoftBenz }, // completed
  { name: "Cedargate", scrape: require("../Companies/cedargate").scrapeCedargate }, // completed
  { name: "Versik", scrape: require("../Companies/verisk").scrapeVerisk }, // completed
  { name: "EbPearls", scrape: require("../Companies/ebperl").scrapeEbPearls }, // completed
  { name: "LogPointNepal", scrape: require("../Companies/logpoint").scrapeLogPoint },  // completed
  { name: "InfoDevelopers", scrape: require("../Companies/infodev").scrapeInfoDev }, // completed
  { name: "Ekbana", scrape: require("../Companies/ekbana").scrapeEkbana },
  { name: "Deerhold", scrape: require("../Companies/deerhold").scrapeDeerhold }, // completed
  { name: "Asterdio", scrape: require("../Companies/asterdio").scrapeAsterdio },
  { name: "Amnil", scrape: require("../Companies/amnil").scrapeAmnilTech },
  { name: "Amsoft", scrape: require("../Companies/amsoft").scrapeAmsoft },
  { name: "Bajira Technolgoies", scrape: require("../Companies/bajiratechnologies").scrapeBajraTechnologies },
  { name: "Clusus", scrape: require("../Companies/clusus").scrapeClusus },
  { name: "Code Pixelz Media", scrape: require("../Companies/codepixelzmedia").scrapeCodePixelzMedia },
  { name: "Compliance Quest", scrape: require("../Companies/compliancequest").scrapeComplianceQuest },
  { name: "MegaBit Nepal (Docsumo)", scrape: require("../Companies/Docsumo").scrapeMegaBitNepal },
];
router.get("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    console.log(`Scraping request for company: ${name}`);

    const company = scrapingFunctions.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

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

module.exports = router;
