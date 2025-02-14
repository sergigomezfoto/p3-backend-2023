import { Router } from "express";
import { prisma } from "../prisma-client.js";
import { queryErrorHandler } from "../helpers/errorHandlers.js";
import { isId } from "../helpers/isId.js";

const apiRouter = Router();


//GET totes les scenes a la base de dades
apiRouter.get('/_all_/:structure?', queryErrorHandler(async (req, res) => {
    const { structure } = req.params;
    const result = await prisma.scene.findMany({
        include: {
            tour: {
                select: { id: true, name: true }
            },
            hotspots: true,
        }

    });

    if (structure === 'schema') {
        const schemaResult = result.map(scene => ({
            name: scene.name,
            id: scene.id,
            tour: scene.tour.name,
            tourId: scene.tour.id,
            hotspots: scene.hotspots.map(hotspot => ({
                hotspotName: hotspot.name,
                hotspotId: hotspot.id
            }))
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(scene => {
            const { tourId, ...restScene } = scene;
            return {
                ...restScene,
                hotspots: scene.hotspots.map(hotspot => {
                    const { sceneId, ...restHotspot } = hotspot;
                    return restHotspot;
                }),
            };
        });
        res.status(200).json({ ok: true, result:modifiedResult });
    }
}));

//GET totes les scenes en un tour nom o id 
apiRouter.get('/_in_tour_/:identifier/:structure?', queryErrorHandler(async (req, res) => {
    const { identifier, structure } = req.params;
    const queryIsId = isId(identifier); // és id?

    const result = await prisma.scene.findMany({
        where: queryIsId ? { tourId: Number(identifier) } : { tour: { name: identifier } },
        include: {
            tour: {
                select: { id: true, name: true }
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
            id: scene.id,
            tour: scene.tour.name,
            tourId: scene.tour.id,
            hotspots: scene.hotspots.map(hotspot => ({
                hotspotName: hotspot.name,
                hotspotId: hotspot.id
            }))

        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(scene => {
            const { tourId, ...restScene } = scene;
            return {
                ...restScene,
                hotspots: scene.hotspots.map(hotspot => {
                    const { sceneId, ...restHotspot } = hotspot;
                    return restHotspot;
                }),
            };
        });
        res.status(200).json({ ok: true,result: modifiedResult });
    }
}));

//GET totes les scenes amb mateix nom o escena única per id.
apiRouter.get('/:identifier/:structure?', queryErrorHandler(async (req, res) => {
    const { identifier, structure } = req.params;
    const queryIsId = isId(identifier); // és id?

    const result = await prisma.scene.findMany({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
        include: {
            tour: {
                select: { id: true, name: true }
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
            id: scene.id,
            tour: scene.tour.name,
            tourId: scene.tour.id,
            hotspots: scene.hotspots.map(hotspot => ({
                hotspotName: hotspot.name,
                hotspotId: hotspot.id
            }))
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(scene => {
            const { tourId, ...restScene } = scene;
            return {
                ...restScene,
                hotspots: scene.hotspots.map(hotspot => {
                    const { sceneId, ...restHotspot } = hotspot;
                    return restHotspot;
                }),
            };
        });
        res.status(200).json({ ok: true, result:modifiedResult });
    }
}));




// PUT scene per ID
apiRouter.put('/:id', queryErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { name, tourId } = req.body;

    const existingScene = await prisma.scene.findUnique({
        where: { id: Number(id) },
        select: { tourId: true },
    });
    const updatedTourId = tourId || existingScene.tourId;

    const uptdatedScene = await prisma.scene.update({
        where: { id: Number(id) },
        data: {
            name,
            tourId: Number(updatedTourId),
        },
        select: {
            name: true,
            id: true,
            tour: {
                select: {
                    id: true,
                    name: true
                }
            },
            hotspots: {
                select: {
                    id: true,
                    name: true
                }
            },
        },
    });

    res.status(200).json({ ok: true, result:uptdatedScene });
}));

//POST una scene
apiRouter.post('/', queryErrorHandler(async (req, res) => {
    const { tourId, ...restData } = req.body;
    const newScene = await prisma.scene.create({
        data: {
            ...restData,
            tourId: Number(tourId),
        },
        include: {
            tour: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    const result = {
        ...newScene,
        tour: newScene.tour, // Icloc el tour
    };
    delete result.tourId; // trec el tourId pe em fa rabia

    res.status(200).json({ ok: true, result });
}));

//DELETE per ID 
apiRouter.delete('/:id', queryErrorHandler(async (req, res) => {
    const { id } = req.params;
    const scene = await prisma.scene.findUnique({
        where: { id: Number(id) },
        select: {
            id: true,
            hotspots: {
                select: {
                    name: true,
                    id: true,
                },
            },
        },
    });
    const deletedScene = await prisma.scene.delete({
        where: { id: Number(id) },
        select: {
            name: true,
            id: true,
            tour: { select: { id: true, name: true } },
        },
    });

    // Recuperar els noms de les escenes eliminades i els seus hotspots relacionats
    const colateralDeletions = { deletedHotspots: scene.hotspots.map(hotspot => hotspot.name) }

    //en delete prisma decideix llençar error si no troba res, per això no cal fer la comprovació
    res.status(200).json({ ok: true, result:deletedScene, colateralDeletions });

}));


export default apiRouter;