# 🚀 Quick Render Deployment Guide for EduConnect

## TL;DR - Deploy in 5 Minutes

### 1. Create PostgreSQL Database
```
1. Go to https://dashboard.render.com
2. Click "New +" → "PostgreSQL"
3. Create it, then copy the External Database URL
```

### 2. Create Web Service
```
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Set Build: npm run build
4. Set Start: npm start
```

### 3. Add Environment Variables
```
DATABASE_URL = [your PostgreSQL URL]
SESSION_SECRET = [run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
NODE_ENV = production
```

### 4. Deploy & Run Migrations
```
Click "Deploy"
Wait for build (2-5 minutes)
When ready, go to Service shell and run: npm run db:push
```

### 5. Done! 🎉
Your app is now live at `https://your-service-name.onrender.com`

---

## File Structure

New deployment files created:

```
📁 EduConnect/
├── 📄 render.yaml              ← Infrastructure as code (optional)
├── 📄 RENDER_DEPLOY.md          ← Full deployment guide
├── 📄 DEPLOYMENT_CHECKLIST.md   ← Pre-deployment checklist
├── 📄 .env.production.example   ← Env vars reference
├── 📄 .npmrc                    ← npm optimization
└── 📄 .gitignore               ← Updated with .env
```

---

## What's Already Configured ✓

Your app is **already production-ready**:

✓ Server listens on dynamic PORT from environment
✓ Database uses environment variable
✓ Session storage configured for PostgreSQL
✓ HTTPS/SSL auto-enabled by Render
✓ Auth configured for production
✓ API uses relative paths (works anywhere)
✓ Build optimized for deployment
✓ Static files configured correctly

---

## Key Environment Variables

| Variable | Value | How to Get |
|----------|-------|-----------|
| `DATABASE_URL` | PostgreSQL connection | Copy from Render DB dashboard |
| `SESSION_SECRET` | Random 32-byte hex | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NODE_ENV` | production | Set to: `production` |
| `PORT` | Auto-set by Render | Leave blank (Render will set it) |

---

## Testing Locally First (Recommended)

Before deploying to Render, test your production build:

```bash
# Build for production
npm run build

# Start the production server
npm start
```

Then visit: `http://localhost:5000`

Everything should work exactly like on Render.

---

## Detailed Guides

- **Full Instructions**: See `RENDER_DEPLOY.md`
- **Pre-Flight Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Troubleshooting**: See `RENDER_DEPLOY.md` → Troubleshooting section

---

## Quick Commands Reference

```bash
npm run dev          # Development server
npm run build        # Build for production
npm start            # Run production server
npm run db:push      # Apply database migrations
npm run check        # TypeScript type checking
```

---

## Support

For issues:
1. Check Render dashboard logs
2. Read TROUBLESHOOTING section in RENDER_DEPLOY.md
3. Verify all environment variables are set
4. Ensure `npm run build` works locally

---

**Need help?** Read RENDER_DEPLOY.md for the complete guide! 📖
