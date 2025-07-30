# Salaam Food Pantry - Senior Breakfast Delivery System

A comprehensive web application for managing senior breakfast deliveries for Salaam Food Pantry. This system allows volunteers to track deliveries, manage senior profiles, and provides admin tools for oversight and reporting.

## 🚀 Features

### For Volunteers
- **Delivery Management**: Track daily deliveries with status updates
- **Senior Profiles**: View and manage senior information
- **Route Mapping**: Interactive maps for delivery routes
- **Real-time Updates**: Live data synchronization with Supabase

### For Administrators
- **Volunteer Management**: Add, edit, and manage volunteer accounts
- **Senior Management**: Comprehensive senior profile management
- **Senior Assignments**: Assign seniors to specific volunteers
- **Analytics Dashboard**: Monthly reports and delivery statistics
- **CSV Import**: Bulk import senior data
- **Accessibility Reports**: Track dietary and accessibility needs

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account and project
- Vercel account (for deployment)

## 🔧 Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd salaam-food-pantry-delivery
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   - Run the SQL scripts in the `scripts/` folder in order
   - Start with `01-create-tables.sql` and proceed sequentially
   - See `SETUP.md` for detailed database setup instructions

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Database Schema

### Core Tables
- `volunteers`: Volunteer user profiles and contact information
- `seniors`: Senior citizen profiles and delivery preferences
- `deliveries`: Delivery tracking and status updates
- `senior_assignments`: Volunteer-senior assignment relationships
- `admins`: Administrative user accounts

### Key Features
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Comprehensive audit trails

## 🔐 Authentication & Authorization

### User Roles
- **volunteer**: Can manage deliveries and view assigned seniors
- **admin**: Full access to all features including volunteer management
- **super_admin**: Highest level access with system administration

### Security Features
- Supabase RLS policies for data access control
- JWT-based authentication
- Role-based access control throughout the application

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop browsers
- Tablet devices
- Mobile phones
- Touch interfaces

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   - Link your GitHub repository to Vercel
   - Configure environment variables in Vercel dashboard

2. **Environment Variables**
   Add these to your Vercel project:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Deploy**
   - Vercel will automatically build and deploy on git push
   - Custom domain can be configured in Vercel dashboard

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── contexts/              # React contexts for state management
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and services
├── public/                # Static assets
├── scripts/               # Database setup scripts
└── styles/                # Global styles
```

## 🔧 Configuration Files

- `next.config.mjs`: Next.js configuration
- `tailwind.config.ts`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `components.json`: UI component configuration

## 📝 Key Components

### Authentication
- `components/login.tsx`: User login interface
- `components/signup.tsx`: User registration
- `contexts/auth-context.tsx`: Authentication state management

### Core Features
- `components/dashboard.tsx`: Main dashboard for volunteers
- `components/delivery-checklist.tsx`: Daily delivery tracking
- `components/senior-profile.tsx`: Senior information display
- `components/volunteer-management.tsx`: Admin volunteer management
- `components/senior-assignments.tsx`: Senior-volunteer assignments

### Services
- `lib/supabase-service.ts`: Database interaction layer
- `lib/supabase.ts`: Supabase client configuration

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables**
   - Ensure all required env vars are set
   - Check Vercel environment variables for production

2. **Database Connection**
   - Verify Supabase URL and keys
   - Check RLS policies are properly configured

3. **Build Errors**
   - Run `npm run type-check` to identify TypeScript issues
   - Ensure all dependencies are installed

### Support

For technical support or questions:
- Check the `SETUP.md` file for detailed setup instructions
- Review the database scripts in the `scripts/` folder
- Contact the development team

## 📄 License

This project is proprietary software developed for Salaam Food Pantry.

## 🤝 Contributing

This application is maintained by the development team. For feature requests or bug reports, please contact the project maintainers.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained By**: Development Team 