import path from 'path';
import AsyncWorker from './AsyncWorker.js';

export default class ResourceManager extends AsyncWorker {
  constructor() {
    super('resource collection');

    this.resources = [];
    this.urls = [];
  }

  setupResourceCollection(page, ticket) {
    const ticketId = ticket.getID();
    this.start();

    page.on('response', async response => {
      // extract some information from the response object:
      const url = response.url();
      const status = response.status();
      const ok = response.ok();

      console.log(`${status} ${url}`);

      if (ok) {
        this.urls.push(url);
      }

      // use hostname/filename as identifier:
      const processedURL = new URL(url);

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

    // load event is emitted when resources are finished loading for the page
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
    page.on('load', () => {
      console.log('Page emitted load event.');

      super.ready();
      super.finish();
    });
  }

  async process() {
    await super.waitUntilReady();

    return this.resources;
  }

  getURLs() {
    return this.urls;
  }
}
