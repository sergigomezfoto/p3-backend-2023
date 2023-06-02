import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const main = async ()=> {
    // Esborra tots els registres de totes les taules
    await prisma.hotspot.deleteMany();
    await prisma.scene.deleteMany();
    await prisma.tour.deleteMany();
    console.log("All records have been deleted");
}

main()
    .catch((e: Error) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });