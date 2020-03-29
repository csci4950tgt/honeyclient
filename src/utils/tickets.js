import ScreenshotManager from '../manager/ScreenshotManager.js';
import ResourceManager from '../manager/ResourceManager.js';
import getBrowser from '../utils/browser.js';
import ArtifactManager from '../manager/ArtifactManager.js';
import YaraManager from '../manager/YaraManager.js';
import OCRManager from '../manager/OCRManager.js';
import SafeBrowsingManager from '../manager/SafeBrowsingManager.js';
import isImageUrl from 'is-image-url';

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

  await page.goto(ticketURL);

  // Store all artifacts while processing honeyclient, will eventually return to api
  const artifacts = [];

  // process resources, waits for page to finish loading
  const resourceArtifacts = await resourceManager.process();
  artifacts.push(...resourceArtifacts);

  // needed for safe browsing:
  const urls = resourceManager.getURLs();

  // filter out only js files for yara:
  const jsArtifacts = resourceArtifacts.filter(artifact =>
    artifact.filename.endsWith('.js')
  );

  // filter out images for OCR:
  const imgArtifacts = resourceArtifacts.filter(artifact =>
    isImageUrl(artifact.filename)
  );

  // do next 3 tasks in parallel using Promise.all.
  // ocr, yara, safe browsing API
  const asyncArtifacts = await Promise.all([
    ssManager.processScreenshots(ticket, page),
    ocrManager.processImages(imgArtifacts),
    yaraManager.setupResourceScan(jsArtifacts, ticket),
    safeBrowsingManager.getMalwareMatches(urls),
  ]);

  artifacts.push(...asyncArtifacts[0]); // screenshots
  artifacts.push(...asyncArtifacts[1].filter(a => a)); // ocr, remove nulls
  artifacts.push(...asyncArtifacts[2]); // yara

  // store
  ArtifactManager.storeArtifactsForTicket(artifacts);

  await page.close();

  console.log(
    `Finished processing #${ticketId}, ${artifacts.length} artifacts stored.`
  );

  // Success, return list of paths
  return {
    success: true,
    fileArtifacts: artifacts.map(ArtifactManager.artifactToPath),
    malwareMatches: JSON.stringify(asyncArtifacts[3]),
  };
};

export default { processTicket };
