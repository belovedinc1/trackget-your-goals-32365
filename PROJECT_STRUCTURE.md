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

## Next Steps (Phase 2)
- Database schema design and migration
- Authentication implementation (Login/Register)
- User profile management
- Core feature implementations
