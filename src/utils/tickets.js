import db from './db';
import ss from './screenshots';

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
  const customScreenshots = ss.getCustomScreenshots(ticket);
  for (const ss of customScreenshots) {
    let artifact = await ss.processScreenshot(page, ss);
    artifacts.push(artifact);
  }

  // process full page screenshot
  const defaultUserAgent = await browser.userAgent();
  let artifact = await ss.processFullScreenshot(
    page,
    defaultUserAgent,
    ticketId
  );
  artifacts.push(artifact);

  // save artifacts to database
  await db.saveArtifacts(artifacts);

  // Close ticket and page
  await db.closeTicketById(ticketId);
  await page.close();
};

export default { processTicket };
