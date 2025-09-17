# Alumni Portal Frontend - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the `frontend` folder as the root directory

### 2. Configure Build Settings

Vercel should automatically detect your Vite React app. If not, configure:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Environment Variables

Add these environment variables in Vercel Dashboard:

#### Required Variables:

- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.herokuapp.com`)
- `VITE_LINKEDIN_CLIENT_ID`: Your LinkedIn OAuth Client ID

#### How to Add Environment Variables:

1. Go to your project dashboard in Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add each variable with appropriate values for:
   - **Production** (for live deployment)
   - **Preview** (for pull request previews)
   - **Development** (for local development)

### 4. Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://your-project-name.vercel.app`

## Configuration Details

### vercel.json Configuration

The `vercel.json` file includes:

- **Static Build**: Uses `@vercel/static-build` for Vite
- **SPA Routing**: All routes redirect to `index.html` for client-side routing
- **Asset Caching**: Long-term caching for static assets
- **Security Headers**: XSS protection, content type options, etc.

### Environment Variables Reference

```bash
# Production Backend URL
VITE_API_URL=https://your-backend-domain.com

# LinkedIn OAuth Client ID
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
```

### Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Ensure TypeScript types are correct
- Verify environment variables are set

### 404 Errors on Refresh

- Ensure `vercel.json` has the catch-all route: `"src": "/(.*)", "dest": "/index.html"`

### API Connection Issues

- Verify `VITE_API_URL` is correctly set
- Check CORS settings in your backend
- Ensure backend is deployed and accessible

### LinkedIn OAuth Issues

- Update LinkedIn app settings with new domain
- Add Vercel domain to authorized redirect URIs
- Verify `VITE_LINKEDIN_CLIENT_ID` is correct

## Performance Optimization

The deployment includes:

- **Asset Optimization**: Automatic minification and compression
- **CDN Distribution**: Global edge network
- **Caching Strategy**: Long-term caching for static assets
- **Security Headers**: XSS protection and content security

## Monitoring

- **Analytics**: Built-in Vercel Analytics
- **Error Tracking**: Real-time error monitoring
- **Performance**: Core Web Vitals tracking

## Commands for Local Testing

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Router with Vercel](https://vercel.com/guides/deploying-react-with-vercel)
