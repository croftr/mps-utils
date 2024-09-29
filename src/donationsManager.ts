
const logger = require('./logger');
const fs = require('fs');
import { normalizeName } from "./utils/utils";
import { createDonar } from "./neoManager";
import * as path from "path";
import * as readline from "readline";

const ROWS_TO_TAKE = 50;

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

function extractDateValue(dateStr: string): string {
    try {
        const dateParts = dateStr.split('/');
        if (dateParts.some(part => part.includes('undefined'))) {
            return '1900-01-01';
        } else {
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
    } catch (err) {
        logger.error(err);
        logger.error(`extractDateValue ${dateStr}`);
        return '1900-01-01';
    }

}

function csvRowToDonar(row: any, fromYear = 2001) {
    const fields = row.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // Split on commas, respecting quotes

    // Assuming the column order remains consistent
    let formattedAcceptedDate = extractDateValue(fields[4] || fields[17] || fields[18]);
    let formattedReceivedDate = extractDateValue(fields[17] || fields[18] || fields[4]);

    return {
        DonorName: normalizeName(fields[6]),
        DonorStatus: fields[9] || '',
        AccountingUnitName: fields[5] || '',
        Postcode: fields[12] || '',
        NatureOfDonation: fields[14] || '',
        DonationType: fields[13] || '',
        ECRef: fields[0] || '',
        AcceptedDate: formattedAcceptedDate,
        ReceivedDate: formattedReceivedDate,
        Value: parseInt(fields[3].replace(/[^0-9.]/g, '')) || 0,
        Party: extractParty(fields[1]),
    };
}

/**
 * * **** UPDATING DONATIONS *****
 * LAST_RAN_DATE = 13/09/2024
 * 
 * Download files from here search.electoralcommission.org.uk/English/Search/Donations
 * then set the dir to the location of the csv download. 
 * This will read the csv files and create nodes and rels in neo4j
 * 
 * 1) go here to search https://search.electoralcommission.org.uk/English/Search/Donations
 * 2) enter the date range from {LAST_RAN_DATE} to today (Note this will query on the Reported Date field)
 * 3) export results as CSV 
 * 4) move the CSV into local ./donations dir
 * 5) make sure the dir for this function is set to "./donations"
 * 6) in .env set CREATE_DONATIONS=true
 * 7) npm start 
 * 8) add the newly downlaoded donation csv file to D:/donations folder
 * 
 * * **** RECREATE ALL  DONATIONS *****
 * 1) make sure the dir for this function is set to D:/donations
 * 2) in .env set CREATE_DONATIONS=true
 * 3) npm start 
 * 
 * @param from 
 */
export const createDonationsFromCsv = async (from = 2001) => {

    try {

        // const dir = 'D:/donations';
        const dir = './donations';

        const csvFiles: Array<string> = []

        for (const file of fs.readdirSync(dir)) {
            const fullPath: string = path.join(dir, file);

            // Check if it's a file AND has a .csv extension
            if (fs.statSync(fullPath).isFile() && path.extname(file).toLowerCase() === '.csv') {
                csvFiles.push(fullPath);
            }
            
        }

        logger.info(`Got ${csvFiles.length} csv files`)

        let fileCount = 0;
        let fileRecordCount = 0;
        let totalRecordCount = 0;

        let donar;
        for (const file of csvFiles) {

            logger.info(`Processing file: ${file}`);
            fileCount++;
            fileRecordCount = 0;

            const readStream = fs.createReadStream(file)
            const lineReader = readline.createInterface({ input: readStream });

            for await (const line of lineReader) {

                try {

                    donar = csvRowToDonar(line);

                    if (donar.DonorName !== "donorname") { //if name is donorname it must be a header row
                        if (!donar.AcceptedDate || (donar.AcceptedDate && donar.AcceptedDate.includes("Date"))) {
                            donar.AcceptedDate = extractDate(donar.AcceptedDate, donar.ReceivedDate, donar, `${from}-11-19T00:00:00.000Z`) || `${from}-11-19T00:00:00.000Z`;
                        }

                        if (!donar.ReceivedDate || (donar.ReceivedDate && donar.ReceivedDate.includes("Date"))) {
                            donar.ReceivedDate = extractDate(donar.ReceivedDate, donar.AcceptedDate, donar, `${from}-11-19T00:00:00.000Z`) || `${from}-11-19T00:00:00.000Z`;
                        }

                        await createDonar(donar);
                        totalRecordCount++;
                        fileRecordCount++;

                        if (totalRecordCount % 500 === 0) {
                            logger.info(`Created ${totalRecordCount} donations from ${fileCount} files`);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    console.error(`Error processing row ${fileRecordCount} in ${file}:`);
                    console.error(donar);
                }
            }
            logger.info(`Created ${fileRecordCount} records from ${file}`);
        }
        logger.info(`Created ${totalRecordCount} donations from ${fileCount} files`);
    } catch (err) {
        logger.error("reateDonationsFromCsv")
        logger.error(err)
    }
}