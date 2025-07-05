# Vercel Frontend Deployment Guide

This guide explains how to deploy the AI Interview Coach frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **GitHub Repository**: Your code should be in a GitHub repository
4. **Backend Deployed**: Your backend should be deployed (Railway, Vercel, etc.)

## Step 1: Prepare Your Repository

### 1.1 Ensure Frontend Structure
Make sure your frontend is in the `frontend/` directory with the following structure:
```
frontend/
├── package.json
├── vite.config.js
├── vercel.json
├── env.example
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── ...
└── public/
```

### 1.2 Check Package.json
Ensure your `frontend/package.json` has the correct scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"

2. **Import Repository**
   - Connect your GitHub account if not already connected
   - Select your repository: `ai-interview-agent`

3. **Configure Project**
   - **Framework Preset**: Select "Vite"
   - **Root Directory**: Set to `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   - Add the following environment variable:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com
   ```
   - Replace `your-backend-url.com` with your actual backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow Prompts**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `ai-interview-coach-frontend` (or your preferred name)
   - In which directory is your code located: `./` (current directory)
   - Want to override the settings: `N`

5. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_BASE_URL
   ```
   - Enter your backend URL when prompted

6. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## Step 3: Configure Custom Domain (Optional)

1. **Go to Project Settings**
   - In your Vercel dashboard, go to your project
   - Click "Settings" → "Domains"

2. **Add Custom Domain**
   - Enter your domain name
   - Follow Vercel's DNS configuration instructions

## Step 4: Environment Variables

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Your backend API URL | `https://your-railway-app.up.railway.app` |

### Setting Environment Variables

1. **Via Dashboard**:
   - Go to Project Settings → Environment Variables
   - Add each variable with the appropriate value

2. **Via CLI**:
   ```bash
   vercel env add VITE_API_BASE_URL
   ```

## Step 5: Update Backend CORS (If Needed)

If your backend is deployed on Railway, make sure it allows requests from your Vercel domain:

```javascript
// In your backend server.js
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:5173' // for local development
  ],
  credentials: true
}));
```

## Step 6: Test Your Deployment

1. **Visit Your Vercel URL**
   - Your app will be available at `https://your-project-name.vercel.app`

2. **Test Features**
   - Test login/registration
   - Test API calls to your backend
   - Test all major features

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure `vite.config.js` is properly configured
   - Check build logs in Vercel dashboard

2. **API Connection Issues**
   - Verify `VITE_API_BASE_URL` is set correctly
   - Check CORS configuration on backend
   - Test API endpoints directly

3. **Environment Variables Not Working**
   - Ensure variables start with `VITE_` prefix
   - Redeploy after adding environment variables
   - Check variable names are correct

### Debug Commands

```bash
# Check Vercel project info
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod

# Remove project
vercel remove
```

## Performance Optimization

### Vercel Configuration
The `vercel.json` file includes:
- **Build optimization**: Manual chunk splitting
- **Caching headers**: For static assets
- **SPA routing**: All routes redirect to index.html

### Build Optimization
- Vendor chunks are separated for better caching
- Source maps are disabled for production
- Static assets are optimized

## Monitoring and Analytics

### Vercel Analytics
- Enable Vercel Analytics in project settings
- Monitor performance and user behavior

### Error Tracking
- Consider adding Sentry for error tracking
- Set `VITE_SENTRY_DSN` environment variable

## Continuous Deployment

Once set up, Vercel will automatically:
- Deploy on every push to main branch
- Create preview deployments for pull requests
- Rollback to previous versions if needed

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)
- **Project Issues**: Check GitHub repository issues 