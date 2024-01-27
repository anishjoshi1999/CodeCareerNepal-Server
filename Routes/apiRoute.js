require("dotenv").config();
const express = require("express");
const router = express.Router();
const Company = require("../Models/Company");
const { getInternJobs } = require("../utils/getInternJobs");

// Number of items to load per page
const ITEMS_PER_PAGE = 10;

// Get all company job listings
router.get("/", async (req, res) => {
  try {
    let { page } = req.query;
    page = parseInt(page) || 1;

    const skip = (page - 1) * ITEMS_PER_PAGE;

    const allCompanyJobListing = await Company.find({})
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    res.status(200).json(allCompanyJobListing);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/total", async (req, res) => {
  try {
    // Fetch all companies and their job listings
    const allCompanies = await Company.find({});
    const internJobs = await getInternJobs();
    // Calculate the total number of jobs
    let totalJobs = 0;
    let totalInterns = 0;
    allCompanies.forEach((company) => {
      totalJobs += company.totalJobs.length;
    });
    internJobs.forEach((company) => {
      totalInterns += company.totalJobs.length;
    });
    res
      .status(200)
      .json({ totalCompanies: allCompanies.length, totalJobs, totalInterns });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get intern jobs
router.get("/intern", async (req, res) => {
  try {
    const internJobs = await getInternJobs();
    console.log(internJobs);
    res.status(200).json(internJobs);
  } catch (error) {
    console.error("Route Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching intern jobs." });
  }
});
//Search
router.get("/search", async (req, res) => {
  const { type, query } = req.query;

  if (!type || !query) {
    return res.status(400).json({
      error: "Invalid parameters. Please provide 'type' and 'query'.",
    });
  }

  try {
    let searchResults;

    if (type === "company") {
      // Search for companies
      searchResults = await Company.find({
        companyName: { $regex: new RegExp(query, "i") },
      });
    } else if (type === "job") {
      // Search for jobs
      searchResults = await Company.find({
        "totalJobs.jobName": { $regex: new RegExp(query, "i") },
      });
    } else {
      return res.status(400).json({
        error: "Invalid search type. Supported types: 'company', 'job'.",
      });
    }

    if (searchResults.length === 0) {
      return res.status(404).json({ message: "No results found." });
    }

    res.status(200).json(searchResults);
  } catch (error) {
    console.error("Search Route Error:", error);
    res.status(500).json({
      error: "An error occurred while processing the search request.",
    });
  }
});

// Get job listings for a specific company
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({ error: "Company not found" });
  }

  try {
    const jobListing = await Company.find({ companyName: id });
    res.status(200).json(jobListing);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
