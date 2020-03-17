/***
 * ScreenshotManager class for use in processing all screenshots associated with
 * a ticket
 */
import AsyncWorker from './AsyncWorker.js';

class ScreenshotManager extends AsyncWorker {
  constructor(defaultUserAgent) {
    super('screenshot collection');

    this.defaultUserAgent = defaultUserAgent;
  }

  // Processes all screenshots for a ticket and returns artifacts
  processScreenshots = async (ticket, page) => {
    super.start();
    this.ticket = ticket;

    const ssArtifacts = [];

    // process fullpage screenshot
    let ssArtifact = await this._processFullScreenshot(page);
    ssArtifacts.push(ssArtifact);

    // process custom screenshots
    const customScreenshots = ticket.getScreenshots();
    for (const ss of customScreenshots) {
      let ssArtifact = await this._processCustomScreenshot(page, ticket, ss);
      ssArtifacts.push(ssArtifact);
    }

    super.finish();

    return ssArtifacts;
  };

  // Process fullpage screenshot and return the artifact
  _processFullScreenshot = async page => {
    // initialize fullpage screenshot object
    const ss = {
      ticketId: this.ticket.getID(),
      filename: 'screenshotFull.png',
      userAgent: this.defaultUserAgent,
    };

    // capture screenshot
    const data = await page.screenshot({ fullPage: true });
    // create artifact object to return
    return {
      ticketId: ss.ticketId,
      filename: ss.filename,
      data,
    };
  };

  // process custom screenshots of ticket and return artifacts
  _processCustomScreenshot = async (page, ticket, ss) => {
    // set viewport
    await page.setViewport({
      width: ss.getWidth(),
      height: ss.getHeight(),
      deviceScaleFactor: 1,
    });

    // set user agent
    const userAgent = ss.getUserAgent() || this.defaultUserAgent;
    await page.setUserAgent(userAgent);

    // capture screenshot
    const data = await page.screenshot();

    // data object is a buffer, we'll send as base64:
    return {
      ticketId: ticket.getID(),
      filename: ss.getFilename(),
      data,
    };
  };
}

export default ScreenshotManager;
