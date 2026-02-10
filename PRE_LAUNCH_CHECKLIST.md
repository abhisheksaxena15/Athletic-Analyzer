# Pre-Launch Checklist - Before Testing

## ✅ Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```
**Check:** No errors, `node_modules` folder created

### 2. Create Environment File
Create `backend/.env` file:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./data/athlete_performance.db
FRONTEND_URL=http://localhost:5173
```

### 3. Start Backend
```bash
npm run dev
```

**Expected Output:**
```
📦 Initializing database...
✅ Database initialized successfully
🚀 Server running on http://localhost:3001
📊 Health check: http://localhost:3001/api/health
```

**Verify:** Open http://localhost:3001/api/health in browser
- Should return: `{"status":"ok","message":"Server is running"}`

---

## ✅ Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```
**Check:** No errors, `node_modules` folder created

### 2. (Optional) Create Environment File
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Frontend
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Verify:** Open http://localhost:5173 in browser
- Should see the application homepage

---

## ✅ Connection Test

### Test 1: Backend Health
1. Open browser
2. Go to: `http://localhost:3001/api/health`
3. Should see: `{"status":"ok","message":"Server is running"}`

### Test 2: Frontend → Backend
1. Open browser console (F12)
2. Run:
   ```javascript
   fetch('http://localhost:3001/api/health')
     .then(r => r.json())
     .then(console.log)
   ```
3. Should see: `{status: "ok", message: "Server is running"}`

### Test 3: Full Flow
1. Register a new user
2. Complete onboarding
3. Log a workout
4. View performance analysis

---

## ⚠️ Common Issues

### Issue: "Cannot connect to backend server"
**Solution:** 
- Check backend is running (see terminal)
- Check port 3001 is not blocked
- Verify `.env` file exists in backend

### Issue: CORS Error
**Solution:**
- Check `FRONTEND_URL` in `backend/.env` matches frontend URL
- Restart backend after changing `.env`

### Issue: Database Error
**Solution:**
- Delete `backend/data/athlete_performance.db`
- Restart backend (database will recreate)

### Issue: Port Already in Use
**Solution:**
- Change `PORT` in `backend/.env`
- Update frontend API URL accordingly

---

## ✅ Verification Steps

### Backend Files Check:
- [ ] `backend/src/server.ts` exists
- [ ] `backend/src/database/init.ts` exists
- [ ] `backend/src/routes/performance.ts` exists
- [ ] `backend/src/services/performanceService.ts` exists
- [ ] `backend/.env` file created

### Frontend Files Check:
- [ ] `frontend/src/services/api.ts` exists
- [ ] `frontend/src/pages/PerformanceAnalysis.tsx` exists
- [ ] `frontend/src/pages/DataManual.tsx` exists
- [ ] `frontend/src/pages/Onboarding.tsx` exists

### Dependencies Check:
- [ ] Backend: `npm install` completed
- [ ] Frontend: `npm install` completed
- [ ] No missing package errors

---

## 🚀 Ready to Test!

Once both servers are running:

1. **Backend:** http://localhost:3001 ✅
2. **Frontend:** http://localhost:5173 ✅
3. **Health Check:** http://localhost:3001/api/health ✅

**All error handling is in place. If you see errors, they will now provide helpful messages!**

---

## 📋 Test Flow

1. ✅ Register → Should work
2. ✅ Onboarding → Should save profile
3. ✅ Log Workout → Should save to database
4. ✅ View Performance → Should show analysis (or "no data" message)
5. ✅ Update Profile → Should persist changes

**If any step fails, check the error message - it will tell you what's wrong!**

