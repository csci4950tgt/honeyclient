import ScreenshotManager from './screenshots.js';
import ResourceManager from '../manager/ResourceManager.js';
import getBrowser from '../utils/browser.js';
import ArtifactManager from '../manager/ArtifactManager.js';

const processTicket = async ticket => {
  const ticketId = ticket.getID();
  const ticketURL = ticket.getURL();

  const resourceManager = new ResourceManager();

  console.log(`Starting to process ticket #${ticketId}.`);
  console.log(`URL: ${ticketURL}`);

  // Setup browser
  const browser = await getBrowser();

  // Create a new page in puppeteer:
  const page = await browser.newPage();
  resourceManager.setupResourceCollection(page, ticket);

  await page.goto(ticketURL);

  // Store all artifacts while processing honeyclient, will eventually return to api
  const artifacts = [];

  // process screenshots
  const defaultUserAgent = await browser.userAgent();
  const ss = new ScreenshotManager(defaultUserAgent);
  const ssArtifacts = await ss.processScreenshots(ticket, page);
  artifacts.push(...ssArtifacts);

  // process resources
  artifacts.push(...(await resourceManager.process()));

  // store
  ArtifactManager.storeArtifactsForTicket(artifacts);

  await page.close();

  // Success, return list of paths
  return {
    success: true,
    fileArtifacts: artifacts.map(ArtifactManager.artifactToPath),
  };
};

export default { processTicket };
