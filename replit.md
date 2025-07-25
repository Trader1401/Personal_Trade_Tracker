# IntraDay Trading Dashboard

## Overview

This is a modern, full-stack web application designed for Indian cash market intraday traders. The application provides comprehensive trade tracking, analytics, strategy management, and psychology journaling capabilities. Built with React.js frontend and Express.js backend, it features a clean, mobile-responsive design optimized for fast performance and real-time trading data management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Migration to Replit Environment (2025-01-24) - COMPLETED
- ✅ Successfully migrated from Replit Agent to standard Replit environment
- ✅ Enhanced Google Sheets integration with comprehensive Apps Script code
- ✅ Added robust error handling and timeout management for external API calls
- ✅ Implemented performance monitoring and health check endpoints
- ✅ Created comprehensive documentation for integration and testing
- ✅ Added backend performance optimizations and security measures
- ✅ Fixed Google Apps Script configuration validation with proper error messages
- ✅ Created troubleshooting guide for common integration issues
- ✅ Enhanced backend with improved Google Sheets client and API testing tools
- ✅ Added comprehensive documentation for API testing and performance monitoring

### Current Status - ALL CRITICAL ISSUES FIXED ✅
- **Project Status**: Production-ready with accurate calculations and proper UI display
- **P&L Calculations**: Fixed all calculation issues - P&L computed correctly from entry/exit prices
- **UI Color Coding**: Green for profit, red for loss, proper visibility in dark mode
- **Test Data Control**: Demo data only appears in development, production is clean
- **Google Sheets Integration**: Complete field mapping, duplicate prevention, psychology data sync working
- **Backend Architecture**: Optimized for fast performance (8-second timeout), proper error handling
- **Dark Mode Fixes**: All text visible with proper contrast, profit/loss colors working correctly
- **Dynamic Configuration**: Google Sheet ID and URL can be changed anytime through settings UI
- **Netlify Deployment**: Complete deployment guide and configuration files ready
- **Data Integrity**: All calculations verified, no test data pollution in production

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Animations**: Framer Motion for smooth page transitions and interactions
- **State Management**: React Context API for global state (AppContext)
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Data Storage**: Google Sheets integration only (no database dependencies)
- **API Design**: RESTful API with proper error handling
- **Development**: Vite for hot module replacement and fast builds

### Build System
- **Frontend Build**: Vite with React plugin
- **Backend Build**: esbuild for server bundling
- **Development**: Concurrent development server with Vite middleware
- **TypeScript**: Shared types between frontend and backend via `/shared` directory

## Key Components

### Data Schema
The application uses TypeScript interfaces and Zod schemas for data validation:

1. **Trades**: Core trading data including entry/exit prices, P&L, emotions, and strategy references
2. **Strategies**: Strategy definitions with descriptions, screenshots, and performance tracking
3. **Psychology Entries**: Monthly psychological reflections and trading analysis
4. **Settings**: Application configuration for Google Sheets integration

### Frontend Pages
- **Dashboard**: Overview with quick stats, recent trades, calendar, and trade entry form
- **Trade Log**: Comprehensive trade management with filtering and detailed views
- **Analytics**: Charts and performance metrics with P&L tracking and win rates
- **Strategies**: Strategy management with performance tracking per strategy
- **Psychology**: Monthly reflection journaling with emotional tracking
- **Settings**: Google Sheets integration configuration

### External Integrations
- Google Sheets API integration for data synchronization
- Screenshot image preview capabilities
- Mobile-responsive calendar component for date-based trade filtering

## Data Flow

### Client-Server Communication
1. React components use TanStack Query hooks for data fetching
2. API requests go through a centralized query client with error handling
3. Server responds with JSON data and proper HTTP status codes
4. Optimistic updates and cache invalidation for real-time feel

### Data Storage Strategy
- **Primary Storage**: Google Sheets via App Script integration
- **Local Cache**: In-memory storage for fast access during session
- **Auto-Sync**: All data changes automatically sync to Google Sheets
- **Local Storage**: Settings and preferences cached locally

### State Management
- Global app state managed via React Context
- Server state cached and synchronized via TanStack Query
- Form state managed locally with React Hook Form
- UI state (modals, filters) managed with local component state

## External Dependencies

### Core Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@hookform/resolvers**: Form validation integration
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting utilities

### UI Dependencies
- **@radix-ui/***: Accessible, unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework
- **framer-motion**: Animation library for smooth transitions
- **embla-carousel-react**: Touch-friendly carousel component
- **recharts**: Charts and data visualization
- **wouter**: Lightweight routing solution

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type safety and developer experience
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Assets**: Static files served from build directory

### Environment Configuration
- **NODE_ENV**: Environment specification (development/production)
- **VITE_GOOGLE_SHEET_ID**: Google Sheets integration ID (configured via UI)
- **VITE_GOOGLE_SCRIPT_URL**: Google Apps Script webhook URL (configured via UI)

### Production Considerations
- Server serves static files from `dist/public` in production
- Google Sheets integration is the primary data storage mechanism
- Mobile-responsive design ensures compatibility across devices
- PWA-ready architecture for potential app-like experience
- No database setup required - only Google Sheets integration needed

The application prioritizes performance, user experience, and data integrity while maintaining a clean, professional interface suitable for active trading environments.