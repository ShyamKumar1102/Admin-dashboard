const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'seniot_ads';

class AdsService {
  async createAd(imageUrl, title, bannerUrl, position, active = true) {
    const id = uuidv4();

    const params = {
      TableName: TABLE_NAME,
      Item: {
        id,
        imageUrl,
        title: title || '',
        bannerUrl: bannerUrl || '',
        position: Number(position) || 1,
        active
      }
    };

    await docClient.send(new PutCommand(params));
    return params.Item;
  }

  async getAllAds() {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await docClient.send(new ScanCommand(params));
    return result.Items || [];
  }

  async deleteAd(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    await docClient.send(new DeleteCommand(params));
    return { success: true };
  }
}

module.exports = new AdsService();
