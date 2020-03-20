import express from 'express';
import ticketManager from '../utils/tickets.js';
import Screenshot from '../models/Screenshot.js';
import Ticket from '../models/Ticket.js';

const router = express.Router();

/**
 * @route  POST /ticket
 * @desc   Investigate ticket url
 * @access Public
 */
router.post('/', async (req, res) => {
  try {
    let { ID, url, screenshots } = req.body;

    screenshots = screenshots.map(
      ss => new Screenshot(ss.width, ss.height, ss.filename, ss.userAgent)
    );

    const ticket = new Ticket(ID, url, screenshots);
    const results = await ticketManager.processTicket(ticket);

    res.json(results);
  } catch (e) {
    console.error('An error occurred when processing this ticket.');
    console.log(e);

    res.status(500).json({
      success: false,
      message: 'An error occurred when processing this ticket.',
    });
  }
});

export default router;
