# honeyclient

Provides functionality for the api, investigates a potentially malicious website safely, on behalf of a security researcher.

## Features

- Grabs screenshots of the target URL, with customizable browser viewport (width/height)
- Accepts a User-Agent string to pass to the website
- Does OCR on site screenshots
- Checks retrieved resources against Google safe browsing database

## Usage

- Check `node -v` to make sure you're running `node` at least 12.0. Node 13 is preferred.
- Run `cp .env.template .env` and fill in your API key for Google Safe Browsing in `.env`.
- Run `npm install` to set up dependencies.
- On macOS, use `brew install yara` and `brew install tesseract` to set up native dependencies. On other platforms, use corresponding versions from your system's package manager.
- Use `npm start` to run the program.

## Class Overview

- `manager/` - the business logic of the application, with one piece of functionality per file.
- `manager/ArtifactManager` - operates an in-memory filesystem to store files temporarily. Used to pass items between processes of the honeyclient (e.g. resource collector and OCR), and to be retrieved by the API. The express web server hooks directly into this virtual filesystem. Files get automatically deleted after 15 minutes.
- `manager/AsyncWorker` - tracks how long operations take, logging it to the console. Uses an event emitter to provide async/await paradigms for older-style callback code.
- `manager/OCRManager` - uses tesseract to process the images retrieved by a site in parallel.
- `manager/ResourceManager` - sets up events to store resources retrieved by a page. Decides when a page has finished loading, so the rest of the operations can continue.
- `manager/SafeBrowsingManager` - client for the Google Safe Browsing API.
- `manager/ScreenshotManager` - takes in a list of custom screenshots, sets viewport and user agent, and takes them (along with the full-page screenshot).
- `manager/TicketManager` - kicks off all other operations relating to a ticket, doing them in parallel where possible. after done, returns some results to the API.
- `manager/YaraManager` - does static analysis based on the rules provided in `resources/rules.yara`.
- `routes/artifact` - provides API endpoints starting with /artifact as their path. See in-line documentation for arguments and syntax. Also provides external access to the in-memory filesystem.
- `routes/ticket` - provides API endpoints starting with /ticket as their path. See in-line documentation for arguments and syntax.
- `utils/browser` - maintains a singleton browser instance.
- `utils/util` - generally useful functions that don't fit anywhere else.
- `index` - entrypoint. Reads and validates environment variables, sets up express web server.
