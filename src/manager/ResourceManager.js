import path from 'path';

export default class ResourceManager {
  constructor() {
    this.resources = [];
    this.urls = [];
  }

  setupResourceCollection(page, ticket) {
    console.log(`Capturing JS...`);
    const ticketId = ticket.getID();

    page.on('response', async response => {
      // extract some information from the response object:
      const url = response.url();
      const status = response.status();
      const ok = response.ok();

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
      //console.log(identifier);

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

  getURLs() {
    return this.urls;
  }
}
