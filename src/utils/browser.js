import puppeteer from 'puppeteer';

// singleton browser instance, so relaunches point to the same place
let browser;

const getBrowser = async () => {
  // if we already have a valid instance, reuse that
  if (browser && browser.isConnected && browser.isConnected()) return browser;

  // TODO: Figure out how to make this work in docker without --no-sandbox. This
  // is a security hole
  console.log('Launching browser...');

  browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });

  browser.on('disconnected', getBrowser);

  return browser;
};

export default getBrowser;
