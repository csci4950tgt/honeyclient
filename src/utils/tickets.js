import ScreenshotManager from './screenshots.js';
import ResourceManager from '../manager/ResourceManager.js';
import getBrowser from '../utils/browser.js';
import ArtifactManager from '../manager/ArtifactManager.js';
import YaraManager from '../manager/YaraManager.js';
import OCRManager from '../manager/OCRManager.js';
import SafeBrowsingManager from '../manager/SafeBrowsingManager.js';

const processTicket = async ticket => {
  const ticketId = ticket.getID();
  const ticketURL = ticket.getURL();

  const browser = await getBrowser();
  const resourceManager = new ResourceManager();
  const yaraManager = new YaraManager();
  const ocrManager = new OCRManager();
  const ssManager = new ScreenshotManager(await browser.userAgent());
  const safeBrowsingManager = new SafeBrowsingManager();

  console.log(`Starting to process ticket #${ticketId}.`);
  console.log(`URL: ${ticketURL}`);

  // Create a new page in puppeteer:
  const page = await browser.newPage();
  resourceManager.setupResourceCollection(page, ticket);

  console.log('Visiting page.');
  await page.goto(ticketURL);

  // Store all artifacts while processing honeyclient, will eventually return to api
  const artifacts = [];

  // process resources, waits for page to finish loading
  const jsArtifacts = await resourceManager.process();
  artifacts.push(...jsArtifacts);

  // process screenshots
  const ssArtifacts = await ssManager.processScreenshots(ticket, page);
  const ocrArtifacts = await ocrManager.processImages(ssArtifacts);

  artifacts.push(...ssArtifacts);
  artifacts.push(...ocrArtifacts);

  // scan js
  await yaraManager.setupResourceScan(jsArtifacts, ticket);
  const yaraArtifacts = yaraManager.process();
  artifacts.push(...yaraArtifacts);

  // store
  ArtifactManager.storeArtifactsForTicket(artifacts);

  await page.close();

  // Get result from Google Safe Browsing API v4
  const urls = resourceManager.getURLs();
  const malwareMatches = await safeBrowsingManager.getMalwareMatches(urls);

  // Success, return list of paths
  return {
    success: true,
    fileArtifacts: artifacts.map(ArtifactManager.artifactToPath),
    malwareMatches: JSON.stringify(malwareMatches),
  };
};

export default { processTicket };
