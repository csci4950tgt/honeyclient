import fetch from 'node-fetch';
import AsyncWorker from './AsyncWorker.js';

const SAFE_BROWSING_BASE = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=`;
const CLIENT_ID = '4950';
const CLIENT_VERSION = '0.0.1';

export default class SafeBrowsingManager extends AsyncWorker {
  constructor() {
    super('safe browsing analysis');

    // Get Google Safe Browsing key
    this.apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  }

  static checkApiKey() {
    const instance = new SafeBrowsingManager();

    if (!instance.apiKey || instance.apiKey === '') {
      console.error(
        `You need an environment variable for GOOGLE_SAFE_BROWSING_API_KEY. Please check slack for this key.
    Quiting honeyclient now.`
      );
      process.exit();
    }
  }

  async getMalwareMatches(URLs) {
    super.start();

    const requestURLList = URLs.map(entry => ({
      url: entry,
    }));
    const request = {
      client: {
        clientId: CLIENT_ID,
        clientVersion: CLIENT_VERSION,
      },
      threatInfo: {
        threatTypes: ['MALWARE'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: requestURLList,
      },
    };

    try {
      // make request to google safe browsing. parse request:
      const json = await fetch(SAFE_BROWSING_BASE + this.apiKey, {
        method: 'POST',
        body: JSON.stringify(request),
        responseType: 'application/json',
      }).then(res => res.json());

      super.finish();

      if (!json.matches) {
        console.log('No Malware found');

        return [];
      } else {
        console.log('Malware found:');
        console.log(json.matches);

        return json.matches;
      }
    } catch (err) {
      console.error(err);
      super.finish();

      throw Error(err.message);
    }
  }
}
