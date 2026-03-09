# Banner Upload Feature - Setup Guide

## 1. Install Dependencies

### Backend
```bash
cd seniot-backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid
```

## 2. Configure Environment Variables

Add to `seniot-backend/.env`:
```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-bucket-name
```

## 3. Register Backend Route

In `seniot-backend/src/app.js`, add:
```javascript
const bannerRoutes = require('./routes/banner.routes');
app.use('/api/banners', bannerRoutes);
```

## 4. Configure AWS

### A. Create S3 Bucket
1. Go to AWS S3 Console
2. Create bucket in `ap-south-1` region
3. Keep "Block all public access" OFF for public URLs
4. Or use CloudFront for better security

### B. Apply IAM Policy
1. Go to IAM Console
2. Create new policy using `IAM_POLICY_BANNER.json`
3. Attach to your IAM user
4. Replace `YOUR_BUCKET_NAME` with actual bucket name

### C. Configure S3 CORS
1. Go to your S3 bucket
2. Permissions → CORS configuration
3. Paste content from `S3_CORS_CONFIG.json`
4. Replace origins with your actual domains

## 5. Use in Your Dashboard

```jsx
import AddBannerButton from './components/AddBannerButton';

function YourPage() {
  return (
    <div>
      <h1>Banners</h1>
      <AddBannerButton />
      {/* Your existing content */}
    </div>
  );
}
```

## 6. Customize to Match Your UI

The component uses generic class names. Replace with your actual classes:

```jsx
// Replace these with your actual component imports
import Button from '../components/Button';
import Modal from '../components/Modal';

// Replace class names
className="btn btn-primary" → className="your-button-class"
className="form-input" → className="your-input-class"
```

## 7. Security Checklist

- ✅ AWS credentials only in backend .env
- ✅ IAM policy restricts to banners/* only
- ✅ Pre-signed URLs expire in 5 minutes
- ✅ File type validation on frontend and backend
- ✅ CORS configured for specific origins only
- ✅ No AWS SDK in frontend bundle

## 8. Production Recommendations

1. **Use CloudFront** for serving images (better performance + security)
2. **Add file size limit** (e.g., max 5MB)
3. **Implement image optimization** (resize/compress before upload)
4. **Store banner metadata** in your database
5. **Add delete functionality** with proper authorization
6. **Use environment-specific CORS** origins

## 9. Troubleshooting

### Upload fails with CORS error
- Check S3 CORS configuration
- Verify origin matches exactly (http vs https)

### "Access Denied" error
- Verify IAM policy is attached
- Check bucket name in policy matches actual bucket

### Pre-signed URL expired
- URLs expire in 5 minutes
- Generate new URL if upload takes longer

### Image not displaying
- Check bucket permissions (public read or CloudFront)
- Verify publicUrl format is correct

## 10. Optional Enhancements

```javascript
// Add to backend route for file size validation
if (req.body.fileSize > 5 * 1024 * 1024) {
  return res.status(400).json({ error: 'File too large (max 5MB)' });
}

// Add to frontend for image compression
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(selectedFile, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920
});
```
