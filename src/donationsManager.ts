
const logger = require('./logger');
import { normalizeName } from "./utils/utils";
const fs = require('fs');
import { createDonar } from "./neoManager";
import { parse } from '@fast-csv/parse';

import * as csv from 'csv-parser';

import { pipeline } from 'stream';
import { promisify } from 'util';

import neo4j, { Record } from "neo4j-driver";
import { log } from "console";

const ROWS_TO_TAKE = 50;

//TODO only want to run this once a year for the previous year.  add an env variable to be updated for this and make it easy to run
const getUrl = ({ from = "2001-01-01", to = "2002-01-01", start = 0 }) => {
    return `https://search.electoralcommission.org.uk/api/search/Donations?start=${start}&rows=${ROWS_TO_TAKE}&query=&sort=AcceptedDate&order=desc&et=pp&date=Accepted&from=${from}&to=${to}&rptPd=&prePoll=true&postPoll=true&register=ni&register=gb&donorStatus=individual&donorStatus=tradeunion&donorStatus=company&period=3862&period=3865&period=3810&period=3765&period=3767&period=3718&period=3720&period=3714&period=3716&period=3710&period=3712&period=3706&period=3708&period=3702&period=3704&period=3698&period=3700&period=3676&period=3695&period=3604&period=3602&period=3600&period=3598&period=3594&period=3596&period=3578&period=3580&period=3574&period=3576&period=3570&period=3572&period=3559&period=3524&period=3567&period=3522&period=3520&period=3518&period=2513&period=2507&period=2509&period=2511&period=1485&period=1487&period=1480&period=1481&period=1477&period=1478&period=1476&period=1474&period=1471&period=1473&period=1466&period=463&period=1465&period=460&period=447&period=444&period=442&period=438&period=434&period=409&period=427&period=403&period=288&period=302&period=304&period=300&period=280&period=218&period=206&period=208&period=137&period=138&period=128&period=73&period=69&period=61&period=63&period=50&period=40&period=39&period=5&isIrishSourceYes=true&isIrishSourceNo=true&includeOutsideSection75=true`
}

const extractDate = (dateString: string | undefined, otherDate: string | undefined, donar: any, period: string): any => {

    //think this can be a string of null
    if (dateString === "null" || dateString === null || !dateString) {

        if (otherDate === "null" || otherDate === null || !otherDate) {
            dateString = period;
        } else {
            dateString = otherDate;
        }
    }

    if (!dateString.includes("Date")) {
        return dateString;
    }

    try {

        // Use a regular expression to extract the numeric part
        const match = dateString?.match(/\/Date\((\d+)\)\//);

        if (match && match[1]) {

            const numericPart = match[1];
            const numericDate = parseInt(numericPart, 10);

            // Create a Date object from the numeric part
            const dateObject = new Date(numericDate).toISOString();

            // logger.info(`Valid date string format for ${dateString} - ${otherDate} for ${donar.DonorName} ${donar.ECRef}`);

            return dateObject;
        } else {
            logger.error(`Invalid date string format for ${dateString} - ${otherDate} for ${donar.DonorName} ${donar.ECRef}`);
        }

    } catch (e) {
        logger.error(e);
        logger.error(`${donar.DonorName} ${donar.ECRef}`);
        logger.error(`Failed processing date ${dateString} other date is ${otherDate}`)

        return undefined;
    }

}

const extractParty = (party: string = "") => {

    if (party.includes("onservative")) {
        return "Conservative";
    } else if (party.includes("abour")) {
        return "Labour";
    } else if (party.includes("emocrat")) {
        return "Liberal Democrat"
    } else if (party.includes("laid")) {
        return "Plaid Cymru";
    } else if (party.includes("hristian")) {
        return "Christian Party";
    } else if (party.includes("UKIP")) {
        return "UK Independence Party";
    } else if (party.includes("SNP")) {
        return "Scottish National Party";
    }

    return party.replace(/[^\w\s]/g, '');
}

/**
 * To get donations select csv download from here 
 * choose date range after the max date of donations we currently have 
 * this function then turns that csv file into neo data 
 * 
 * @param row 
 * @returns 
 */
// function csvRowToDonar(row: any): any {

//     const acceptedDateParts = row['AcceptedDate'].split('/');
//     const receivedDateParts = row['ReceivedDate'].split('/');

//     const formattedAcceptedDate = `${acceptedDateParts[2]}-${acceptedDateParts[1]}-${acceptedDateParts[0]}`;
//     const formattedReceivedDate = `${receivedDateParts[2]}-${receivedDateParts[1]}-${receivedDateParts[0]}`;

//     return {
//         DonorName: normalizeName(row['DonorName']),
//         DonorStatus: row['DonorStatus'] || '',
//         AccountingUnitName: row['AccountingUnitName'] || '',
//         Postcode: row['Postcode'] || '',
//         NatureOfDonation: row['NatureOfDonation'] || '',
//         DonationType: row['DonationType'] || '',
//         ECRef: row['ECRef'] || '',
//         AcceptedDate: formattedAcceptedDate,
//         ReceivedDate: formattedReceivedDate,
//         Value: parseInt(row['Value'].replace(/[^0-9.]/g, '')) || 0,
//         Party: extractParty(row['RegulatedEntityName']),
//     };
// }

function extractDateValue(dateStr: string): string {
    const dateParts = dateStr.split('/');
    if (dateParts.some(part => part.includes('undefined'))) {
        return '1900-01-01';
    } else {
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
}

function csvRowToDonar(row: any, fromYear = 2001): any {


    let formattedAcceptedDate = extractDateValue(row._4 || row._17 || row._18);
    let formattedReceivedDate = extractDateValue(row._17 || row._18 || row._4);

    // Handle cases where both dates are 'undefined'
    if (formattedAcceptedDate === '1900-01-01' && formattedReceivedDate === '1900-01-01') {
        formattedAcceptedDate = `${fromYear}-11-19T00:00:00.000Z`;
        formattedReceivedDate = `${fromYear}-11-19T00:00:00.000Z`;
    } else if (formattedAcceptedDate === '1900-01-01') {
        formattedAcceptedDate = formattedReceivedDate;
    } else if (formattedReceivedDate === '1900-01-01') {
        formattedReceivedDate = formattedAcceptedDate;
    }

    return {
        DonorName: normalizeName(row._6),
        DonorStatus: row._9 || '',
        AccountingUnitName: row._5 || '',
        Postcode: row._12 || '',
        NatureOfDonation: row._14 || '',
        DonationType: row._13 || '',
        ECRef: row._0 || '',
        AcceptedDate: formattedAcceptedDate,
        ReceivedDate: formattedReceivedDate,
        Value: parseInt(row._3.replace(/[^0-9.]/g, '')) || 0,
        Party: extractParty(row._1),
    };
}

// export const createDonationsFromCsv = async (from = 2001) => {

//     const csvDirectoryPath = 'D:/donations';
//     // const csvDirectoryPath = 'D:/rerun';

//     const files = await fs.promises.readdir(csvDirectoryPath);
//     // @ts-ignore
//     const csvFiles = files.filter(file => file.endsWith('.csv'));
//     console.log("converting ", csvFiles);

//     for (const file of csvFiles) {

//         logger.info(`Processing file: ${file}`);

//         const donationsToCreate: Array<any> = [];

//         const parser = parse({ headers: true, delimiter: ',' });

//         fs.createReadStream(`${csvDirectoryPath}/${file}`).pipe(parser);

//         let index = 0;
//         parser.on('readable', async () => {

//             if (index % 100 === 0) {
//                 logger.info(`Created ${index} donations`)
//             }

//             let record
//             while ((record = parser.read()) !== null) {

//                 try {

//                     const donar = csvRowToDonar(record);

//                     if (!donar.AcceptedDate || donar.AcceptedDate && donar.AcceptedDate.includes("Date")) {
//                         donar.AcceptedDate = extractDate(donar.AcceptedDate, donar.ReceivedDate, donar, `${from}-11-19T00:00:00.000Z`) || `${from}-11-19T00:00:00.000Z`;
//                     }

//                     if (!donar.ReceivedDate || donar.ReceivedDate && donar.ReceivedDate.includes("Date")) {
//                         donar.ReceivedDate = extractDate(donar.ReceivedDate, donar.AcceptedDate, donar, `${from}-11-19T00:00:00.000Z`) || `${from}-11-19T00:00:00.000Z`;
//                     }

//                     await createDonar(donar);

//                     index++;

//                 } catch (error) {
//                     console.error(`Error processing row in ${file}:`, error);
//                     console.error(`${record}`);
//                 }
//             }
//         });


//     }
// }



const pipelineAsync = promisify(pipeline);


export const createDonationsFromCsv = async (from = 2001) => {

      const csvDirectoryPath = 'D:/donations';
    // const csvDirectoryPath = 'D:/rerun';

    const files = await fs.promises.readdir(csvDirectoryPath);
    //@ts-ignore
    const csvFiles = files.filter((file) => file.endsWith('.csv'));

    let fileCount = 0;
    let recordCount = 0

    for (const file of csvFiles) {

        logger.info(`Processing file: ${file}`);

        let isHeader = true;

        const readStream = fs.createReadStream(`${csvDirectoryPath}/${file}`, { encoding: 'latin1' }); // Specify 'latin1' encoding

        //@ts-ignore
        const parser = csv.default({ headers: true, delimiter: ',' });

        try {
            await pipelineAsync(readStream, parser);
        } catch (err) {
            console.error('Pipeline failed.', err);
        }

        for await (const record of parser) {

            if (isHeader) {
                continue;
            }

            try {
                const donar = csvRowToDonar(record);

                if (!donar.AcceptedDate || (donar.AcceptedDate && donar.AcceptedDate.includes("Date"))) {
                    donar.AcceptedDate = extractDate(donar.AcceptedDate, donar.ReceivedDate, donar, `${from}-11-19T00:00:00.000Z`) || `${from}-11-19T00:00:00.000Z`;
                }

                if (!donar.ReceivedDate || (donar.ReceivedDate && donar.ReceivedDate.includes("Date"))) {
                    donar.ReceivedDate = extractDate(donar.ReceivedDate, donar.AcceptedDate, donar, `${from}-11-19T00:00:00.000Z`) || `${from}-11-19T00:00:00.000Z`;
                }


                await createDonar(donar);

                recordCount++;
                isHeader = false;

                if (recordCount % 100 === 0) {
                    logger.info(`Created ${recordCount} donations from ${fileCount} files`);
                }
            } catch (error) {
                console.error(`Error processing row in ${file}:`, error);
                console.error(`${record}:`, error);
            }
        }
        fileCount++;
        
    }
    logger.info(`Created ${recordCount} donations from ${fileCount} files`);
}