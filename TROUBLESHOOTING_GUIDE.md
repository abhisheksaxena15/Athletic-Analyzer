# Troubleshooting Guide - "Failed to fetch" Error

## Common Causes and Solutions

### 1. Backend Server Not Running ⚠️ **MOST COMMON**

**Symptom:** "Failed to fetch" or "Cannot connect to backend server" error

**Solution:**
1. Open a terminal in the `backend` folder
2. Run: `npm install` (if not done already)
3. Create `.env` file (copy from `.env.example`)
4. Run: `npm run dev`
5. You should see: `🚀 Server running on http://localhost:3001`

**Verify:** Open http://localhost:3001/api/health in browser - should return `{"status":"ok"}`

---

### 2. Wrong API URL

**Check:** The frontend is trying to connect to `http://localhost:3001/api`

**Solution:**
- If backend runs on different port, create `frontend/.env` file:
  ```
  VITE_API_URL=http://localhost:3001/api
  ```
- Or update `frontend/src/services/api.ts` line 1 if needed

---

### 3. CORS Issues

**Symptom:** CORS error in browser console

**Solution:**
- Backend CORS is configured for `http://localhost:5173`
- If frontend runs on different port, update `backend/.env`:
  ```
  FRONTEND_URL=http://localhost:5173
  ```
- Restart backend after changing `.env`

---

### 4. Database Not Initialized

**Symptom:** Backend starts but API calls fail

**Solution:**
- Database auto-creates on first backend start
- Check `backend/data/` folder exists
- If issues, delete `backend/data/athlete_performance.db` and restart backend

---

### 5. Missing Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### 6. Port Already in Use

**Symptom:** Backend won't start, port 3001 in use

**Solution:**
- Change port in `backend/.env`: `PORT=3002`
- Update frontend API URL accordingly

---

## Step-by-Step Startup Checklist

### Backend:
1. ✅ `cd backend`
2. ✅ `npm install`
3. ✅ Create `.env` file with:
   ```
   PORT=3001
   JWT_SECRET=your-secret-key-here
   FRONTEND_URL=http://localhost:5173
   DATABASE_PATH=./data/athlete_performance.db
   ```
4. ✅ `npm run dev`
5. ✅ See: `🚀 Server running on http://localhost:3001`

### Frontend:
1. ✅ `cd frontend`
2. ✅ `npm install`
3. ✅ (Optional) Create `.env` file with:
   ```
   VITE_API_URL=http://localhost:3001/api
   ```
4. ✅ `npm run dev`
5. ✅ See: `Local: http://localhost:5173`

---

## Testing Connection

### 1. Test Backend Health:
Open in browser: `http://localhost:3001/api/health`
Should return: `{"status":"ok","message":"Server is running"}`

### 2. Test from Frontend:
Open browser console (F12) and run:
```javascript
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 3. Check Network Tab:
- Open browser DevTools → Network tab
- Try to submit a form
- Look for failed requests
- Check the error message

---

## Error Messages Explained

### "Failed to fetch"
- **Cause:** Backend not running or network issue
- **Fix:** Start backend server

### "Cannot connect to backend server"
- **Cause:** Backend not accessible
- **Fix:** Check backend is running, check port, check firewall

### "401 Unauthorized"
- **Cause:** Missing or invalid token
- **Fix:** Login again to get new token

### "404 Not Found"
- **Cause:** Wrong API endpoint
- **Fix:** Check API route exists in backend

### "500 Internal Server Error"
- **Cause:** Backend code error
- **Fix:** Check backend console for error details

---

## Quick Fixes

### If Backend Won't Start:
1. Check Node.js version: `node --version` (should be 18+)
2. Delete `node_modules` and `package-lock.json`, then `npm install`
3. Check for TypeScript errors: `npm run build`

### If Frontend Won't Connect:
1. Verify backend is running (check terminal)
2. Check browser console for CORS errors
3. Verify API URL in `frontend/src/services/api.ts`
4. Try accessing backend directly in browser

### If Database Errors:
1. Delete `backend/data/athlete_performance.db`
2. Restart backend (database will recreate)
3. Check file permissions on `backend/data/` folder

---

## Still Not Working?

1. **Check Backend Console:**
   - Look for error messages
   - Check if routes are registered
   - Verify database initialized

2. **Check Frontend Console:**
   - Open DevTools (F12)
   - Look for network errors
   - Check for JavaScript errors

3. **Verify Files:**
   - All backend files exist in `backend/src/`
   - All frontend files exist in `frontend/src/`
   - No missing imports

4. **Test Manually:**
   - Use Postman or curl to test backend endpoints
   - Test health endpoint first
   - Then test authenticated endpoints with token

---

## Common Issues Fixed in Code

✅ **Network error handling** - Better error messages
✅ **Empty data handling** - Performance service handles no data gracefully
✅ **Try-catch blocks** - All service methods have error handling
✅ **Connection checks** - Frontend shows helpful error messages

---

## Need More Help?

Check these files for details:
- `CODE_REVIEW_CHECKLIST.md` - Complete code verification
- `COMPLETE_UPDATE_SUMMARY.md` - All files changed
- `FINAL_REVIEW_SUMMARY.md` - Quick status


