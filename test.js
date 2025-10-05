const { getJobs ,listCompanies} = require("./index");

(async () => {
  try {
    const companies = listCompanies();
    console.log("Available companies:", companies);
    const jobs = await getJobs("Cotiviti");
    console.log(jobs);
  } catch (err) {
    console.error(err.message);
  }
})();
