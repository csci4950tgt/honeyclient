import puppeteer from 'puppeteer';
import db from './utils/db';
import ticketManager from './utils/tickets';
import PGPubsub from 'pg-pubsub';

let browser;

const processAllTickets = async () => {
  console.log('Finding new tickets...');
  const tickets = await db.getNewTickets();

  try {
    // loop through and process tickets
    for (let ticket of tickets) {
      await ticketManager.processTicket(browser, ticket);
    }
    // success message
    console.log(
      `Finished processing ${tickets.length} ticket(s)! Awaiting more...`
    );
  } catch (e) {
    console.error('An error occurred when processing a ticket');
    console.log(e);
  }
};

const setupBrowser = async () => {
  // TODO: Figure out how to make this work in docker without --no-sandbox. This
  // is a security hole
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  // browser = await puppeteer.launch();

  browser.on('disconnected', setupBrowser);
};

const main = async () => {
  console.log('Launching browser...');
  await setupBrowser();

  console.log('Processing existing tickets since last run...');
  await processAllTickets();

  console.log('Waiting for new ticket notification.');
  db.registerUpdateHandler(processAllTickets);
};

main();
