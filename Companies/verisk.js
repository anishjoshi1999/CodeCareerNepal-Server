async function scrapeVerisk() {
  const url =
    "https://fa-ewmy-saasfaprod1.fa.ocs.oraclecloud.com/hcmRestApi/resources/latest/recruitingCEJobRequisitions?onlyData=true&expand=requisitionList.workLocation,requisitionList.otherWorkLocations,requisitionList.secondaryLocations,flexFieldsFacet.values,requisitionList.requisitionFlexFields&finder=findReqs;siteNumber=CX_1,facetsList=LOCATIONS%3BWORK_LOCATIONS%3BWORKPLACE_TYPES%3BTITLES%3BCATEGORIES%3BORGANIZATIONS%3BPOSTING_DATES%3BFLEX_FIELDS,limit=25,sortBy=POSTING_DATES_DESC";
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "en",
        "content-type":
          "application/vnd.oracle.adf.resourceitem+json;charset=utf-8",
        "ora-irc-cx-userid": "09fe3df0-cea1-485b-8716-70c18f73ee67",
        "ora-irc-language": "en",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        cookie:
          "_ga=GA1.1.2127236961.1759587996; CX_1_cookieAccept_functional=true; ORA_CX_USERID_FUNCTIONAL=09fe3df0-cea1-485b-8716-70c18f73ee67; CX_1_cookieAccept_analytical=true; ORA_CX_USERID=09fe3df0-cea1-485b-8716-70c18f73ee67; ORA_FUSION_PREFS=v1.0~bG9jYWxlPWVufmRlZmF1bHRMYW5ndWFnZU1hcmtlcj10cnVl; ORA_FND_SESSION_IADEV_F=DEFAULT_PILLAR:7e3sXdcC+qvq/DJTM+gF0skyKmqnVLOFbGo4BB1+ZQGWXylVcBclR2JLN+qhqtM9:1765333612342; CX_1_cookieConsentEnabled=true; ORA_CX_SITE_NUMBER=CX_1; ak_bmsc=461D00E1F02CD01DB2180905B8885F0A~000000000000000000000000000000~YAAQtJbTZ+Duv6qaAQAAn00WBh7zkInPFLoYp6Oum/TrSuJfRtaChfwwJoO6gi9UFM1Nbfnj+QWaGim363xkyZANpnD6HGDigEdSntTYZl5Nh7O7KJ1Dw5LzKlHXoYstkyV6Q+OL1YN/r49cwS3gz5FhH7ugyylpb12uZiWMqw/fu3wZv7zJk3rZH1ojAHiGEVdqK1MonHd+2Hogi6vfwON2XL68xJ/LEc6/l7voPyEgUVVuzd2OPMU7Ct4DiogW1/cDcOZ1SzkvNPmA/iFpW+dzvaivDi56UFVQ4ezitz59M6qSCh8HqcZKQEzs5vMECz7iBvaXp7a7kZ2iaSxiYY6c7wpKd8VnzS2WbXSPxgrzQOgYjiY7+BElU4TOZ9Tft6jaoS021qa8vtPilJ+oWSzCGgLIzBRtnOmUBNggggkNAGxkaAY=; _ga_ZYCERQWVNJ=GS2.1.s1765333615$o3$g1$t1765333695$j59$l0$h0; bm_sv=BCEFF8EF409D30FF79089E8EE7EF7169~YAAQtJbTZ+jvv6qaAQAAE4EWBh5Ofn9XiDP+L74A3PQE4OoCvuLft2BNTIMjJ5VqMhq3YkApVMPHHNVU5vUo1mfBIHIxsJi6v9wt0I9ESd0xja7kAA+baKfTbPXpx9foqWPAKfiOo1xXWBKWLjWu5hClPoxLOYE2Wv84OHUHjwKpmaD629fIOKN7pxXwo+9PO/e/LAPV/hrw0CEQKt81C4OxIe2NmDbqzsAOemt8MpxyZ7PpbPBDunGUUpmT5Bh29QZj4ce+z9T/AD2jXA==~1",
        Referer:
          "https://fa-ewmy-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs",
      },
    });

    const { items } = await response.json();

    // Extract all requisitionList arrays
    const allRequisitions = items.flatMap((item) => item.requisitionList);

    const baseURL =
      "https://fa-ewmy-saasfaprod1.fa.ocs.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/job";

    // Suppose allRequisitions is the array you already extracted
    const jobs = allRequisitions.map((req) => ({
      jobName: req.Title,
      jobLocation: req.PrimaryLocation,
      jobUrl: `${baseURL}/${req.Id}`,
    }));
    return {
      companyName: "Verisk",
      totalJobs: jobs,
      isDirectApply: true,
    };
  } catch (err) {
    console.error("Scraping error:", err);
  } 
}
module.exports = {
  scrapeVerisk,
};
