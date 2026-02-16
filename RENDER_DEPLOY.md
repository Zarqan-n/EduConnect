# Render Deployment Guide for EduConnect

## Prerequisites
- A Render account (https://render.com)
- Your repository pushed to GitHub
- PostgreSQL database (can be provisioned via Render)

## Step-by-Step Deployment

### 1. Create a PostgreSQL Database on Render
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Give it a name (e.g., `educonnect-db`)
4. Choose a region close to your users
5. Select appropriate plan (free tier available)
6. Click "Create Database"
7. Wait for the database to be created
8. Copy the **External Database URL** (it will look like: `postgresql://...`)

### 2. Create a Web Service
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Enter deployment settings:
   - **Name**: `educonnect`
   - **Branch**: `main` (or your main branch)
   - **Root Directory**: Leave empty (or set to `/` if needed)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan

### 3. Configure Environment Variables
In the "Environment" section of your Web Service, add:

```
DATABASE_URL = [paste your PostgreSQL URL from step 1]
NODE_ENV = production
SESSION_SECRET = [generate a strong random string - see below]
PORT = 10000
```

**To generate SESSION_SECRET:**
Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Database Migrations
After deployment, you need to run migrations:

**Option A: Using Render Shell**
1. In your Render dashboard, go to your Web Service
2. Click "Shell" tab
3. Run: `npm run db:push`

**Option B: Automatic (Recommended)**
1. Add a migration step to your build process
2. Update your `render.yaml` if using infrastructure-as-code

The database migrations are handled by:
- `migrations/0000_brief_amphibian.sql` - Contains all database tables and schemas
- `apply-migration.js` - Script to run migrations on startup
- `drizzle.config.ts` - Drizzle ORM configuration

### 5. Deploy
1. Click "Deploy" button
2. Wait for the build to complete (2-5 minutes)
3. Once "Live" status is shown, your app is deployed!
4. Click the service URL to access your application

## Important Configuration Details

### Port Binding
- Render assigns a dynamic PORT via environment variable
- Your app is already configured to use this (see `server/index.ts`)
- Default PORT: 10000

### Database Connection
- Uses PostgreSQL via Drizzle ORM
- Session storage uses PostgreSQL (via `connect-pg-simple`)
- Migrations are automatically run on build

### Security
- HTTPS is automatically enabled by Render
- Secure session cookies for production
- Trust proxy configuration is enabled
- All environment variables are encrypted

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure `npm run build` works locally
- Check Render build logs for specific errors

### Database Connection Error
- Verify DATABASE_URL is correctly copied
- Check that database user has proper permissions
- Ensure migrations have run (`npm run db:push`)

### Session Issues
- Verify SESSION_SECRET is set
- Check PostgreSQL database is accessible
- Look for connection pool exhaustion in logs

### Static Files Not Serving
- The built client files are in `dist/public`
- Vite build output is configured correctly
- Server is serving static files in production via `serveStatic()`

## Local Testing Before Deployment

Test the production build locally:
```bash
npm run build
npm start
```

Then open http://localhost:5000 (or your PORT)

## Redeploying

Any push to your main branch will:
1. Trigger a new build
2. Run `npm run build`
3. Start the new instance with `npm start`

To manually trigger a redeploy:
- Go to Render dashboard
- Click your service
- Scroll down to "Recent Deploys"
- Click "Redeploy"

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | No | Set by Render (default 10000) |
| `SESSION_SECRET` | Yes | Random string for session encryption |

## API Endpoints

Your API will be available at:
```
https://your-service-name.onrender.com/api/*
```

Client will be available at:
```
https://your-service-name.onrender.com/
```

## Support

For Render-specific issues, check:
- https://render.com/docs
- Render Dashboard Logs
- Your application logs in Render console

For EduConnect-specific issues, check:
- `package.json` for scripts
- `server/index.ts` for server configuration
- `.env` for environment setup
