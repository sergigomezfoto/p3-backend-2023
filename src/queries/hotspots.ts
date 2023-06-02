import { Router } from "express";
import { prisma } from "../prisma-client.js";
import { queryErrorHandler } from "../helpers/errorHandlers.js";
import { isId } from "../helpers/isId.js";

const apiRouter = Router();


//GET totes les hotspots a la base de dades
apiRouter.get('/', queryErrorHandler(async (req, res) => {
    const result = await prisma.hotspot.findMany({
        select: {
            id: true,
            name: true,
            style: true,
            transform:true,
            extraData: true,
            scene: {
                select: {
                    id: true,
                    name: true,
                    tour: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        },
    });

    res.status(200).json({ ok: true, result });
}));

// GET totes els hotspots de la BBDD per id o nom
apiRouter.get('/:identifier', queryErrorHandler(async (req, res) => {
    const { identifier } = req.params;
    const queryIsId = isId(identifier); // és id?

    const result = await prisma.hotspot.findMany({
        where: queryIsId ? { id: Number(identifier) } : { name: identifier },
        select: {
            id: true,
            name: true,
            style: true,
            transform: true,
            extraData: true,
            scene: {
                select: {
                    id: true,
                    name: true,
                    tour: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        }
    });

    if (result.length === 0) {
        const errorMessage = queryIsId
        ? `Hotspot with ID ${identifier} not found in the database.`
        : `There are no hotspots in the database with the name: ${identifier}.`;
  
      throw new Error(errorMessage);
    }
    res.status(200).json({ ok: true, result });
}));

// //GET totes els hotspots de las bbdd amb el mateix nom
// apiRouter.get('/name/:name', queryErrorHandler(async (req, res) => {
//     const { name } = req.params;
//     const result = await prisma.hotspot.findMany({
//         where: { name: name },
//         select: {
//             id: true,
//             name: true,
//             style : true,
//             transform:true,
//             extraData: true,
//             scene: {
//                 select: {
//                     id: true,
//                     name: true,
//                     tour: {
//                         select: {
//                             id: true,
//                             name: true,
//                         }
//                     }
//                 }
//             }
//         }
//     });
//     result.length === 0
//         ? res.status(404).json({ ok: false, message: `There are no hotspots with the name: ${name}.` })
//         : res.status(200).json({ ok: true, result });
// }));


// //GET escena per id
// apiRouter.get('/:id', queryErrorHandler(async (req, res) => {
//     const { id } = req.params;
//     const result = await prisma.hotspot.findUnique({
//         where: { id: Number(id) },
//         select: {
//             id: true,
//             name: true,
//             style: true,
//             transform:true,
//             extraData: true,
//             scene: {
//                 select: {
//                     id: true,
//                     name: true,
//                     tour: {
//                         select: {
//                             id: true,
//                             name: true,
//                         }
//                     }
//                 }
//             }
//         }
//     });

//     result !== null
//         ? res.status(200).json({ ok: true, result })
//         : (() => { throw new Error(`Hotspot with id ${id} not found`); })();

// }));


// //GET totes les hotspots d'un tour per tour id
// apiRouter.get('/tourid/:tourid', queryErrorHandler(async (req, res) => {
//     const { tourid } = req.params;
//     const result = await prisma.hotspot.findMany({
//         where: { tourId: Number(tourid) },
//         select: {
//             id: true,
//             tourId: true,
//             name: true,
//             hotspots: {
//                 select: { id: true, name: true }
//             },
//         },
//     });

//     result.length === 0
//         ? res.status(404).json({ ok: false, message: `hotspot belonging to tour id: ${tourid} not found` })
//         : res.status(200).json({ ok: true, result });
// }));

// //GET totes les hotspots d'un tour per tour name
// apiRouter.get('/tourname/:tourname', queryErrorHandler(async (req, res) => {
//     const { tourname } = req.params;
//     const result = await prisma.hotspot.findMany({
//         where: {
//             tour:
//                 { name: tourname }
//         },
//         select: {
//             id: true,
//             tourId: true,
//             name: true,
//             hotspots: {
//                 select: { id: true, name: true }
//             },
//         },
//     });
//     result.length === 0
//         ? res.status(404).json({ ok: false, message: `hotspot belonging to tour ${tourname} not found` })
//         : res.status(200).json({ ok: true, result });
// }));


// // PUT hotspot per ID
// apiRouter.put('/:id', queryErrorHandler(async (req, res) => {
//     const { id } = req.params;
//     const { name, tourId } = req.body;

//     const existinghotspot = await prisma.hotspot.findUnique({
//         where: { id: Number(id) },
//         select: { tourId: true },
//     });
//     const updatedTourId = tourId || existinghotspot.tourId;

//     const uptdatedhotspot = await prisma.hotspot.update({
//         where: { id: Number(id) },
//         data: {
//             name,
//             tourId: Number(updatedTourId),
//         },
//         select: {
//             id: true,
//             name: true,
//             tourId: true,
//             hotspots: {
//                 select: { id: true, name: true }
//             },
//         },
//     });

//     res.status(200).json({ ok: true, uptdatedhotspot });
// }));

// //POST una hotspot
// apiRouter.post('/', queryErrorHandler(async (req, res) => {
//     const { tourId, ...restData } = req.body;
//     const newhotspot = await prisma.hotspot.create({
//         data: {
//             ...restData,
//             tourId: Number(tourId),
//         },
//     });
//     res.status(200).json({ ok: true, newhotspot });
// }));

// //DELETE per ID 
// apiRouter.delete('/:id', queryErrorHandler(async (req, res) => {
//     const { id } = req.params;
//     const hotspot = await prisma.hotspot.findUnique({
//         where: { id: Number(id) },
//         select: {
//             name: true,
//             hotspots: {
//                 select: {
//                     name: true,
//                 },
//             },
//         },
//     });
//     const deletedhotspot = await prisma.hotspot.delete({
//         where: { id: Number(id) },
//     });

//     // Recuperar els noms de les ehotspots eliminades i els seus hotspots relacionats
//     const deletedHotspots = hotspot.hotspots.map(hotspot => hotspot.name);

//     //en delete prisma decideix llençar error si no troba res, per això no cal fer la comprovació
//     res.status(200).json({ ok: true, deletedhotspot, deletedHotspots });

// }));


export default apiRouter;