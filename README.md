# Job Portal Frontend

This is the frontend application for the Job Portal, built with Next.js, React, and TypeScript.

## Features

- **User Authentication**: Secure login and registration
- **Job Listings**: Browse and search for jobs
- **Job Applications**: Apply for jobs with resume upload
- **User Dashboards**: Separate dashboards for job seekers and employers
- **Profile Management**: Update user profiles and company information
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Next.js 15**: React framework 
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling
- **React Hook Form**: For form handling
- **Zod**: For form validation
- **Supabase**: For file storage (resumes)
- **Lucide React**: For icons

## Project Structure

```
app/
├── api/                    # API routes for server-side operations
│   ├── applications/       # Application-related API endpoints
│   ├── auth/               # Authentication API endpoints
│
├── auth/                   # Authentication pages
│   ├── login/              # Login page
│   ├── register/           # Registration page
│
├── dashboard/              # Job seeker dashboard
├── employer-dashboard/     # Employer dashboard
│
├── employer/               # Employer-specific pages
│   ├── jobs/               # Job management
│   │   ├── create/         # Create job page
│   │   ├── [id]/           # Dynamic job routes
│   │   │   ├── edit/       # Edit job page
│   │   │   ├── applications/ # View job applications
│   ├── profile/            # Employer profile page
│
├── jobs/                   # Job-related pages
│   ├── [id]/               # Individual job page
│   │   ├── apply/          # Job application page
│
├── applications/           # User's job applications
├── profile/                # User profile page
│
├── globals.css             # Global styles
├── layout.tsx              # Root layout
└── page.tsx                # Home page

lib/                        # Utility functions
hooks/                      # Custom React hooks
```

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Add the following environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

### Running the Application

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The application will be available at http://localhost:3000

## Supabase Setup

For resume uploads to work, you need to set up Supabase:

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Create a storage bucket named "resumes"
4. Set the bucket's privacy settings to allow public access
5. Copy your Supabase URL and anon key to the `.env.local` file
