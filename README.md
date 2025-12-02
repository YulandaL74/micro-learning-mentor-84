# Micro-Learning Mentor

An AI-powered micro-learning platform delivering 5-minute daily lessons for niche professional skills. Designed for mid-to-senior-level professionals and trainers who need to upskill quickly through bite-sized, scenario-based learning.

![License](https://img.shields.io/badge/License-Proprietary-red)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-Deployed-success)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E)

## 🌟 Features

### Core Functionality
- **5-Minute Micro-Lessons**: Bite-sized, focused lessons designed for busy professionals
- **Scenario-Based Learning**: Interactive, real-world scenarios that mirror workplace challenges
- **Interactive Quizzes**: Knowledge checks with immediate feedback after each lesson
- **Skill Assessment**: Comprehensive assessment quiz to determine skill levels across categories
- **Personalized Recommendations**: AI-powered lesson suggestions based on skill assessments

### User Experience
- **Progress Dashboard**: Track learning streaks, completed lessons, and skill progression
- **Lessons Library**: Browse all available lessons with filtering by category and difficulty
- **Dark Mode**: Comfortable learning experience in any lighting condition
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices

### Content Categories
- **Executive Communication**: Leadership messaging, stakeholder management, crisis communication
- **Compliance Workflows**: Regulatory compliance, audit preparation, policy implementation
- **AI Literacy**: Generative AI tools, prompt engineering, AI governance

## 🚀 Technology Stack

### Frontend
- **React 18.3** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **React Router** - Client-side routing
- **TanStack Query** - Powerful data fetching and caching
- **next-themes** - Dark mode support

### Backend
- **Supabase** - PostgreSQL database with real-time capabilities
- **Row Level Security (RLS)** - Database-level security policies
- **Edge Functions** - Serverless backend logic
- **Authentication** - Built-in user authentication system

### Additional Libraries
- **Lucide React** - Beautiful, consistent icons
- **React Hook Form** - Performant form management
- **Zod** - TypeScript-first schema validation
- **date-fns** - Modern date utility library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **Git** - For version control

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd micro-learning-mentor
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

The project uses Supabase for backend services. The `.env` file is auto-generated and includes:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

**Note**: These variables are automatically managed. Do not edit the `.env` file manually.

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Setup

The project uses Supabase for backend functionality. The database schema includes:

### Tables
- **profiles** - User profile information
- **lessons** - Lesson content and metadata
- **quiz_questions** - Quiz questions for each lesson
- **lesson_progress** - User progress tracking
- **skill_assessments** - User skill assessment results
- **user_streaks** - Learning streak tracking
- **user_roles** - Role-based access control

### Security
All tables are protected with Row Level Security (RLS) policies to ensure users can only access their own data.

## 🚢 Deployment

### Self-Hosting

You can deploy the frontend to any static hosting provider:

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The `dist` folder contains the production build ready for deployment to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

**Important**: For self-hosting, you'll need to configure the Supabase connection separately.

## 📁 Project Structure

```
micro-learning-mentor/
├── src/
│   ├── components/        # Reusable React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── lesson/       # Lesson-specific components
│   │   └── ...
│   ├── pages/            # Route-level components
│   │   ├── Index.tsx     # Landing page
│   │   ├── Auth.tsx      # Authentication
│   │   ├── Dashboard.tsx # User dashboard
│   │   ├── LessonsLibrary.tsx
│   │   └── LessonPlayer.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── integrations/     # External service integrations
│   │   └── supabase/     # Supabase client and types
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Application entry point
│   └── index.css         # Global styles and design tokens
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
├── public/               # Static assets
└── ...config files
```

## 🎨 Design System

The project uses a custom design system built with Tailwind CSS:

- **Design Tokens**: Defined in `src/index.css`
- **Theme Configuration**: `tailwind.config.ts`
- **Semantic Color Variables**: HSL-based color system
- **Dark Mode**: System-based or manual toggle
- **Typography**: Professional, calm aesthetic

## 🤝 Contributing

This is a personal project with public read access. While you're welcome to view and download the code, direct contributions are not accepted at this time.

If you'd like to use this project as a foundation for your own work:
1. Fork the repository
2. Make your modifications in your fork
3. Deploy your version independently

## 📄 License

This project is the intellectual property of the repository owner. All rights reserved.

You may:
- View and study the code
- Download and run the code locally for educational purposes

You may not:
- Use this code commercially without permission
- Redistribute this code
- Claim this work as your own

## 🆘 Support

For questions or issues:
1. Review the code comments and inline documentation
2. Open an issue in this repository for bug reports

---

**Built with passion for professional learning**
