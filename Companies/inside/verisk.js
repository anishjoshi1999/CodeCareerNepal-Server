async function scrapeInsideVerisk(jobUrl) {
  // Extract JobId from the last segment of the URL
  const segments = jobUrl.split("/");
  const jobId = segments[segments.length - 1];
  console.log(`Extracted JobId: ${jobId}`);

  // Construct the API URL using the JobId
  const apiUrl = `https://fa-ewmy-saasfaprod1.fa.ocs.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitionDetails?expand=all&onlyData=true&finder=ById;Id=%22${jobId}%22,siteNumber=CX_1`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "en",
        "content-type": "application/vnd.oracle.adf.resourceitem+json;charset=utf-8",
        "ora-irc-cx-userid": "09fe3df0-cea1-485b-8716-70c18f73ee67",
        "ora-irc-language": "en",
        priority: "u=1, i",
        "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie: "_ga=GA1.1.2127236961.1759587996; ...", // keep full cookies
        Referer: jobUrl,
      },
    });

    const data = await response.json();
    const job = data.items[0];

    const combinedJobInfo = `
      ${job.ExternalDescriptionStr || ""}
      ${job.ExternalResponsibilitiesStr || ""}
      ${job.ExternalQualificationsStr || ""}
    `.replace(/\s+/g, " ").trim();

    return {
      jobUrl,
      jobDescriptionText: combinedJobInfo,
    };
  } catch (err) {
    console.error("Scraping error:", err);
    return null;
  }
}

module.exports = { scrapeInsideVerisk };
