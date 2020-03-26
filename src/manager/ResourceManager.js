import path from 'path';
import isImageUrl from 'is-image-url';
import AsyncWorker from './AsyncWorker.js';

const LOAD_TIMEOUT = 10 * 1000;

export default class ResourceManager extends AsyncWorker {
  constructor() {
    super('resource collection');

    this.resources = [];
    this.urls = [];

    // the last time a relevant asset was requested
    this.lastResourceLoadedAt = Date.now();
  }

  isRelevantAsset(url) {
    return url.endsWith('.js') || isImageUrl(url);
  }

  setupResourceCollection(page, ticket) {
    const ticketId = ticket.getID();
    this.start();

    setTimeout(() => {
      if (super.isReady) return;

      console.log(
        'Page failed to finish loading before timeout. Marking complete anyways.'
      );

      super.ready();
      super.finish();
    }, LOAD_TIMEOUT);

    const pageLoadWatcher = setInterval(() => {
      if (Date.now() - this.lastResourceLoadedAt > 1000 && !super.isReady) {
        console.log(
          'One second elapsed since last relevant resource was requested. Marking complete.'
        );

        clearInterval(pageLoadWatcher);
        super.ready();
        super.finish();
      }
    }, 100);

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

      if (ok && this.isRelevantAsset(url)) {
        this.lastResourceLoadedAt = Date.now();
      }

      // collect .js files retrieved for static analysis
      if (ok && url.endsWith('.js')) {
        const text = await response.text();

        this.resources.push({
          ticketId,
          filename: identifier,
          data: Buffer.from(text, 'utf8'),
        });
      }

      // collect images retrieved for OCR purposes
      if (ok && isImageUrl(url)) {
        const buf = await response.buffer();

        this.resources.push({
          ticketId,
          filename: identifier,
          data: Buffer.from(buf),
        });
      }
    });

    // load event is emitted when resources are finished loading for the page
    // https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event
    // this doesn't delay for all the images to load.
    page.on('load', () => {
      console.log('Page emitted load event.');

      this.lastResourceLoadedAt = Date.now();
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
