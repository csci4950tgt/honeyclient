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

  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  const port = process.env.PORT || 8000;

  app.post('/ticket', async (req, res) => {
    try {
      const { id, url } = req.body;
      const tickets = await db.getTicket(id);
      var artifacts;
      // loop through and process tickets
      for (let ticket of tickets) {
        artifacts = await ticketManager.processTicket(browser, ticket);
        break;
      }
      // success message
      console.log(
        `Finished processing ${tickets.length} ticket(s)! Awaiting more...`
      );
      res.json({ ticketArtifacts: artifacts });
    } catch (error) {
      console.error('An error occurred when processing a ticket');
      console.error(error);
      res.status(500).send({error: error});
   }
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
