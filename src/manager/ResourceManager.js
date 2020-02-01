import path from 'path';
import { config } from '../index.js';

export default class ResourceManager {
  constructor() {
    this.resources = [];
  }

  setupResourceCollection(page, ticket) {
    console.log(`Capturing JS...`);
    const ticketId = ticket.getID();

    page.on('response', async response => {
      // extract some information from the response object:
      const url = response.url();
      const status = response.status();
      const ok = response.ok();

      // use hostname/filename as identifier:
      const processedURL = new URL(url);

      const safeBrowsingURL =
        'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=' +
        index.config.google_safe_browsing_api_key;
      const request = {
        client: {
          clientId: '4950',
          clientVersion: '0.0.1',
        },
        threatInfo: {
          threatTypes: ['MALWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url: processedURL }],
        },
      };

      const fetch = require('node-fetch');

      try {
        fetch(safeBrowsingURL, {
          method: 'POST',
          body: JSON.stringify(request),
          responseType: 'application/json',
        })
          .then(res => res.json())
          .then(res => {
            if (res.matches === undefined) {
              // console.log('----------------------------------------------');
              // console.log('no malware find');
            } else {
              const { matches } = res.matches;
              const match = matches[0];
              console.log('----------------------------------------------');
              console.log('malware find:');
              console.log(match);
            }
          });
      } catch (error) {
        console.log(error);
      }

      const hostname = processedURL.hostname;
      // grab the filename from the path specifier:
      const filename = processedURL.pathname.substring(
        processedURL.pathname.lastIndexOf('/') + 1
      );
      let identifier = `${hostname}/${filename}`;

      // handle 2 objects with same identifier:
      const pathParsed = path.parse(filename);
      let i = 0;

      // find first available name:
      while (this.resources.some(x => x.filename === identifier)) {
        i++;
        identifier = `${hostname}/${pathParsed.name}-${i}${pathParsed.ext}`;
      }

      if (ok && url.endsWith('.js')) {
        const text = await response.text();

        this.resources.push({
          ticketId,
          filename: identifier,
          data: Buffer.from(text, 'utf8'),
        });
      }
    });
  }

  process() {
    return this.resources;
  }
}
