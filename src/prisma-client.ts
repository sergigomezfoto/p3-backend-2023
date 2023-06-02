import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
// const xprisma = prisma.$extends({
//     result: {
//         tour: {
//             count: {
//                 needs:{},
//                 compute(tour) {
//                     return              // the computation logic
//                 },
//             },
//         },
//     },
// });
