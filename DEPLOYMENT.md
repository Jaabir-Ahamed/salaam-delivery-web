# Deployment Guide - Salaam Food Pantry Delivery System

This guide provides step-by-step instructions for deploying the Salaam Food Pantry Delivery System to Vercel.

## 🚀 Prerequisites

Before deploying, ensure you have:

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Project**: Set up and configured with all required tables
4. **Environment Variables**: Ready to configure in Vercel

## 📋 Pre-Deployment Checklist

### 1. Database Setup
- [ ] All SQL scripts have been run in Supabase
- [ ] Row Level Security (RLS) policies are configured
- [ ] Admin user has been created
- [ ] Test data has been imported (if needed)

### 2. Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

### 3. Code Preparation
- [ ] All TypeScript errors are resolved
- [ ] Build passes locally (`npm run build`)
- [ ] All dependencies are in `package.json`
- [ ] No sensitive data in the codebase

## 🔧 Vercel Deployment Steps

### Step 1: Connect Repository

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository
   - Vercel will automatically detect it's a Next.js project

### Step 2: Configure Project Settings

1. **Project Name**
   - Set to: `salaam-food-pantry-delivery`
   - Or your preferred name

2. **Framework Preset**
   - Should auto-detect as Next.js
   - If not, select "Next.js"

3. **Root Directory**
   - Leave as default (root of repository)

### Step 3: Environment Variables

Add these environment variables in the Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important Notes:**
- `NEXT_PUBLIC_` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` should be kept secret
- Get these values from your Supabase project settings

### Step 4: Build Configuration

1. **Build Command**: `npm run build` (default)
2. **Output Directory**: `.next` (default)
3. **Install Command**: `npm install` (default)

### Step 5: Deploy

1. **Click "Deploy"**
   - Vercel will build and deploy your application
   - First deployment may take 5-10 minutes

2. **Monitor Build Logs**
   - Watch for any build errors
   - Common issues:
     - Missing environment variables
     - TypeScript errors
     - Missing dependencies

## 🔍 Post-Deployment Verification

### 1. Test Core Functionality

- [ ] **Authentication**: Login/signup works
- [ ] **Admin Access**: Admin features are accessible
- [ ] **Volunteer Access**: Volunteer features work
- [ ] **Database Connection**: Data loads correctly
- [ ] **Real-time Updates**: Changes sync properly

### 2. Test User Roles

**Admin User:**
- [ ] Can access admin dashboard
- [ ] Can manage volunteers
- [ ] Can manage seniors
- [ ] Can view reports
- [ ] Can assign seniors to volunteers

**Volunteer User:**
- [ ] Can view assigned seniors
- [ ] Can update delivery status
- [ ] Can add delivery notes
- [ ] Cannot access admin features

### 3. Mobile Testing

- [ ] **Responsive Design**: Works on mobile devices
- [ ] **Touch Interactions**: Buttons and forms work
- [ ] **Loading States**: Proper loading indicators
- [ ] **Error Handling**: Graceful error messages

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build locally first
   npm run build
   npm run type-check
   ```

2. **Environment Variable Issues**
   - Verify all variables are set in Vercel
   - Check for typos in variable names
   - Ensure Supabase keys are correct

3. **Database Connection Issues**
   - Verify Supabase URL is correct
   - Check RLS policies are configured
   - Test database connection locally

4. **Authentication Issues**
   - Verify Supabase Auth is enabled
   - Check redirect URLs in Supabase settings
   - Test auth flow locally

### Debugging Steps

1. **Check Vercel Logs**
   - Go to your project in Vercel dashboard
   - Click on the latest deployment
   - Review build and function logs

2. **Test Locally**
   ```bash
   # Set environment variables locally
   cp .env.example .env.local
   # Edit .env.local with your values
   npm run dev
   ```

3. **Check Supabase Logs**
   - Go to your Supabase dashboard
   - Check the Logs section for errors
   - Verify RLS policies are working

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive keys to Git
- Use Vercel's environment variable system
- Rotate keys regularly

### Database Security
- RLS policies are properly configured
- Admin access is restricted
- User roles are enforced

### Application Security
- HTTPS is enforced (Vercel default)
- Authentication is required for all routes
- Input validation is implemented

## 📊 Monitoring and Maintenance

### Performance Monitoring
- Vercel provides built-in analytics
- Monitor Core Web Vitals
- Check for performance regressions

### Error Tracking
- Consider adding error tracking (Sentry, etc.)
- Monitor for 404s and 500s
- Track user experience issues

### Regular Maintenance
- Keep dependencies updated
- Monitor Supabase usage
- Review and update security policies

## 🚀 Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Vercel project settings
   - Click "Domains"
   - Add your custom domain

2. **Configure DNS**
   - Follow Vercel's DNS instructions
   - Update your domain registrar

3. **SSL Certificate**
   - Vercel automatically provides SSL
   - No additional configuration needed

## 📞 Support

For deployment issues:

1. **Check Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Review Supabase Documentation**: [supabase.com/docs](https://supabase.com/docs)
3. **Contact Development Team**: For application-specific issues

## 🔄 Continuous Deployment

Once deployed, Vercel will automatically:
- Deploy on every Git push to main branch
- Create preview deployments for pull requests
- Maintain deployment history

**Best Practices:**
- Test changes locally before pushing
- Use feature branches for new development
- Review preview deployments before merging

---

**Last Updated**: December 2024  
**Version**: 1.0.0 