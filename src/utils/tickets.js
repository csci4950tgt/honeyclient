import ScreenshotManager from './screenshots.js';
import ResourceManager from '../manager/ResourceManager.js';
import getBrowser from '../utils/browser.js';
import ArtifactManager from '../manager/ArtifactManager.js';
import { config } from '../index.js';

import fetch from 'node-fetch';

const getMalwareMatches = async URL => {
  console.log(`Getting Google Safe Browsing information...`);
  const safeBrowsingURL =
    'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' +
    config.google_safe_browsing_api_key;
  console.log(requestURLList);
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

  return fetch(safeBrowsingURL, {
    method: 'POST',
    body: JSON.stringify(request),
    responseType: 'application/json',
  })
    .then(res => {
      return res.json();
    })
    .then(json => {
      if (json.matches === undefined) {
        console.log('No malware found');
        return [];
      } else {
        console.log('Malware found');
        console.log(json.matches);
        return json.matches;
      }
    })
    .catch(error => {
      console.log(error);
      return [];
    });
};

const processTicket = async ticket => {
  const ticketId = ticket.getID();
  const ticketURL = ticket.getURL();

  console.log(`Starting to process ticket #${ticketId}.`);
  console.log(`URL: ${ticketURL}`);

  const resourceManager = new ResourceManager();

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

  // Get result from Google Safe Browsing API v4
  const malwareMatches = getMalwareMatches(await resourceManager.getURLs());

  // Success, return list of paths
  return {
    success: true,
    fileArtifacts: artifacts.map(ArtifactManager.artifactToPath),
    malwareMatches: JSON.stringify(malwareMatches),
  };
};

export default { processTicket };
