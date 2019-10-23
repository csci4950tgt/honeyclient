import puppeteer from 'puppeteer';
import db from './src/manager/DatabaseManager';

const FULLPAGE_VIEWPORT_WIDTH = 1920;
const FULLPAGE_VIEWPORT_HEIGHT = 1080;

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();

	console.log("Finding new tickets...");
    const tickets = await db.getNewTickets();

    for(let ticket of tickets) {
        const ticketId = ticket.get("id");
        const ticketURL = ticket.get("url");

        // pull the fields out of the screenshot object into something a bit easier to work with:
        const ticketScreenshots = ticket.get("ScreenShots").map(ss => ({
			ticketId: ss.get("TicketId"),
			width: ss.get("width"),
			height: ss.get("height"),
			filename: ss.get("filename"),
			userAgent: ss.get("userAgent")
		}));

        // any objects in here will get stored:
        const artifacts = [];

        console.log(`Start processing for ticket #${ticketId}.`);

        try {
            // create a new page in puppeteer:
            const page = await browser.newPage();

			console.log(`Loading ${ticketURL}...`);
			await page.goto(ticketURL);

			// process all screenshots:
			for(let ss of ticketScreenshots) {
			    // +1 is intentional, extra fullpage screenshot should count towards total:
			    console.log(`Processing screenshot ${ticketScreenshots.indexOf(ss) + 1} of ${ticketScreenshots.length + 1}.`);

				await page.setViewport({
					width: ss.width,
					height: ss.height,
					deviceScaleFactor: 1
				});

				const userAgent = ss.userAgent || await browser.userAgent();
				console.log(`Setting user agent string to ${userAgent}.`);
				page.setUserAgent(userAgent);

				// data object is a buffer, we'll convert it later:
				artifacts.push({
                    screenshot: ss,
                    data: await page.screenshot()
                });
            }

            // take full-page screenshot:
			console.log(`Processing screenshot ${ticketScreenshots.length + 1} of ${ticketScreenshots.length + 1}.`);

			await page.setViewport({
				width: FULLPAGE_VIEWPORT_WIDTH,
				height: FULLPAGE_VIEWPORT_HEIGHT,
				deviceScaleFactor: 1
			});

			artifacts.push({
				screenshot: {
					ticketId: ticketId,
					width: FULLPAGE_VIEWPORT_WIDTH,
					height: FULLPAGE_VIEWPORT_HEIGHT,
					filename: "screenshotFull.png",
					userAgent: await browser.userAgent()
				},
				data: await page.screenshot({fullPage: true})
		    });

			console.log("Saving output to database...");
            for(let obj of artifacts) {
                console.log(`Saving object ${obj.screenshot.filename}...`);
                await db.storeFile(obj.screenshot.ticketId, obj.screenshot.filename, obj.data);
            }

			console.log("Marking ticket as processed...");
            await db.closeTicketById(ticketId);

            console.log("Done, closing page.");
            await page.close();
        } catch(e) {
            console.warn("An error occurred when processing a ticket:");

            console.log(e);
        }
    }

    console.log(`Finished ${tickets.length} tickets! Closing browser.`);
    await browser.close();
})();