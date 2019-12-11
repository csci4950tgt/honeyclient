import express from 'express';
import db from '../utils/db';
import ticketManager from '../utils/tickets';

const router = express.Router();

/**
 * @route  POST /ticket
 * @desc   Investigate ticket url
 * @access Public
 */
router.post('/', async (req, res) => {
  // TODO: refactor to simply investigate a URL, and return file artifacts.
  // Should not be touching the database at all
  try {
    // Parse and validate request body
    const { id } = req.body;
    if (!id) {
      console.error('Bad request.');
      res.status(400).send({ error: 'Bad request.' });
    }
    // Get ticket from database
    const ticket = await db.getTicket(id);
    if (!ticket) {
      throw Error(`Ticket with ID '${id}' not found in database.`);
    }
    // Process Ticket
    const artifacts = await ticketManager.processTicket(ticket);
    if (artifacts.length === 0) {
      throw Error(
        `No ticket artifacts found for ticket with URL '${ticket.url}'`
      );
    }
    // Send artifacts back in response
    res.json({ ticketArtifacts: artifacts });
  } catch (err) {
    console.error(err.message);
    res.status(500).send({ error: err.message });
  }
});

export default router;
