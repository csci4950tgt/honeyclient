import puppeteer from 'puppeteer';

const getBrowser = async () => {
  // TODO: Figure out how to make this work in docker without --no-sandbox. This
  // is a security hole
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  // browser = await puppeteer.launch();
  console.log('Launching browser...');
  browser.on('disconnected', getBrowser);
  return browser;
};

export default getBrowser;
