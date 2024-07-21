import { setupDataScience, setupNeo, batchDelete, createMpNode, updateMpStatus } from "./src/neoManager";
import { Mp } from "./src/models/mps";
import { createParties } from "./src/nodeManager";
import { createDonations } from "./src/donationsManager";
import { createContracts, getContracts } from "./src/contractsManager";
import { getMps } from "./src/apicall";

const logger = require('./src/logger');

const CREATE_PARTIES = process.env.CREATE_PARTIES === "true" ? true : false;
const CREATE_DONATIONS = process.env.CREATE_DONATIONS === "true" ? true : false;
const RUN_DATA_SCIENCE = process.env.RUN_DATA_SCIENCE === "true" ? true : false;
const CREATE_CONTRACTS = process.env.CREATE_CONTRACTS === "true" ? true : false;
const DELETE_DONARS = process.env.DELETE_DONARS === "true" ? true : false;
const CREATE_MPS = process.env.CREATE_MPS === "true" ? true : false;

const MP_TAKE_PER_LOOP = 20;

const endAndPrintTiming = (timingStart: number, timingName: string) => {
  // END timing
  let timingEnd = performance.now();
  logger.info(`<<TIMING>> ${timingName} in ${(timingEnd - timingStart) / 1000} seconds`);
}

/**
 * Order mps by name
 * @param a 
 * @param b 
 * @returns 
 */
const sortMps = (a: Mp, b: Mp) => {
  if (a.nameDisplayAs < b.nameDisplayAs) {
    return -1;
  }
  if (a.nameDisplayAs > b.nameDisplayAs) {
    return 1;
  }
  return 0;
}

const go = async () => {

  await setupNeo();
  const totalTimeStart = performance.now();
  let timingStart = performance.now();
  const allMps: Array<Mp> = [];

  if (CREATE_MPS) {

  
    let neoCreateCount = 0;
    let skip = 0;

    for (let i = 0; ; i++) {

      const mps: Array<Mp> = await getMps(skip, Number(MP_TAKE_PER_LOOP));

      console.log("got " + mps.length + " mps ");
      
      skip += 20;
      allMps.push(...mps);

      if (!mps.length) {
        break;
      }
    }
    allMps.sort(sortMps);
    logger.debug(`Created ${allMps.length} MPs in memory`);


    for (let i of allMps) {            
      await createMpNode(i);
      neoCreateCount = neoCreateCount + 1;
    }

    await updateMpStatus(allMps.map(i => i.id));

    logger.debug(`Created ${neoCreateCount} MPs in Neo4j`);

    // END timing
    endAndPrintTiming(timingStart, 'create mps');
  }

  if (DELETE_DONARS) {
    await batchDelete();
    // END timing
    endAndPrintTiming(timingStart, 'delete donars');
  }

  if (CREATE_PARTIES) {
    logger.info("CREATING PARTIES")
    //create parties
    await createParties();
    endAndPrintTiming(timingStart, 'created Parties');
  }

  if (CREATE_DONATIONS) {
    logger.info("CREATING DONATIONS")
    await createDonations(Number(process.env.DONATIONS_FROM_YEAR));
    endAndPrintTiming(timingStart, 'created Donations');
  }

  if (RUN_DATA_SCIENCE) {
    logger.info("CREATING DATA SCIENCE")
    await setupDataScience();
  }

  if (CREATE_CONTRACTS) {
    logger.info("CREATING CONTRACTS")
    await createContracts(false, true); //add contracts to databases
    // await getContracts()   //get contracts from website
    endAndPrintTiming(timingStart, 'create contracts');
  }

  endAndPrintTiming(totalTimeStart, 'Everything complete');
  logger.info('THE END');
}


go();

