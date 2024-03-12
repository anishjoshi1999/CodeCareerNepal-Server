const mongoose = require("mongoose");

const companyInfo = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Website: {
    type: String,
    required: true,
  },
  Location: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const CompanyInfo = mongoose.model("CompanyInfo", companyInfo);

module.exports = CompanyInfo;
