import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// AWS Configuration with error handling
let dynamoClient;
let TABLE_NAME;

try {
  // Check if required environment variables are present
  if (!process.env.REACT_APP_AWS_REGION || 
      !process.env.REACT_APP_AWS_ACCESS_KEY_ID || 
      !process.env.REACT_APP_AWS_SECRET_ACCESS_KEY) {
    throw new Error('Missing required AWS environment variables');
  }

  const client = new DynamoDBClient({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: {
      accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    },
  });

  dynamoClient = DynamoDBDocumentClient.from(client);
  TABLE_NAME = process.env.REACT_APP_DYNAMODB_TABLE || "seniotusers";
  
  console.log('AWS DynamoDB client initialized successfully');
  console.log('Region:', process.env.REACT_APP_AWS_REGION);
} catch (error) {
  console.error('Failed to initialize AWS DynamoDB client:', error.message);
  console.warn('Application will run in demo mode with mock data');
}

// DynamoDB Table Names
export const TABLES = {
  CUSTOMER: 'seniot_customer',
  ENGINEER: 'seniot_engineer',
  DEVICES: 'seniot_devices',
  DEVICE_DATA: 'seniot_devicedata',
  STAFF: 'seniot_staff',
  SUBSCRIPTION_PLANS: 'subscription_plans',
  REMOVED_DEVICES: 'removeddevices'
};

export { dynamoClient, TABLE_NAME };

// Check if AWS is properly configured
export const isAWSConfigured = () => {
  return dynamoClient !== undefined && TABLE_NAME !== undefined;
};