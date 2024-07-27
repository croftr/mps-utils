
const logger = require('./logger');
const path = require('path');
import { getCategory } from "./utils/categoryManager";
import { parse } from '@fast-csv/parse';
const fs = require('fs');
const { stringify } = require('csv-stringify');
const { Readable } = require('stream');
const cheerio = require('cheerio');
const { DateTime } = require("luxon");

import neo4j from "neo4j-driver";

import { contractNode, contractAwardedToNode } from "././models/contracts";
import { createContract } from "./neoManager";

const CSV_SIZE = 50;

const partyInPower = [
    { parties: "Labour", fromDate: new Date("1997-05-02"), toDate: new Date("2010-05-11") },
    { parties: "Conservative,Liberal Democrat", fromDate: new Date("2010-05-11"), toDate: new Date("2015-05-08") },
    { parties: "Conservative", fromDate: new Date("2015-05-08"), toDate: new Date("2025-01-28") },
];

const COLUMNS = [
    'id',
    'title',
    'supplier',
    'description',
    'publishedDate',
    'awardedDate',
    'awardedValue',
    'issuedByParties',
    'category',
    'industry',
    'link',
    'location',
    'awardedTo'
]

const getAwardedValue = (awardedValueText: string, title: string, publishedDate: string) => {
    try {
        const value = awardedValueText.trim().split(" ")[2];
        const cleanedStr = value.replace(/[^0-9.]/g, '');
        const awardedValue = Number(cleanedStr);
        return awardedValue
    } catch (error) {
        logger.error(`Failed to get awarded value from ${awardedValueText}`)
        logger.error(`Failed for contract ${title} ${publishedDate}`)
        console.error(error);
        return 0;
    }
}

const writeCsv = async (data: Array<any>, pageNumber: number) => {

    const pagePickup = 0;

    pageNumber = pageNumber + pagePickup;

    const fromPage = pageNumber - CSV_SIZE;
    const outputDir = 'output'; // Set the output directory name
    const filename = `contracts_2020_${fromPage}_${pageNumber}.csv`
    const filePath = path.join(outputDir, filename);

    const csvStream = stringify({ header: true, columns: COLUMNS });
    const writeStream = fs.createWriteStream(filePath)
    const contractStream = Readable.from(data);

    return new Promise((resolve, reject) => { // Create a Promise
        contractStream
            .pipe(csvStream)
            .pipe(writeStream)
            .on('error', reject) // Reject the promise on error
            .on('finish', resolve); // Resolve the promise when finished
    });

}

const endAndPrintTiming = (timingStart: number, timingName: string) => {
    let timingEnd = performance.now();
    const elapsedSeconds = (timingEnd - timingStart) / 1000;
    const minutes = elapsedSeconds / 60;
    logger.info(`<<TIMING>> ${timingName} in ${minutes.toFixed(2)} minutes`);
}


const getPartyFromIssueDate = (issuedDate: string): string => {

    const targetDate = new Date(issuedDate.split('/').reverse().join('-'));

    for (const party of partyInPower) {
        const fromDate = new Date(party.fromDate);
        const toDate = new Date(party.toDate);

        if (targetDate >= fromDate && targetDate <= toDate) {
            return party.parties; // Found the party in power
        }
    }

    return "";

}

const extractContractId = (linkId: string) => {

    const parts = linkId.split('/');
    const lastPart = parts.pop();
    // @ts-ignore
    const contractId = lastPart.split('?')[0];

    return contractId;
}


export const getContracts = async () => {

    const cookie = "CF_COOKIES_PREFERENCES_SET=1; CF_AUTH=3odnc5udu0rolkvnbiu2io2vn5; CF_PAGE_TIMEOUT=1716712243246";

    const ACCEPTED_ERROR_COUNT = 10
    let errorCount = 0;

    const rows = [];

    let timingStart = performance.now();

    let page = 1;
    let createdCount = 0;
    let keepGoing = true;
    while (keepGoing) {

        let url;
        if (page === 1) {
            url = `https://www.contractsfinder.service.gov.uk/Search/Results`
        } else {
            url = `https://www.contractsfinder.service.gov.uk/Search/Results?&page=${page}`
        }

        logger.info(`PAGE ${page} - ${url}`)

        //make a query on the webside for what we need then set this cookie
        const result = await fetch(url, { headers: { "Cookie": cookie } });
        const resultBody = await result.text();

        const $ = cheerio.load(resultBody);

        // Get all div elements with a specific class name
        const contracts = $('.search-result');

        if (!contracts.length) {
            logger.info(`No conntracts left so ending`)
            await writeCsv(rows, page);
            keepGoing = false;
        }
        // @ts-ignore
        for (const div of contracts) {

            const stage = $(div).find(':nth-child(6)').text().trim();
            const title = $(div).find('.search-result-header h2 a').text().trim();
            const link = $(div).find('.search-result-header h2 a').attr('href');

            if (stage.includes("Awarded contract")) {

                const title = $(div).find('.search-result-header h2 a').text().trim();
                const link = $(div).find('.search-result-header h2 a').attr('href');
                const supplier = $(div).find('.search-result-sub-header').text().trim();
                const description = $(div).find(':nth-child(4)').text().replace(/^\s*[\r\n]/gm, '');
                const location = $(div).find(':nth-child(7)').text().trim().split(" ")[2];

                const awardedTo = $(div).find(':nth-child(9)').text().split(" ").slice(2).join(" ");
                const publishedDate = $(div).find(':nth-child(10)').text().split(" ").slice(2).join(" ");;

                const awardedValue = getAwardedValue($(div).find(':nth-child(8)').text(), title, publishedDate);

                logger.info(`Get ${publishedDate} ${link}`);

                const details = await fetch(link);

                const resultBody = await details.text();

                const $1 = cheerio.load(resultBody);
                const industry = $1('.content-block ul li p').text();
                const titles = $1('#content-holder-left .content-block h3');

                // get all the details for the contract and find the index of the Award information one so we can extract awarded date from here 
                // @ts-ignore
                const titleArray = titles.map((i, el) => {
                    const htmlContent = $1(el).html();
                    return htmlContent.replace(/<[^>]+>/g, ''); // Remove HTML tags
                }).get();

                const awardInfoIndex = titleArray.indexOf('Award information');

                const awardedDate = $1(`#content-holder-left .content-block:nth-child(${awardInfoIndex + 3})`).find('p').eq(0).text();

                const row = {
                    id: extractContractId(link),
                    title: title,
                    supplier: supplier,
                    description: description,
                    publishedDate: publishedDate,
                    awardedDate: awardedDate,
                    awardedValue: awardedValue,
                    issuedByParties: getPartyFromIssueDate(awardedDate),
                    category: getCategory(title),
                    industry: industry,
                    link: link,
                    location: location,
                    awardedTo: awardedTo
                }

                rows.push(row);
                createdCount = createdCount + 1;

            } else {

                if (!stage) { // have found the odd blank stage, just move on 
                    logger.warn(`Got blank stage for ${$(div).find('.search-result-header h2 a').text().trim()}`)
                    continue;
                } else {
                    errorCount = errorCount + 1;
                    if (errorCount = ACCEPTED_ERROR_COUNT) {
                        errorCount = 0;
                        keepGoing = false;
                        logger.info(`Created ${createdCount} contracts`)
                        endAndPrintTiming(timingStart, 'create contracts');
                        logger.error(`Got stage of ${stage} for ${title} possible token expired. ${link}`);
                        throw new Error("Session has expired")
                    } else {
                        errorCount = 0;
                        logger.info(`Created ${createdCount} contracts`)
                        logger.error(`Got stage of ${stage} for ${title} possible token expired. ${link}`);
                        continue;
                    }
                }
            }
        };

        page = page + 1;

        if (page % CSV_SIZE === 0) {
            await writeCsv(rows, page);
            rows.length = 0;
        }

    }

    keepGoing = false;
    logger.info(`Created ${createdCount} contracts`)
    endAndPrintTiming(timingStart, 'create contracts complete');

    logger.info("The end")
}

export const createContracts = async () => {

    const csvDirectoryPath = 'D:/contracts';
    // const csvDirectoryPath = 'D:/rerun';
    // const csvDirectoryPath = './output';

    const files = await fs.promises.readdir(csvDirectoryPath);
    // @ts-ignore
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    console.log("converting ", csvFiles);

    for (const file of csvFiles) {
        logger.info(`Processing file: ${file}`);
        // @ts-ignore
        const contractsToCreate = []; // Batch the contracts
        const parser = parse({ headers: true, delimiter: ',' });

        fs.createReadStream(`${csvDirectoryPath}/${file}`).pipe(parser);

        let index = 0;
        parser.on('readable', async () => { // Event-driven row processing
            let record
            while ((record = parser.read()) !== null) {

                try {
                    const contractData = transformCsvRow(record);
                    contractsToCreate.push(contractData);

                    // Create contracts in batches (adjust batch size as needed)
                    if (contractsToCreate.length >= 50 || record === null) {
                        index = index + 1;


                        // @ts-ignore
                        await createContractsInNeo4j(contractsToCreate);


                        contractsToCreate.length = 0;


                    }
                } catch (error) {
                    console.error(`Error processing row in ${file}:`, error);
                }
            }
        });

        // After the 'end' event is emitted, process any remaining contracts
        parser.on('end', async () => {
            if (contractsToCreate.length > 0) {
                index = index + 1;

                // @ts-ignore
                await createContractsInNeo4j(contractsToCreate);
                contractsToCreate.length = 0;

            }
        });

        await new Promise(resolve => parser.on('end', resolve)); // Wait for parsing to finish
        // Process any remaining contracts
        if (contractsToCreate.length > 0) {

            // @ts-ignore
            await createContractsInNeo4j(contractsToCreate);


        }

    }
};

// @ts-ignore
function transformCsvRow(row) {

    let lastValidDate = null;

    for (const key of Object.keys(row)) {
        if (key.toLowerCase().includes('date')) {
            const dateToFormat = row[key].split(",")[0].trim();
            const date = DateTime.fromFormat(dateToFormat, 'd MMMM yyyy');

            if (date.isValid) {
                row[key] = date.toISODate();
                lastValidDate = date.toISODate();
            } else if (lastValidDate) { // Use the last valid date if available
                row[key] = lastValidDate;
            } else {
                logger.error(`Invalid date format in column ${key}:`, row[key]);
                // Handle the case where the first date is invalid (e.g., skip the row)
            }
        }
    }

    let awardedValue = 0
    try {
        awardedValue = Number(row['awardedValue']);
    } catch (error) {
        logger.error(`Invalid number of ${row['awardedValue']} in column awardedValue`);
        awardedValue = -1;
    }

    const contract: contractNode = {
        id: row['id'],
        title: row['title'],
        supplier: row['supplier'],
        description: row['description'].substring(0, 200),
        publishedDate: row["publishedDate"],
        awardedDate: row['awardedDate'],
        awardedValue,
        issuedByParties: row['issuedByParties'].split(','),
        category: row['category'],
        industry: row['industry'],
        link: row['link'],
        location: row['location'],
    }

    const contractAwardedTo: contractAwardedToNode = {
        name: row['awardedTo'],
    }

    return { contract, contractAwardedTo }

}

// @ts-ignore
async function createContractsInNeo4j(contracts) {
    let CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;

    const driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();
    try {
        for (const item of contracts) {
            await createContract(item.contractAwardedTo, item.contract, session);
        }
        logger.info(`Created ${contracts.length} contracts in neo`)
        // TODO 1 second delate here is it necessary?
        // await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
        await session.close();
    }
}