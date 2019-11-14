import { js as beautify } from 'js-beautify';
import path from 'path';

export default class ResourceManager {
  constructor() {
    this.resources = [];
  }

  setupResourceCollection(page, ticket) {
    const ticketId = ticket.get('id');

    page.on('response', async response => {
      // extract some information from the response object:
      const url = response.url();
      const status = response.status();
      const ok = response.ok();

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

      console.log(`${status} ${url}`);

      if (ok && url.endsWith('.js')) {
        console.log(`Beautifying and saving to ${identifier}.`);

        const text = await response.text();
        const beautified = beautify(text);

        this.resources.push({
          ticketId,
          filename: identifier,
          data: Buffer.from(beautified, 'utf8'),
        });
      }
    });
  }

  process() {
    return this.resources;
  }
}