async function scrapeCedargate() {
  try {
    const response = await fetch(
      "https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&timeStamp=1766456890948&ccId=9200974512588_2&lang=en_US&ccId=9200974512588_2&locale=en_US&$top=100",
      {
        headers: {
          accept: "*/*",
          "accept-language": "en_US",
          "content-type": "application/json",
          locale: "en_US",
          "sec-ch-ua":
            '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
          "sec-ch-ua-mobile": "?1",
          "sec-ch-ua-platform": '"Android"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-forwarded-host": "workforcenow.adp.com",
          "x-requested-with": "XMLHttpRequest",
          cookie:
            "k8Ksj346=A1YMl6-ZAQAAHN-dEPxQkqz57-jSMz896chFbETANvMoSG-UgbSBl_3x1sVvAXHH3B6uct4VwH8AAEB3AAAAAA|1|0|5e9c1ac12b99709d28ba3fa4721a62d54529094b; dtCookie=v_4_srv_24_sn_53E2DDC2B6DC81AD028BDAF2CB532711_perc_100000_ol_0_mul_1_app-3A24dc33f3b2fb6337_0; XSRF-TOKEN=01ef34d6-ec6d-444c-a010-c803ee27bfeb; BIGipServerp_workforcenow_wfn-static=!wzc88+2JYUc+p45U/dIoLcjHVJ7P9YSXBdmJc6t6WtbgDRFiwQ6HmufT63X0gsa4FQFSKYPmnnJrLQ==; DType=WFNPortal^DType^WFNCURR; RelayState=https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=9200974512588_2&lang=en_US&selectedMenuKey=CareerCenter; ADPLangLocaleCookie=en_US; workforcenow40g=3756327435.4395.0000",
          Referer:
            "https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=9200974512588_2&lang=en_US&selectedMenuKey=CareerCenter",
        },
        body: null,
        method: "GET",
      }
    );
    const { jobRequisitions } = await response.json();
   

    // // Suppose allRequisitions is the array you already extracted
    const jobs = jobRequisitions.map((req) => {
      const externalJobId = req.customFieldGroup?.stringFields?.find(
        (field) => field.nameCode.codeValue === "ExternalJobID"
      )?.stringValue;
      return {
        jobName: req.requisitionTitle,
        jobLocation: req.requisitionLocations[0]?.nameCode?.shortName,
        jobUrl: `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html?cid=00938235-a9f7-41c8-88da-16d4f27e21c1&ccId=9200974512588_2&lang=en_US&selectedMenuKey=CareerCenter&jobId=${externalJobId}`,
       
      };
    });

    return {
      companyName: "Cedargate",
      totalJobs: jobs,
      isDirectApply: true,
    };
  } catch (err) {
    console.error("Scraping error:", err);
  }
}
//Invoke the function for testing using IIF
// (async () => {
//   await scrapeCedargate();
// })();

module.exports = {
  scrapeCedargate,
};
