# Robstar Kasi - Secure B2B Auto-Parts Ordering Portal v2

This is the second version of the Robstar Kasi B2B auto-parts ordering portal for verified garages in Kenya. The implementation rebuilds the security features from scratch while preserving the existing frontend UI/UX.

## Table of Contents
- [Robstar Kasi - Secure B2B Auto-Parts Ordering Portal v2](#robstar-kasi---secure-b2b-auto-parts-ordering-portal-v2)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Security Improvements](#key-security-improvements)
  - [Local Development Setup](#local-development-setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Database Setup](#database-setup)
    - [Running the Migration](#running-the-migration)
    - [Starting the Server](#starting-the-server)
    - [Testing the API](#testing-the-api)
      - [Example: User Login](#example-user-login)
      - [Database Seeding (for local development)](#database-seeding-for-local-development)
  - [Deployment to Render](#deployment-to-render)
    - [Prerequisites](#prerequisites-1)
    - [Step-by-Step Deployment](#step-by-step-deployment)
    - [Important Notes for Render](#important-notes-for-render)
  - [Environment Variables](#environment-variables)
  - [API Endpoints](#api-endpoints)
    - [Authentication](#authentication)
    - [Products](#products)
    - [Orders](#orders)
    - [Statistics](#statistics)
    - [Legacy (Deprecated)](#legacy-deprecated)
  - [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Getting Help](#getting-help)
  - [License](#license)
  - [Acknowledgments](#acknowledgments)

## Overview

### Key Security Improvements
1. **Authentication**: Phone + password (admin-issued passwords, no self-serve signup)
2. **Session Management**: Server-side sessions with `express-session` + `connect-pg-simple` (PostgreSQL-backed)
3. **Authorization**: Role-based access control (`requireAuth`, `requireAdmin`, `requireBuyer` middleware)
4. **Database Migration**: Replaced `sql.js` with PostgreSQL for production-ready concurrency and scalability
5. **Input Validation**: Comprehensive validation using `express-validator` for all endpoints
6. **Security Hardening**: 
   - `helmet()` for security headers
   - Restricted CORS (configured via environment variable)
   - Rate limiting (global and strict on auth endpoints)
   - Request body size limits (100KB)
   - Parameterized queries to prevent SQL injection
7. **Transaction Safety**: ACID transactions for order placement to prevent race conditions
8. **Data Protection**: 
   - Passwords hashed with bcryptjs (12 salt rounds)
   - Account lockout after 5 failed login attempts (30-minute lock)
   - No sensitive data (password hashes) returned in API responses
   - Phone numbers only accessible to authorized users

## Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) (v12 or higher)
- Git

### Installation

1. Clone the repository and checkout the `security-rewrite` branch:
   ```bash
   git clone <repository-url>
   cd robstar-kasi
   git checkout security-rewrite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Database Setup

1. Start your local PostgreSQL service.
2. Create a database for the application:
   ```bash
   createdb robstar_kasi
   ```
3. Copy the example environment file and update it:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` to set your local PostgreSQL connection:
   ```
   DATABASE_URL=postgresql://localhost:5432/robstar_kasi
   SESSION_SECRET=your_local_dev_secret_here
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   PORT=3001
   ```

### Running the Migration

The migration script will create the schema and migrate any existing data to supabase (if present).

```bash
npm run migrate
```

*Note: The first time you run this, it will create the tables. If you have existing data in `robstar.sqlite` (from the prototype), it will migrate that data. If not, it will just create the empty schema.*

### Starting the Server

```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

### Testing the API

You can test the API using tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/).

#### Example: User Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0722100001","password":"your_password_here"}'
```

*Note: For the demo data, passwords need to be set via the admin route or by updating the database directly. See the [Database Seeding](#database-seeding) section below.*

#### Database Seeding (for local development)

If you need to seed the database with demo users and products (since the migration script only moves existing SQLite data), you can run:

```bash
npm run seed
```

This will create:
- 4 demo users (3 buyers, 1 admin)
- 12 demo products
- Some demo orders

*Demo credentials:*
- **Admin**: Phone: `0700000000`, Password: `admin123` (you should change this after first login)
- **Buyers**: 
  - James Mwangi: `0722100001` / `buyer123`
  - Fatuma Hassan: `0733200002` / `buyer123`
  - Peter Kamau: `0711300003` / `buyer123`

*After first login, users should change their password via the `/api/auth/change-password` endpoint.*

## Deployment to Render

### Prerequisites
- A [Render](https://vercel.com/) account
- The code pushed to a GitHub repository (Render connects to your repo)

### Step-by-Step Deployment

1. **Create a PostgreSQL Database on Render**:
   - In the Render dashboard, click "New" → "PostgreSQL"
   - Choose a name (e.g., `robstar-kasi-db`)
   - Select the region closest to your users
   - Leave the version as default
   - Click "Create Database"w

2. **Note the Database Connection Details**:
   - After creation, go to the database's dashboard
   - Copy the **Internal Database URL** (you'll need this for the `DATABASE_URL` environment variable)

3. **Create a New Web Service on Render**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository containing the `security-rewrite` branch
   - Configure the service:
     - **Name**: `robstar-kasi`
     - **Region**: Same as your database (for lower latency)
     - **Branch**: `security-rewrite` (or main if you've merged)
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Click "Create Web Service"

4. **Configure Environment Variables**:
   - In your web service's dashboard, go to "Environment"
   - Add the following variables:
     - `DATABASE_URL`: [Internal Database URL from step 2]
     - `SESSION_SECRET`: [Generate a strong random string, e.g., 32+ characters]
     - `CORS_ORIGIN`: [Your frontend URL, e.g., `https://your-frontend.onrender.com`]
     - `NODE_ENV`: `production`
     - `PORT`: [Leave blank, Render will set this automatically]
   - Click "Save Changes"

5. **Trigger Initial Deploy**:
   - Render will automatically detect the `npm start` command and begin deployment
   - Watch the logs for the migration to run on startup (we've added a startup migration check)

6. **Verify Deployment**:
   - Once deployed, visit the URL provided by Render (e.g., `https://robstar-kasi.onrender.com`)
   - Test the API endpoints (e.g., `GET https://robstar-kasi.onrender.com/api/products` should return product data)

### Important Notes for Render
- The application will automatically run the migration script on startup if the database schema doesn't match
- Ensure your PostgreSQL instance allows connections from Render's IP addresses (Render handles this automatically for internal databases)
- The first deploy may take a few minutes as dependencies are installed and the migration runs

## Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` | Yes |
| `SESSION_SECRET` | Secret for signing session cookies | `a_very_long_random_string_here` | Yes |
| `CORS_ORIGIN` | Allowed origin for CORS requests | `http://localhost:3000` (dev) or `https://yourdomain.com` (prod) | Yes |
| `NODE_ENV` | Environment mode | `development` or `production` | Yes |
| `PORT` | Port to listen on | `3001` (dev) or Render-assigned (prod) | No (Render provides) |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate with phone and password
- `POST /api/auth/logout` - Log out (destroys session)
- `POST /api/auth/change-password` - Change password (requires authentication)
- `GET /api/auth/me` - Get current user profile (requires authentication)
- `POST /api/admin/users` - Admin only: Create a new buyer user with initial password
- `POST /api/admin/users/:id/reset-password` - Admin only: Reset a user's password (generates temporary one)

### Products
- `GET /api/products` - Get list of products (public, no auth required)
- `GET /api/products/categories` - Get list of product categories (public)

### Orders
- `GET /api/orders` - Get orders (buyers: own orders only; admins: all orders, optional buyer_id filter)
- `GET /api/orders/:id` - Get specific order (buyers: only if owned; admins: any)
- `POST /api/orders` - Place new order (buyers only, buyer_id derived from session)
- `PATCH /api/orders/:id/status` - Update order status (admin only)

### Statistics
- `GET /api/stats` - Get system statistics (admin only)

### Legacy (Deprecated)
- `POST /api/users/login` - **DEPRECATED** - Returns 410, use `/api/auth/login` instead

## Troubleshooting

### Common Issues

1. **Database Connection Failures**
   - **Symptoms**: Server fails to start, error connecting to database
   - **Solution**: 
     - Verify `DATABASE_URL` in `.env` (local) or Render environment variables
     - Ensure PostgreSQL service is running (local)
     - Check that the database exists and credentials are correct

2. **Migration Errors**
   - **Symptoms**: Errors during `npm run migrate` or on startup
   - **Solution**:
     - Check the error message for specific SQL syntax issues
     - Ensure the PostgreSQL user has sufficient privileges (CREATE, INSERT, etc.)
     - For local development, try dropping the database and recreating it

3. **Authentication Failures**
   - **Symptoms**: Login fails with "Invalid phone or password"
   - **Solution**:
     - Verify the phone number exists in the database
     - Check that the password is correct (demo passwords are set in seed data)
     - Ensure the account is not locked (wait 30 minutes or ask admin to reset)
     - Verify password hashing is working correctly

4. **CORS Issues**
   - **Symptoms**: Frontend cannot connect to API (browser console shows CORS errors)
   - **Solution**:
     - Verify `CORS_ORIGIN` matches exactly what your frontend is served from
     - Include the protocol (http/https) and port if non-standard
     - In development, ensure your frontend is running on the specified origin

5. **Session Cookie Not Being Set**
   - **Symptoms**: After login, subsequent requests are unauthenticated
   - **Solution**:
     - Check that the cookie is being set in the response (look for `Set-Cookie` header)
     - Ensure your frontend is sending cookies with requests (credentials: 'include')
     - Verify the cookie settings (secure, sameSite) match your deployment context

### Getting Help
If you encounter issues not covered here, please check:
- The application logs (stdout/stderr)
- GitHub issues for this repository
- Render logs (if deployed to Render)

## License

This project is proprietary and confidential. All rights reserved.

## Acknowledgments
- Original prototype provided by the Robstar Kasi team
- Security hardening implementation following OWASP best practices