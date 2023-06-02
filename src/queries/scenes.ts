import { Router } from "express";
import { prisma } from "../prisma-client.js";
import { queryErrorHandler } from "../helpers/errorHandlers.js";
import { isId } from "../helpers/isId.js";

const apiRouter = Router();


//GET totes les scenes a la base de dades
apiRouter.get('/_all_scenes/:structure?', queryErrorHandler(async (req, res) => {
    const { structure } = req.params;
    const result = await prisma.scene.findMany({
        include: {
            tour:{
                select:{id:true,name:true}
            },
            hotspots: true,
        }
        
    });

    if (structure === 'schema') {
        const schemaResult = result.map(scene => ({
            name: scene.name,
            tour: scene.tour.name,
            hotspots: scene.hotspots.map(hotspot => ({
                name: hotspot.name
            }))
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        res.status(200).json({ ok: true, result });
    }
}));


apiRouter.get('/_tour_id/:identifier/:structure?', queryErrorHandler(async (req, res) => {
    const { identifier,structure } = req.params;
    const queryIsId = isId(identifier); // és id?

    const result = await prisma.scene.findMany({
        where: queryIsId ? { tourId: Number(identifier) } : { tour: { name: identifier } },
        include: {
            tour:{
                select:{id:true,name:true}
            },
            hotspots: true,
        }
    });

    if (result.length === 0) {
        const errorMessage = queryIsId
            ? `Scene belonging to tour id: ${identifier} not found`
            : `Scene belonging to tour ${identifier} not found`;

        throw new Error(errorMessage);
    }

    if (structure === 'schema') {
        const schemaResult = result.map(scene => ({
            name: scene.name,
            tour: scene.tour.name,
            hotspots: scene.hotspots.map(hotspot => ({
                name: hotspot.name
            }))
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        res.status(200).json({ ok: true, result });
    }
}));


apiRouter.get('/:identifier/:structure?', queryErrorHandler(async (req, res) => {
    const { identifier, structure } = req.params;
    const queryIsId = isId(identifier); // és id?

    const result = await prisma.scene.findMany({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
        include: {
            tour:{
                select:{id:true,name:true}
            },
            hotspots: true,
        }
    });

    if (result.length === 0) {
        const errorMessage = queryIsId
            ? `Scene with ID ${identifier} not found`
            : `There are no scenes with the name: ${identifier}.`;

        throw new Error(errorMessage);
    }

    if (structure === 'schema') {
        const schemaResult = result.map(scene => ({
            name: scene.name,
            tour: scene.tour.name,
            hotspots: scene.hotspots.map(hotspot => ({
                name: hotspot.name
            }))
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        res.status(200).json({ ok: true, result });
    }
}));




// PUT scene per ID
apiRouter.put('/:identifier', queryErrorHandler(async (req, res) => {
    const { identifier } = req.params;
    const { name, tourId } = req.body;
    const queryIsId = /^\d+$/.test(identifier); // Comprobar si el identificador es un ID numérico

    const where = queryIsId ? { id: Number(identifier) } : { name: identifier };
    const existingScene = await prisma.scene.findUnique({
        where,
        select: { tourId: true },
    });
    const updatedTourId = tourId || existingScene?.tourId;

    const updatedScene = await prisma.scene.update({
        where,
        data: {
            name,
            tourId: Number(updatedTourId),
        },
        select: {
            id: true,
            name: true,
            tourId: true,
            hotspots: {
                select: { id: true, name: true }
            },
        },
    });

    res.status(200).json({ ok: true, updatedScene });
}));
//POST una scene
apiRouter.post('/', queryErrorHandler(async (req, res) => {
    const { tourId, ...restData } = req.body;
    const newScene = await prisma.scene.create({
        data: {
            ...restData,
            tourId: Number(tourId),
        },
    });
    res.status(200).json({ ok: true, newScene });
}));

//DELETE per ID 
apiRouter.delete('/:id', queryErrorHandler(async (req, res) => {
    const { id } = req.params;
    const scene = await prisma.scene.findUnique({
        where: { id: Number(id) },
        select: {
            name: true,
            hotspots: {
                select: {
                    name: true,
                },
            },
        },
    });
    const deletedScene = await prisma.scene.delete({
        where: { id: Number(id) },
    });

    // Recuperar els noms de les escenes eliminades i els seus hotspots relacionats
    const deletedHotspots = scene.hotspots.map(hotspot => hotspot.name);

    //en delete prisma decideix llençar error si no troba res, per això no cal fer la comprovació
    res.status(200).json({ ok: true, deletedScene, deletedHotspots });

}));


export default apiRouter;