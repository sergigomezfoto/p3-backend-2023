import { Router } from "express";
import { prisma } from "../prisma-client.js";
import { queryErrorHandler } from "../helpers/errorHandlers.js";
import { isId } from "../helpers/isId.js";

const apiRouter = Router();


//GET totes les hotspots a la base de dades
apiRouter.get('/_all_/:structure?', queryErrorHandler(async (req, res) => {
    const { structure } = req.params;
    const result = await prisma.hotspot.findMany({
        include: {
            scene: {
                select: {
                    id: true,
                    name: true,
                    tour: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }
        }

    });

    if (structure === 'schema') {
        const schemaResult = result.map(hotspot => ({
            name: hotspot.name,
            id: hotspot.id,
            scene: hotspot.scene.name,
            tour: hotspot.scene.tour.name
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(hotspot => { // trec del resultat el sceneId que queda penjat i em molesta visualment
            const { sceneId, ...rest } = hotspot;
            return rest;
        });
        res.status(200).json({ ok: true, modifiedResult });
    }
}));

//GET hotspots per tour i scene (id o name)
apiRouter.get('/_in_tour_and_scene/:touridentifier/:sceneidendifier/:structure?', queryErrorHandler(async (req, res) => {
    const { touridentifier, sceneidendifier, structure } = req.params;
    const tourQueryIsId = isId(touridentifier); // és id?
    const sceneQueryIsId = isId(sceneidendifier); // és id?
    const scene = await prisma.scene.findFirst({
        where: {
            AND: [
                { tour: tourQueryIsId ? { id: Number(touridentifier) } : { name: touridentifier } },
                { id: sceneQueryIsId ? Number(sceneidendifier) : undefined },
                { name: sceneQueryIsId ? undefined : sceneidendifier },
            ]
        },
        include: {
            hotspots: {
                include: {

                    scene: {
                        select: {
                            id: true,
                            name: true,
                            tour: { select: { id: true, name: true } }
                        }
                    }
                },

            },
            tour: true,


        },
    });

    if (!scene) {
        const errorMessage = `Scene with ${sceneQueryIsId ? 'ID' : 'name'} ${sceneidendifier} not found in Tour with ${tourQueryIsId ? 'ID' : 'name'} ${touridentifier}.`;
        throw new Error(errorMessage);
    }

    const result = scene.hotspots;

    if (structure === 'schema') {
        const schemaResult = result.map(hotspot => ({
            name: hotspot.name,
            id: hotspot.id,
            scene: scene.name,
            sceneId: scene.id,
            tour: scene.tour.name,
            tourId: scene.tour.id
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(hotspot => { // trec del resultat el sceneId que queda penjat i em molesta visualment
            const { sceneId, ...rest } = hotspot;
            return rest;
        });
        res.status(200).json({ ok: true, modifiedResult });
    }
}));

apiRouter.get('/_in_tour/:touridentifier/:structure?', queryErrorHandler(async (req, res) => {
    const { touridentifier, structure } = req.params;
    const tourQueryIsId = isId(touridentifier); // és id?

    // Obtenim el tour i totes les seves escenes amb els respectius hotspots inclosos
    const tour = await prisma.tour.findFirst({
        where: {
            [tourQueryIsId ? 'id' : 'name']: tourQueryIsId ? Number(touridentifier) : touridentifier,
        },
        include: {
            scenes: {
                include: {
                    hotspots: {
                        include: {
                            scene: {
                                include: {
                                    tour: true
                                }
                            }
                        }
                    }
                    ,
                },
            },
        },
    });

    if (!tour) {
        const errorMessage = `El tour amb ${tourQueryIsId ? 'ID' : 'nom'} ${touridentifier} no s'ha trobat.`;
        throw new Error(errorMessage);
    }

    // Concatenem tots els hotspots de totes les escenes en un sol array
    // Cada hotspot inclou també el nom de l'escena a la que pertany
    const result = tour.scenes.flatMap(scene => scene.hotspots.map(hotspot => ({
        ...hotspot,
        scene: {
            name: scene.name,
            id: scene.id,
            tour: {
                name: tour.name,
                id: tour.id
            }
        },

    })));

    if (structure === 'schema') {
        const schemaResult = result.map(hotspot => ({
            name: hotspot.name,
            id: hotspot.id,
            scene: hotspot.scene,
            sceneId: hotspot.sceneId,
            tour: tour.name,
            tourId: tour.id
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        res.status(200).json({ ok: true, result });
    }
}));


// hotspot per ID o hotspots per name
apiRouter.get('/:identifier/:structure?', queryErrorHandler(async (req, res) => {
    const { identifier, structure } = req.params;
    const queryIsId = isId(identifier); // és id?

    const result = await prisma.hotspot.findMany({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
        include: {
            scene: {
                select: {
                    id: true,
                    name: true,
                    tour: {
                        select:
                        {
                            id: true,
                            name: true
                        }
                    }

                }

            }
        }
    });

    if (result.length === 0) {
        const errorMessage = queryIsId
            ? `Hotspot with ID ${identifier} not found`
            : `There are no hotspots with the name: ${identifier}.`;

        throw new Error(errorMessage);
    }

    if (structure === 'schema') {
        const schemaResult = result.map(hotspot => ({
            name: hotspot.name,
            id: hotspot.id,
            scene: hotspot.scene.name,
            sId: hotspot.scene.id,
            tour: hotspot.scene.tour.name,
            tId: hotspot.scene.tour.id
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        res.status(200).json({ ok: true, result });
    }
}));

export default apiRouter;