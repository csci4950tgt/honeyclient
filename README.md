# honeyclient

Provides functionality for the api, investigates a potentially malicious website safely, on behalf of a security researcher.

## Features

- Grabs screenshots of the target URL, with customizable browser viewport (width/height)
- Accepts a User-Agent string to pass to the website

### Upcoming

- Beautified JS: Web service will include a JS package to beautify JS string

## Usage

- Check `node -v` to make sure you're running `node` at least 12.0. Node 13 is preferred.
- Run `npm install` to set up puppeteer.
- Use `npm start` to run the program.
- Place files into the `input` directory, based on the syntax of `request.json`.
- Look in the `output/` directory, the filename of the input will match to the output
