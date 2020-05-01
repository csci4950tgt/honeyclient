import express from 'express';
import dotenv from 'dotenv';
import SafeBrowsingManager from './manager/SafeBrowsingManager.js';

// Routes
import ticketRouter from './routes/ticket.js';
import artifactRouter from './routes/artifact.js';

// Use environment variables in projects
dotenv.config();

// validate API key is present for google safe browsing:
SafeBrowsingManager.checkApiKey();

// Port
const port = process.env.PORT || 8000;

// Set up express server
const app = express();

// middleware for POST requests:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/ticket', ticketRouter);
app.use('/artifacts', artifactRouter);

// Serve app
app.listen(port, () =>
  console.log(`Honeyclient listening on http://localhost:${port}...`)
);
