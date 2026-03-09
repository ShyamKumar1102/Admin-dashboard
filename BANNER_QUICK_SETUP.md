# Banner Feature Setup

## 1. Install Dependencies
```bash
cd seniot-backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

## 2. Update .env file
Add to `seniot-backend/.env`:
```
S3_BUCKET_NAME=your-bucket-name
```

## 3. Create S3 Bucket
1. Go to AWS S3 Console
2. Create bucket in `ap-south-1` region
3. Name it (e.g., `seniot-banners`)

## 4. Apply IAM Policy
Use the policy from `IAM_POLICY_BANNER.json`

## 5. Configure S3 CORS
Use the config from `S3_CORS_CONFIG.json`

## 6. Access Banners
Navigate to: http://localhost:5173/banners

✅ Done! You can now upload banners to AWS S3!
