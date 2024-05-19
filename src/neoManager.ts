import { Division } from './models/divisions';
import { Mp } from './models/mps';
import { VotedFor } from './models/relationships';
import neo4j from "neo4j-driver";
import { contractAwardedToNode, contractNode, issuedContractRelationship, recievedContractRelationship } from "./models/contracts";
import { log } from 'console';

const logger = require('./logger');

let CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
// let CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
let driver: any;

const runCypher = async (cypher: string, session: any) => {
    logger.trace(cypher);
    try {
        const result = await session.run(cypher);
        return result;
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed" && error.code !== "Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists") {
            logger.error(error);
            logger.error(cypher);
        }

    }
}

export const getMpNames = async () => {

    logger.debug('Getting MP Names...');

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Mp) RETURN n.nameDisplayAs, n.id`, session);
        return result;
    } finally {
        session.close();
    }
}

export const getDivisionNames = async () => {

    logger.debug('Getting DIVISION Names...');

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(`MATCH (n:Division) RETURN n.Title, n.DivisionId`, session);
        return result;
    } finally {
        session.close();
    }
}

export const totalVotes = async (nameDisplayAs: string) => {
    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.nameDisplayAs = "${nameDisplayAs}") RETURN COUNT(d)`;

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedAyeCount = async (nameDisplayAs: string) => {
    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.nameDisplayAs = "${nameDisplayAs}" AND r.votedAye) RETURN COUNT(*)`;

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedNoCount = async (nameDisplayAs: string) => {
    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.nameDisplayAs = "${nameDisplayAs}" AND NOT r.votedAye) RETURN COUNT(*)`;

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const voted = async (nameDisplayAs: string) => {

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.nameDisplayAs = "${nameDisplayAs}") RETURN d.DivisionId, d.Title, d.Date, r.votedAye`;

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedAye = async (nameDisplayAs: string) => {

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.nameDisplayAs = "${nameDisplayAs}" AND r.votedAye) RETURN d.DivisionId, d.Title, d.Date`;

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const votedNo = async (nameDisplayAs: string) => {

    const cypher = `MATCH (s:Mp)-[r:VOTED_FOR]-(d) WHERE (s.nameDisplayAs = "${nameDisplayAs}" AND NOT r.votedAye) RETURN d.DivisionId, d.Title, d.Date`;

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }
}

export const mostSimilarVotingRecord = async (nameDisplayAs: string) => {

    logger.debug('finding mostSimilarVotingRecord...');

    //find mps with most similar voting records
    const cypher = `MATCH(targetNode: Mp { nameDisplayAs: "${nameDisplayAs}" })
    CALL gds.nodeSimilarity.stream('g1', {
            relationshipWeightProperty: 'votedAyeNumeric'
        })
    YIELD node1, node2, similarity
    WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity    
    RETURN mp1.nameDisplayAs, mp2.nameDisplayAs, mp2.partyName, similarity
    ORDER BY similarity DESCENDING, mp1.nameDisplayAs, mp2.nameDisplayAs
    LIMIT 20`;

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const mostSimilarVotingRecordwithinParty = async (nameDisplayAs: string, partyName: string) => {

    logger.debug('finding mostSimilarVotingRecord...');

    //find mps with most similar voting records
    const cypher = `CALL gds.nodeSimilarity.stream('g1', {
        relationshipWeightProperty: 'votedAyeNumeric'
    })
    YIELD node1, node2, similarity 
    WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity 
    WHERE (mp1.nameDisplayAs = "${nameDisplayAs}" OR mp2.nameDisplayAs = "${nameDisplayAs})"
    AND mp2.partyName = "${partyName}"
    RETURN mp1.nameDisplayAs, mp2.nameDisplayAs, similarity
    ORDER BY similarity DESCENDING, mp1, mp2`;


    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const mostSimilarVotingRecordOutsideOfParty = async (nameDisplayAs: string, partyName: string) => {

    logger.debug('finding mostSimilarVotingRecord...');

    //find mps with most similar voting records
    const cypher = `CALL gds.nodeSimilarity.stream('g1', {
        relationshipWeightProperty: 'votedAyeNumeric'
    })
    YIELD node1, node2, similarity 
    WITH gds.util.asNode(node1) AS mp1, gds.util.asNode(node2) AS mp2, similarity 
    WHERE (mp1.nameDisplayAs = "${nameDisplayAs}" OR mp2.nameDisplayAs = "${nameDisplayAs})"
    AND (mp1.partyName <> "${partyName}" OR mp2.partyName <> "${partyName}")    
    RETURN mp1.nameDisplayAs, mp2.nameDisplayAs, similarity
    ORDER BY similarity DESCENDING, mp1, mp2`;


    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;
    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        const result = await runCypher(cypher, session);
        return result;
    } finally {
        session.close();
    }

}

export const setupNeo = async () => {

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;
    // CONNECTION_STRING = `neo4j+s://bb90f2dc.databases.neo4j.io`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    logger.debug(`NEO URL ${CONNECTION_STRING + process.env.NEO4J_USER + " " + process.env.NEO4J_PASSWORD}`);

    try {
        let result;

        // Range Indexes
        result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Mp) ON (e.id)`, session);
        result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Party) ON (e.partyName)`, session);
        result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Organisation) ON (e.donar)`, session);
        result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Organisation) ON (e.DonorName)`, session);
        result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Individual) ON (e.donar)`, session);
        result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Individual) ON (e.DonorName)`, session);
        result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Contract) ON (e.contractId)`, session);

        // Uniqueness Constraints (These will automatically create range indexes
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Mp) ASSERT (e.id) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Party) ASSERT (e.partyName) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Organisation) ASSERT (e.donar) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Organisation) ASSERT (e.DonorName) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Organisation) ASSERT (e.Name) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Individual) ASSERT (e.donar) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Individual) ASSERT (e.DonorName) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Individual) ASSERT (e.Name) IS UNIQUE`, session);
        result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Contract) ASSERT (e.contractId) IS UNIQUE`, session);


    } catch (error) {
        //contraint already exists so proceed
    } finally {
        session.close();
    }

    logger.debug('NEO setup complete');

}

export const batchDelete = async () => {

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;

    const cypher = `
    MATCH (n:Organisation)-[r:DONATED_TO]-(p:Party)
    WITH n LIMIT 100
    DETACH DELETE n
    `

    try {
        driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
        const session = driver.session();

        let keepgoing = true;
        while (keepgoing) {
            const result = await session.run(cypher);
            logger.info(` deleted ${result.summary.updateStatistics._stats.nodesDeleted} nodes and ${result.summary.updateStatistics._stats.relationshipsDeleted} relationships`);
            if (result.summary.updateStatistics._stats.nodesDeleted === 0) {
                keepgoing = false;
            }
        }
        logger.info("All Done!")

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed" && error.code !== "Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists") {
            logger.error(error);
            logger.error(cypher);
        }
    }
}

export const createContract = async (contractAwardedTo: contractAwardedToNode, contract: contractNode, issuedContract: issuedContractRelationship, recievedContract: recievedContractRelationship) => {

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    console.log("bobby >>> ", contract.publishedDate);


    //ogganisation could already exist as a donar for example     
    const contractAwardedToCypher = `
    MERGE (n:Organisation { Name: $organisationName })
    SET n.Website = $contactWebsite,
        n.Address = $contactAddress,
        n.Email = $contactEmail,
        n.Country = $contactCountry,
        n.ContactName = $contactName,
        n.ContactPhone = $contactPhone,
        n.ContactTown = $contactTown
    `;
    
    const parameters1 = {
        organisationName: contractAwardedTo.organisationName,
        contactWebsite: contractAwardedTo.contactWebsite,
        contactAddress: contractAwardedTo.contactAddress,
        contactEmail: contractAwardedTo.contactEmail,
        contactCountry: contractAwardedTo.contactCountry,
        contactName: contractAwardedTo.contactName,
        contactPhone: contractAwardedTo.contactPhone,
        contactTown: contractAwardedTo.contactTown
    };
    

    try {
        const result1 = await session.run(contractAwardedToCypher, parameters1);        
    } catch (error) {
      // Handle errors
      console.error("Error creating/updating org:", error);
      throw error;  // Re-throw to propagate the error if needed
  }
   

    // await runCypher(contractAwardedToCypher, session);

    // const contractCypher: string = `CREATE (n:Contract {
    //     ContractId: "${contract.contractId}",        
    //     AwardedValue: ${contract.awardedValue},
    //     Category: "${contract.category}",
    //     Description: "${contract.description}",        
    //     IsSubContract: ${contract.isSubContract},
    //     IsSuitableForSme: ${contract.isSuitableForSme},
    //     IsSuitableForVco: ${contract.isSuitableForVco},                
    //     Region: "${contract.region}",
    //     PublishedDate: datetime("${contract.publishedDate}"),
    //     EndDate: date("${contract.endDate}"),
    //     AwardedDate: date("${contract.awardedDate}"),
    //     IssuedByParties: ${contract.issuedByParties}
    //     })`;

    // await runCypher(contractCypher, session);

    const contractCypher = `
    MERGE (n:Contract { ContractId: $contractId })
    SET n.AwardedValue = $awardedValue,
        n.Title = $title,
        n.Category = $category,
        n.Description = $description,
        n.IsSubContract = $isSubContract,
        n.IsSuitableForSme = $isSuitableForSme,
        n.IsSuitableForVco = $isSuitableForVco,
        n.Region = $region,
        n.PublishedDate = date($publishedDate),
        n.EndDate = date($endDate),
        n.AwardedDate = date($awardedDate),
        n.IssuedByParties = $issuedByParties
    `;

    const parameters2 = {
        contractId: contract.contractId,
        title: contract.title,
        awardedValue: contract.awardedValue,
        category: contract.category,
        description: contract.description,
        isSubContract: contract.isSubContract,
        isSuitableForSme: contract.isSuitableForSme,
        isSuitableForVco: contract.isSuitableForVco,
        region: contract.region,
        publishedDate: contract.publishedDate, // Assuming already in "YYYY-MM-DDTHH:mm:ss[.sss][Z]" format
        endDate: contract.endDate, // Use your formatDate function from previous answers
        awardedDate: contract.awardedDate,
        issuedByParties: contract.issuedByParties // Pass the array directly
    };

    console.log("params ", parameters2);
    
    
    try {
        const result2 = await session.run(contractCypher, parameters2);        
    } catch (error) {
        // Handle errors
        console.error("Error creating/updating contract:", error);
        throw error;  // Re-throw to propagate the error if needed
    }
    
        
    const recievedContractRelCypher = `MATCH (org:Organisation { Name: "${contractAwardedTo.organisationName}"}) MATCH (con:Contract {ContractId: "${contractAwardedTo.contractId}"}) CREATE (org)-[:AWARDED { AwardedDate: date("${contract.awardedDate}") }]->(con)`;
    await runCypher(recievedContractRelCypher, session);

    //if more than 1 party was in power at the time create relationship for each party 
    for (let partyName of contract.issuedByParties) {
        const issuedContractRelCypher = `MATCH (party:Party { partyName: "${partyName}"}) MATCH (con:Contract { ContractId: "${contractAwardedTo.contractId}"}) CREATE (party)-[:TENDERED { PublishedDate: date("${contract.publishedDate}") }]->(con)`;
        await runCypher(issuedContractRelCypher, session);
    }
    
    session.close();  // Close the session when done

}

export const setupDataScience = async () => {

    logger.info("Creating data scuence node similarity")

    CONNECTION_STRING = `bolt://${process.env.DOCKER_HOST}:7687`;

    driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));
    const session = driver.session();

    try {
        await runCypher(`CALL gds.graph.drop('similarityGraph',false) YIELD graphName`, session);
        await runCypher(`CALL gds.graph.project('similarityGraph', {Mp: {}, Division: { properties: 'DateNumeric' }}, ['VOTED_FOR'],  { relationshipProperties: ['votedAyeNumeric'] })`, session);
    } catch (error) {
        //contraint already exists so proceed
    }

    session.close();

}

export const cleanUp = () => {
    driver.close();
}

export const getPartyMpCounts = async () => {

    const cypher: string = `MATCH (n:Mp) RETURN n.partyName, COUNT (n.partyName) as mpsCount`;

    const session = driver.session();
    try {
        await runCypher(cypher, session);
        const result = await session.run(cypher);
        return result;
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error querying neo ${error}`);
        }
    }
}


export const createPartyNode = async (party: any) => {

    const cypher: string = `CREATE (party:Party {
        partyName: "${party.name}",
        mpsCount: ${party.mpsCount}
      });`

    const session = driver.session();
    try {
        await runCypher(cypher, session);
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
        }
    }

}

export const createMpNode = async (mp: Mp) => {

    const partyName = mp.latestParty.name.includes("abour") ? "Labour" : mp.latestParty.name;

    const cypher: string =
        `CREATE (mp:Mp {
        id: ${mp.id},
        nameListAs: "${mp.nameListAs}",
        nameDisplayAs: "${mp.nameDisplayAs}",
        nameFullTitle: "${mp.nameFullTitle}",                
        partyId: "${mp.latestParty.id}",
        partyName: "${partyName}",
        gender: "${mp.gender}",        
        partyBackgroundColour: "${mp.latestParty.backgroundColour}",
        partyForegroundColour: "${mp.latestParty.foregroundColour}",
        partyIsLordsMainParty: "W${mp.latestParty.isLordsMainParty}",
        partyIsLordsSpiritualParty: "${mp.latestParty.isLordsSpiritualParty}",        
        partyIsIndependentParty: "${mp.latestParty.isIndependentParty}",
        house: ${mp.latestHouseMembership.house},
        membershipFrom: "${mp.latestHouseMembership.membershipFrom}",
        membershipStartDate: datetime("${mp.latestHouseMembership.membershipStartDate}")
      });`

    try {
        const session = driver.session();
        const result = await session.run(cypher);
        // logger.debug('created ', result);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
        }
    }

}

export const createDonar = async (donar: any) => {

    let type = donar.DonorStatus === "Individual" ? "Individual" : "Organisation";

    const nodeCypher: string = `CREATE (donar:${type} {
            donar: "${donar.DonorName}",                                
            Name: "${donar.DonorName}",                                
            accountingUnitName: "${donar.AccountingUnitName}",
            donorStatus: "${donar.DonorStatus}",
            postcode: "${donar.Postcode}"
            })`;

    const relCypher = `
        MATCH (donar:${type} {donar: "${donar.DonorName}"} )  
        MATCH (party:Party {partyName: "${donar.Party}"} )     
        CREATE (donar)-[:DONATED_TO { natureOfDonation: "${donar.NatureOfDonation}", donationType: "${donar.DonationType}", ecRef: "${donar.ECRef}", acceptedDate: datetime("${donar.AcceptedDate}"), receivedDate: datetime("${donar.ReceivedDate}"), amount: ${donar.Value} } ]->(party)`;

    const session = driver.session();
    try {
        const result = await runCypher(nodeCypher, session);
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding donar node to neo ${error}`);
            logger.error(nodeCypher);
        }
    }

    try {
        const result = await runCypher(relCypher, session);
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding donar relationship to neo ${error}`);
            logger.error(relCypher);
        }
    }

}

export const createDonarNode = async (donar: any) => {

    const cypher: string = `CREATE (donar:Donar {
        donar: "${donar.DonorName}",
        ecRef: "${donar.ECRef}",
        partyName: "${donar.Party}",        
        amount: ${donar.Value},
        acceptedDate: datetime("${donar.AcceptedDate}"),
        receivedDate: datetime("${donar.ReceivedDate}"),                
        accountingUnitName: "${donar.AccountingUnitName}",
        donorStatus: "${donar.DonorStatus}",
        postcode: "${donar.Postcode}",
        donationType: "${donar.DonationType}",
        postcode: "${donar.Postcode}",
        natureOfDonation: "${donar.NatureOfDonation}",
        postcode: "${donar.Postcode}"             
        })`;

    try {
        const session = driver.session();
        const result = await session.run(cypher);
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
            logger.error(cypher);

        }
    }
}

export const createDonarRelationships = async () => {

    logger.info(`Createding donar relationships`);

    const cypher = `MATCH (party:Party) MATCH (donar:Donar {partyName: party.partyName}) CREATE (donar)-[:DONATED_TO]->(party)`;

    const session = driver.session();
    try {
        const result = await runCypher(cypher, session);
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
        }
    }

    logger.info(`Donar relationships created`);
}

export const createDivisionNode = async (division: Division) => {

    const dateNumeric = new Date(division.Date);

    const cypher: string = `CREATE (division:Division {
        DivisionId: ${division.DivisionId},
        Date: datetime("${division.Date}"),
        DateNumeric: ${dateNumeric.getTime()},
        PublicationUpdated: datetime("${division.PublicationUpdated}"),
        Number: ${division.Number},
        IsDeferred: ${division.IsDeferred},        
        Title: "${division.Title}",
        AyeCount: ${division.AyeCount},
        NoCount: ${division.NoCount},
        Category: "${division.category}"
        })`;

    try {
        const session = driver.session();
        const result = await session.run(cypher);
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
        }
    }

}

export const createParyRelationships = async () => {

    logger.info(`Creating pary relationships`);

    const cypher = `MATCH (party:Party) MATCH (mp:Mp {partyName: party.partyName}) CREATE (mp)-[:MEMBER_OF]->(party)`;

    const session = driver.session();
    try {
        const result = await runCypher(cypher, session);
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
        }
    }
}

export const createVotedForDivision = async (votedFor: VotedFor) => {

    const cypher: string = `MATCH (mp:Mp {id: ${votedFor.mpId}}), (division:Division {DivisionId: ${votedFor.divisionId}}) CREATE (mp)-[:VOTED_FOR {votedAye: ${votedFor.votedAye}, votedAyeNumeric: ${Number(votedFor.votedAye)} }]->(division);`;

    try {
        const session = driver.session();
        // logger.debug(cypher);            
        const result = await session.run(cypher);

    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
        }
    }

}