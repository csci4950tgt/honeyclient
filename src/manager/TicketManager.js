import ScreenshotManager from '../manager/ScreenshotManager.js';
import ResourceManager from '../manager/ResourceManager.js';
import getBrowser from '../utils/browser.js';
import ArtifactManager from '../manager/ArtifactManager.js';
import YaraManager from '../manager/YaraManager.js';
import OCRManager from '../manager/OCRManager.js';
import SafeBrowsingManager from '../manager/SafeBrowsingManager.js';
import isImageUrl from 'is-image-url';

export default {
  async processTicket(ticket) {
    const browser = await getBrowser();
    const resourceManager = new ResourceManager();
    const yaraManager = new YaraManager();
    const ocrManager = new OCRManager();
    const ssManager = new ScreenshotManager(await browser.userAgent());
    const safeBrowsingManager = new SafeBrowsingManager();

    console.log(`Starting to process ticket #${ticket.getID()}.`);
    console.log(`URL: ${ticket.getURL()}`);

    // Create a new page in puppeteer:
    const page = await browser.newPage();
    resourceManager.setupResourceCollection(page, ticket);

    await page.goto(ticket.getURL());

    // Store all artifacts while processing honeyclient, will eventually return to api
    const artifacts = [];

    // process resources, waits for page to finish loading
    const resourceArtifacts = await resourceManager.process();
    artifacts.push(...resourceArtifacts[0]);

    // needed for safe browsing:
    const urls = resourceManager.getURLs();

    // filter out images for OCR:
    const imgArtifacts = resourceArtifacts[0].filter(artifact =>
      isImageUrl(artifact.filename)
    );

    // do next four tasks in parallel using Promise.all.
    const asyncArtifacts = await Promise.all([
      ssManager.processScreenshots(ticket, page), // screenshots
      ocrManager.processImages(imgArtifacts), // ocr
      yaraManager.setupResourceScan(resourceArtifacts[1], ticket), // yara
      safeBrowsingManager.getMalwareMatches(urls), // safe browsing
    ]);

    artifacts.push(...asyncArtifacts[0]); // screenshots
    artifacts.push(...asyncArtifacts[1]); // ocr
    artifacts.push(...asyncArtifacts[2]); // yara

    // store in in-memory filesystem
    ArtifactManager.storeArtifactsForTicket(artifacts);

    await page.close();

    console.log(
      `Finished processing #${ticket.getID()}, ${
        artifacts.length
      } artifacts stored.`
    );

    // Success, return list of paths
    return {
      success: true,
      fileArtifacts: artifacts.map(ArtifactManager.artifactToPath),
      malwareMatches: JSON.stringify(asyncArtifacts[3]),
    };
  },
};
