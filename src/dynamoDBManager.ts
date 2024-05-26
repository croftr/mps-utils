const logger = require('./logger');
import { dynamoItem } from "././models/contracts";


export const setupDynamo = () => {
}

export const addDynamoDbRow = (item:dynamoItem) => {
    console.log(item);    
}
