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
    logger.debug(cypher);
    try {
        logger.info(cypher)
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
        // result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Mp) ON (e.id)`, session);
        // result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Party) ON (e.partyName)`, session);
        // result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Organisation) ON (e.donar)`, session);
        // result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Organisation) ON (e.DonorName)`, session);
        // result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Individual) ON (e.donar)`, session);
        // result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Individual) ON (e.DonorName)`, session);
        // result = await runCypher(`CREATE RANGE INDEX IF NOT EXISTS FOR (e:Contract) ON (e.contractId)`, session);

        // // Uniqueness Constraints (These will automatically create range indexes
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Mp) ASSERT (e.id) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Party) ASSERT (e.partyName) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Organisation) ASSERT (e.donar) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Organisation) ASSERT (e.DonorName) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Organisation) ASSERT (e.Name) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Individual) ASSERT (e.donar) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Individual) ASSERT (e.DonorName) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Individual) ASSERT (e.Name) IS UNIQUE`, session);
        // result = await runCypher(`CREATE CONSTRAINT IF NOT EXISTS ON (e:Contract) ASSERT (e.contractId) IS UNIQUE`, session);

        // Contract relationship constraints
        // CREATE CONSTRAINT IF NOT EXISTS FOR() - [r: AWARDED] - ()
        // REQUIRE(r.AwardedDate, r.relId) IS UNIQUE;

        // CREATE CONSTRAINT IF NOT EXISTS FOR() - [r: TENDERED] - ()
        // REQUIRE(r.PublishedDate, r.relId) IS UNIQUE;


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

// @ts-ignore
export const createContract = async (contractAwardedTo: contractAwardedToNode, contract: contractNode, session) => {

    if (!contractAwardedTo.name) {
        logger.warn(`Organisation with no name awared contract ${contract.title}`)
    }

    // const driver = neo4j.driver(CONNECTION_STRING, neo4j.auth.basic(process.env.NEO4J_USER || '', process.env.NEO4J_PASSWORD || ''));

    // Combine queries for better performance
    const combinedCypher = `
    MERGE (org:Organisation { Name: $organisationName })
    SET org.hasHadContract = $hasHadContract 
    MERGE (con:Contract { ContractId: $contractId })
    SET con.AwardedValue = $awardedValue,
        con.Title = $title,
        con.Category = $category,
        con.Description = $description,
        con.PublishedDate = date($publishedDate),
        con.AwardedDate = date($awardedDate),
        con.Supplier = $supplier,
        con.Industry = $industry,
        con.Link = $link,
        con.Location = $location
    CREATE (con)-[:AWARDED { AwardedDate: date($awardedDate), relId: toString(con.Title) + "_" + toString(org.Name) }]->(org)  // Explicit conversion to string
    WITH con
    UNWIND $issuedByParties AS partyName
    MATCH (party:Party { partyName: partyName })
    CREATE (party)-[:TENDERED { PublishedDate: date($publishedDate), relId: toString(con.Title) + "_" + toString(party.partyName) }]->(con)  // Explicit conversion to string
`;

    const parameters = {
        organisationName: contractAwardedTo.name.toLowerCase(),
        hasHadContract: true,
        contractId: contract.id,
        title: contract.title,
        awardedValue: contract.awardedValue,
        category: contract.category,
        description: contract.description,
        publishedDate: contract.publishedDate,
        awardedDate: contract.awardedDate,
        issuedByParties: contract.issuedByParties, // Pass as an array
        supplier: contract.supplier,
        industry: contract.industry,
        link: contract.link,
        location: contract.location
    };

    // const session = driver.session();
    try {
        await session.run(combinedCypher, parameters);
        // logger.info(`Created contract ${contract.title} ${contract.publishedDate}`)
    } catch (error) {

        //@ts-ignore
        if (error.message.startsWith("Relationship")) {
            //constraint violation
            //@ts-ignore
            logger.trace(error.message);
        } else {
            //@ts-ignore
            logger.error(error.message)
        }
        //lots of constraint violations
    } finally {
        // await session.close();
    }
};

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

/**
 * 
 * every mp that we have not just created is assumed to therefor be inactive 
 * @param ids of all the active mps
 * 
 */
export const updateMpStatus = async (ids: Array<number>) => {
    logger.info(`updaating  mps status for ${ids}`)

    const cypher: string = `
    MATCH (mp:Mp)
    WHERE NOT mp.id IN [${ids}]
    SET mp.isActive = false
    `

    const session = await driver.session();
    await runCypher(cypher, session);
}


export const createMpNode = async (mp: Mp) => {
    
    const partyName = mp.latestParty.name === "Labour (Co-op)" ? "Labour" : mp.latestParty.name;

    const cypher: string = `
    MERGE (mp:Mp {id: ${mp.id}})
    ON CREATE SET
      mp.nameListAs = "${mp.nameListAs}",
      mp.nameDisplayAs = "${mp.nameDisplayAs}",
      mp.nameFullTitle = "${mp.nameFullTitle}",
      mp.partyId = "${mp.latestParty.id}",
      mp.partyName = "${partyName}",
      mp.gender = "${mp.gender}",
      mp.partyBackgroundColour = "${mp.latestParty.backgroundColour}",
      mp.partyForegroundColour = "${mp.latestParty.foregroundColour}",
      mp.partyIsLordsMainParty = "${mp.latestParty.isLordsMainParty}",
      mp.partyIsLordsSpiritualParty = "${mp.latestParty.isLordsSpiritualParty}",
      mp.partyIsIndependentParty = "${mp.latestParty.isIndependentParty}",
      mp.house = ${mp.latestHouseMembership.house},
      mp.membershipFrom = "${mp.latestHouseMembership.membershipFrom}",
      mp.isActive = "${mp.latestHouseMembership.membershipStatus.statusIsActive}",
      mp.membershipEndDate = ${mp.latestHouseMembership.membershipEndDate ? `datetime("${mp.latestHouseMembership.membershipEndDate}")` : 'null'},
      mp.membershipStartDate = ${mp.latestHouseMembership.membershipStartDate ? `datetime("${mp.latestHouseMembership.membershipStartDate}")` : 'null'}
    ON MATCH SET
      mp.nameListAs = "${mp.nameListAs}",
      mp.nameDisplayAs = "${mp.nameDisplayAs}",
      mp.nameFullTitle = "${mp.nameFullTitle}",
      mp.partyId = "${mp.latestParty.id}",
      mp.partyName = "${partyName}",
      mp.gender = "${mp.gender}",
      mp.partyBackgroundColour = "${mp.latestParty.backgroundColour}",
      mp.partyForegroundColour = "${mp.latestParty.foregroundColour}",
      mp.partyIsLordsMainParty = "${mp.latestParty.isLordsMainParty}",
      mp.partyIsLordsSpiritualParty = "${mp.latestParty.isLordsSpiritualParty}",
      mp.partyIsIndependentParty = "${mp.latestParty.isIndependentParty}",
      mp.house = ${mp.latestHouseMembership.house},
      mp.membershipFrom = "${mp.latestHouseMembership.membershipFrom}",
      mp.isActive = true,
      mp.membershipEndDate = ${mp.latestHouseMembership.membershipEndDate ? `datetime("${mp.latestHouseMembership.membershipEndDate}")` : 'null'},
      mp.membershipStartDate = ${mp.latestHouseMembership.membershipStartDate ? `datetime("${mp.latestHouseMembership.membershipStartDate}")` : 'null'}
  `;


    try {
        const session = await driver.session();
        const result = await session.run(cypher);    
    } catch (error: any) {
        if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
            logger.error(`Error adding to neo ${error}`);
        }
    }

}

const runCypherWithParams = async (cypher: string, session: any, params?: Record<string, any>) => { // Add optional 'params' parameter
    logger.trace(cypher);
    try {      
      const result = await session.run(cypher, params); 
      return result;
    } catch (error: any) {
      logger.error("in runCypherWithParams");
      if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed" && error.code !== "Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists") {        
        logger.error(error);
      } else {
        logger.trace(error);
      }
    }
  }

  export const createDonar = async (donar: any) => { 

    if (!donar.DonorName) {
      logger.warn(`Got donar with no name`);
      logger.warn(donar);
      donar.DonorName = "unidentifiable donor";
    }

    const type = donar.DonorStatus === "Individual" ? "Individual" : "Organisation";
  
    const nodeCypher: string = `
      MERGE (donar:${type} { donar: $donarName }) 
      ON CREATE SET 
        donar.Name = $donarName, 
        donar.accountingUnitName = $accountingUnitName,
        donar.donorStatus = $donorStatus,
        donar.postcode = $postcode
    `;
  
    const relCypher = `
    MATCH (donar:${type} {donar: $donarName} )
    MATCH (party:Party {partyName: $partyName} ) 
    CREATE (donar)-[:DONATED_TO { 
        natureOfDonation: $natureOfDonation, 
        donationType: $donationType, 
        ecRef: $ecRef, 
        acceptedDate: datetime($acceptedDate), 
        receivedDate: datetime($receivedDate), 
        amount: toInteger($amount) 
    }]->(party)
    `;

    const session = await driver.session();
  
    try {
      const nodeResult = await runCypherWithParams(nodeCypher, session, { 
        donarName: donar.DonorName,
        accountingUnitName: donar.AccountingUnitName || '', 
        donorStatus: donar.DonorStatus || '',
        postcode: donar.Postcode || '',
      });

      if (nodeResult?.summary?.counters?._stats?.nodesCreated === 1) { // Assuming runCypher returns a result object with summary
        logger.trace(`Created new donor node: ${donar.DonorName}`);
      } else {
        logger.trace(`Donor node already exists: ${donar.DonorName}`);
      }
  
      const relResult = await runCypherWithParams(relCypher, session, { 
        donarName: donar.DonorName,
        partyName: donar.Party,
        natureOfDonation: donar.NatureOfDonation || '',
        donationType: donar.DonationType || '',
        ecRef: donar.ECRef || '',
        acceptedDate: donar.AcceptedDate,
        receivedDate: donar.ReceivedDate,
        amount: donar.Value,
      });
      
      if (relResult?.summary?.counters?._stats?.relationshipsCreated === 1) {
        logger.trace(`Created new donation relationship for: ${donar.DonorName}`);
      } else {
        logger.trace(`Donation relationship already exists for: ${donar.DonorName}`);
      }
    } catch (error: any) {
      if (error.code !== "Neo.ClientError.Schema.ConstraintValidationFailed") {
        logger.error(`Error creating donar or relationship: ${error.message}`);
        logger.error(donar);        
      }
    } 
  }

export const createDonarNode = async (donar: any) => {

    if (!donar.DonorName) {
        logger.warn(`Got donar with no name`)
    }

    const name = donar.DonorName.toLowerCase();

    const cypher: string = `CREATE (donar:Donar {
        donar: "${name}",
        Name: "${name}",
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