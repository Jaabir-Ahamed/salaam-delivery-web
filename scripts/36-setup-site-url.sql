-- Setup Site URL for Password Reset Links
-- This script helps you understand what URL to set for password reset links

-- Check current environment configuration
SELECT 
    'Environment Setup Instructions' as info,
    'For password reset links to work properly, you need to set the NEXT_PUBLIC_SITE_URL environment variable.' as instruction;

-- Show what the current redirect URL would be
SELECT 
    'Current Configuration' as status,
    CASE 
        WHEN '${NEXT_PUBLIC_SITE_URL}' = '${NEXT_PUBLIC_SITE_URL}' THEN 'NOT SET - Using default'
        ELSE 'SET - Using custom URL'
    END as site_url_status,
    CASE 
        WHEN '${NEXT_PUBLIC_SITE_URL}' = '${NEXT_PUBLIC_SITE_URL}' THEN 'http://localhost:3000 (development) or https://your-production-domain.com (production)'
        ELSE '${NEXT_PUBLIC_SITE_URL}'
    END as current_redirect_url;

-- Instructions for setting up the environment variable
SELECT 
    'Setup Instructions' as step,
    '1. Go to your Vercel dashboard' as instruction
UNION ALL
SELECT 
    '2. Navigate to your project settings' as step,
    '3. Go to Environment Variables section' as instruction
UNION ALL
SELECT 
    '4. Add new environment variable' as step,
    'Name: NEXT_PUBLIC_SITE_URL, Value: https://your-actual-domain.vercel.app' as instruction
UNION ALL
SELECT 
    '5. Redeploy your application' as step,
    '6. Test password reset functionality' as instruction;

-- Test URLs that should work
SELECT 
    'Test URLs' as category,
    'Your production URL should look like:' as description,
    'https://salaam-delivery-web-1r5d-git-testing-jaabir-ahameds-projects.vercel.app' as example_url
UNION ALL
SELECT 
    'Auth Callback URL' as category,
    'Password reset links will redirect to:' as description,
    'https://your-domain.vercel.app/auth-callback' as example_url;
