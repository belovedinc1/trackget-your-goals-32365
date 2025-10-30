# Trackget Project Structure

## Overview
Trackget is an AI-powered personal finance management application built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Phase Completion Status

### ✅ Phase 1-8: COMPLETED
All previous phases (Project Setup, Authentication, Expense Management, Savings, Dashboard, EMI Management, Price Tracking, Reporting & Analytics) are fully implemented.

### ✅ Phase 9: AI Financial Assistant (COMPLETED)
- Conversational AI chat interface with streaming responses
- Real-time financial data context integration
- Chat history persistence in Supabase
- Voice input capability using Web Speech API
- Suggested questions and quick replies
- Conversation management with sidebar
- Natural language financial queries
- Context-aware advice based on user's actual financial data

### ✅ Phase 10: Settings, Profile & Security (COMPLETED)
- Comprehensive settings page with multiple sections
- Profile information management with full name updates
- Notification preferences (email, push, EMI reminder days)
- Budget settings with monthly and category-wise limits
- Data export functionality (CSV format for all user data)
- Security settings with password change
- Two-factor authentication toggle
- Account deletion flow with confirmation
- Profile page with financial statistics dashboard
- Achievement system with 6 unlockable achievements
- Progress tracking for financial goals
- User statistics cards (net balance, income, expenses, savings)

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

## Phase 6: EMI & Loan Management ✅

- EMI loans and payments tables with RLS policies
- Loan tracking with calculator (principal, rate, tenure)
- EMI schedule generator with detailed breakdown
- Payment recording and status tracking
- Notification settings (email + browser push)
- User preferences management
- Individual loan detail pages with payment schedule
- Upcoming payment alerts and overdue tracking

## Phase 7: Product Price Tracking ✅

- Tracked products and price history tables with RLS policies
- Product tracking with URL, current price, and target price
- Multi-platform support (Amazon, Flipkart, etc.)
- Add product dialog with platform selection
- Active/paused product status toggle
- Price history visualization with Recharts
- Mock price scraping edge function (check-prices)
- Price trend charts with lowest, average, and highest prices
- Price drop detection and alerts (logged)

## Phase 8: Reporting & Analytics ✅

- Comprehensive reports dashboard at /reports
- Date range filtering with calendar component
- Summary cards for expenses, savings, and EMI
- Chart components:
  - IncomeVsExpenseChart (Bar chart for monthly spending trends)
  - CategoryBreakdownChart (Pie chart for expense distribution)
  - SavingsSummaryChart (Progress bars for all savings goals)
- AI-powered financial insights using Lovable AI (Gemini)
- Export functionality:
  - PDF export with jsPDF (detailed financial summary)
  - CSV export with Papa Parse (data analysis ready)
- Custom hook: useReportData for aggregated financial data
- Edge function: generate-report-insights for AI analysis
- Responsive layout with loading states and error handling

## Next Steps
- User feedback and feature enhancements
- Performance optimization and analytics
