# ShweMinthar 2D3D - Lottery Betting Application

## Overview

ShweMinthar 2D3D is a fullstack lottery betting application built with a modern TypeScript stack. The application provides a complete lottery betting system with 2D and 3D number betting, user authentication, wallet management, referral system, and administrative controls.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React Context for authentication
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database**: PostgreSQL using Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with structured error handling

### Database Schema
- **Users**: User accounts with authentication, balance, referral codes, and admin flags
- **Bets**: Lottery bets with types (2D/3D), numbers, amounts, and status tracking
- **Results**: Daily lottery results for both 2D and 3D draws
- **Transactions**: Financial transactions including deposits, withdrawals, and payouts
- **Audit Logs**: Administrative action tracking

## Key Components

### Authentication System
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control (user/admin)
- Protected routes with middleware

### Betting System
- Support for 2D (2-digit) and 3D (3-digit) lottery betting
- Real-time number pad interface for bet placement
- Automatic payout calculation based on fixed odds (2D: 85x, 3D: 500x)
- Bet status tracking (pending, won, lost)

### Wallet Management
- User balance tracking with decimal precision
- Deposit and withdrawal request system
- Transaction approval workflow for administrators
- Commission tracking for referral rewards

### Referral System
- Unique referral codes for each user
- Commission tracking for successful referrals
- Shareable referral links with native sharing API

### Administrative Dashboard
- Result entry system for daily draws
- Transaction approval/rejection interface
- Bet analytics with CSV export functionality
- Dashboard statistics and user management

## Data Flow

1. **User Registration/Login**: Users authenticate via username/password, receive JWT tokens
2. **Bet Placement**: Users select numbers and amounts, bets are validated and stored
3. **Result Processing**: Admins enter daily results, system automatically evaluates bets
4. **Financial Transactions**: Users request deposits/withdrawals, admins approve/reject
5. **Referral Processing**: New user registrations with referral codes trigger commission payments

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Styling**: Tailwind CSS, Class Variance Authority, clsx
- **Database**: Drizzle ORM, Postgres.js, Neon Database serverless
- **Authentication**: jsonwebtoken, bcrypt
- **Development**: Vite, TypeScript, ESBuild

### Database Connection
- PostgreSQL database accessed via `DATABASE_URL` environment variable
- Neon Database serverless driver for connection pooling
- Drizzle Kit for schema migrations and database management

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React application to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Development**: Concurrent TypeScript compilation with hot reloading

### Environment Configuration
- Development mode with Vite middleware for hot reloading
- Production mode serves static files from Express
- Database migrations handled via Drizzle Kit commands

### File Structure
- `client/`: React frontend application
- `server/`: Express backend with API routes and middleware
- `shared/`: Common TypeScript schemas and types
- `migrations/`: Database migration files

## Changelog
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.