import { PrismaClient } from '@prisma/client'
import { randomToken } from '../helpers/randomToken.js';
const prisma = new PrismaClient()



const main = async () => {
    const name1 = randomToken(6);
    const name2 = randomToken(6);
    console.log(name1, name2);

    const createdTours = await prisma.tour.createMany({
        data: [
            { name: `tour_${name1}` },
            { name: `tour_${name2}` },
        ]
    });
    console.log("Tours created: ", createdTours);

    const tours = await prisma.tour.findMany();
    console.log("records: ", tours);


    const createdScenes = [];

    for (const sceneData of [
        { name: `scene_1`, tourId: tours[tours.length - 2].id },
        { name: `scene_2`, tourId: tours[tours.length - 2].id },
        { name: `scene_1`, tourId: tours[tours.length - 1].id },
    ]) {
        const createdScene = await prisma.scene.create({
            data: sceneData,
        });
        createdScenes.push(createdScene);
    }

    console.log("Scenes created: ", createdScenes);

    const sceneIds = createdScenes.map(scene => scene.id);
    const scenesWithHotspots = await prisma.scene.findMany({
        where: {
            id: {
                in: sceneIds,
            },
        },
        include: {
            hotspots: true,
        },
    });

    for (const scene of scenesWithHotspots) {
        const numHotspots = Math.floor(Math.random() * 3) + 1; // 1-3(aleatori) hotspots

        for (let i = 0; i < numHotspots; i++) {
            const hotspotName = `hs_${randomToken(6)}`;
            const tx = (Math.random() * 4000) - 2000;
            const ty = (Math.random() * 4000) - 2000;
            const tz = (Math.random() * 4000) - 2000;
            const rx = Math.random() * 360;
            const ry = Math.random() * 360;
            const rz = Math.random() * 360;
            const scale = Math.random() * 0.9 + 0.1;
            const createdHotspot = await prisma.hotspot.create({
                data: {
                    name: hotspotName,
                    sceneId: scene.id,
                    transform: { tx, ty, tz, rx, ry, rz, scale },
                    style: `hs_image|${hotspotName}`,
                    extraData: {
                        url: "../assets/360_1.jpg",
                        blendmode: "add",
                        alpha: "1",
                    },
                },
                select: { // select: retorna només els camps que especifiquem
                    id: true,
                    name: true,
                    transform: true,
                    style: true,
                    extraData: true,
                },
            });

            console.log("Hotspot created: ", createdHotspot);
        }
    }
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });