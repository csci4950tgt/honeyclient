import puppeteer from 'puppeteer';
import db from './utils/db';
import ticketManager from './utils/tickets';

const main = async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch();

  console.log('Finding new tickets...');
  const tickets = await db.getNewTickets();

  try {
    // loop through and process tickets
    for (let ticket of tickets) {
      await ticketManager.processTicket(browser, ticket);
    }
    // success message
    console.log(
      `Finished processing ${tickets.length} tickets! Closing browser.`
    );
  } catch (e) {
    console.error('An error occurred when processing a ticket');
    console.log(e);
  }

  await browser.close();
};

main();
