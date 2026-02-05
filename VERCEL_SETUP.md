# TripVerse Frontend - Vercel Configuration Guide

## 🎯 Your Deployment URLs

- **Frontend (Vercel)**: https://trip-verse-frontend.vercel.app
- **Backend (Render)**: https://tripverse-backend-ztsz.onrender.com

## ✅ Environment Configuration

Your app is already configured to use environment variables:
- **Local Development**: Uses `NEXT_PUBLIC_API_URL=http://localhost:8000`
- **Production**: Will use `NEXT_PUBLIC_API_URL=https://tripverse-backend-ztsz.onrender.com`

## 🔧 Vercel Setup

### Add Environment Variable to Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **trip-verse-frontend**
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://tripverse-backend-ztsz.onrender.com
   Environment: Production
   ```
5. Click **Save**
6. **Redeploy** your frontend (Deployments → Latest → Redeploy)

## 🔐 Backend CORS Configuration

Update your Render backend to allow requests from Vercel:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select **tripverse-backend** service
3. Go to **Environment** tab
4. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://trip-verse-frontend.vercel.app,http://localhost:3000
   ```
5. Click **Save Changes** (auto-redeploys)

## ✅ Testing

### Local Development (Both Running Locally):
```bash
# Terminal 1 - Backend
cd TripVerse-Backend
npm run dev

# Terminal 2 - Frontend
cd TripVerse-Frontend
npm run dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- **Works because**: Frontend uses `.env` with `localhost:8000`

### Production (Both on Cloud):
- Frontend: https://trip-verse-frontend.vercel.app
- Backend: https://tripverse-backend-ztsz.onrender.com
- **Works because**: 
  - Frontend uses Vercel env var with Render URL
  - Backend CORS allows Vercel domain

### Hybrid (Frontend Local, Backend Production):
```bash
# Terminal - Frontend only
cd TripVerse-Frontend
NEXT_PUBLIC_API_URL=https://tripverse-backend-ztsz.onrender.com npm run dev
```
- **Works because**: Override env var to use production backend

## 🧪 Verification Steps

After configuration:

1. **Check Backend Health**:
   ```bash
   curl https://tripverse-backend-ztsz.onrender.com/auth/health
   ```
   Should return: `{"ok":true,"service":"auth"}`

2. **Check Frontend**:
   - Open: https://trip-verse-frontend.vercel.app
   - Open browser console (F12)
   - Check for CORS errors
   - Try login/signup

3. **Check CORS**:
   ```bash
   curl -H "Origin: https://trip-verse-frontend.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://tripverse-backend-ztsz.onrender.com/auth/health
   ```
   Should include: `Access-Control-Allow-Origin: https://trip-verse-frontend.vercel.app`

## 🐛 Troubleshooting

### CORS Errors in Production:
- ✅ Verify `FRONTEND_URL` in Render includes your Vercel domain
- ✅ No trailing slash in URLs
- ✅ Use `https://` (not `http://`)

### API Requests Failing:
- ✅ Check Vercel environment variable is set
- ✅ Redeploy frontend after adding env var
- ✅ Check browser console for actual API URL being used

### Cookie Authentication Issues:
- ✅ Backend automatically uses `secure: true, sameSite: 'none'` in production
- ✅ Frontend must use `credentials: true` in fetch/axios (already configured)
- ✅ Both apps must use HTTPS in production

### Backend Spinning Down:
- Free tier spins down after 15 minutes inactivity
- First request takes 30-60 seconds to wake up
- Consider upgrading to $7/month for always-on

## 📊 Update Postman for Production Testing

Update your Postman environment:
```
base_url = https://tripverse-backend-ztsz.onrender.com
```

## 🎉 You're All Set!

Once you've:
1. ✅ Updated `FRONTEND_URL` in Render
2. ✅ Added `NEXT_PUBLIC_API_URL` in Vercel
3. ✅ Redeployed both services

Your full-stack app will work in both local and production environments!
