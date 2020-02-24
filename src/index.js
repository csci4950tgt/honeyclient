import express from 'express';
import fs from 'fs';

// Routes
import ticketRouter from './routes/ticket.js';
import artifactRouter from './routes/artifact.js';

// Port
const port = process.env.PORT || 8000;

// Set up express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/ticket', ticketRouter);
app.use('/artifacts', artifactRouter);

let config;
export { config };
try {
  console.log('Reading config file.');
  let data = fs.readFileSync('./config/config.json');
  config = JSON.parse(data);
} catch (err) {
  console.log(`Error when reading config file: ${err.message}. Exit now.`);
  process.exit();
}

// Serve app
app.listen(port, () =>
  console.log(`Honeyclient listening on http://localhost:${port}...`)
);
