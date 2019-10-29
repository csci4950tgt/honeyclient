const getCustomScreenshots = (ticket, defaultUserAgent) => {
  // pull the fields out of the screenshot object into something a bit easier to work with:
  const ticketScreenshots = ticket.get('ScreenShots').map(ss => ({
    ticketId: ss.get('TicketId'),
    width: ss.get('width'),
    height: ss.get('height'),
    filename: ss.get('filename'),
    userAgent: ss.get('userAgent'),
  }));

  return ticketScreenshots;
};

const processScreenshot = async (page, ss, defaultUserAgent) => {
  console.log(`processing screenshot for ticket: ${ss.ticketId}`);

  // set viewport
  await page.setViewport({
    width: ss.width,
    height: ss.height,
    deviceScaleFactor: 1,
  });

  // set user agent
  const userAgent = ss.userAgent || defaultUserAgent;
  page.setUserAgent(userAgent);

  // capture screenshot
  const data = await page.screenshot();

  // data object is a buffer, we'll convert it later:
  artifact = {
    screenshot: ss,
    data: data,
  };

  return artifact;
};

const processFullScreenshot = async (page, defaultUserAgent, ticketId) => {
  console.log('\tProcessing fullpage screenshot');

  // initialize fullpage screenshot object
  const ss = {
    ticketId: ticketId,
    filename: 'screenshotFull.png',
    userAgent: defaultUserAgent,
  };

  // capture screenshot
  const data = await page.screenshot({ fullPage: true });
  // create artifact object to return
  const artifact = {
    screenshot: ss,
    data: data,
  };

  return artifact;
};

export default {
  getCustomScreenshots,
  processScreenshot,
  processFullScreenshot,
};
