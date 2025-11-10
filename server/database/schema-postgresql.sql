-- Project Sentinel Database Schema - PostgreSQL
-- Enterprise-grade schema with indexes, constraints, and triggers

-- Create database (run this separately as superuser)
-- CREATE DATABASE sentinel;
-- CREATE USER sentinel_user WITH ENCRYPTED PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE sentinel TO sentinel_user;

-- Connect to sentinel database
\c sentinel;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables (for clean reinstall)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS sentinel_reviews CASCADE;
DROP TABLE IF EXISTS gaming_alerts CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS prizes CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    region VARCHAR(50) NOT NULL CHECK (region IN ('Malaysia', 'Australia', 'India')),
    role VARCHAR(100) NOT NULL,
    is_sentinel BOOLEAN DEFAULT FALSE,
    sentinel_role VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE
);

-- Submissions Table
CREATE TABLE submissions (
    submission_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    solution TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'implemented')),
    submitted_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_date TIMESTAMP WITH TIME ZONE,
    reviewed_by INTEGER REFERENCES users(user_id),
    impact_score INTEGER DEFAULT 0 CHECK (impact_score >= 0 AND impact_score <= 200),
    points_awarded INTEGER DEFAULT 0 CHECK (points_awarded >= 0 AND points_awarded <= 200),
    implementation_notes TEXT,
    gaming_check_result JSONB,
    ai_analysis JSONB
);

-- Prizes Table
CREATE TABLE prizes (
    prize_id SERIAL PRIMARY KEY,
    quarter_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_sentinel_prize BOOLEAN DEFAULT FALSE,
    place INTEGER NOT NULL CHECK (place >= 1 AND place <= 3),
    prize_amount DECIMAL(10,2) NOT NULL CHECK (prize_amount > 0),
    prize_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quarter_name, is_sentinel_prize, place)
);

-- Leaderboard Table
CREATE TABLE leaderboard (
    leaderboard_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    quarter_name VARCHAR(50) NOT NULL,
    total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
    submissions_count INTEGER DEFAULT 0 CHECK (submissions_count >= 0),
    verified_count INTEGER DEFAULT 0 CHECK (verified_count >= 0),
    implemented_count INTEGER DEFAULT 0 CHECK (implemented_count >= 0),
    rank INTEGER,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quarter_name)
);

-- Sentinel Reviews Table
CREATE TABLE sentinel_reviews (
    review_id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
    sentinel_id INTEGER NOT NULL REFERENCES users(user_id),
    review_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    decision VARCHAR(50) CHECK (decision IN ('approved', 'needs_revision', 'rejected')),
    comments TEXT,
    points_assigned INTEGER CHECK (points_assigned >= 0 AND points_assigned <= 200)
);

-- Gaming Alerts Table
CREATE TABLE gaming_alerts (
    alert_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    message TEXT NOT NULL,
    details JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log Table
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table (for express-session with connect-pg-simple)
CREATE TABLE sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);

-- Create Indexes for Performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_region ON users(region);
CREATE INDEX idx_users_is_sentinel ON users(is_sentinel);

CREATE INDEX idx_submissions_user ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_date ON submissions(submitted_date DESC);
CREATE INDEX idx_submissions_category ON submissions(category);

CREATE INDEX idx_leaderboard_quarter ON leaderboard(quarter_name);
CREATE INDEX idx_leaderboard_rank ON leaderboard(quarter_name, rank);
CREATE INDEX idx_leaderboard_user ON leaderboard(user_id);

CREATE INDEX idx_sentinel_reviews_submission ON sentinel_reviews(submission_id);
CREATE INDEX idx_sentinel_reviews_sentinel ON sentinel_reviews(sentinel_id);

CREATE INDEX idx_gaming_alerts_user ON gaming_alerts(user_id);
CREATE INDEX idx_gaming_alerts_acknowledged ON gaming_alerts(acknowledged);

CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Create Views
CREATE OR REPLACE VIEW active_leaderboard AS
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
WHERE l.quarter_name = 'Q1 2025' AND u.is_active = TRUE
ORDER BY l.rank ASC NULLS LAST, l.total_points DESC;

CREATE OR REPLACE VIEW sentinel_leaderboard AS
SELECT
    ROW_NUMBER() OVER (ORDER BY l.total_points DESC) as rank,
    u.full_name,
    u.region,
    u.sentinel_role,
    l.total_points,
    l.submissions_count,
    l.verified_count
FROM leaderboard l
JOIN users u ON l.user_id = u.user_id
WHERE u.is_sentinel = TRUE AND l.quarter_name = 'Q1 2025' AND u.is_active = TRUE
ORDER BY l.total_points DESC;

CREATE OR REPLACE VIEW pending_submissions AS
SELECT
    s.submission_id,
    u.full_name AS submitter,
    u.region,
    s.title,
    s.description,
    s.solution,
    s.category,
    s.submitted_date,
    s.status
FROM submissions s
JOIN users u ON s.user_id = u.user_id
WHERE s.status IN ('pending', 'under_review')
ORDER BY s.submitted_date ASC;

-- Trigger to update leaderboard last_updated
CREATE OR REPLACE FUNCTION update_leaderboard_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leaderboard_update_timestamp
    BEFORE UPDATE ON leaderboard
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_timestamp();

-- Trigger to auto-update leaderboard when submission is approved
CREATE OR REPLACE FUNCTION update_leaderboard_on_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        INSERT INTO leaderboard (user_id, quarter_name, total_points, submissions_count, verified_count)
        VALUES (NEW.user_id, 'Q1 2025', NEW.points_awarded, 1, 1)
        ON CONFLICT (user_id, quarter_name)
        DO UPDATE SET
            total_points = leaderboard.total_points + NEW.points_awarded,
            submissions_count = leaderboard.submissions_count + 1,
            verified_count = leaderboard.verified_count + 1;
    END IF;

    IF NEW.status = 'implemented' AND OLD.status != 'implemented' THEN
        UPDATE leaderboard
        SET implemented_count = implemented_count + 1
        WHERE user_id = NEW.user_id AND quarter_name = 'Q1 2025';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submission_approval_trigger
    AFTER UPDATE ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_leaderboard_on_approval();

-- Insert Initial Users (passwords will be hashed by backend)
INSERT INTO users (username, password_hash, full_name, email, region, role, is_sentinel, sentinel_role) VALUES
-- Admin
('chris.marinelli', 'PLACEHOLDER', 'Chris Marinelli', 'chris.marinelli@vysusgroup.com', 'Australia', 'System Administrator', FALSE, NULL),

-- Malaysian Region
('amani.razif', 'PLACEHOLDER', 'Amani Razif', 'amani.syafiqah@vysusgroup.com', 'Malaysia', 'Region Lead', TRUE, 'Sentinel Lead'),
('shahrul.azri', 'PLACEHOLDER', 'Shahrul Azri', 'shahrul.azri@vysus.com', 'Malaysia', 'Engineer', FALSE, NULL),
('syafiq.ishamuddin', 'PLACEHOLDER', 'Syafiq Ishamuddin', 'syafiq.ishamuddin@vysus.com', 'Malaysia', 'Engineer', TRUE, 'Sentinel'),
('izzat.luqman', 'PLACEHOLDER', 'Izzat Luqman', 'izzat.luqman@vysus.com', 'Malaysia', 'Engineer', FALSE, NULL),

-- Australian Region
('robby.palackal', 'PLACEHOLDER', 'Robby Palackal', 'robby.palackal@vysusgroup.com', 'Australia', 'Region Lead', FALSE, NULL),
('eduardo.laygo', 'PLACEHOLDER', 'Eduardo Laygo', 'eduardo.laygo@vysus.com', 'Australia', 'Lead', FALSE, NULL),
('ajith.tennakoon', 'PLACEHOLDER', 'Ajith Tennakoon', 'ajith.tennakoon@vysus.com', 'Australia', 'Lead', FALSE, NULL),
('montazur.rahman', 'PLACEHOLDER', 'Montazur Rahman', 'montazur.rahman@vysus.com', 'Australia', 'Senior Engineer', FALSE, NULL),
('zabir.syed', 'PLACEHOLDER', 'Zabir Syed', 'zabir.syed@vysus.com', 'Australia', 'Senior Engineer', FALSE, NULL),
('komal.gaikwad', 'PLACEHOLDER', 'Komal Gaikwad', 'komal.gaikwad@vysusgroup.com', 'Australia', 'Senior Engineer', FALSE, NULL),
('dominic.moncada', 'PLACEHOLDER', 'Dominic Moncada', 'dominic.moncada@vysusgroup.com', 'Australia', 'Engineer', TRUE, 'Sentinel'),
('khadija.kobra', 'PLACEHOLDER', 'Khadija Kobra', 'khadija.kobra@vysus.com', 'Australia', 'Engineer', FALSE, NULL),
('hayden.brunjes', 'PLACEHOLDER', 'Hayden Brunjes', 'hayden.brunjes@vysus.com', 'Australia', 'Engineer', FALSE, NULL),
('parthena.savvidis', 'PLACEHOLDER', 'Parthena Savvidis', 'parthena.savvidis@vysusgroup.com', 'Australia', 'Engineer', FALSE, NULL),
('naveenkumar.rajagopal', 'PLACEHOLDER', 'Naveenkumar Rajagopal', 'Naveenkumar.Rajagopal@vysusgroup.com', 'Australia', 'Engineer', FALSE, NULL),

-- Indian Region
('faraz.khan', 'PLACEHOLDER', 'Faraz Khan', 'faraz.khan@vysusgroup.com', 'India', 'Region Lead', TRUE, 'Sentinel Lead'),
('mohammed.arif', 'PLACEHOLDER', 'Mohammed Arif', 'mohammed.arif@vysus.com', 'India', 'Lead', FALSE, NULL),
('abhinit.gaurav', 'PLACEHOLDER', 'Abhinit Gaurav', 'abhinit.gaurav@vysus.com', 'India', 'Senior Engineer', TRUE, 'Sentinel'),
('chirag.rohit', 'PLACEHOLDER', 'Chirag Rohit', 'chirag.rohit@vysus.com', 'India', 'Senior Engineer', FALSE, NULL),
('owais.raja', 'PLACEHOLDER', 'Owais Raja', 'owais.raja@vysus.com', 'India', 'Engineer', FALSE, NULL);

-- Insert Initial Prize Structure (Q1 2025)
INSERT INTO prizes (quarter_name, start_date, end_date, is_sentinel_prize, place, prize_amount, prize_description, is_active) VALUES
-- Team Competition Prize (One winner per quarter)
('Q1 2025', '2024-12-22', '2025-03-21', FALSE, 1, 15000.00, 'Q1 2025 Team Prize', TRUE),

-- Sentinel Competition Prize (One winner per quarter)
('Q1 2025', '2024-12-22', '2025-03-21', TRUE, 1, 5000.00, 'Q1 2025 Sentinel Prize', TRUE);

-- Initialize leaderboard for all users for Q1 2025
INSERT INTO leaderboard (user_id, quarter_name, total_points, submissions_count, verified_count, implemented_count)
SELECT user_id, 'Q1 2025', 0, 0, 0, 0 FROM users;

-- Grant permissions to sentinel_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sentinel_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sentinel_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO sentinel_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO sentinel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO sentinel_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Project Sentinel database initialized successfully!';
    RAISE NOTICE 'Total users created: %', (SELECT COUNT(*) FROM users);
    RAISE NOTICE 'Total prizes configured: %', (SELECT COUNT(*) FROM prizes);
    RAISE NOTICE 'Remember to run the init-database.js script to hash passwords!';
END $$;
