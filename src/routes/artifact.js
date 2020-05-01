import express from 'express';
import ArtifactManager from '../manager/ArtifactManager.js';
import util from '../utils/util.js';
import memfsMiddleware from '@limedocs/express-middleware-memfs';

const router = express.Router();

/**
 * @route  GET /artifacts/{ticketID}
 * @desc   List artifacts possible to retrieve for a ticket ID.
 * @access Public
 */
router.get('/:ticketId', (req, res) => {
  const ticketId = req.params.ticketId;

  if (!util.isValidTicketId(ticketId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid ticket ID.',
    });

    return;
  }

  res.json({
    success: true,
    fileArtifacts: ArtifactManager.listArtifactsByTicketId(ticketId),
  });
});

/**
 * @route  DELETE /artifacts/{ticketID}
 * @desc   Deletes assets associated with a ticket ID.
 * @access Public
 */
router.delete('/:ticketId', async (req, res) => {
  const ticketId = req.params.ticketId;

  if (!util.isValidTicketId(ticketId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid ticket ID.',
    });

    return;
  }

  const numDeleted = await ArtifactManager.deleteArtifactsByTicketId(ticketId);

  res.json({
    success: true,
    numDeleted,
  });
});

/**
 * @route   GET /ticket/{ticketID}/
 * @desc    Retrieve a file at the given path for a ticket ID.
 * @access  Public
 */
router.use(
  memfsMiddleware.default(ArtifactManager.getFileSystem(), {
    baseUrl: `file:///${process.cwd()}`,
    root: '/artifacts',
  })
);

export default router;
