# Port 3001 Already in Use - Fix Guide

## Quick Fix Options

### Option 1: Kill the Process Using Port 3001 (Recommended)

**Windows PowerShell:**
```powershell
# Find the process ID (PID)
netstat -ano | findstr :3001

# Kill the process (replace <PID> with the actual number)
taskkill /PID <PID> /F
```

**Example:**
```powershell
# If you see: TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING    12345
# Then run:
taskkill /PID 12345 /F
```

### Option 2: Change Backend Port

1. **Update `backend/.env` file:**
   ```env
   PORT=3002
   ```

2. **Update `frontend/src/services/api.ts` (if needed):**
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
   ```

3. **Or create `frontend/.env` file:**
   ```env
   VITE_API_URL=http://localhost:3002/api
   ```

### Option 3: Find and Close the Process Manually

1. Open **Task Manager** (Ctrl + Shift + Esc)
2. Go to **Details** tab
3. Look for `node.exe` processes
4. End the one using port 3001

## After Fixing Port Issue

1. **Start Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Verify it's running:**
   - Should see: `🚀 Server running on http://localhost:3001`
   - Open browser: `http://localhost:3001/api/health`

3. **Start Frontend:**
   ```powershell
   cd frontend
   npm run dev
   ```

## All TypeScript Errors Fixed! ✅

The build now succeeds. You can proceed with starting the servers.


