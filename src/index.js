import puppeteer from 'puppeteer';
import db from './utils/db';
import ticketManager from './utils/tickets';
import PGPubsub from 'pg-pubsub';

const main = async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();

  db.registerUpdateHandler(async () => {
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
  });
  console.log(`Closing browser...`);
  await browser.close();
};

main();
