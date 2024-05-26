
const logger = require('./logger');
const path = require('path');
import { getCategory } from "./utils/categoryManager";
import { parse } from '@fast-csv/parse';
const fs = require('fs');
const { stringify } = require('csv-stringify');
const { Readable } = require('stream');
const cheerio = require('cheerio');
const { DateTime } = require("luxon");

import { contractNode, contractAwardedToNode, dynamoItem } from "././models/contracts";
import { createContract } from "./neoManager";
import { addDynamoDbRow } from "./dynamoDBManager";

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

    const pagePickup = 1000;

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

const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
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
                    errorCount = errorCount+1;
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

const extractPublishedDate = (dateString: string, previousdDate: string) => {

    try {
        const pd = dateString.split(',')[0] //some published dates have an edit comment next to them like this - "11 December 2017, last edited 11 December 2017" 

        //verify whe have a valud date
        const dateCheck = new Date(pd);
        const isValid = !isNaN(dateCheck.getTime());

        if (!isValid) {
            throw new Error(`Invalid date ${dateCheck}`)
        }

        return pd;

    } catch (error) {
        logger.error(`Failed to work out published date from ${dateString} so using previous date`)
        return previousdDate;
    }

}

export const createContracts = async () => {

    const csvDirectoryPath = './output';
    
    // @ts-ignore
    fs.readdir(csvDirectoryPath, (err, files) => {

        if (err) throw err;

        files
            // @ts-ignore
            .filter(file => file.endsWith('.csv'))
            // @ts-ignore
            .forEach(file => {
                const cleanedFile:Array<any> = [];
                console.log(`got file ${file}`);
                let lastValidDate:string;
                const parser = parse({ headers: true }); // Parse into objects
                fs.createReadStream(`${csvDirectoryPath}/${file}`)
                    .pipe(parser)
                    // @ts-ignore
                    .on('data', async (row) => {
                        try {
                            const cleanRow = { ...row }; // Copy the row
                        
                            for (const key of Object.keys(row)) {
                                if (key.toLowerCase().includes('date')) {
                                    
                                    const dateToFormat = row[key].split(",")[0].trim();                                                                                                                                                                                    
                                    const date = DateTime.fromFormat(dateToFormat, 'd MMMM yyyy');
                                                                                                            
                                    if (date.isValid) {
                                        cleanRow[key] = date.toISODate();
                                        lastValidDate = date.toISODate();                                                                                
                                    } else {
                                        //if the date is too messed up set it to the last date we used as they are in date order so should be same of very close
                                        console.warn(`Invalid date format in column ${key}:`, row[key]);
                                        cleanRow[key] = lastValidDate;
                                    }
                                } 

                            }
                            // @ts-ignore
                            cleanedFile.push(cleanRow);


                            const contract: contractNode = {
                                id: row['id'],
                                title: row['title'],
                                supplier: row['supplier'],
                                description: row['description'].substring(0, 200),
                                publishedDate: cleanRow["publishedDate"],
                                awardedDate: cleanRow['awardedDate'],
                                awardedValue: Number(row['awardedValue']),
                                issuedByParties: row['issuedByParties'].split(','),
                                category: row['category'],
                                industry: row['industry'],
                                link: row['link'],
                                location: row['location'],
                            }
                
                            const contractAwardedTo: contractAwardedToNode = {
                                name: row['awardedTo'],
                            }

                            const dynamoDbItem:dynamoItem = {
                                id: row['id'],
                                title: row['title'],
                                supplier: row['supplier'],
                                description: row['description'].substring(0, 200),
                                publishedDate: cleanRow["publishedDate"],
                                awardedDate: cleanRow['awardedDate'],
                                awardedValue: Number(row['awardedValue']),
                                issuedByParties: new Set(row['issuedByParties']),
                                category: row['category'],
                                industry: row['industry'],
                                link: row['link'],
                                location: row['location'],
                                awardedTo: row['awardedTo'],
                            }

                            console.log(contract);
                            console.log("=================================");                            
                            console.log(contractAwardedTo);
                            
                
                            // createContract(contractAwardedTo, contract);

                            addDynamoDbRow(dynamoDbItem);

                            // console.log(`got row ${JSON.stringify(row)}`);
                        } catch (error) {
                            console.error(`Error adding item from ${file}:`, error);
                        }                        
                    })                    
                    .on('end', () => {
                        console.log(`Finished processing ${file}`);
                        // cleanedFile.forEach(row => console.log(row));        
                        // console.log(cleanedFile[0]);
                        cleanedFile.length = 0;
                    });
                                                            
            });
            
    });
}