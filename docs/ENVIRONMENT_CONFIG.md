# Environment Configuration Guide

## Overview

This project uses environment variables to manage configuration for different environments (development, staging, production).

## Files

### `.env.example`
Template file with all required environment variables. This file is committed to the repository.

### `.env.local`
Your local environment variables. **This file should NEVER be committed.**

### `.env`
Default environment variables for the project. Can be committed for shared defaults.

## Setup Instructions

### 1. Create Local Environment File

```bash
# Copy the example file
cp .env.example .env.local

# Or manually create
touch .env.local
```

### 2. Add Your Values

Edit `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.revupbikes.com

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_HERE
```

### 3. Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Start again
npm run dev
```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `https://api.revupbikes.com` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay API Key (test or live) | `rzp_test_xxxxx` |

### Variable Naming Convention

- **`NEXT_PUBLIC_`** prefix: Accessible in browser (client-side)
- No prefix: Server-side only (not exposed to browser)

## Usage in Code

### Centralized Config (Recommended)

```javascript
// Import from config
import { API_CONFIG, RAZORPAY_CONFIG, APP_CONFIG } from "@/config";

// Use the values
const apiUrl = API_CONFIG.BASE_URL;
const razorpayKey = RAZORPAY_CONFIG.KEY_ID;
const appName = APP_CONFIG.NAME;
```

### Direct Access (Not Recommended)

```javascript
// Direct access to env variables
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
```

## File Locations

```
src/
├── config/
│   └── index.js          # Centralized configuration
├── lib/
│   ├── apiClient.js      # Uses API_CONFIG
│   └── razorpay.js       # Uses RAZORPAY_CONFIG
```

## Validation

Configuration is automatically validated on startup (development mode):

```javascript
import { validateConfig } from "@/config";

// Check if all required variables are set
if (!validateConfig()) {
  console.error("Missing required environment variables!");
}
```

## Environment-Specific Values

### Development (Local)
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

### Production (Vercel/Netlify)
```bash
# Set in hosting platform dashboard
NEXT_PUBLIC_API_BASE_URL=https://api.revupbikes.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
```

## Security Best Practices

### ✅ DO:
- Use `NEXT_PUBLIC_` prefix only for non-sensitive data
- Keep `.env.local` in `.gitignore`
- Use test keys for development
- Store secrets in hosting platform's environment variables
- Rotate keys regularly

### ❌ DON'T:
- Commit `.env.local` to git
- Expose secret keys with `NEXT_PUBLIC_` prefix
- Hardcode API keys in code
- Share environment files via email/chat

## Troubleshooting

### Variables Not Loading

1. **Check file name**: Must be `.env.local` (note the dot)
2. **Restart server**: Environment variables load on startup
3. **Check prefix**: Use `NEXT_PUBLIC_` for client-side access
4. **Check syntax**: No spaces around `=`

```bash
# ✅ Correct
NEXT_PUBLIC_API_URL=https://api.example.com

# ❌ Wrong
NEXT_PUBLIC_API_URL = https://api.example.com
```

### Configuration Errors

Check browser console (Development mode only):
```
🔧 Configuration loaded: {
  API_BASE_URL: 'https://api.revupbikes.com',
  RAZORPAY_KEY_ID: 'rzp_test_...'
}
```

## Getting API Keys

### Razorpay
1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Go to Settings → API Keys
3. Generate Test/Live Keys
4. Copy **Key ID** (starts with `rzp_test_` or `rzp_live_`)

### Backend API
Contact your backend team for the base URL.

## Production Deployment

### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable with production values
3. Deploy

### Netlify
1. Site Settings → Build & Deploy → Environment
2. Add variables
3. Redeploy

## Support

- Configuration issues: Check `src/config/index.js`
- Missing variables: See `.env.example`
- Validation errors: Check browser console in development
