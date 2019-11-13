/***
 * ScreenshotManager class for use in processing all screenshots associated with
 * a ticket
 */
class ScreenshotManager {
  constructor(defaultUserAgent) {
    this.defaultUserAgent = defaultUserAgent;
  }

  // Processes all screenshots for a ticket and returns artifacts
  processScreenshots = async (ticket, page) => {
    this.ticket = ticket;
    const ssArtifacts = [];

    // process fullpage screenshot
    let ssArtifact = await this._processFullScreenshot(page);
    ssArtifacts.push(ssArtifact);

    // process custom screenshots
    const customScreenshots = this._getCustomScreenshots();
    for (const ss of customScreenshots) {
      let ssArtifact = await this._processCustomScreenshot(page, ss);
      ssArtifacts.push(ssArtifact);
    }

    return ssArtifacts;
  };

  // Process fullpage screenshot and return the artifact
  _processFullScreenshot = async page => {
    console.log('\tProcessing fullpage screenshot');

    // initialize fullpage screenshot object
    const ss = {
      ticketId: this.ticket.get('id'),
      filename: 'screenshotFull.png',
      userAgent: this.defaultUserAgent,
    };

    // capture screenshot
    const data = await page.screenshot({ fullPage: true });
    // create artifact object to return
    const artifact = {
      screenshot: ss,
      data,
    };

    return artifact;
  };

  // process custom screenshots of ticket and return artifacts
  _processCustomScreenshot = async (page, ss) => {
    console.log(`processing screenshot for ticket: ${ss.ticketId}`);

    // set viewport
    await page.setViewport({
      width: ss.width,
      height: ss.height,
      deviceScaleFactor: 1,
    });

    // set user agent
    const userAgent = ss.userAgent || this.defaultUserAgent;
    page.setUserAgent(userAgent);

    // capture screenshot
    const data = await page.screenshot();

    // data object is a buffer, we'll convert it later:
    const artifact = {
      screenshot: ss,
      data,
    };

    return artifact;
  };

  // get all custom screenshots of a ticket
  _getCustomScreenshots = () => {
    // pull the fields out of the screenshot object into something a bit easier to work with:
    const ticketScreenshots = this.ticket.get('ScreenShots').map(ss => ({
      ticketId: ss.get('TicketId'),
      width: ss.get('width'),
      height: ss.get('height'),
      filename: ss.get('filename'),
      userAgent: ss.get('userAgent'),
    }));

    return ticketScreenshots;
  };
}

export default ScreenshotManager;
