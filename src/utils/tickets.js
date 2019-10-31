import db from './db';
import ScreenshotManager from './screenshots';

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

  // process screenshots
  const defaultUserAgent = await browser.userAgent();
  const ss = new ScreenshotManager(defaultUserAgent);
  const ssArtifacts = await ss.processScreenshots(ticket, page);
  artifacts.push(...ssArtifacts);

  // save artifacts to database
  await db.saveArtifacts(artifacts);

  // Close ticket and page
  await db.closeTicketById(ticketId);
  await page.close();
};

export default { processTicket };
