
const logger = require('./logger');

import { createContract } from "./neoManager";
import fs from 'fs';
import { parse } from '@fast-csv/parse';

const CONSERVATIVE = "Conservative";
const LABOUR = "Labour";
const LIBERAL = "Liberal Democrat";

const partyInPower = [
    {parties: [LABOUR] , from: "2 May 1997", to: "11 May 2010"}
    {parties: [CONSERVATIVE,LIBERAL] , from: "11 May 2010 ", to: "8 May 2015"}
    {parties: [CONSERVATIVE] , from: "8 May 2015", to: "28 Jan 2025"}    
    
]

type contractNode = {
    contractId: string,
}

type contractAwardedToNode = {
    contractId: string,
}

type recievedContractRelationship  = {

}

type issuedContractRelationship  = {

}


export const createContracts = async (filename="contracts.csv") => {    
    
    const stream = fs.createReadStream(filename, { encoding: 'utf8' });
    
    const parser = parse({ headers: true })  // Assuming your CSV has headers
      .on('error', error => console.error(error))
      .on('data', row => {

        console.log("Got row of ", row);

        const contract:contractNode = { contractId: row[0] }
        const contractAwardedTo:contractAwardedToNode = { contractId: row[0]}

        const recievedContract:recievedContractRelationship = { contractId: row[0]}
        const issuedContract:issuedContractRelationship = { contractId: row[0]}

        // createContract({contract, contractAwardedTo, recievedContract, issuedContract});
        
      })
      // @ts-ignore
      .on('end', rc => console.log(`Parsed ${rc} rows`));
    
    stream.pipe(parser);

    
}
