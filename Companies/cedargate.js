const CC_IDS = {
  nepal: "9200975014487_2",
  usa: "9200974512588_2",
};

/**
 * Utility: Strip HTML tags and normalize text
 */
function stripHtml(html) {
  if (!html) return null;

  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJobId(externalJobId) {
  if (!externalJobId) return null;
  if (/^\d+$/.test(externalJobId)) return externalJobId;

  try {
    const url = new URL(externalJobId);
    return url.searchParams.get("jobId");
  } catch {
    return null;
  }
}

/**
 * Fetch inside job description
 */
async function fetchInsideJob(jobId, ccId) {
  const apiUrl = `https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions/${jobId}?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=${ccId}&lang=en_US&locale=en_US&timeStamp=${Date.now()}`;

  try {
    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        accept: "*/*",
        "content-type": "application/json",
        locale: "en_US",
        "x-requested-with": "XMLHttpRequest",
        referer: `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?jobId=${jobId}`,
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    return stripHtml(data?.requisitionDescription);
  } catch (err) {
    console.error("❌ Inside job fetch failed:", err.message);
    return null;
  }
}

/**
 * MAIN SCRAPER
 * - Scrapes Nepal + USA
 * - Immediately fetches inside detail for FIRST job only
 */
async function scrapeCedargate() {
  try {
    let allJobs = [];
    let firstJobDescription = null;
    let firstJobFetched = false;

    for (const [country, ccId] of Object.entries(CC_IDS)) {
      const listUrl = `https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=${ccId}&lang=en_US&locale=en_US&$top=100`;

      const response = await fetch(listUrl, {
        method: "GET",
        headers: {
          accept: "*/*",
          "content-type": "application/json",
          locale: "en_US",
          "x-requested-with": "XMLHttpRequest",
          Referer: `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?ccId=${ccId}`,
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ Failed list fetch for ${country}`);
        continue;
      }

      const { jobRequisitions = [] } = await response.json();

      for (const req of jobRequisitions) {
        const externalJobId = req.customFieldGroup?.stringFields?.find(
          (f) => f.nameCode.codeValue === "ExternalJobID"
        )?.stringValue;

        const jobId = extractJobId(externalJobId);

        // 🔥 Immediately scrape inside detail for FIRST job only
        if (!firstJobFetched && jobId) {
          firstJobFetched = true;
          firstJobDescription = await fetchInsideJob(jobId, ccId);
        }

        allJobs.push({
          jobName: req.requisitionTitle,
          jobLocation:
            req.requisitionLocations?.[0]?.nameCode?.shortName?.trim() ||
            country,
          jobDetails: {
            jobDescriptionText: firstJobDescription,
          },
          jobUrl: jobId
            ? `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=${ccId}&lang=en_US&jobId=${jobId}`
            : null,
        });
      }
    }

    return {
      companyName: "Cedargate",
      totalJobs: allJobs,
      // jobs: allJobs,
      // firstJobDescription, // 👈 inside detail of first job
      isDirectApply: true,
    };
  } catch (err) {
    console.error("❌ Scraping error:", err.message);
    return null;
  }
}

module.exports = {
  scrapeCedargate,
};
