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
            sceneId: hotspot.scene.id,
            tour: hotspot.scene.tour.name,
            tourId: hotspot.scene.tour.id
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(hotspot => { // trec del resultat el sceneId que queda penjat i em molesta visualment
            const { sceneId, ...rest } = hotspot;
            return rest;
        });
        res.status(200).json({ ok: true, result: modifiedResult });
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
        res.status(200).json({ ok: true, result: modifiedResult });
    }
}));
// get tots els hotspots d'un tour (id o name)
apiRouter.get('/_in_tour/:touridentifier/:structure?', queryErrorHandler(async (req, res) => {
    const { touridentifier, structure } = req.params;
    const tourQueryIsId = isId(touridentifier); // és id?

    // Obtenim el tour i totes les seves escenes amb els seus hs
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
        const errorMessage = tourQueryIsId
            ? `No tour found with ID ${touridentifier}`
            : `No tour found with name ${touridentifier}`;
        throw new Error(errorMessage);
    }

    // Concateno els hotspots de totes les escenes en un sol array (TODO informació del flatmap és experimental, no l'entenc massa bé)
    // icloc el camp scene i dintre el camp tour per cada hotspot per que sigui el mateix format que les altres consultes
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
            scene: hotspot.scene.name,
            sceneId: hotspot.scene.id,
            tour: hotspot.scene.tour.name,
            tourId: hotspot.scene.tour.id
        }));

        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(hotspot => { // trec del resultat el sceneId que queda penjat i em molesta visualment
            const { sceneId, ...rest } = hotspot;
            return rest;
        });
        res.status(200).json({ ok: true, result: modifiedResult });
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
            sceneId: hotspot.scene.id,
            tour: hotspot.scene.tour.name,
            tourId: hotspot.scene.tour.id
        }));
        console.log('sending schema result');
        res.status(200).json({ ok: true, result: schemaResult });
    } else {
        const modifiedResult = result.map(hotspot => { // trec del resultat el sceneId que queda penjat i em molesta visualment
            const { sceneId, ...rest } = hotspot;
            return rest;
        });
        console.log('sending normal result');
        res.status(200).json({ ok: true, result: modifiedResult });
    }
}));


// PUT scene per ID
apiRouter.put('/:id', queryErrorHandler(async (req, res) => {
    const { id } = req.params;
    const { name, sceneId, transform, style, extraData } = req.body;


    const existingHotspot = await prisma.hotspot.findUnique({
        where: { id: Number(id) },
        select: {
            sceneId: true,
            transform: true,
            extraData: true,
        },
    });

    const updatedSceneId = sceneId || existingHotspot.sceneId;

    const updatedTransform = transform ? transform : existingHotspot.transform;
    const updatedExtraData = extraData ? extraData : existingHotspot.extraData;

    const data = {
        ...(name && { name }),
        ...(sceneId && { sceneId: Number(updatedSceneId) }),
        ...(transform && { transform: updatedTransform }),
        ...(style && { style }),
        ...(extraData && { extraData: updatedExtraData }),
    };

    const updatedHotspot = await prisma.hotspot.update({
        where: { id: Number(id) },
        data,
        select: {
            name: true,
            id: true,
            sceneId: true,
            style: true,
            extraData: true,
            transform: true,
            scene: {
                select: {
                    id: true,
                    name: true
                }
            },
        },
    });

    res.status(200).json({ ok: true, result: updatedHotspot });
}));

//////////////////////////////////////////////////////////VALIDACIONS DELS CAMPS DE POST I PUT TODO: VALIDAR PUT TMABÉ
const validateTransform = (transform) => {
    if (!transform) {
      throw new Error('The "transform" field is required.');
    }
  
    const hasGroup1Keys = ['tx', 'ty', 'tz', 'rx', 'ry', 'rz'].every(key => key in transform);
    const hasGroup2Keys = 'ath' in transform && 'atv' in transform;
  
    if (!(hasGroup1Keys || hasGroup2Keys)) {
      throw new Error(`The "transform" field must have either 'tx', 'ty', 'tz', 'rx', 'ry', 'rz' or 'atv' 'ath'.`);
    }
  };
  const validateExtraData = (extraData) => {
    if (typeof extraData !== 'object' || Object.keys(extraData).some(key => typeof extraData[key] !== 'string')) {
      throw new Error('The "extraData" field must have the correct structure with keys and string values.');
    }
  };


apiRouter.post('/', queryErrorHandler(async (req, res) => {
    const { sceneId, transform, name, style, extraData, ...restData } = req.body;

    // Validoque trform està i la estructura de transform
    validateTransform(transform);
    //valido que están o style o extraData
    if (!style && !extraData) {
        throw new Error('Either the "style" field or the "extraData" field must be provided.');
    }
    // valido que extraData que tingui la estructura correcta un objecte amb key: string
    if (extraData) {
        validateExtraData(extraData);
      }


    if (extraData) {
        if (
            typeof extraData !== 'object' ||
            Object.keys(extraData).some(key => typeof extraData[key] !== 'string')
        ) {
            throw new Error('The "extraData" field must have the correct structure with keys and string values.');
        }
    }
    
    const newHotspot = await prisma.hotspot.create({
        data: {
            ...restData,
            name: name,
            transform: transform,
            sceneId: Number(sceneId),
            style: style ? style : '',
            extraData: extraData ? extraData : {},
        },
        include: {
            scene: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });
    const result = {
        ...newHotspot,
        scene: newHotspot.scene, 
    };
    delete result.sceneId; 

    res.status(200).json({ ok: true, result });
}));


//DELETE per ID 
apiRouter.delete('/:id', queryErrorHandler(async (req, res) => {
    const { id } = req.params;

    // Buscar i eliminar el hotspot
    const deletedHotspot = await prisma.hotspot.delete({
        where: { id: Number(id) },
        select: {
            name: true,
            id: true,
            scene: {
                select: {
                    id: true,
                    name: true,
                    tour: { // Afegim el tour a la selecció de camps
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            },
        },
    });

    // En delete, Prisma decideix llençar un error si no troba res, per això no cal fer la comprovació
    res.status(200).json({ ok: true, result: deletedHotspot });
}));






export default apiRouter;