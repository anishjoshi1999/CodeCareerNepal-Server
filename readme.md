# job-listings-scraper

A small Node.js package to scrape job listings from multiple Nepal-based (and related) company career pages.

This repository exports a simple API you can use to fetch job listings for a supported company.

## Installation

Install from npm (if published) or use locally by cloning this repo.

From npm:

```bash
npm install job-listings-scraper
```

From the repository (local development):

```powershell
git clone https://github.com/anishjoshi1999/CodeCareerNepal-Server.git
cd "CodeCareerNepal-Server"
npm install
```

## Quick usage

The package exposes a single convenience function `getJobs(companyName)` from the module entrypoint (`index.js`). It returns a Promise which resolves to an array of job objects scraped for the given company.

Example (Node.js):

```javascript
const { getJobs } = require('job-listings-scraper'); // or require('./index') when using repo locally

(async () => {
	try {
		const jobs = await getJobs('Cotiviti');
		console.log(jobs);
	} catch (err) {
		console.error('Error:', err.message);
	}
})();
```

API contract

- Input: companyName (string) — case-insensitive name of a supported company
- Output: Promise<Array<Object>> — array of job objects (shape depends on each scraper but usually contains title, location, url and posted date when available)
- Errors: throws an Error if company is not found or scraping fails

Listing available companies

If you're unsure which company names to pass to `getJobs()`, use the helper `listCompanies()` which returns the registered company names the package knows about.

Example:

```javascript
const { listCompanies } = require('job-listings-scraper');

console.log(listCompanies());
// -> ['Cotiviti', 'FuseMachine', 'LeapFrog', ...]
```

Tip: `listCompanies()` returns the same strings registered in the `index.js` entrypoint. Use any of those strings (case-insensitive) with `getJobs(companyName)`.

Scripts

- `npm start` — runs `node index` (entrypoint)
- `npm run dev` — runs `nodemon index.js` (requires `nodemon` to be installed globally or as a devDependency)

Supported companies

The following company names (case-insensitive) are wired into the entrypoint. Use one of these strings with `getJobs()`:

- Cotiviti
- FuseMachine
- LeapFrog
- LISNepal
- SoftBenz
- Cedargate
- Versik (note: spelled `verisk` in code)
- EbPearls
- LogPointNepal
- InfoDevelopers
- Ekbana
- Deerhold
- Asterdio
- Amnil
- BajiraTechnolgoies
- Clusus
- CodePixelzMedia
- ComplianceQuest
- MegaBitNepalDocsumo

Note: The exact internal module names map from the `Companies/` folder. If a company entry throws "not found", check `index.js` for the exact registered `name` strings and use the same.

Troubleshooting

- If you get "Company 'X' not found.", verify the name matches one of the supported company names above (case-insensitive).
- If a scraper returns an empty array, the company's website markup may have changed — open an issue or update the corresponding file in `Companies/`.
- Some scrapers may require additional dependencies (e.g., Puppeteer is included in `package.json`). Install the dependencies with `npm install` before running.

Contributing

Contributions are welcome. To add a new company scraper:

1. Create a new file under `Companies/` that exports a scraping function (e.g. `scrapeNewCo`) and exposes it via `module.exports`.
2. Register the function in `index.js` by adding an entry to the `scrapingFunctions` array with a `name` and `scrape` reference.
3. Add tests or a small script to verify the scraper works.

License

MIT

