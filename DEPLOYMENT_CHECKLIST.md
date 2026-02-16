# Pre-Deployment Checklist for EduConnect on Render

## ✅ Code Repository
- [ ] All code committed to GitHub repository
- [ ] `.env` file is in `.gitignore` (DO NOT commit secrets)
- [ ] `.env.production.example` file exists with placeholder values
- [ ] `package.json` contains all dependencies
- [ ] `package-lock.json` is committed

## ✅ Build Configuration
- [ ] `npm run build` works locally without errors
- [ ] `npm start` runs the production build successfully
- [ ] Build output is in `dist/` directory
  - [ ] Static files in `dist/public/`
  - [ ] Server code in `dist/index.cjs`
- [ ] No hardcoded localhost URLs in client code
- [ ] Client uses `window.location.origin` for API calls

## ✅ Database Setup
- [ ] PostgreSQL database created on Render
- [ ] Database URL obtained from Render dashboard
- [ ] Migrations file exists: `migrations/0000_brief_amphibian.sql`
- [ ] `apply-migration.js` script is present
- [ ] `drizzle.config.ts` correctly configured
- [ ] `db:push` script works locally: `npm run db:push`

## ✅ Environment Variables
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SESSION_SECRET` - Generated using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] `NODE_ENV` - Set to `production`
- [ ] `PORT` - Will be set by Render automatically
- [ ] `.env` file created with above values (NOT committed to git)

## ✅ Server Configuration
- [ ] Server listens on dynamic `PORT` from environment
- [ ] Server binds to `0.0.0.0` for external access
- [ ] Express is configured for production
- [ ] Session store uses PostgreSQL (via `connect-pg-simple`)
- [ ] HTTPS/SSL is handled by Render
- [ ] Trust proxy is enabled for production

## ✅ Rendering Configuration
- [ ] `render.yaml` file is present
- [ ] Service name configured in `render.yaml`
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Database service configured with correct name

## ✅ Deployment Files
- [ ] `render.yaml` at root of repository ✓
- [ ] `RENDER_DEPLOY.md` with detailed instructions ✓
- [ ] `.npmrc` for optimized npm installs ✓
- [ ] `.env.production.example` as reference ✓

## 🚀 Render Dashboard Setup
1. [ ] Render account created at https://render.com
2. [ ] GitHub repository connected to Render
3. [ ] PostgreSQL database provisioned
4. [ ] Web Service created with correct:
    - [ ] Build command: `npm run build`
    - [ ] Start command: `npm start`
    - [ ] Root directory: (leave empty)
    - [ ] Runtime: Node
5. [ ] Environment variables added:
    - [ ] `DATABASE_URL`
    - [ ] `SESSION_SECRET`
    - [ ] `NODE_ENV=production`
6. [ ] Service connected to PostgreSQL database

## 🔍 Pre-Launch Testing

### Local Production Build
```bash
# Build locally
npm run build

# Test production locally
npm start

# Visit http://localhost:5000
```

- [ ] Client loads successfully
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] Database queries execute
- [ ] No console errors

### Render Staging (Optional)
- [ ] Deploy to Render
- [ ] Check logs: `npm run db:push`
- [ ] Verify database migrations ran
- [ ] Test all features work

## 🎯 Common Issues & Solutions

### Build Fails
- [ ] Check: `npm run build` works locally
- [ ] Verify all imports are correct
- [ ] Check for missing dependencies in `package.json`

### Database Connection Error
- [ ] Verify DATABASE_URL is correctly copied
- [ ] Ensure PostgreSQL database is up and running
- [ ] Check user permissions on database

### Static Files Not Found
- [ ] Verify `npm run build` creates `dist/public/`
- [ ] Check `server/static.ts` path is correct
- [ ] Ensure client build output exists

### Session/Login Issues
- [ ] Verify SESSION_SECRET is set in environment
- [ ] Check PostgreSQL is accessible for session store
- [ ] Clear browser cookies and retry

## 📝 Deployment Commands Reference

```bash
# Build for production
npm run build

# Start production server
npm start

# Push database migrations
npm run db:push

# Local development
npm run dev

# Type checking
npm check
```

## 🔐 Security Checklist
- [ ] DATABASE_URL not committed to repository
- [ ] SESSION_SECRET is strong (32+ bytes)
- [ ] HTTPS enabled on Render (automatic)
- [ ] Cookies set to secure in production
- [ ] Trust proxy enabled for production
- [ ] CORS properly configured if needed

## 📊 Performance Optimization
- [ ] Build output is minified
- [ ] esbuild is configured with production settings
- [ ] npm install uses optimized settings (.npmrc)
- [ ] Node modules are properly bundled
- [ ] Static files are served with caching headers

## ✨ Final Steps
1. [ ] Read through RENDER_DEPLOY.md
2. [ ] Verify all checklist items above
3. [ ] Test production build locally
4. [ ] Deploy to Render
5. [ ] Monitor logs and verify functionality
6. [ ] Test all user flows on production
7. [ ] Set up Render alerts (optional)

---

**Once you've verified everything above, you're ready to deploy! 🎉**

If you encounter any issues, check:
1. Render dashboard logs
2. Build output in terminal
3. RENDER_DEPLOY.md troubleshooting section
4. Environment variables are correctly set
