import express from 'express';
import ArtifactManager from '../manager/ArtifactManager.js';
import util from '../utils/util.js';
import memfsMiddleware from '@limedocs/express-middleware-memfs';

const router = express.Router();

// artifact listing endpoint:
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

// serve requests for files:
router.use(
  memfsMiddleware.default(ArtifactManager.getFileSystem(), {
    baseUrl: `file:///${process.cwd()}`,
    root: '/artifacts',
  })
);

export default router;
