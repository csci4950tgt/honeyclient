import express from 'express';

// Routes
import ticketRouter from './routes/ticket';

// Port
const port = process.env.PORT || 8000;

// Set up express server
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use('/ticket', ticketRouter);

// Serve app
app.listen(port, () =>
  console.log(`Honeyclient listening on http://localhost:${port}...`)
);
