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
