const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

let dynamoClient;
let docClient;
let isConnected = false;

const initializeDynamoDB = () => {
  try {
    if (process.env.DEMO_MODE === 'true') {
      console.log('🔶 Running in DEMO MODE - Using in-memory data');
      return null;
    }

    console.log('Attempting AWS DynamoDB connection...');
    console.log('Region:', process.env.AWS_REGION);
    console.log('Access Key:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Missing');

    dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    docClient = DynamoDBDocumentClient.from(dynamoClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: false
      }
    });

    isConnected = true;
    console.log('✅ AWS DynamoDB connection initialized');
    return docClient;
  } catch (error) {
    console.error('❌ DynamoDB initialization failed:', error.message);
    console.log('🔶 Falling back to DEMO MODE');
    isConnected = false;
    return null;
  }
};

const getDocClient = () => {
  if (!docClient && !process.env.DEMO_MODE) {
    initializeDynamoDB();
  }
  return docClient;
};

const isDemoMode = () => {
  return process.env.DEMO_MODE === 'true' || !isConnected;
};

module.exports = {
  initializeDynamoDB,
  getDocClient,
  isDemoMode
};
