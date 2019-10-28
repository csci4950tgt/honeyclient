import puppeteer from 'puppeteer';
import db from './manager/DatabaseManager';

// these are used for the fullpage screenshot:
const FULLPAGE_VIEWPORT_WIDTH = 1920;
const FULLPAGE_VIEWPORT_HEIGHT = 1080;

const getCustomScreenshots = (ticket, defaultUserAgent) => {
  // custom screenshot functionality not yet added, so will just return empty
  // array
  return [];

  // pull the fields out of the screenshot object into something a bit easier to work with:
  // const ticketScreenshots = ticket.get('ScreenShots').map(ss => ({
  //   ticketId: ss.get('TicketId'),
  //   width: ss.get('width'),
  //   height: ss.get('height'),
  //   filename: ss.get('filename'),
  //   userAgent: ss.get('userAgent'),
  // }));
};

const processScreenshot = async (page, ss, defaultUserAgent) => {
  console.log(`processing screenshot for ticket: ${ss.ticketId}`);

  // set viewport
  await page.setViewport({
    width: ss.width,
    height: ss.height,
    deviceScaleFactor: 1,
  });

  // set user agent
  const userAgent = ss.userAgent || defaultUserAgent;
  page.setUserAgent(userAgent);

  // capture screenshot
  const data = await page.screenshot();

  // data object is a buffer, we'll convert it later:
  artifact = {
    screenshot: ss,
    data: data,
  };

  return artifact;
};

const processFullScreenshot = async (page, defaultUserAgent, ticketId) => {
  console.log('\tProcessing fullpage screenshot');

  // initialize fullpage screenshot object
  const ss = {
    ticketId: ticketId,
    width: FULLPAGE_VIEWPORT_WIDTH,
    height: FULLPAGE_VIEWPORT_HEIGHT,
    filename: 'screenshotFull.png',
    userAgent: defaultUserAgent,
  };

  // set viewport
  await page.setViewport({
    width: FULLPAGE_VIEWPORT_WIDTH,
    height: FULLPAGE_VIEWPORT_HEIGHT,
  });

  // capture screenshot
  const data = await page.screenshot({ fullPage: true });
  // create artifact object to return
  const artifact = {
    screenshot: ss,
    data: data,
  };

  return artifact;
};

const saveToDB = async (db, artifacts) => {
  console.log('Saving artifacts to database...');
  for (let obj of artifacts) {
    await db.storeFile(
      obj.screenshot.ticketId,
      obj.screenshot.filename,
      obj.data
    );
  }
};

const processTicket = async (browser, ticket) => {
  // get important ticket info from db
  const ticketId = ticket.get('id');
  const ticketURL = ticket.get('url');

  // create a new page in puppeteer:
  console.log(`Starting to process ticket #${ticketId}.`);
  const page = await browser.newPage();
  await page.goto(ticketURL);

  // Store all artifacts while processing honeyclient, will eventually store in db
  const artifacts = [];

  // process custom screenshots
  const customScreenshots = getCustomScreenshots(ticket);
  for (const ss of customScreenshots) {
    let artifact = await processScreenshot(page, ss);
    artifacts.push(artifact);
  }

  // process full page screenshot
  const defaultUserAgent = await browser.userAgent();
  let artifact = await processFullScreenshot(page, defaultUserAgent, ticketId);
  artifacts.push(artifact);

  // save artifacts to database
  await saveToDB(db, artifacts);

  // Close ticket and page
  await db.closeTicketById(ticketId);
  await page.close();
};

const main = async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();

  console.log('Finding new tickets...');
  const tickets = await db.getNewTickets();

  try {
    // loop through and process tickets
    for (let ticket of tickets) {
      await processTicket(browser, ticket);
    }
    // success message
    console.log(
      `Finished processing ${tickets.length} tickets! Closing browser.`
    );
  } catch (e) {
    console.error('An error occured when processing a ticket');
    console.log(e);
  }

  await browser.close();
};

main();
