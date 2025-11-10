-- Project Sentinel Database Schema
-- Created: 2025-10-23

-- Users Table (includes all team members)
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- In production, use hashed passwords
    full_name TEXT NOT NULL,
    email TEXT,
    region TEXT NOT NULL, -- 'Malaysia', 'Australia', 'India'
    role TEXT NOT NULL, -- 'Region Lead', 'Lead', 'Senior Engineer', 'Engineer'
    is_sentinel BOOLEAN DEFAULT 0,
    sentinel_role TEXT, -- 'Sentinel Lead', 'Sentinel', NULL for non-sentinels
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- 'efficiency', 'safety', 'quality', 'cost_reduction'
    status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected', 'implemented'
    submitted_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_date DATETIME,
    reviewed_by INTEGER, -- user_id of reviewer (sentinel)
    impact_score INTEGER DEFAULT 0, -- Calculated impact score
    points_awarded INTEGER DEFAULT 0,
    implementation_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);

-- Prizes Table (Quarterly structure)
CREATE TABLE IF NOT EXISTS prizes (
    prize_id INTEGER PRIMARY KEY AUTOINCREMENT,
    quarter_name TEXT NOT NULL, -- 'Q1 2025', 'Q2 2025', etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_sentinel_prize BOOLEAN DEFAULT 0, -- Separate prizes for sentinels
    place INTEGER NOT NULL, -- 1st, 2nd, 3rd
    prize_amount DECIMAL(10,2) NOT NULL,
    prize_description TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Leaderboard Scores (Calculated from submissions)
CREATE TABLE IF NOT EXISTS leaderboard (
    leaderboard_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quarter_name TEXT NOT NULL,
    total_points INTEGER DEFAULT 0,
    submissions_count INTEGER DEFAULT 0,
    verified_count INTEGER DEFAULT 0,
    implemented_count INTEGER DEFAULT 0,
    rank INTEGER,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    UNIQUE(user_id, quarter_name)
);

-- Sentinel Reviews (Weekly adjudication meetings)
CREATE TABLE IF NOT EXISTS sentinel_reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    sentinel_id INTEGER NOT NULL,
    review_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    decision TEXT, -- 'approved', 'needs_revision', 'rejected'
    comments TEXT,
    points_assigned INTEGER,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id),
    FOREIGN KEY (sentinel_id) REFERENCES users(user_id)
);

-- Audit Log (Track all changes)
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL, -- 'login', 'submission', 'review', 'edit', etc.
    entity_type TEXT, -- 'submission', 'user', 'prize', etc.
    entity_id INTEGER,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Insert Initial Users (from current leaderboard)
INSERT INTO users (username, password, full_name, region, role, is_sentinel, sentinel_role) VALUES
-- Malaysian Region
('amani.razif', 'password', 'Amani Razif', 'Malaysia', 'Region Lead', 1, 'Sentinel Lead'),
('shahrul.azri', 'password', 'Shahrul Azri', 'Malaysia', 'Engineer', 0, NULL),
('syafiq.ishamuddin', 'password', 'Syafiq Ishamuddin', 'Malaysia', 'Engineer', 1, 'Sentinel'),
('izzat.luqman', 'password', 'Izzat Luqman', 'Malaysia', 'Engineer', 0, NULL),

-- Australian Region
('robby.palackal', 'password', 'Robby Palackal', 'Australia', 'Region Lead', 0, NULL),
('eduardo.laygo', 'password', 'Eduardo Laygo', 'Australia', 'Lead', 0, NULL),
('ajith.tennakoon', 'password', 'Ajith Tennakoon', 'Australia', 'Lead', 0, NULL),
('montazur.rahman', 'password', 'Montazur Rahman', 'Australia', 'Senior Engineer', 0, NULL),
('zabir.syed', 'password', 'Zabir Syed', 'Australia', 'Senior Engineer', 0, NULL),
('komal.gaikwad', 'password', 'Komal Gaikwad', 'Australia', 'Senior Engineer', 0, NULL),
('dominic.moncada', 'password', 'Dominic Moncada', 'Australia', 'Engineer', 1, 'Sentinel'),
('khadija.kobra', 'password', 'Khadija Kobra', 'Australia', 'Engineer', 0, NULL),
('hayden.brunjes', 'password', 'Hayden Brunjes', 'Australia', 'Engineer', 0, NULL),

-- Indian Region
('faraz.khan', 'password', 'Faraz Khan', 'India', 'Region Lead', 1, 'Sentinel Lead'),
('mohammed.arif', 'password', 'Mohammed Arif', 'India', 'Lead', 0, NULL),
('abhinit.gaurav', 'password', 'Abhinit Gaurav', 'India', 'Senior Engineer', 1, 'Sentinel'),
('chirag.rohit', 'password', 'Chirag Rohit', 'India', 'Senior Engineer', 0, NULL),
('owais.raja', 'password', 'Owais Raja', 'India', 'Engineer', 0, NULL);

-- Insert Initial Prize Structure (Q1 2025 starting Dec 22, 2024)
INSERT INTO prizes (quarter_name, start_date, end_date, is_sentinel_prize, place, prize_amount, prize_description, is_active) VALUES
-- Regular Competition Prizes
('Q1 2025', '2024-12-22', '2025-03-21', 0, 1, 15000.00, 'First Place - Quarterly Champion', 1),
('Q1 2025', '2024-12-22', '2025-03-21', 0, 2, 7500.00, 'Second Place - Runner Up', 1),
('Q1 2025', '2024-12-22', '2025-03-21', 0, 3, 3000.00, 'Third Place', 1),

-- Sentinel Competition Prizes (separate track)
('Q1 2025', '2024-12-22', '2025-03-21', 1, 1, 5000.00, 'Top Sentinel - Excellence in Process Leadership', 1),
('Q1 2025', '2024-12-22', '2025-03-21', 1, 2, 2500.00, 'Second Place Sentinel', 1),
('Q1 2025', '2024-12-22', '2025-03-21', 1, 3, 1000.00, 'Third Place Sentinel', 1);

-- Initialize leaderboard for Q1 2025 (start with zero scores)
INSERT INTO leaderboard (user_id, quarter_name, total_points, submissions_count, verified_count, implemented_count)
SELECT user_id, 'Q1 2025', 0, 0, 0, 0 FROM users;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_leaderboard_quarter ON leaderboard(quarter_name);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(quarter_name, rank);
CREATE INDEX IF NOT EXISTS idx_sentinel_reviews_submission ON sentinel_reviews(submission_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- Create views for common queries
CREATE VIEW IF NOT EXISTS active_leaderboard AS
SELECT
    l.rank,
    u.full_name,
    u.region,
    u.role,
    u.is_sentinel,
    l.total_points,
    l.submissions_count,
    l.verified_count,
    l.implemented_count
FROM leaderboard l
JOIN users u ON l.user_id = u.user_id
WHERE l.quarter_name = 'Q1 2025'
ORDER BY l.rank ASC;

CREATE VIEW IF NOT EXISTS sentinel_leaderboard AS
SELECT
    l.rank,
    u.full_name,
    u.region,
    u.sentinel_role,
    l.total_points,
    l.submissions_count,
    l.verified_count
FROM leaderboard l
JOIN users u ON l.user_id = u.user_id
WHERE u.is_sentinel = 1 AND l.quarter_name = 'Q1 2025'
ORDER BY l.total_points DESC;

CREATE VIEW IF NOT EXISTS pending_submissions AS
SELECT
    s.submission_id,
    u.full_name AS submitter,
    u.region,
    s.title,
    s.description,
    s.category,
    s.submitted_date,
    s.status
FROM submissions s
JOIN users u ON s.user_id = u.user_id
WHERE s.status IN ('pending', 'under_review')
ORDER BY s.submitted_date ASC;
