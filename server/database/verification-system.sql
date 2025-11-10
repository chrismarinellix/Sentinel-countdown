-- Project Sentinel - Multi-Stage Verification System
-- Adds robust anti-gaming verification with milestones and impact tracking

-- Submission Milestones Table (tracks multi-stage verification)
CREATE TABLE IF NOT EXISTS submission_milestones (
    milestone_id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
    milestone_type VARCHAR(50) NOT NULL CHECK (milestone_type IN (
        'initial_review',           -- First Sentinel review
        'concept_approved',          -- Concept is valid
        'implementation_started',    -- Work has begun
        'pilot_completed',           -- Pilot or test phase done
        'impact_measured',           -- Impact data collected
        'final_verification',        -- Final Sentinel verification
        'fully_implemented'          -- Complete and verified
    )),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress')),
    verified_by INTEGER REFERENCES users(user_id),
    verification_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    evidence_provided TEXT,
    required BOOLEAN DEFAULT TRUE,  -- Some milestones are mandatory
    points_at_milestone INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(submission_id, milestone_type)
);

-- Impact Verification Table (tracks actual vs claimed impact)
CREATE TABLE IF NOT EXISTS impact_verifications (
    verification_id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
    claimed_impact TEXT NOT NULL,
    actual_impact TEXT,
    measurement_method VARCHAR(100),
    metrics JSONB,  -- Store measurable data: {time_saved: 120, cost_reduced: 5000, errors_prevented: 15}
    verified_by INTEGER REFERENCES users(user_id),
    verification_status VARCHAR(50) CHECK (verification_status IN ('pending', 'verified', 'partially_verified', 'not_verified')),
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    impact_score_adjustment INTEGER,  -- Adjust points based on actual vs claimed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Attachments (for proof of implementation/impact)
CREATE TABLE IF NOT EXISTS evidence_attachments (
    attachment_id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL REFERENCES submissions(submission_id) ON DELETE CASCADE,
    milestone_id INTEGER REFERENCES submission_milestones(milestone_id) ON DELETE CASCADE,
    attachment_type VARCHAR(50) CHECK (attachment_type IN ('screenshot', 'document', 'data', 'video', 'link', 'other')),
    description TEXT,
    file_path TEXT,
    url TEXT,
    uploaded_by INTEGER NOT NULL REFERENCES users(user_id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification Checkpoints (defines required checkpoints for different submission types)
CREATE TABLE IF NOT EXISTS verification_checkpoints (
    checkpoint_id SERIAL PRIMARY KEY,
    submission_category VARCHAR(100) NOT NULL,
    checkpoint_name VARCHAR(100) NOT NULL,
    checkpoint_description TEXT,
    min_days_from_submission INTEGER DEFAULT 0,  -- Minimum time before this checkpoint
    max_days_from_submission INTEGER,            -- Maximum time allowed
    requires_evidence BOOLEAN DEFAULT FALSE,
    points_awarded INTEGER DEFAULT 0,
    display_order INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(submission_category, checkpoint_name)
);

-- Sentinel Verification Votes (for multi-sentinel approval)
CREATE TABLE IF NOT EXISTS sentinel_verification_votes (
    vote_id SERIAL PRIMARY KEY,
    milestone_id INTEGER NOT NULL REFERENCES submission_milestones(milestone_id) ON DELETE CASCADE,
    sentinel_id INTEGER NOT NULL REFERENCES users(user_id),
    vote VARCHAR(20) CHECK (vote IN ('approve', 'reject', 'abstain', 'needs_more_info')),
    comments TEXT,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(milestone_id, sentinel_id)
);

-- Gaming Detection Flags (enhanced with verification tracking)
CREATE TABLE IF NOT EXISTS gaming_detection_flags (
    flag_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    submission_id INTEGER REFERENCES submissions(submission_id) ON DELETE CASCADE,
    flag_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    auto_detected BOOLEAN DEFAULT TRUE,
    detection_details JSONB,
    reviewed_by INTEGER REFERENCES users(user_id),
    review_status VARCHAR(50) DEFAULT 'pending' CHECK (review_status IN ('pending', 'false_positive', 'confirmed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Update submissions table status to include new workflow states
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_status_check
    CHECK (status IN (
        'draft',
        'submitted',
        'initial_review',
        'concept_approved',
        'implementation',
        'pilot_testing',
        'impact_measurement',
        'final_verification',
        'completed',
        'rejected',
        'on_hold'
    ));

-- Indexes for performance
CREATE INDEX idx_milestones_submission ON submission_milestones(submission_id);
CREATE INDEX idx_milestones_type ON submission_milestones(milestone_type);
CREATE INDEX idx_milestones_status ON submission_milestones(status);

CREATE INDEX idx_impact_verifications_submission ON impact_verifications(submission_id);
CREATE INDEX idx_impact_verifications_status ON impact_verifications(verification_status);

CREATE INDEX idx_evidence_submission ON evidence_attachments(submission_id);
CREATE INDEX idx_evidence_milestone ON evidence_attachments(milestone_id);

CREATE INDEX idx_sentinel_votes_milestone ON sentinel_verification_votes(milestone_id);
CREATE INDEX idx_sentinel_votes_sentinel ON sentinel_verification_votes(sentinel_id);

CREATE INDEX idx_gaming_flags_user ON gaming_detection_flags(user_id);
CREATE INDEX idx_gaming_flags_submission ON gaming_detection_flags(submission_id);
CREATE INDEX idx_gaming_flags_severity ON gaming_detection_flags(severity);

-- Insert default verification checkpoints for each category
INSERT INTO verification_checkpoints (submission_category, checkpoint_name, checkpoint_description, min_days_from_submission, max_days_from_submission, requires_evidence, points_awarded, display_order) VALUES
-- AEMO Processes
('AEMO Processes', 'Initial Review', 'Sentinel reviews concept and feasibility', 0, 7, FALSE, 25, 1),
('AEMO Processes', 'Concept Approved', 'Idea approved for implementation', 1, 14, FALSE, 25, 2),
('AEMO Processes', 'Implementation Started', 'Work has begun with evidence', 3, 30, TRUE, 0, 3),
('AEMO Processes', 'Pilot Completed', 'Process tested in pilot environment', 14, 60, TRUE, 50, 4),
('AEMO Processes', 'Impact Measured', 'Results measured and documented', 21, 90, TRUE, 50, 5),
('AEMO Processes', 'Final Verification', 'Sentinels verify actual impact', 30, 120, TRUE, 50, 6),

-- PSSE/PSCAD
('PSSE/PSCAD', 'Initial Review', 'Sentinel reviews technical approach', 0, 7, FALSE, 25, 1),
('PSSE/PSCAD', 'Concept Approved', 'Technical solution approved', 1, 14, FALSE, 25, 2),
('PSSE/PSCAD', 'Implementation Started', 'Development begun with proof', 3, 30, TRUE, 0, 3),
('PSSE/PSCAD', 'Testing Completed', 'Solution tested and validated', 14, 60, TRUE, 50, 4),
('PSSE/PSCAD', 'Impact Measured', 'Time/efficiency gains documented', 21, 90, TRUE, 50, 5),
('PSSE/PSCAD', 'Final Verification', 'Sentinels verify deployment', 30, 120, TRUE, 50, 6),

-- Electrical Design
('Electrical Design', 'Initial Review', 'Design concept reviewed', 0, 7, FALSE, 25, 1),
('Electrical Design', 'Concept Approved', 'Design approach approved', 1, 14, FALSE, 25, 2),
('Electrical Design', 'Implementation Started', 'Design work commenced', 3, 30, TRUE, 0, 3),
('Electrical Design', 'Design Completed', 'Design delivered with documentation', 14, 60, TRUE, 50, 4),
('Electrical Design', 'Impact Measured', 'Quality/efficiency improvements shown', 21, 90, TRUE, 50, 5),
('Electrical Design', 'Final Verification', 'Sentinels verify adoption and impact', 30, 120, TRUE, 50, 6),

-- Client Communication
('Client Communication', 'Initial Review', 'Communication improvement reviewed', 0, 7, FALSE, 25, 1),
('Client Communication', 'Concept Approved', 'Approach approved for rollout', 1, 14, FALSE, 25, 2),
('Client Communication', 'Pilot Started', 'New process piloted with client', 7, 30, TRUE, 0, 3),
('Client Communication', 'Feedback Collected', 'Client feedback documented', 14, 60, TRUE, 50, 4),
('Client Communication', 'Impact Measured', 'Satisfaction/efficiency measured', 21, 90, TRUE, 50, 5),
('Client Communication', 'Final Verification', 'Sentinels verify client outcomes', 30, 120, TRUE, 50, 6),

-- Project Management
('Project Management', 'Initial Review', 'PM improvement concept reviewed', 0, 7, FALSE, 25, 1),
('Project Management', 'Concept Approved', 'PM approach approved', 1, 14, FALSE, 25, 2),
('Project Management', 'Implementation Started', 'New PM process deployed', 7, 30, TRUE, 0, 3),
('Project Management', 'Results Tracked', 'Project metrics tracked', 14, 60, TRUE, 50, 4),
('Project Management', 'Impact Measured', 'Efficiency/outcome improvements shown', 30, 90, TRUE, 50, 5),
('Project Management', 'Final Verification', 'Sentinels verify sustained improvement', 45, 120, TRUE, 50, 6);

-- Create view for submission progress tracking
CREATE OR REPLACE VIEW submission_progress AS
SELECT
    s.submission_id,
    s.title,
    s.status,
    u.full_name AS submitter,
    s.submitted_date,
    COUNT(sm.milestone_id) FILTER (WHERE sm.status = 'approved') AS milestones_completed,
    COUNT(vc.checkpoint_id) AS total_checkpoints_required,
    ROUND(
        (COUNT(sm.milestone_id) FILTER (WHERE sm.status = 'approved')::NUMERIC /
         NULLIF(COUNT(vc.checkpoint_id)::NUMERIC, 0)) * 100
    ) AS completion_percentage,
    SUM(sm.points_at_milestone) AS points_earned,
    MAX(sm.verification_date) AS last_milestone_date
FROM submissions s
JOIN users u ON s.user_id = u.user_id
LEFT JOIN submission_milestones sm ON s.submission_id = sm.submission_id
LEFT JOIN verification_checkpoints vc ON s.category = vc.submission_category AND vc.is_active = TRUE
GROUP BY s.submission_id, s.title, s.status, u.full_name, s.submitted_date;

-- Function to auto-create milestones when submission is created
CREATE OR REPLACE FUNCTION create_submission_milestones()
RETURNS TRIGGER AS $$
BEGIN
    -- Create milestones based on category checkpoints
    INSERT INTO submission_milestones (submission_id, milestone_type, status, required)
    SELECT
        NEW.submission_id,
        checkpoint_name,
        'pending',
        TRUE
    FROM verification_checkpoints
    WHERE submission_category = NEW.category AND is_active = TRUE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_milestones_on_submission
    AFTER INSERT ON submissions
    FOR EACH ROW
    EXECUTE FUNCTION create_submission_milestones();

-- Function to detect gaming based on verification patterns
CREATE OR REPLACE FUNCTION detect_verification_gaming()
RETURNS TRIGGER AS $$
DECLARE
    days_since_submission INTEGER;
    checkpoint_config RECORD;
    flag_message TEXT;
BEGIN
    -- Get checkpoint configuration
    SELECT * INTO checkpoint_config
    FROM verification_checkpoints vc
    JOIN submissions s ON s.submission_id = NEW.submission_id
    WHERE vc.submission_category = s.category
    AND vc.checkpoint_name = NEW.milestone_type;

    -- Calculate days since submission
    SELECT EXTRACT(DAY FROM (NEW.verification_date - s.submitted_date))::INTEGER
    INTO days_since_submission
    FROM submissions s
    WHERE s.submission_id = NEW.submission_id;

    -- Check if milestone is too fast (gaming attempt)
    IF checkpoint_config.min_days_from_submission IS NOT NULL AND
       days_since_submission < checkpoint_config.min_days_from_submission THEN

        INSERT INTO gaming_detection_flags (
            user_id, submission_id, flag_type, severity, description, detection_details
        )
        SELECT
            s.user_id,
            NEW.submission_id,
            'MILESTONE_TOO_FAST',
            'HIGH',
            format('Milestone "%s" reached in %s days, minimum required: %s days',
                   NEW.milestone_type, days_since_submission, checkpoint_config.min_days_from_submission),
            jsonb_build_object(
                'milestone_type', NEW.milestone_type,
                'days_taken', days_since_submission,
                'min_required', checkpoint_config.min_days_from_submission
            )
        FROM submissions s WHERE s.submission_id = NEW.submission_id;
    END IF;

    -- Check if evidence required but missing
    IF checkpoint_config.requires_evidence AND
       (NEW.evidence_provided IS NULL OR NEW.evidence_provided = '') AND
       NOT EXISTS (SELECT 1 FROM evidence_attachments WHERE milestone_id = NEW.milestone_id) THEN

        INSERT INTO gaming_detection_flags (
            user_id, submission_id, flag_type, severity, description
        )
        SELECT
            s.user_id,
            NEW.submission_id,
            'MISSING_EVIDENCE',
            'MEDIUM',
            format('Milestone "%s" requires evidence but none provided', NEW.milestone_type)
        FROM submissions s WHERE s.submission_id = NEW.submission_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_verification_gaming
    AFTER INSERT OR UPDATE ON submission_milestones
    FOR EACH ROW
    WHEN (NEW.status = 'approved')
    EXECUTE FUNCTION detect_verification_gaming();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Verification system created successfully!';
    RAISE NOTICE 'Total checkpoints configured: %', (SELECT COUNT(*) FROM verification_checkpoints);
    RAISE NOTICE 'Multi-stage verification with anti-gaming enabled!';
END $$;
