# Setup Guide - Fix Supabase Connection Error

## The Problem
You're getting a "Error loading user profile" error because the Supabase environment variables are missing. The application can't connect to your Supabase database.

## Solution

### 1. Create Environment File
Create a `.env.local` file in the root directory of your project with the following content:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Optional: Production site URL (for auth redirects)
# NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

### 2. Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Update the .env.local File
Replace the placeholder values with your actual Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 4. Restart the Development Server
After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```

## Verification
Once you've set up the environment variables correctly:
1. The console error should disappear
2. The authentication should work properly
3. You should be able to sign up and log in

## Troubleshooting
- Make sure the `.env.local` file is in the root directory (same level as `package.json`)
- Ensure there are no spaces around the `=` sign in the environment variables
- Double-check that you copied the correct credentials from Supabase
- The file should be named exactly `.env.local` (not `.env` or `.env.local.txt`)

## Security Note
The `.env.local` file is already in `.gitignore`, so your credentials won't be committed to version control. 