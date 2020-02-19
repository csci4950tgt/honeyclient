import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

// Routes
import ticketRouter from './routes/ticket.js';
import artifactRouter from './routes/artifact.js';

// Use environment variables in projects
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Port
const port = process.env.PORT || 8000;

// Set up express server
const app = express();

// Cors
// const allowedOrigins = ['http://localhost:3000', 'http://localhost:8080'];
// app.use(
//   cors({
//     origin: function(origin, callback) {
//       // allow requests with no origin
//       // (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         var msg =
//           'The CORS policy for this site does not ' +
//           'allow access from the specified Origin.';
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//   })
// );

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
