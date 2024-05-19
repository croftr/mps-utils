
const logger = require('./logger');

import { contractAwardedToNode, contractNode, issuedContractRelationship, recievedContractRelationship } from "./models/contracts";
import fs from 'fs';
import { parse } from '@fast-csv/parse';
import { createContract } from "./neoManager";
import { getCategory } from "./utils/categoryManager";

const CONSERVATIVE = "Conservative";
const LABOUR = "Labour";
const LIBERAL = "Liberal Democrat";

const partyInPower = [
    { parties: ["Labour"], fromDate: new Date("1997-05-02"), toDate: new Date("2010-05-11") },
    { parties: ["Conservative", "Liberal Democrat"], fromDate: new Date("2010-05-11"), toDate: new Date("2015-05-08") },
    { parties: ["Conservative"], fromDate: new Date("2015-05-08"), toDate: new Date("2025-01-28") },
];

const getPartyFromIssueDate = (issuedDate: string): Array<string> => {

    const targetDate = new Date(issuedDate.split('/').reverse().join('-'));

    for (const party of partyInPower) {
        const fromDate = new Date(party.fromDate);
        const toDate = new Date(party.toDate);

        if (targetDate >= fromDate && targetDate <= toDate) {
            return party.parties; // Found the party in power
        }
    }

    return [];

}

const formatDate = (dateStr:string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }


export const createContracts = async (filename = "contracts-test.csv") => {

    const stream = fs.createReadStream(filename, { encoding: 'utf8' });

    const parser = parse({ headers: true })  // Assuming your CSV has headers
        .on('error', error => console.error(error))
        .on('data', row => {
            
            const publishedDate = row['Published Date'].substring(0,10);
            
            // console.log("Got row of ", row);
            const contract: contractNode = {
                contractId: row['Notice Identifier'],
                title: row['Title'],
                description: row['Description'].substring(0,200),
                region: row['Region'],
                publishedDate: publishedDate,
                startDate: formatDate(row['Start Date']),
                endDate: formatDate(row['End Date']),
                awardedDate: formatDate(row['Awarded Date']),
                awardedValue: row['Awarded Value'],
                isSubContract: row['Is sub-contract'] === "Yes" ? true : false,
                isSuitableForSme: row['Suitable for SME'] === "Yes" ? true : false,
                isSuitableForVco: row['Suitable for VCO'] === "Yes" ? true : false,
                issuedByParties: getPartyFromIssueDate(row['Awarded Date']),
                category: getCategory(row['Title'])
            }
            
            const contractAwardedTo: contractAwardedToNode = {
                contractId: row['Notice Identifier'],
                organisationName: row['Organisation Name'],
                contactName: row['Contact Name'],
                contactEmail: row['Contact Email'],
                contactAddress: row['Contact Address 1'],
                contactTown: row['Contact Town'],
                contactPostcode: row['Contact Postcode'],
                contactCountry: row['Contact Country'],
                contactPhone: row['Contact Telephone'],
                contactWebsite: row['Contact Website'],
            }
            
            const recievedContract: recievedContractRelationship = {
                awardedDate: row['Awarded Date'],
            }

            const issuedContract: issuedContractRelationship = {
                awardedDate: row['Awarded Date'],
            }

            createContract(contractAwardedTo, contract, recievedContract, issuedContract);

        })
        // @ts-ignore
        .on('end', rc => console.log(`Parsed ${rc} rows`));

    stream.pipe(parser);


}


