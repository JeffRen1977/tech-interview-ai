# Firebase Deployment Setup Guide

This guide explains how to set up Firebase for deployment environments (Railway, Vercel, Heroku, etc.) using environment variables instead of service account files.

## Problem Solved

The original Firebase configuration was trying to load a `serviceAccountKey.json` file that doesn't exist in deployment environments. This caused the error:

```
Firebase Admin SDK initialization failed: Error: Cannot find module '../serviceAccountKey.json'
```

## Solution

The Firebase configuration has been updated to:
1. **First try environment variables** (for deployment)
2. **Fallback to service account file** (for local development)
3. **Provide safe getter functions** that handle uninitialized Firebase gracefully

## Environment Variables Required

For deployment, you need to set these environment variables:

```bash
# Required Firebase Environment Variables
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# Other Required Variables
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## How to Get Firebase Environment Variables

### Step 1: Go to Firebase Console
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Select your project

### Step 2: Generate Service Account Key
1. Go to **Project Settings** (gear icon)
2. Click **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file

### Step 3: Extract Values from JSON
Open the downloaded JSON file and extract these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",                    // → FIREBASE_PROJECT_ID
  "private_key_id": "abc123...",                      // → FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",  // → FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk...",             // → FIREBASE_CLIENT_EMAIL
  "client_id": "123456789...",                        // → FIREBASE_CLIENT_ID
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Step 4: Set Environment Variables

#### For Railway:
```bash
# Use the railway-env-import.sh script
./railway-env-import.sh

# Or manually set each variable
railway variables set FIREBASE_PROJECT_ID=your-project-id
railway variables set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# ... set all other variables
```

#### For Vercel:
```bash
# Use the deploy-vercel-backend.sh script
./deploy-vercel-backend.sh

# Or set in Vercel dashboard
# Go to Project Settings → Environment Variables
```

#### For Heroku:
```bash
# Use the deploy-heroku.sh script
./deploy-heroku.sh

# Or manually set
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# ... set all other variables
```

## Testing the Configuration

### Local Testing
```bash
cd backend
node test-firebase-config.js
```

### Deployment Testing
After deployment, check the logs for:
- ✅ "Firebase Admin SDK initialized successfully with environment variables"
- ✅ "Server is running on port 3000"

If you see errors, check:
1. All environment variables are set correctly
2. Private key format is correct (with `\n` for line breaks)
3. Service account has proper permissions

## Code Changes Made

### 1. Updated Firebase Configuration (`backend/config/firebase.js`)
- Added environment variable support
- Added fallback to service account file
- Added safe getter functions
- Added initialization status tracking

### 2. Updated All Controllers
- Changed from direct destructuring to safe getter functions
- Added error handling for uninitialized Firebase

### 3. Updated Utility Scripts
- All utility scripts now use safe getter functions
- Better error handling and logging

### 4. Added Docker Ignore
- Created `.dockerignore` to exclude sensitive files
- Prevents service account files from being included in builds

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Check if all environment variables are set
   - Verify private key format (should include `\n` for line breaks)

2. **"Invalid private key" error**
   - Ensure private key is properly escaped
   - Check that line breaks are represented as `\n`

3. **"Permission denied" error**
   - Verify service account has proper permissions
   - Check if Firestore rules allow access

4. **Environment variables not loading**
   - Restart the deployment after setting variables
   - Check deployment platform's environment variable documentation

### Debug Commands

```bash
# Test Firebase configuration locally
cd backend && node test-firebase-config.js

# Check environment variables
echo $FIREBASE_PROJECT_ID

# Test with minimal configuration
NODE_ENV=production node -e "console.log(process.env.FIREBASE_PROJECT_ID)"
```

## Security Notes

1. **Never commit service account files** to version control
2. **Use environment variables** for all deployment platforms
3. **Rotate service account keys** regularly
4. **Limit service account permissions** to minimum required
5. **Monitor Firebase usage** in the console

## Next Steps

After setting up Firebase environment variables:

1. Deploy your application
2. Test all Firebase-dependent features
3. Monitor logs for any Firebase-related errors
4. Set up Firebase monitoring and alerts

For more help, check the deployment guides:
- [Railway Deployment Guide](RAILWAY_DEPLOYMENT.md)
- [Vercel Deployment Guide](DEPLOYMENT.md)
- [Heroku Deployment Guide](DEPLOYMENT.md) 