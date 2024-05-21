
const logger = require('./logger');

import { contractAwardedToNode, contractNode, issuedContractRelationship, recievedContractRelationship } from "./models/contracts";
import fs from 'fs';
import { parse } from '@fast-csv/parse';
import { createContract } from "./neoManager";
import { getCategory } from "./utils/categoryManager";

const cheerio = require('cheerio');

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

const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
}


export const getContracts = async () => {


    let page = 1;
    // // const pageCount = 15896
    const pageCount = 4;
    let keepGoing = true;
    while (keepGoing) {        
        
        let url;
        if (page === 1) {
            url = `https://www.contractsfinder.service.gov.uk/Search/Results}`
        } else {
            url = `https://www.contractsfinder.service.gov.uk/Search/Results?&page=${page}`
        }

        const cookie = "tngqld6kba6jcnjvbi2v1ups56";

        logger.info(`PAGE ${page} - ${url}`)
        
        //make a query on the webside for what we need then set this cookie
        const result = await fetch(url, { headers: {"Cookie": "CF_AUTH=tngqld6kba6jcnjvbi2v1ups56; CF_COOKIES_PREFERENCES_SET=1; CF_PAGE_TIMEOUT=1716315309219"} });
        const resultBody = await result.text();
        // console.log(resultBody);

        const $ = cheerio.load(resultBody);

        // Get all div elements with a specific class name
        const contracts = $('.search-result');

        // @ts-ignore
        contracts.each((i, div) => {

            const $div = $(div);

            const stage = $(div).find(':nth-child(6)').text().trim(); 

            if (stage === "Procurement stage Awarded contract") {

                console.log(`GOT ONE!  ${stage}`);    
                const title = $(div).find('.search-result-header').text().trim();
                const orgName = $(div).find('.search-result-sub-header').text().trim();
                const description = $(div).find(':nth-child(4)').text().replace(/^\s*[\r\n]/gm, '');
                const location = $(div).find(':nth-child(7)').text().trim().split(" ")[2];                
                
                
                const value = $(div).find(':nth-child(8)').text().trim().split(" ")[2];            
                const cleanedStr = value.replace(/[^0-9.]/g, '');            
                const awardedValue = Number(cleanedStr);

                const awardedTo = $(div).find(':nth-child(9)').text().split(" ").slice(2).join(" ");            
                    
                const awardedDate = $(div).find(':nth-child(10)').text().split(" ").slice(2).join(" ");           ;    

                const contract = {
                    title,
                    description,
                    supplier: orgName,
                    category: getCategory(title),
                    location,
                    awardedValue

                }

                const contractAwardedTo = {
                    awardedTo,
                    awardedDate
                }

                logger.info(`contract ${JSON.stringify(contract)}`)
                logger.info(`contractAwardedTo ${JSON.stringify(contractAwardedTo)}`)
                
                // console.log("awardedTo", awardedTo);
                // console.log("awardedDate", awardedDate);
                
                
                

                keepGoing = false;

            } else {
                console.log(`skipping ${stage}`);    
            }
            
            
            // const awardedDate = $(div).find(':nth-child(12)').text().trim(); 
            


            // console.log(`"${location}"----"${description}"`);
            
            
        
            // const contract: contractNode = {
            //     contractId: row['Notice Identifier'],
            //     title: title,
            //     description: row['Description'].substring(0, 200),
            //     region: row['Region'],
            //     publishedDate: publishedDate,
            //     startDate: formatDate(row['Start Date']),
            //     endDate: formatDate(row['End Date']),
            //     awardedDate: formatDate(row['Awarded Date']),
            //     awardedValue: row['Awarded Value'],
            //     isSubContract: row['Is sub-contract'] === "Yes" ? true : false,
            //     isSuitableForSme: row['Suitable for SME'] === "Yes" ? true : false,
            //     isSuitableForVco: row['Suitable for VCO'] === "Yes" ? true : false,
            //     issuedByParties: getPartyFromIssueDate(row['Awarded Date']),
            //     category: getCategory(row['Title'])
            // }

            // const contractAwardedTo: contractAwardedToNode = {
            //     contractId: row['Notice Identifier'],
            //     organisationName: orgName,
            //     contactName: row['Contact Name'],
            //     contactEmail: row['Contact Email'],
            //     contactAddress: row['Contact Address 1'],
            //     contactTown: row['Contact Town'],
            //     contactPostcode: row['Contact Postcode'],
            //     contactCountry: row['Contact Country'],
            //     contactPhone: row['Contact Telephone'],
            //     contactWebsite: row['Contact Website'],
            // }
            
        });

        page = page + 1;

    }


    logger.info("The end")
}

export const createContracts = async (filename = "aa.csv") => {

    const stream = fs.createReadStream(filename, { encoding: 'utf8' });
    const created: Array<string> = [];

    const parser = parse({ headers: true })  // Assuming your CSV has headers
        .on('error', error => console.error(error))
        .on('data', row => {

            const publishedDate = row['Published Date'].substring(0, 10);

            // console.log("Got row of ", row);
            const contract: contractNode = {
                contractId: row['Notice Identifier'],
                title: row['Title'],
                description: row['Description'].substring(0, 200),
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

            created.push(row['Title'])

        })
        // @ts-ignore
        .on('end', rc => {

            created.forEach(i => console.log(i));
            console.log(`Parsed ${rc} and ${created.length} rows`)
        });

    stream.pipe(parser);




}


