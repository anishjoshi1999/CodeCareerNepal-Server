# KaamKhoj API (CodeCareerNepal-Server)

**KaamKhoj** is a small job-scraping API that collects job listings from several Nepal-based companies, stores them in MongoDB, and supports scraping detailed job pages on demand.

---

## 🔧 Features

- Scrapes job listings from a registry of company scrapers ✅
- Stores companies and job listings in MongoDB 🗄️
- Supports fetching detailed job descriptions ("inside" scraping) for each job 🌐
- Sequential stateful scraping with resume support using `ScrapeState` 🔁
- Simple Express-based API with CORS enabled 🚀

---

## 🧩 Project Structure

- `index.js` — App entry point and MongoDB connection
- `Routes/scrapeRoute.js` — Main scraping routes and orchestration
- `Companies/` — Company-specific scrapers (list pages)
- `Companies/inside/` — Scrapers for individual job detail pages
- `Models/Company.js` — Mongoose model for company + jobs
- `Models/scrapeState.js` — Tracks the current scraper index (resume progress)
- `utils/store.js` — Helper to persist scraped jobs into the DB
- `Dockerfile` — Containerization config

---

## ⚙️ Requirements

- Node.js (v16+ recommended)
- npm
- MongoDB Atlas (or another MongoDB instance)

---

## 🚀 Setup & Run

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (or set environment variables) with at least:

```
MONGODB_URI=<your-mongodb-connection-string>
PORT=3000 # optional
```

3. Start the server:

```bash
npm start
# or
node index.js
```

Server will run on `http://localhost:3000` (or the configured `PORT`).

---

## 🔍 API Endpoints

- GET `/scrape` — Run the sequential, stateful scrape process for the current company in the registry. Progress persists in `ScrapeState`.

  - Success response: `{ message: '✅ Fully scraped <CompanyName>', stats: { scraped, skipped, failed } }`

- GET `/scrape/:name` — Scrape a single company immediately (one-off). Example: `/scrape/fusemachine`

- GET `/scrape/:name/inside` — Scrape detailed job pages for an already-stored company. Example: `/scrape/fusemachine/inside`

Notes:
- The route handlers log detailed progress to the console and return JSON summaries on completion.
- The route uses retry logic for inside scraping to improve reliability.

---

## 🧪 Usage Examples

Run the sequential scraper:

```bash
curl http://localhost:3000/scrape
```

Scrape a single company:

```bash
curl http://localhost:3000/scrape/leapfrog
```

Scrape inside pages for a company:

```bash
curl http://localhost:3000/scrape/verisk/inside
```

---

## 🛠 Development Tips

- Company scrapers are defined in `Routes/scrapeRoute.js` (the `SCRAPERS` array). Add a new company by adding a scraper module and registering it.
- Inside scrapers (detailed job pages) live under `Companies/inside/` and are referenced by the `INSIDE_SCRAPERS` map.

---

## 🧾 License & Contribution

- This project includes a `LICENSE.md`. Feel free to open issues or PRs for improvements.

---

> **Tip:** If you plan to run this in a container, make sure to supply MongoDB connection information to the container via environment variables, and consider using the provided `Dockerfile`.

---

If you'd like, I can also add an example `.env.example`, Postman collection, or more detailed docs for contributing — tell me which you'd prefer. ✨
