# Project Sentinel - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Open the Application

1. Navigate to the `project-sentinel` folder
2. Open `login.html` in your web browser (Chrome, Edge, or Firefox recommended)

### Step 2: Login

**Admin Login:**
- Username: `chris.marinelli`
- Password: `password`

**Test User Login:**
- Username: `dominic.moncada`
- Password: `password`

**Other Users:**
- Format: `firstname.lastname` (e.g., `syafiq.ishamuddin`, `abhinit.gaurav`)
- Password: `password` (for all users)

### Step 3: Configure AI (Admin Only)

1. Login as admin (`chris.marinelli`)
2. Click "🛡️ Admin" button in the top right
3. Go to "🔑 API Configuration" tab
4. Get an API key from [Anthropic Console](https://console.anthropic.com/)
5. Paste the key and click "Save API Key"
6. Click "Test Connection" to verify

### Step 4: Submit Your First Idea

1. Go to "Submit Idea" tab
2. Fill out the form:
   - **Title**: Brief description (e.g., "Automate Protection Settings Calculations")
   - **Category**: Select from dropdown
   - **Current Process**: Describe the problem (minimum 100 characters)
   - **Proposed Solution**: Your idea (minimum 50 characters for bonus points)
3. Click "Submit for Review"

### Step 5: View the Leaderboard

1. Click "Leaderboard" tab
2. See real-time rankings and countdown
3. Track your position and points

## ⚡ Common Tasks

### For Regular Users

**Submit an Idea:**
1. Login → Submit Idea tab
2. Fill form → Submit
3. Wait for Sentinel review

**Check Your Rank:**
1. Login → Leaderboard tab
2. Find your name in the table
3. View your points and submissions

**View Prizes:**
1. Login → Prizes tab
2. See prize amounts and dates
3. Check which track you're in

### For Sentinels

**Review Submissions:**
1. Login → (Future: Review tab)
2. View pending submissions
3. Assign points and approve/reject

**Check Gaming Reports:**
1. Login as admin → Admin Dashboard
2. Gaming Detection tab
3. Click "Generate Report"

### For Administrators

**Manage Users:**
1. Admin Dashboard → User Management
2. Add email addresses
3. Reset passwords (requires email config)

**Configure Gaming Rules:**
1. Admin Dashboard → Gaming Detection
2. Adjust thresholds
3. Save Rules

**View System Stats:**
1. Admin Dashboard → Overview
2. Monitor submissions, users, flagged behavior

## 🎯 Tips for Success

### Earn More Points

✅ **Include Solutions** (+50 bonus points)
- Don't just identify problems
- Propose actionable solutions
- Detail implementation steps

✅ **Write Detailed Descriptions** (+20 bonus points)
- Minimum 100 characters required
- 200+ characters recommended
- Explain the current problem clearly

✅ **Focus on Quality Over Quantity**
- Gaming detection limits submissions
- 3 per day maximum
- 10 per week maximum

### Avoid Getting Flagged

❌ **Don't Submit Too Quickly**
- Wait at least 5 minutes between submissions
- Take time to think through your ideas

❌ **Don't Submit Duplicates**
- System detects 85%+ similarity
- Variation on same theme counts as duplicate

❌ **Don't Skip Solutions**
- Must maintain 40% solution ratio
- After 5 submissions, 2 must have solutions

❌ **Don't Submit Low-Quality Ideas**
- Minimum description: 100 characters
- Minimum solution: 50 characters
- AI detects low-value submissions

## 🛡️ Sentinel Workflow

### Weekly Adjudication Process

**Monday Morning:**
1. Sentinels receive list of pending submissions
2. Review queue in Admin Dashboard

**Weekly Meeting (1 hour):**
1. Discuss each submission
2. Validate impact and feasibility
3. Assign points (0-200 scale)
4. Approve, reject, or request revision

**Friday:**
1. Users notified of decisions
2. Points added to leaderboard
3. Leaderboard updated

## ⚙️ Admin Configuration

### First-Time Setup

1. **Add API Key** (enables AI features)
   - Admin → API Configuration
   - Add Anthropic API key
   - Test connection

2. **Add User Emails** (enables password reset)
   - Admin → User Management
   - Add email for each user
   - Click "Save Email"

3. **Configure Gaming Rules**
   - Admin → Gaming Detection
   - Adjust thresholds if needed
   - Default settings work well for most teams

4. **Review System Health**
   - Admin → Overview
   - Check all systems green
   - Monitor flagged users

### Optional: Email Setup

For password reset functionality:
1. Admin → Settings
2. Configure SMTP server
3. Add from email
4. Save settings

*Note: Email functionality requires server-side integration (not included in this demo)*

## 📊 Understanding the Leaderboard

### Regular Competition

- **Open to**: All non-Sentinel team members
- **Prizes**: $15,000 / $7,500 / $3,000
- **Tracked by**: Total points across quarter

### Sentinel Competition

- **Open to**: Sentinels only (Amani, Syafiq, Dominic, Abhinit, Faraz)
- **Prizes**: $5,000 / $2,500 / $1,000
- **Why Separate**: Prevents conflicts of interest

### Point System

| Action | Points |
|--------|--------|
| Basic submission | 50 |
| Include solution | +50 |
| Detailed description (200+ chars) | +20 |
| High impact (AI detected) | +30 |
| **Maximum per submission** | **200** |

## 🐛 Troubleshooting

### "Submission Blocked" Error

**Cause**: Gaming detection triggered

**Solutions**:
- Check description length (100+ chars required)
- Wait longer between submissions
- Ensure you're not submitting duplicates
- Add solutions to more submissions

### Admin Link Not Showing

**Cause**: Not logged in as admin user

**Solution**:
- Logout
- Login as `chris.marinelli` or `admin`
- Admin link appears in top right

### API Key Not Working

**Cause**: Invalid key or connection issue

**Solutions**:
- Verify key starts with `sk-ant-`
- Check internet connection
- Regenerate key in Anthropic Console
- Test connection button

### No Data Showing

**Cause**: First time using the system

**Solution**:
- Submit a few test ideas
- Data persists in browser localStorage
- Refresh page to see updates

## 📱 Browser Compatibility

✅ **Fully Supported:**
- Google Chrome (latest)
- Microsoft Edge (latest)
- Mozilla Firefox (latest)
- Safari (latest)

⚠️ **Limited Support:**
- Internet Explorer (not recommended)
- Older mobile browsers

## 🔒 Data & Privacy

- **Storage**: All data stored in browser localStorage
- **Persistence**: Data survives browser restarts
- **Clearing**: Admin can export/clear all data
- **Backup**: Use "Export All Data" in Admin → Settings

## ❓ FAQ

**Q: Can I change my password?**
A: Not yet. Contact admin for password reset (requires email setup).

**Q: What happens if I clear my browser data?**
A: All submissions and leaderboard data will be lost. Export regularly!

**Q: Can I see who submitted what idea?**
A: Sentinels and admins can see submitter names. Regular users see anonymous leaderboard.

**Q: When do prizes get distributed?**
A: At the end of each quarter (Q1: March 21, 2025).

**Q: Can I edit a submission after submitting?**
A: Not currently. Contact your Sentinel Lead for revisions.

**Q: What if I disagree with my points?**
A: Contact your regional Sentinel who can review and adjust.

---

## 🆘 Need Help?

**Contact:**
- Your Sentinel Lead (see Org Chart)
- Admin: chris.marinelli
- Technical Issues: Check Browser Console (F12)

**Resources:**
- Full Documentation: `README.md`
- Business Rules: See "Business Rules" tab in app
- Process Workflow: See "Process Excellence" tab in app

---

**Happy Improving! 🎯**
