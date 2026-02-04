# Frontend Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- GitHub repository (recommended)

### Automatic Deployment
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically detect the React/Vite app
4. Configure environment variables if needed

### Manual Deployment
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Environment Variables
Set these in Vercel dashboard if your app uses them:
- `VITE_API_URL` - Backend API URL
- Any other environment variables starting with `VITE_`

### Build Configuration
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

### Post-Deployment
- Test all routes work correctly
- Verify API connections
- Check environment variables are loaded
