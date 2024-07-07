example .env

DOCKER_HOST=193.203.191.46
PORT=8001
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
CREATE_PARTIES=false
CREATE_DONATIONS=false
RUN_DATA_SCIENCE=true
DONATIONS_FROM_YEAR=2025

dynamo contains - 331,368

cyhper queries for contracts 
CALL db.schema.visualization

//orgs that donated to party that awarded them a contract
MATCH (org:Organisation)-[:DONATED_TO]->(party:Party)-[:TENDERED]->(c:Contract)-[:AWARDED]->(org)
RETURN org.Name AS organisation, party.partyName AS partyDnatedTo, c.Title AS contractRecieved LIMIT 5

//orgs that were awarded more than n contracts
MATCH (party:Party)-[:TENDERED]->(c:Contract)-[awarded:AWARDED]->(org)
WITH org, COUNT(c) AS contractCount
WHERE contractCount > 1000
AND org.Name <> ""
RETURN org.Name, contractCount
ORDER BY contractCount

MATCH (c:Contract)
WHERE c.PublishedDate.year = 2017 AND c.PublishedDate.month = 1 AND c.PublishedDate.day = 12
RETURN c


MATCH (c:Contract) RETURN COUNT(c)

//bulk add columns
id string, title string, supplier string, description string, publisheddate date, awardeddate date, awardedvalue int, issuedbyparties array<string>, category string, industry string, link string, location string, awardedto string