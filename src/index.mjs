import express from 'express';
import dotenv from 'dotenv';

// Routes
import ticketRouter from './routes/ticket.js';
import artifactRouter from './routes/artifact.js';

// Use environment variables in projects
dotenv.config();

// Port
const port = process.env.PORT || 8000;

// Set up express server
const app = express();

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/ticket', ticketRouter);
app.use('/artifacts', artifactRouter);

// Serve app
app.listen(port, () =>
  console.log(`Honeyclient listening on http://localhost:${port}...`)
);
