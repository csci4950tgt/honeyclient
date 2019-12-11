import db from './db';
import ScreenshotManager from './screenshots';
import ResourceManager from '../manager/ResourceManager';
import getBrowser from '../utils/browser';

const processTicket = async ticket => {
  // get important ticket info from db
  const ticketId = ticket.get('id');
  const ticketURL = ticket.get('url');

  const resourceManager = new ResourceManager();

  console.log(`Starting to process ticket #${ticketId}.`);
  console.log(`URL: ${ticketURL}`);

  // Setup browser
  const browser = await getBrowser();

  // Create a new page in puppeteer:
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
  // TODO: take out this functionality
  if (!ticket.get('processed')) {
    await db.saveArtifacts(artifacts);
  }

  // Close ticket and page
  await db.closeTicketById(ticketId);
  await page.close();

  // Success
  console.log(`Finished processing ticket #${ticket.id}.`);
  return artifacts;
};

export default { processTicket };
