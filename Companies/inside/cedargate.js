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

/**
 * Fetch job details from ADP using ExternalJobID
 */
async function scrapeInsideCedargate(externalJobId) {
  if (!externalJobId) return null;

  const jobUrl = `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=9200974512588_2&lang=en_US&selectedMenuKey=CareerCenter&jobId=${externalJobId}`;

  try {
    const res = await fetch(jobUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Try to extract description from meta tag
    const metaMatch = html.match(/<meta name="description" content="([^"]+)"/i);
    const jobDescription = metaMatch ? metaMatch[1] : null;

    return {
      jobUrl,
      jobDescriptionText: stripHtml(jobDescription),
    };
  } catch (error) {
    console.error("❌ Cedargate scrape failed:", error.message);
    return null;
  }
}

module.exports = { scrapeInsideCedargate };
