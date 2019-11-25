import puppeteer from 'puppeteer';
import db from './utils/db';
import ticketManager from './utils/tickets';
import PGPubsub from 'pg-pubsub';
import { wrap } from './middleware/wrap';

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
  browser = await puppeteer.launch();

  browser.on('disconnected', setupBrowser);
};

const main = async () => {
  console.log('Launching browser...');
  await setupBrowser();

  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const port = process.env.PORT || 8000;

  app.post('/ticket', (req, res) => {
    try {
      //onsole.log("---------------------" req.body));
      //Promise.
      const { id, url } = req.body;
      console.log('---------------------' + id + ' ' + url);
      //const ticket = db.getTicket(id);
      //await ticketManager.processTicket(browser, ticket);
      res.json(req.body);
    } catch (error) {
      console.error(error);
    }
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));

  // console.log('Processing existing tickets since last run...');
  // await processAllTickets();
  //
  // console.log('Waiting for new ticket notification.');
  // db.registerUpdateHandler(processAllTickets);
};

main();
