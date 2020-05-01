# honeyclient

A secure environment in which to do analysis work on a potentially malicious website. Exposes a REST api, consumed by [csci4950tgt/api](https://github.com/csci4950tgt/api), to recieve ticket information. Artifacts produced after a ticket's processing are persisted in-memory temporarily.

## Features

- Grabs screenshots of the target URL, with customizable browser viewport (width/height) and user agent
- Tracks and stores resources retrieved by the site
- Performs OCR on all images loaded by the site
- Checks the URLs of retrieved resources against the [Google Safe Browsing](https://safebrowsing.google.com) service
- Uses [yara](https://virustotal.github.io/yara/) to run static analysis tasks on assets retrieved by the site over XHR

## Prerequisites

- [Node.js](https://nodejs.org) is used to run this project. Check `node -v` to make sure you're running `node` at least version 12.0. Node 13 is preferred.
- [Tesseract](https://github.com/tesseract-ocr/tesseract) is used to perform OCR on images. On a mac, use `brew install tesseract` to set up the dependency. On other platforms, you should be able to find a version in your package manager's repositories.
- [Yara](https://yara.readthedocs.io/en/stable/gettingstarted.html) is used to perform static analysis. On a mac, use `brew install yara`. On other platforms, see the linked website to download and install from source.
- An [API key](https://developers.google.com/safe-browsing/v4/get-started) for Google Safe Browsing is required. See the referenced link for documentation on how to obtain a key.

## Installation

- Run `cp .env.template .env`, and fill in your API key for Google Safe Browsing in `.env`.
- Run `npm install` to set up dependencies.
- Use `npm start` to run the program.

## Docker

Alternatively, you can set up the entire system using Docker. A `Dockerfile` for this project is provided. See more information and instructions in the [csci4950tgt/utils](https://github.com/csci4950tgt/utils) repository.

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
