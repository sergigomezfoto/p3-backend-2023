import { Router } from "express";
import { prisma } from "../prisma-client.js";
import { queryErrorHandler } from "../helpers/errorHandlers.js";
import { isId } from "../helpers/isId.js";

const apiRouter = Router();
//GET tots els tours
apiRouter.get('/_all_tours/:structure?', queryErrorHandler(async (req, res) => {
    const { structure } = req.params;

    const result = await prisma.tour.findMany({
        include: {
            scenes: {
                include: {
                    hotspots: true
                }
            }
        }
    });

   if (structure === 'schema') {
        const schemaResult = result.map(tour => ({
            name: tour.name,
            scenes: tour.scenes.map(scene => ({
                [scene.name]: scene.hotspots.map(hotspot => hotspot.name)
            }))
        }));       
        res.status(200).json({ ok: true, result: schemaResult });
    }
    else {
        res.status(200).json({ ok: true, result });

    }
}));




//GET per id o per nom amb possible full structure = /fs
apiRouter.get('/:identifier/:structure?', queryErrorHandler(async (req, res) => {
    const { identifier, structure } = req.params;
    const queryIsId = isId(identifier);

    const result = await prisma.tour.findUnique({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
        include: {
            scenes: {
                include: {
                    hotspots: true
                }
            }
        }
    });

    if (!result) {
        const errorMessage = queryIsId
            ? `No tour found with ID ${identifier}`
            : `No tour found with name ${identifier}`;
        throw new Error(errorMessage);
    }
    if (structure === 'schema') {
        const schemaResult = {
            name: result.name,
            scenes: result.scenes.map(scene => ({
                [scene.name]: scene.hotspots.map(hotspot => hotspot.name)
            }))
        };
        res.status(200).json({ ok: true, result: schemaResult });
    }
    else {
        res.status(200).json({ ok: true, result });
    }
}));



//POST un tour
apiRouter.post('/', queryErrorHandler(async (req, res) => {
    const newTour = await prisma.tour.create({ data: req.body });
    res.status(200).json({ ok: true, newTour });
}));

// PUT per ID o Name
apiRouter.put('/:identifier', queryErrorHandler(async (req, res) => {
    const { identifier } = req.params;
    const queryIsId = isId(identifier); // Comprovem si l'identificador és un id o un nom
    const updatedTour = await prisma.tour.update({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
        data: req.body,
    });

    // Prisma decideix llençar un error a update si no es troba res, per això no cal fer la comprovació.
    res.status(200).json({ ok: true, updatedTour });
}));

//DELETE by id or name

apiRouter.delete('/:identifier', queryErrorHandler(async (req, res) => {
    const { identifier } = req.params;
    const queryIsId = isId(identifier);

    //informo de les escenes i hotspots que s'ha carregat de pas
    const tour = await prisma.tour.findUnique({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
        select: {
            name: true,
            scenes: {
                select: {
                    name: true,
                    hotspots: { select: { name: true } },
                },
            },
        },
    });
    const deletedScenesAndHotspots = tour.scenes.map(scene => ({
        name: scene.name,
        deletedHotspots: scene.hotspots.map(hotspot => hotspot.name),
    }));
    //borro el tour
    const deletedTour = await prisma.tour.delete({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
    });
    // prisma llença error si no el troba, per això no cal fer la comprovació.
    res.status(200).json({ ok: true, deletedTour, deletedScenesAndHotspots });
}));

export default apiRouter;