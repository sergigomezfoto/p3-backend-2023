import { execSync } from 'child_process';

//npm run delseedmulti // borra el que hi ha i hi posa 8 tours nous-


const deleteAll = async () => {
  execSync('ts-node-esm src/db_seed/deleteall.ts');
};

const seed = async () => {
  execSync('ts-node-esm src/db_seed/seed.ts');
};

const delseedmulti = async () => {
  await deleteAll();
  console.log('Old DB erased');
  
  for (let i = 0; i < 4; i++) {
    console.log(`seed: ${i + 1}`);
    await seed();
  }
};

delseedmulti().catch((error) => {
  console.error('Error during delseedmulti:', error);
  process.exit(1); // el 1 significa que hi ha hagut error.
});
