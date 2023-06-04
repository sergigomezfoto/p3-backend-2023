import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import toursRouter from './endpoints/tours.js';
import scenesRouter from './endpoints/scenes.js';
import hotspotsRouter from './endpoints/hotspots.js';
import { errorHandler } from './helpers/errorHandlers.js';

dotenv.config();
const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/tours', toursRouter);
app.use('/scenes', scenesRouter);
app.use('/hotspots', hotspotsRouter);

app.use(errorHandler);
// això s'encarrega de fer a json els errors de rute no descrites.
app.use((req, res, next) => {
    res.status(404).json({ ok: false, message: 'Route not found' });
  });
const { SERVER_PORT } = process.env;
app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port :${SERVER_PORT}`);
});
  