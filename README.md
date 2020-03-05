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
