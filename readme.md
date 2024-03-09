# CodeCareerNepal-Server

This repository contains the source code for CodeCareerNepal, a job portal application. The application is built using Node.js, Express, MongoDB, and Puppeteer for web scraping.

## Table of Contents

- [MongoDB Schemas](#mongodb-schemas)
- [API Routes](#api-routes)
- [Scraping Routes](#scraping-routes)
- [Utility Functions](#utility-functions)
- [Docker Configuration](#docker-configuration)
- [Environment Configuration](#environment-configuration)
- [Application Setup](#application-setup)
- [Usage](#usage)

## MongoDB Schemas

### Job Schema (`jobSchema`)

- `jobName`: String, required.
- `jobUrl`: String, required.
- `updatedAt`: Date, default: current date.

### Company Schema (`companySchema`)

- `companyName`: String, required.
- `totalJobs`: Array of `jobSchema`, required.
- `createdAt`: Date, default: current date.
- `updatedAt`: Date, default: current date.

### Scrape State Schema (`scrapeStateSchema`)

- `currentIndex`: Number, default: 0.
- `updatedAt`: Date, default: current date.

## API Routes

### GET `/`

- Returns a paginated list of all company job listings.

### GET `/intern`

- Fetches and returns intern jobs using the `getInternJobs` utility function.

### GET `/:id`

- Returns job listings for a specific company based on the provided company ID.

## Scraping Routes

### GET `/scrape`

- Initiates web scraping for multiple companies using predefined scraping functions.
- Scraping functions are defined for companies such as Cotiviti, FuseMachine, LeapFrog, and others.

## Utility Functions

### `getInternJobs.js`

- Filters and projects relevant intern jobs from the MongoDB collection.

### `store.js`

- Stores job data into the MongoDB collection.

## Docker Configuration

The application is containerized using Docker.

- Base image: Puppeteer (version 21.6.1).
- Installs Node.js dependencies and sets the entry point to `index.js`.

## Environment Configuration

- Environment variables are loaded using the `dotenv` package.
- Key variables include `MONGODB_URI` for MongoDB connection and `PORT` for the application.

## Application Setup

1.  Clone the repository: `git clone https://github.com/anishjoshi1999/CodeCareerNepal.git`
2.  Install dependencies: `npm install`
3.  Set up environment variables: Create a `.env` file with required configurations.
4.  Start the application: `npm start` or `npm run dev` for development.

## Usage

- Access the job portal API through the defined routes.
- Initiate web scraping for new job listings using the `/scrape` route.

Note: Ensure proper error handling, logging, and security measures are implemented before deploying the application in a production environment.

# Contribution Guidelines

Thank you for considering contributing to our project! We appreciate the community's involvement in making this project better.

## Ways to Contribute

There are several ways you can contribute to this project:

1. Reporting Bugs: If you find a bug, please open an issue. Provide a clear and detailed description, including steps to reproduce the issue.

2. Suggesting Enhancements: Have an idea to improve the project? Feel free to open an issue with your enhancement suggestion, and we can discuss it.

3. Fixing Issues: Want to tackle an existing issue or contribute a new feature? Fork the repository, create a new branch, make your changes, and submit a pull request.

## How to Contribute

To contribute to this project, follow these steps:

1. Fork the repository to your GitHub account.

2. Clone the forked repository to your local machine:

   ```bash
   git clone https://github.com/anishjoshi1999/CodeCareerNepal-Server.git
   ```

3. Create a new branch for your contribution:

   ```bash
   git checkout -b feature/your-feature
   ```

4. Make your changes and test them thoroughly.

5. Commit your changes:

   ```bash
   git commit -m "Your meaningful commit message"
   ```

6. Push your changes to your fork:

   ```bash
   git push origin feature/your-feature
   ```

7. Submit a pull request to the 'dev' branch of this repository, ensuring that your changes are clearly described and any relevant issues are referenced.

## Code Style and Guidelines

Follow the established coding style and guidelines for this project. If there are specific conventions to adhere to, they will be mentioned here. Ensure that your code passes any existing tests.

## Code of Conduct

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). We aim to foster a welcoming and inclusive community.

## Licensing

By contributing to this project, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE.md).

Thank you for your contribution!
