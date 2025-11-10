# 🚀 Project Sentinel - Easy Setup Guide (Option A)

## Fix the API Key Issue - 3 Simple Steps

### The Problem
When you open files directly in browser (`file://`), the Anthropic API is blocked by CORS security.

### The Solution
Use the **Enterprise Backend** - it acts as a proxy and fixes the issue!

---

## 📋 Prerequisites (One-Time Install)

### 1. Install PostgreSQL (15 minutes)

**Download:** https://www.postgresql.org/download/windows/

**During installation:**
- ✅ Accept all defaults
- ✅ Set a password for `postgres` user (remember it!)
- ✅ Port 5432 is fine
- ✅ Finish installation

**Create the database:**

Open **"SQL Shell (psql)"** from Start Menu:

```sql
-- Press Enter for defaults, then enter postgres password when prompted

CREATE DATABASE sentinel;
CREATE USER sentinel_user WITH ENCRYPTED PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sentinel TO sentinel_user;
\q
```

✅ Done! PostgreSQL is ready.

### 2. Get Your Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Sign up or login
3. Go to API Keys section
4. Create new key
5. Copy it (starts with `sk-ant-`)

✅ Done! Keep the key handy.

---

## 🚀 Automated Setup (5 Minutes)

### Option A: Run the Setup Script (Easiest!)

```bash
# Navigate to project folder
cd "C:\Code\STI  LTI Scheme\project-sentinel"

# Run automated setup
SETUP-BACKEND.bat
```

The script will:
1. ✅ Check Node.js is installed
2. ✅ Check PostgreSQL is installed
3. ✅ Create .env configuration file
4. ✅ Prompt you to add API key
5. ✅ Install all dependencies (npm install)
6. ✅ Initialize the database
7. ✅ Start the server

Just follow the prompts!

### Option B: Manual Setup

**Step 1: Configure Environment**
```bash
cd "C:\Code\STI  LTI Scheme\project-sentinel\server"

# Copy template
copy .env.example .env

# Edit with your settings
notepad .env
```

**Edit .env file - Add these 3 critical values:**
```env
# Database password (from PostgreSQL setup)
DB_PASSWORD=password

# Your Anthropic API key
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Random secret for sessions (make it long!)
SESSION_SECRET=make_this_a_very_long_random_string_32_chars_minimum
```

Save and close.

**Step 2: Install Dependencies**
```bash
npm install
```

**Step 3: Initialize Database**
```bash
npm run init-db
```

You should see:
```
✅ Database created
✅ Schema created successfully
✅ Passwords hashed for 19 users
🎉 Database initialization complete!
```

**Step 4: Start Server**
```bash
npm start
```

You should see:
```
🛡️  Project Sentinel Server Started!
📡 Server:     http://localhost:3000
🗄️  Database:   Connected (PostgreSQL)
✅ Server ready to accept connections
```

**Step 5: Access Application**

Open in browser:
```
http://localhost:3000/login.html
```

Login:
- Username: `chris.marinelli`
- Password: `password`
- ✅ Check "Remember me"

---

## ✅ Testing the Fix

### Before (File Access - CORS Error):
```
file://C:/Code/STI  LTI Scheme/project-sentinel/admin.html
❌ Failed to fetch
❌ CORS policy blocked
```

### After (Server Access - Works!):
```
http://localhost:3000/admin.html
✅ API key works
✅ AI features active
✅ No CORS errors
```

### Verify It's Working:

1. Go to Admin Dashboard
2. Click "API Configuration"
3. API key should show: "✅ API Key Status: Configured"
4. Click "Test Connection"
5. Should see: "✅ API connection successful!"

---

## 🎯 What You Get With Enterprise Backend

**Before (Standalone):**
- ❌ API key fails (CORS)
- ❌ AI enhancement doesn't work
- ❌ localStorage only (single computer)
- ❌ No network access
- ❌ Sessions expire on browser close

**After (Enterprise Backend):**
- ✅ API key works perfectly!
- ✅ AI enhancement fully functional
- ✅ PostgreSQL database (persistent)
- ✅ Network access (1000+ users)
- ✅ Secure session management
- ✅ Multi-stage verification
- ✅ Complete audit trails
- ✅ Production-ready

---

## 🔧 Troubleshooting

### "npm not found"
**Solution:** Install Node.js from https://nodejs.org/

### "psql not found"
**Solution:** Install PostgreSQL from https://www.postgresql.org/

### "Database initialization failed"
**Check:**
1. Is PostgreSQL running? (Check services.msc)
2. Did you create the database? (Run CREATE DATABASE commands)
3. Is password in .env correct?

**Test manually:**
```bash
psql -U sentinel_user -d sentinel -h localhost
# If this works, your database is ready
```

### "Port 3000 already in use"
**Solution:** Edit `.env` and change:
```env
PORT=3001
```

### Server starts but API still fails
**Check:**
1. Did you add ANTHROPIC_API_KEY to `.env`?
2. Did you restart server after editing `.env`?
3. Are you accessing via `http://localhost:3000` not `file://`?

---

## 📞 Quick Help

**Can't find .env file?**
- It's in: `project-sentinel/server/.env`
- Create from: `project-sentinel/server/.env.example`

**Forgot postgres password?**
- Reinstall PostgreSQL OR
- Reset postgres password (Google: "reset postgres password windows")

**API key not working?**
- Verify it starts with `sk-ant-`
- Check it's in `.env` file in the server folder
- Restart server after adding it

---

## ✅ Success Checklist

After setup, you should have:

- [ ] PostgreSQL running
- [ ] Database 'sentinel' created
- [ ] .env file configured with API key
- [ ] Dependencies installed (node_modules folder exists)
- [ ] Database initialized (shows 19 users created)
- [ ] Server running (terminal shows "Server ready")
- [ ] Can access http://localhost:3000/login.html
- [ ] Can login as chris.marinelli
- [ ] Admin → API Configuration shows "✅ Configured"
- [ ] "Test Connection" returns success
- [ ] AI features working

---

## 🎉 Once Setup is Complete

**You'll have:**
- ✅ No more CORS errors
- ✅ AI enhancement working
- ✅ All features enabled
- ✅ Network accessible
- ✅ Production-ready system

**Access from anywhere on your network:**
```
http://YOUR-IP-ADDRESS:3000/login.html

# Find your IP:
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

**Your team can then access:**
```
http://192.168.1.100:3000/login.html
```

---

## 📝 After First Login

1. Go to Admin → User Management
2. Add email addresses for all users
3. Change default passwords (currently all "password")
4. Test submitting an idea
5. Test AI enhancement
6. Check Kanban board
7. Review Business Rules tab

**Everything will work perfectly!** 🎉

---

**Need help?** Check the terminal where server is running for error messages.

**Server logs show everything** - if something fails, the error will be displayed there.
