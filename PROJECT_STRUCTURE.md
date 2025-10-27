# Trackget Project Structure

## Overview
Trackget is an AI-powered personal finance management application built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Folder Structure

```
trackget/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── landing/         # Landing page sections
│   │   └── ui/              # Shadcn UI components
│   ├── hooks/               # Custom React hooks
│   ├── integrations/        # Third-party integrations
│   │   └── supabase/        # Supabase client and types
│   ├── lib/                 # Utility functions and helpers
│   ├── pages/               # Page components (routes)
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and design system
├── supabase/               # Supabase configuration
│   └── config.toml         # Supabase project config
├── public/                 # Static assets
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── tsconfig.json           # TypeScript configuration
```

## Design System

### Color Palette
- **Primary (Navy Blue)**: Trust and financial stability - `hsl(221, 64%, 33%)`
- **Secondary (Forest Green)**: Growth and savings - `hsl(163, 94%, 30%)`
- **Accent (Golden Yellow)**: Attention and alerts - `hsl(43, 96%, 56%)`
- **Background (Cool Gray)**: Clean interface - `hsl(214, 32%, 96%)`
- **Foreground (Charcoal)**: Readable text - `hsl(217, 33%, 17%)`

### Typography
- Headings: Inter/Nunito Sans (system font stack)
- Body: System font stack for cross-platform consistency
- Numerical: Monospace for data alignment

## Key Technologies

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Radix UI (Shadcn)
- **Charts**: Recharts
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form + Zod

## Development

### Running Locally
```bash
npm install
npm run dev
```

### Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key
- `OPENAI_API_KEY`: OpenAI API key (stored in Supabase secrets)

## Phase 1 Completion ✓

- [x] Initialize project with React + TypeScript + Vite + Tailwind CSS
- [x] Setup Supabase project connection
- [x] Configure ESLint and project structure
- [x] Setup frontend folder structure
- [x] Setup backend connection using Supabase client SDK
- [x] Define environment variables
- [x] Integrate UI libraries (Radix UI, Recharts)
- [x] Implement color palette and design system
- [x] Create base layout components (Header, Footer)
- [x] Build landing page with Hero and Features sections

## Phase 2 Completion ✓

- [x] Database schema design and migration (profiles table)
- [x] User authentication with Supabase Auth
- [x] Email-based login, register, and password reset
- [x] Form validation with Zod and React Hook Form
- [x] Protected routes with authentication checks
- [x] Session management with proper persistence
- [x] Error handling and success messages with toast notifications
- [x] Auth context provider for global state management
- [x] Login, Register, and Forgot Password pages
- [x] Dashboard page with protected route

## Phase 3 Completion ✓

- [x] Global application layout with sidebar navigation
- [x] Responsive top navigation bar with user menu
- [x] Collapsible sidebar with main navigation and account sections
- [x] Enhanced Dashboard page with summary cards
- [x] Recent transactions widget with mock data
- [x] Upcoming EMI reminders section
- [x] AI insights panel with personalized recommendations
- [x] Placeholder pages for all main features:
  - Expenses page with "Add Expense" action
  - Savings page for goal tracking
  - EMI & Loans management page
  - Price Tracking page for product monitoring
  - Reports page for financial analytics
  - Profile page with user information
  - Settings page with notification preferences
  - AI Assistant page for financial queries
- [x] Complete React Router navigation structure
- [x] Responsive design for desktop and mobile devices
- [x] User menu with profile, settings, and logout options

## Phase 4: Expense Management Module ✅

- Expenses table with RLS policies
- Receipt storage bucket
- AI categorization edge function
- CRUD operations with custom hook
- Expense list with filters and search
- Add expense dialog with receipt upload
- Category-based summaries

## Phase 5: Savings Goals Management ✅

- Savings goals and transactions tables with RLS
- Goal creation with target amounts and deadlines
- Progress tracking with visual indicators
- Individual goal detail pages with charts
- Transaction management (deposits/withdrawals)
- AI-powered savings recommendations
- Progress visualization with Recharts

## Next Steps (Phase 6)
- Savings goals with progress tracking and milestones
- EMI calculator and payment reminders
- Price tracking for products across e-commerce platforms
- Advanced reporting with charts and analytics
- Enhanced AI insights with spending pattern analysis
