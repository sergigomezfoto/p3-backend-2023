import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import toursRouter from './queries/tours.js';
import scenesRouter from './queries/scenes.js';
import hotspotsRouter from './queries/hotspots.js';
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

const { SERVER_PORT } = process.env;
app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port :${SERVER_PORT}`);
});
    // app.get('/structure', async (req, res) => {
    //     try {
    
    //         const result = await prisma.tour.findMany({
    //             select: {
    //                 id: true, name: true, scenes: {
    
    //                     select: {
    //                         id: true,
    //                         name: true,
    //                         hotspots: {
    //                             select: {
    //                                 id: true,
    //                                 name: true,
    //                             }
    //                         }
    //                     }
    //                 },
    //             }
    //         });
    //         const tourCount = await prisma.tour.count(); // Obtener el total de tours
    //         const sceneCount = await prisma.scene.count(); // Obtener el total de escenas
    //         const hotspotsCount = await prisma.hotspot.count(); // Obtener el total de hotspots
    //         res.status(200).json({  tourCount, sceneCount, hotspotsCount,result });
    //     } catch (error) {
    //         res.sendStatus(500).send({ type: error.constructor.name, message: error.toString() });
    //     }
    // });
    
