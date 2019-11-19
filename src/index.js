import puppeteer from 'puppeteer';
import readline from 'readline';
import db from './utils/db';
import ticketManager from './utils/tickets';

const main = async () => {
  console.log(`Starting service... <q! to exit>`);
  var should_break = false;

  // create interface for reading user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Launching browser...');
  const browser = await puppeteer.launch();

  console.log(`Awaiting new tickets...`);
  // tell program to quit service
  rl.on(`line`, input => {
    if (input == `q!`) {
      should_break = true;
    }
  });

  while (true) {
    if (should_break) {
      break;
    }
    const tickets = await db.getNewTickets();
    if (tickets.length == 0) {
      // do nothing
    } else {
      console.log('Processing new tickets...');
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
    }
  }
  console.log(`Closing browser...`);
  await browser.close();
  return process.exit(0);
};

main();
