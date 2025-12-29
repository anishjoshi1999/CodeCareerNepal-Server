function normalizeJob(raw) {
  return {
    job_id: raw.job_id || raw.id || null,

    title: raw.title || raw.jobName || null,
    company: raw.company || raw.companyName || null,
    company_img_link: raw.company_img_link || null,
    company_link: raw.company_link || null,

    location: raw.location || raw.jobLocation || null,
    place: raw.place || null,

    apply_link: raw.apply_link || null,
    link: raw.link || raw.jobUrl || null,

    date: raw.date || null,
    date_text: raw.date_text || null,

    description: raw.description || raw.jobDescriptionText || null,
    description_html: raw.description_html || null,

    skills: raw.skills || [],
    insights: raw.insights || [],

    query: raw.query || null,
    job_index: raw.job_index ?? null,

    first_seen: raw.first_seen || new Date(),
    scraped_at: new Date(),
  };
}

module.exports = {normalizeJob};
