// Import all company scrapers
const scrapingFunctions = [
  { name: "Cotiviti", scrape: require("./Companies/cotiviti").scrapeCotiviti },
  { name: "FuseMachine", scrape: require("./Companies/fusemachine").scrapeFuseMachine },
  { name: "LeapFrog", scrape: require("./Companies/leapfrog").scrapeLeapFrog },
  { name: "LISNepal", scrape: require("./Companies/lisnepal").scrapeLISNepal },
  { name: "SoftBenz", scrape: require("./Companies/softbenz").scrapeSoftBenz },
  { name: "Cedargate", scrape: require("./Companies/cedargate").scrapeCedargate },
  { name: "Versik", scrape: require("./Companies/verisk").scrapeVerisk },
  { name: "EbPearls", scrape: require("./Companies/ebperl").scrapeEbPearls },
  { name: "LogPointNepal", scrape: require("./Companies/logpoint").scrapeLogPoint },
  { name: "InfoDevelopers", scrape: require("./Companies/infodev").scrapeInfoDev },
  { name: "Ekbana", scrape: require("./Companies/ekbana").scrapeEkbana },
  { name: "Deerhold", scrape: require("./Companies/deerhold").scrapeDeerhold },
  { name: "Asterdio", scrape: require("./Companies/asterdio").scrapeAsterdio },
  { name: "Amnil", scrape: require("./Companies/amnil").scrapeAmnilTech },
  { name: "BajiraTechnolgoies", scrape: require("./Companies/bajiratechnologies").scrapeBajraTechnologies },
  { name: "Clusus", scrape: require("./Companies/clusus").scrapeClusus },
  { name: "CodePixelzMedia", scrape: require("./Companies/codepixelzmedia").scrapeCodePixelzMedia },
  { name: "ComplianceQuest", scrape: require("./Companies/compliancequest").scrapeComplianceQuest },
  { name: "MegaBitNepalDocsumo", scrape: require("./Companies/Docsumo").scrapeMegaBitNepal },
];

async function getJobs(companyName) {
  const company = scrapingFunctions.find(
    (c) => c.name.toLowerCase() === companyName.toLowerCase()
  );
  if (!company) throw new Error(`Company '${companyName}' not found.`);
  const jobs = await company.scrape();
  return jobs;
}

function listCompanies() {
  // Return the registered company names in the scrapingFunctions array
  return scrapingFunctions.map((c) => c.name);
}

module.exports = { getJobs, listCompanies };