const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const adsService = require('../services/ads.service');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const BUCKET_NAME = 'seniot-ads-banners';

router.post('/generate-upload-url', async (req, res) => {
  try {
    const { fileType } = req.body;

    if (!fileType || (!fileType.startsWith('image/') && !fileType.startsWith('video/'))) {
      return res.status(400).json({ error: 'Only image and video files allowed' });
    }

    const fileExtension = fileType.split('/')[1];
    const fileName = `banners/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${fileName}`;

    res.json({ uploadUrl, publicUrl, fileName });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

router.post('/upload-complete', async (req, res) => {
  try {
    const { imageUrl, title, bannerUrl, position, active } = req.body;
    console.log('📥 Received upload-complete request:', { imageUrl, title, bannerUrl, position, active });

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const ad = await adsService.createAd(imageUrl, title, bannerUrl, position, active);
    console.log('✅ Saved to DynamoDB:', ad);
    res.json({ success: true, ad });
  } catch (error) {
    console.error('❌ Error saving to DynamoDB:', error);
    res.status(500).json({ error: 'Failed to save banner to database' });
  }
});

router.post('/save-to-dynamodb', async (req, res) => {
  try {
    const { imageUrl, title, bannerUrl, position, active } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const ad = await adsService.createAd(imageUrl, title, bannerUrl, position, active);
    res.json({ success: true, ad });
  } catch (error) {
    console.error('Error saving to DynamoDB:', error);
    res.status(500).json({ error: 'Failed to save banner to database' });
  }
});

router.get('/ads', async (req, res) => {
  try {
    const ads = await adsService.getAllAds();
    res.json(ads);
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

router.delete('/delete', async (req, res) => {
  try {
    const { fileName, id } = req.body;

    // Delete from S3
    if (fileName) {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName
      });
      await s3Client.send(command);
    }

    // Delete from DynamoDB
    if (id) {
      await adsService.deleteAd(id);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ error: 'Failed to delete banner' });
  }
});

module.exports = router;
