import puppeteer from 'puppeteer';
import {promises as fs} from 'fs';

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();

    console.log("Reading list of jobs...");
    let input, output;

    // read in list of files from input and output dirs:
    try {
        input = await fs.readdir('input');
        output = await fs.readdir('output');
    } catch(e) {
        console.warn("Failed to read input/output directories.");

        process.exit(0);
    }

    // find .json files in input dir:
    let tickets = input.filter(filename => filename.endsWith(".json"));

    // filter output dir to only be folders, not files:
    const finishedTickets = output.filter(filename => !filename.includes("."));

    // check which .json files don't have folders in output/:
    const unfinished = tickets.filter(filename => !finishedTickets.includes(filename.replace(".json", "")));

    for(let ticket of unfinished) {
        const ticketNumber = ticket.replace(".json", "");

        console.log(`Start processing for ${ticketNumber}.`);

        try {
            let contents = await fs.readFile(`input/${ticket}`, "utf8");

            contents = JSON.parse(contents);

            // make output/{ticketNumber}:
            fs.mkdir(`output/${ticketNumber}`);

            // create a new page in puppeteer:
            const page = await browser.newPage();
            await page.setViewport({
                width: contents.screenshot.width,
                height: contents.screenshot.height,
                deviceScaleFactor: 1,
            });

            console.log(`Loading ${contents.url}...`);
            await page.goto(contents.url);

            const userAgent = contents.useragent || await browser.userAgent();
            console.log(`Setting user agent string to ${userAgent}.`);
            page.setUserAgent(userAgent);

            const screenshotFile = `output/${ticketNumber}/${contents.screenshot.filename}`;
            console.log(`Saving screenshot to ${screenshotFile}`);
            await page.screenshot({path: screenshotFile});

            console.log("Done, closing page.");
            await page.close();
        } catch(e) {
            console.warn(`Failed to load ticket: ${ticket}`);

            console.log(e);
        }
    }

    console.log(`Finished ${tickets.length} jobs! Closing browser.`);
    await browser.close();
})();