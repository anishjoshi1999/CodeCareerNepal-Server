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

  // If already numeric, return as-is
  if (/^\d+$/.test(externalJobId)) {
    return externalJobId;
  }

  try {
    const url = new URL(externalJobId);
    return url.searchParams.get("jobId");
  } catch {
    return null;
  }
}
function extractJobccId(externalJobId) {
  if (!externalJobId) return null;

  // If already numeric, return as-is
  if (/^\d+$/.test(externalJobId)) {
    return externalJobId;
  }

  try {
    const url = new URL(externalJobId);
    return url.searchParams.get("ccId");
  } catch {
    return null;
  }
}
/**
 * Fetch job details from ADP (Cedargate)
 */
async function scrapeInsideCedargate(externalJobId) {
  console.log("🔍 Fetching Cedargate job via ADP API...");
  console.log("Raw ExternalJobID:", externalJobId);

  const jobId = extractJobId(externalJobId);
  const ccId = extractJobccId(externalJobId);
  console.log("Parsed jobId:", jobId);
  console.log("Parsed ccId:", ccId);

  if (!jobId) {
    console.warn("❌ Invalid or missing jobId");
    return null;
  }
  const apiUrl = `https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions/${jobId}?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&timeStamp=1767028826229&ccId=${ccId}&lang=en_US&ccId=${ccId}&locale=en_US`;
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

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const rawDescription = data?.requisitionDescription;

    if (!rawDescription) {
      console.warn("⚠️ No requisitionDescription found");
      return null;
    }

    console.log("✅ Cedargate API fetch successful");

    return {
      jobUrl: `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?jobId=${jobId}`,
      jobDescriptionText: stripHtml(rawDescription),
    };
  } catch (error) {
    console.error("❌ Cedargate API fetch failed:", error.message);
    return null;
  }
}

module.exports = { scrapeInsideCedargate };
