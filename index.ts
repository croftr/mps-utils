import { setupDataScience, setupNeo, batchDelete } from "./src/neoManager";
import { Mp } from "./src/models/mps";
import { Division } from "./src/models/divisions";
import { createParties } from "./src/nodeManager";
import { createDonations } from "./src/donationsManager";

const logger = require('./src/logger');

const CREATE_PARTIES = process.env.CREATE_PARTIES === "true" ? true : false;
const CREATE_DONATIONS = process.env.CREATE_DONATIONS === "true" ? true : false;
const RUN_DATA_SCIENCE = process.env.RUN_DATA_SCIENCE === "true" ? true : false;

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

  // await batchDelete();

  const allMps: Array<Mp> = [];
  const allDivisions: Array<Division> = [];

  const MAX_LOOPS = 1000;
  let skip = 0;

  let neoCreateCount = 0;

  // Start timing
  const totalTimeStart = performance.now();
  let timingStart = performance.now();

  if (CREATE_PARTIES) {
    //create parties
    await createParties();
    endAndPrintTiming(timingStart, 'created Parties');
  }


  // END timing
  endAndPrintTiming(timingStart, 'created divisions');


  if (CREATE_DONATIONS) {
    await createDonations(Number(process.env.DONATIONS_FROM_YEAR));
    endAndPrintTiming(timingStart, 'created Donations');
  }

  if (RUN_DATA_SCIENCE) {
    await setupDataScience();
  }
  
  endAndPrintTiming(totalTimeStart, 'Workflow complete');
  logger.info('THE END');
}


go();

