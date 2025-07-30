# Salam Food Pantry App - Codebase Analysis and Fix Instructions

## Project Overview
- **Frontend**: Next.js with Tailwind CSS (web MVP) + React Native (Expo) for mobile
- **Backend**: Supabase for authentication, database, and API
- **Purpose**: Nonprofit food delivery app for seniors with volunteer and admin roles
- **Current Issues**: Client-side exceptions, authentication problems, navigation errors, UI responsiveness

## Analysis Goals

Analyze the entire codebase for:
- Backend integration issues (Supabase setup, authentication, RLS policies)
- Frontend navigation and client-side errors
- UI responsiveness and accessibility
- Signup/login flow correctness
- Data synchronization and error handling

## Critical Issues to Address

### 1. Authentication & Database Issues
- **Infinite recursion in RLS policies** causing signup failures
- **Missing or broken signup functionality**
- **Login credentials validation errors**
- **Email confirmation redirect problems** (localhost vs production URLs)
- **Missing environment variables** causing "supabaseUrl is required" errors

### 2. Navigation & Client-Side Errors
- **Application error: client-side exception** when clicking navigation buttons
- **Broken back button behavior** (Route Map → Senior Details → Delivery Checklist instead of Route Map)
- **Navigation stack issues** causing loops and crashes

### 3. UI/UX Problems
- **Mobile responsiveness issues** on Route Map and View Seniors tabs
- **Overlapping UI components** and buttons
- **Text wrapping problems** with phone numbers and addresses
- **Hidden status tags** ("Delivered", "Pending") on mobile

## Tasks for Analysis

### 1. Codebase Scanning
- Scan all frontend and backend files for errors and warnings
- Identify missing or misconfigured environment variables
- Detect improper Supabase client usage and async/await misuse
- Locate missing or incorrect "use client" directives
- Check navigation stack and routing logic
- Identify UI components with responsiveness issues

### 2. Database & Authentication Fixes
- **Fix RLS policies** to prevent infinite recursion:
