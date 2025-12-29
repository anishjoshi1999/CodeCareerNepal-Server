const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  job_id: { type: String, required: true, index: true },

  title: { type: String, default: null },
  company: { type: String, default: null },
  company_img_link: { type: String, default: null },
  company_link: { type: String, default: null },

  location: { type: String, default: null },
  place: { type: String, default: null },

  apply_link: { type: String, default: null },
  link: { type: String, default: null },

  date: { type: String, default: null },
  date_text: { type: String, default: null },

  description: { type: String, default: null },
  description_html: { type: String, default: null },

  skills: { type: [String], default: [] },
  insights: { type: [String], default: [] },

  query: { type: String, default: null },
  job_index: { type: Number, default: null },

  first_seen: { type: Date, default: Date.now },
  scraped_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Job", jobSchema);
