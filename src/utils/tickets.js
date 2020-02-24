import ScreenshotManager from './screenshots.js';
import ResourceManager from '../manager/ResourceManager.js';
import getBrowser from '../utils/browser.js';
import ArtifactManager from '../manager/ArtifactManager.js';
import YaraManager from './yara.js';
import fetch from 'node-fetch';

const getMalwareMatches = async URLs => {
  // Get Google Safe Browsing key
  const google_safe_browsing_api_key = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!google_safe_browsing_api_key) {
    console.error(
      `You need an environment variable for GOOGLE_SAFE_BROWSING_API_KEY. Please check slack for this key.
    Quiting honeyclient now.`
    );
    process.exit();
  }

  // Make request to Google safe browsing
  console.log(`Getting Google Safe Browsing information...`);
  const safeBrowsingURL =
    'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' +
    google_safe_browsing_api_key;
  const requestURLList = URLs.map(entry => {
    const container = {};
    container['url'] = entry;
    return container;
  });
  const request = {
    client: {
      clientId: '4950',
      clientVersion: '0.0.1',
    },
    threatInfo: {
      threatTypes: ['MALWARE'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: requestURLList,
    },
  };

  try {
    // Parse request
    const res = await fetch(safeBrowsingURL, {
      method: 'POST',
      body: JSON.stringify(request),
      responseType: 'application/json',
    });
    const json = res.json();
    if (!json.matches) {
      console.log('No Malware found');
      return [];
    } else {
      console.log('Malware found');
      console.log(json.matches);
      return json.matches;
    }
  } catch (err) {
    console.error(error);
    throw Error(err.message);
  }
};

const processTicket = async ticket => {
  const ticketId = ticket.getID();
  const ticketURL = ticket.getURL();

  const resourceManager = new ResourceManager();
  const yaraManager = new YaraManager();

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
  const jsArtifacts = await resourceManager.process();
  artifacts.push(...jsArtifacts);

  // scan js
  yaraManager.setupResourceScan(jsArtifacts, ticket);
  const yaraArtifacts = await yaraManager.process();
  artifacts.push(...yaraArtifacts);

  // store
  ArtifactManager.storeArtifactsForTicket(artifacts);

  await page.close();

  // Get result from Google Safe Browsing API v4
  const urls = await resourceManager.getURLs();
  const malwareMatches = await getMalwareMatches(urls);

  // Success, return list of paths
  return {
    success: true,
    fileArtifacts: artifacts.map(ArtifactManager.artifactToPath),
    malwareMatches: JSON.stringify(malwareMatches),
  };
};

export default { processTicket };
