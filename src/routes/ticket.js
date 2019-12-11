import express from 'express';
import db from '../utils/db';
import ticketManager from './utils/tickets';

const router = express.Router();

/**
 * @route  POST /ticket
 * @desc   Investigate ticket url
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    // TODO: refactor to simply investigate a URL, and return file artifacts.
    // Should not be touching the database at all
    const { id } = req.body;
    // Get ticket from database
    const ticket = await db.getTicket(id);
    if (!ticket) {
      throw Error(`Ticket with ID "${id}" not found in database.`);
    }
    console.log(ticket);
    const artifacts = ticketManager.processTicket(browser, ticket);
    if (artifacts.length() == 0) {
      throw Error(
        `No ticket artifacts found for ticket with URL "${ticket.url}"`
      );
    }
    // success message
    console.log(
      `Finished processing ${tickets.length} ticket(s)! Awaiting more...`
    );
    // send artifacts back in response
    res.json({ ticketArtifacts: artifacts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

export default router;
