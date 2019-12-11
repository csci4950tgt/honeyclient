import db from './db';
import ScreenshotManager from './screenshots';
import ResourceManager from '../manager/ResourceManager';

const processTicket = async (browser, ticket) => {
  // get important ticket info from db
  const ticketId = ticket.get('id');
  const ticketURL = ticket.get('url');

  const resourceManager = new ResourceManager();

  // create a new page in puppeteer:
  console.log(`Starting to process ticket #${ticketId}.`);
  console.log(`URL: ${ticketURL}`);

  const page = await browser.newPage();
  resourceManager.setupResourceCollection(page, ticket);

  await page.goto(ticketURL);

  // Store all artifacts while processing honeyclient, will eventually store in db
  const artifacts = [];

  // process screenshots
  const defaultUserAgent = await browser.userAgent();
  const ss = new ScreenshotManager(defaultUserAgent);
  const ssArtifacts = await ss.processScreenshots(ticket, page);
  artifacts.push(...ssArtifacts);

  // process resources
  artifacts.push(...(await resourceManager.process()));

  // save artifacts to database
  //don't want to do this????
  //----------------------------------
  await db.saveArtifacts(artifacts);

  // Close ticket and page
  await db.closeTicketById(ticketId);
  await page.close();
  return artifacts;
};

export default { processTicket };
