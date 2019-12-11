import puppeteer from 'puppeteer';
import express from 'express';
import db from './utils/db';
import ticketManager from './utils/tickets';

// routes
import ticketRouter from './routes/ticket';

let browser;

const setupBrowser = async () => {
  // TODO: Figure out how to make this work in docker without --no-sandbox. This
  // is a security hole
  browser = await puppeteer.launch({
    args: ['--no-sandbox'],
  });
  // browser = await puppeteer.launch();

  browser.on('disconnected', setupBrowser);
};

const main = async () => {
  console.log('Launching browser...');
  await setupBrowser();

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const port = process.env.PORT || 8000;

  // Use ticket route
  app.use('/ticket', ticketRouter);

  app.listen(port, () =>
    console.log(`Honeyclient listening on http://localhost:${port}...`)
  );
};

main();
