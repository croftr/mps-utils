
const logger = require('./logger');

import { createContract } from "./neoManager";
import fs from 'fs';
import { parse } from '@fast-csv/parse';
import { bool } from "aws-sdk/clients/signer";

const CONSERVATIVE = "Conservative";
const LABOUR = "Labour";
const LIBERAL = "Liberal Democrat";

const partyInPower = [
    { parties: ["LABOUR"], fromDate: new Date("1997-05-02"), toDate: new Date("2010-05-11") },
    { parties: ["CONSERVATIVE", "LIBERAL"], fromDate: new Date("2010-05-11"), toDate: new Date("2015-05-08") },
    { parties: ["CONSERVATIVE"], fromDate: new Date("2015-05-08"), toDate: new Date("2025-01-28") },
];

type contractNode = {
    contractId: string,
    title: string,
    description: string,
    publishedDate: string,
    startDate: string,
    endDate: string,
    awardedDate: string,
    awardedValue: string,
    isSubContract: boolean,
    isSuitableForSme: boolean,
    isSuitableForVco: boolean,
    issuedByParty: Array<string>
}

type contractAwardedToNode = {
    contractId: string,
    contactName: string,
    contactEmail: string,
    contactAddress: string,
    contactTown: string,
    contactPostcode: string,
    contactCountry: string,
    contactPhone: string,
    contactWebsite: string,
}

type recievedContractRelationship = {
    awardedDate: string,
}

type issuedContractRelationship = {
    awardedDate: string,
}

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


export const createContracts = async (filename = "contracts-test.csv") => {

    const stream = fs.createReadStream(filename, { encoding: 'utf8' });

    const parser = parse({ headers: true })  // Assuming your CSV has headers
        .on('error', error => console.error(error))
        .on('data', row => {

            console.log("Got row of ", row);


            const contract: contractNode = {
                contractId: row['Notice Identifier'],
                title: row['Title'],
                description: row['Description'],
                publishedDate: row['Published Date'],
                startDate: row['Start Date'],
                endDate: row['End Date'],
                awardedDate: row['Awarded Date'],
                awardedValue: row['Awarded Value'],
                isSubContract: row['Is sub-contract'] === "Yes" ? true : false,
                isSuitableForSme: row['Suitable for SME'] === "Yes" ? true : false,
                isSuitableForVco: row['Suitable for VCO'] === "Yes" ? true : false,
                issuedByParty: getPartyFromIssueDate(row['Awarded Date'])                
            }

            console.log("Created ", contract);

            const contractAwardedTo: contractAwardedToNode = {
                contractId: row['Notice Identifier'],
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

            // createContract({contract, contractAwardedTo, recievedContract, issuedContract});

        })
        // @ts-ignore
        .on('end', rc => console.log(`Parsed ${rc} rows`));

    stream.pipe(parser);


}


