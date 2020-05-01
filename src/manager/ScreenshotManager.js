/***
 * ScreenshotManager class for use in processing all screenshots associated with
 * a ticket
 */
import AsyncWorker from './AsyncWorker.js';

class ScreenshotManager extends AsyncWorker {
  constructor(defaultUserAgent) {
    super('screenshot collection');

    this.defaultUserAgent = defaultUserAgent;
    this.ticket = null;
  }

  // Processes all screenshots for a ticket and returns artifacts
  processScreenshots = async (ticket, page) => {
    super.start();
    this.ticket = ticket;

    const ssArtifacts = [];
    const customScreenshots = ticket.getScreenshots();

    // process fullpage screenshot.
    // each screenshot is not done in parallel, so each one can have the
    // proper user agent applied without a race condition.
    let ssArtifact = await this._processFullScreenshot(page);
    ssArtifacts.push(ssArtifact);

    // process custom screenshots
    for (const ss of customScreenshots) {
      let ssArtifact = await this._processCustomScreenshot(page, ticket, ss);
      ssArtifacts.push(ssArtifact);
    }

    super.finish();

    return ssArtifacts;
  };

  // Process fullpage screenshot and return the artifact
  _processFullScreenshot = async page => {
    // capture screenshot
    const data = await page.screenshot({ fullPage: true });

    // create artifact object to return
    return {
      ticketId: this.ticket.getID(),
      filename: 'screenshotFull.png',
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

    return {
      ticketId: ticket.getID(),
      filename: ss.getFilename(),
      data,
    };
  };
}

export default ScreenshotManager;
