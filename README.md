# Project Sentinel - Process Excellence Framework

**A gamified process improvement system with AI-powered gaming detection**

## 🛡️ Overview

Project Sentinel is a comprehensive process excellence platform designed to encourage, track, and reward continuous improvement initiatives across regional teams. The system features:

- **Gamified Submissions**: Users submit process improvement ideas to earn points and compete for quarterly prizes
- **Sentinel Leadership**: Dedicated team members who review and validate submissions weekly
- **AI-Powered Gaming Detection**: Uses Anthropic Claude to detect and prevent gaming behavior
- **Separate Competition Tracks**: Regular team members and Sentinels compete in separate prize pools
- **Real-time Leaderboards**: Live tracking of points, submissions, and rankings
- **Comprehensive Admin Dashboard**: Full system control and monitoring

## 🚀 Getting Started

### 1. Initial Setup

1. Open `login.html` in your browser
2. Default credentials for all users:
   - **Username**: `firstname.lastname` (e.g., `dominic.moncada`)
   - **Password**: `password`

### 2. Admin Access

Admin dashboard is available at `admin.html` and requires admin privileges.

**Admin Users**:
- `chris.marinelli`
- `admin`

### 3. Configure AI Gaming Detection

1. Go to Admin Dashboard → API Configuration
2. Add your Anthropic API key (get one from [console.anthropic.com](https://console.anthropic.com/))
3. Test the connection
4. Configure gaming detection rules

## 📋 Features

### For All Users

- **Submit Ideas**: Submit process improvement suggestions with detailed descriptions
- **View Leaderboard**: See real-time rankings and points
- **Track Progress**: Monitor your submissions and impact
- **Compete for Prizes**: Quarterly prize structure with multiple tiers

### For Sentinels

- **Review Submissions**: Weekly adjudication meetings to validate ideas
- **Assign Points**: Score submissions based on impact and quality
- **Separate Competition**: Compete in Sentinel-only prize track
- **Leadership Recognition**: Special recognition and responsibilities

### For Administrators

- **User Management**: Add emails, reset passwords, manage accounts
- **API Configuration**: Set up Anthropic AI for advanced detection
- **Gaming Detection**: Monitor and prevent gaming behavior
- **System Reports**: Generate comprehensive gaming detection reports
- **Rule Configuration**: Adjust gaming detection thresholds
- **Data Management**: Export and manage all system data

## 🚨 Gaming Detection System

The system uses multiple layers to detect and prevent gaming:

### Rule-Based Detection (Always Active)

1. **Submission Limits**:
   - Max 3 submissions per day
   - Max 10 submissions per week

2. **Quality Requirements**:
   - Minimum 100 characters for descriptions
   - Minimum 50 characters for solutions
   - 40% of submissions must include solutions

3. **Pattern Detection**:
   - Duplicate/similar submission detection
   - Rapid submission alerts (within 5 minutes)
   - Low-quality content flagging

### AI-Powered Detection (Requires API Key)

1. **Quality Analysis**: Claude analyzes submission quality and genuine value
2. **Gaming Likelihood**: Calculates probability of gaming behavior
3. **Intelligent Scoring**: Suggests impact scores based on content analysis
4. **Red Flag Detection**: Identifies suspicious patterns and behaviors

### User Alerts

Users receive warnings when:
- Approaching submission limits
- Submitting too quickly
- Low solution ratio
- Quality concerns detected

Submissions are **blocked** when:
- Daily submission limit exceeded
- Description too short
- Duplicate content detected
- AI detects high gaming likelihood

## 🏆 Prize Structure

### Regular Competition (Q1 2025: Dec 22, 2024 - Mar 21, 2025)

- **1st Place**: $15,000
- **2nd Place**: $7,500
- **3rd Place**: $3,000

### Sentinel Competition (Separate Track)

- **1st Place**: $5,000
- **2nd Place**: $2,500
- **3rd Place**: $1,000

## 📊 Database Structure

The system uses localStorage for data persistence (in production, migrate to SQLite or PostgreSQL).

### Tables/Collections:

- **users**: All team members with credentials and roles
- **submissions**: Process improvement ideas and status
- **leaderboard**: Point tracking and rankings
- **prizes**: Quarterly prize structures
- **sentinel_reviews**: Review history and decisions
- **audit_log**: Complete system activity log
- **gaming_alerts**: Gaming detection warnings and blocks

## 🔐 Security Features

1. **Session Management**: Secure login/logout with session storage
2. **Admin-Only Access**: Restricted admin dashboard access
3. **Password Reset**: Email-based password recovery (requires SMTP configuration)
4. **Audit Logging**: Complete tracking of all system actions
5. **Gaming Prevention**: Multi-layer detection and blocking system

## 🛠️ Technical Architecture

### Frontend
- **HTML5/CSS3**: Modern glassmorphism UI with animations
- **Vanilla JavaScript**: No framework dependencies
- **localStorage API**: Client-side data persistence

### Backend Integration (Optional)
- **SQLite**: Included schema for production deployment
- **Node.js**: Database initialization script included
- **Anthropic API**: AI-powered analysis and detection

## 📁 File Structure

```
project-sentinel/
├── index.html              # Main dashboard
├── login.html              # Login page
├── admin.html              # Admin dashboard
├── database/
│   ├── schema.sql          # Database schema
│   ├── init-db.js          # Database initialization
│   └── sentinel.db         # SQLite database (generated)
├── js/
│   ├── db-operations.js    # Database operations
│   └── ml-gaming-detection.js  # Gaming detection engine
└── assets/                 # Images and resources
```

## 🔧 Configuration Options

### Gaming Detection Rules (Configurable in Admin)

- Max submissions per day: `3`
- Max submissions per week: `10`
- Minimum solution ratio: `40%`
- Minimum description length: `100 chars`
- Minimum solution length: `50 chars`
- Duplicate threshold: `85% similarity`
- Rapid submission window: `5 minutes`

### System Settings

- Quarter dates (Q1 2025): Dec 22, 2024 - Mar 21, 2025
- Prize amounts (configurable)
- User roles and permissions
- Email server settings (for password reset)

## 👥 Team Structure

### Sentinels (Current):

**Malaysian Region**:
- Amani Razif (Sentinel Lead)
- Syafiq Ishamuddin (Sentinel)

**Australian Region**:
- Dominic Moncada (Sentinel)

**Indian Region**:
- Faraz Khan (Sentinel Lead)
- Abhinit Gaurav (Sentinel)

### All Team Members

See Org Chart tab in the application for complete team structure across Malaysia, Australia, and India regions.

## 🔄 Workflow

1. **User submits idea** → System runs gaming detection
2. **Submission accepted** → Added to pending queue
3. **Sentinels review weekly** → Adjudicate and assign points
4. **Points awarded** → Leaderboard updated automatically
5. **Quarter ends** → Prize distribution based on final rankings

## 📝 Business Rules

1. **Eligibility**: All team members can submit ideas
2. **Verification**: Sentinels validate all submissions
3. **Scoring**: Based on impact, quality, and implementation potential
4. **Anti-Gaming**: Strict rules prevent system abuse
5. **Fair Play**: Sentinels compete separately to avoid conflicts of interest

## 🚀 Future Enhancements

- [ ] Email integration for password reset
- [ ] Real-time notifications
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Integration with project management tools
- [ ] Automated impact tracking
- [ ] Multi-language support

## 📞 Support

For issues or questions:
- Contact your Sentinel Lead
- Access Admin Dashboard (admin users only)
- Review Business Rules tab in the application

## 📄 License

Internal use only - Vysus Group

---

**Version**: 1.0.0
**Last Updated**: October 23, 2025
**Generated with**: Claude Code 🤖
