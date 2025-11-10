/**
 * Project Sentinel - Database Operations
 * Client-side database operations using better-sqlite3 or similar
 * Note: For a web application, this would typically be server-side
 */

class DatabaseOperations {
    constructor(dbPath) {
        this.dbPath = dbPath;
        // In a real implementation, you'd use a proper database connection
        // For demo purposes, we'll simulate with localStorage
        this.useLocalStorage = true;
    }

    // Authentication
    async authenticate(username, password) {
        if (this.useLocalStorage) {
            const users = this.getStoredUsers();
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                this.logAction(user.user_id, 'login', null, null, 'User logged in');
                return { success: true, user };
            }
            return { success: false, message: 'Invalid credentials' };
        }
    }

    getCurrentUser() {
        const userJson = sessionStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    }

    logout() {
        sessionStorage.removeItem('currentUser');
    }

    // User Operations
    getStoredUsers() {
        const users = localStorage.getItem('sentinel_users');
        if (!users) {
            // Initialize with default users
            const defaultUsers = [
                { user_id: 0, username: 'chris.marinelli', password: 'password', full_name: 'Chris Marinelli', email: 'chris.marinelli@vysusgroup.com', region: 'Australia', role: 'System Administrator', is_sentinel: 0 },
                { user_id: 1, username: 'amani.razif', password: 'password', full_name: 'Amani Razif', email: 'amani.syafiqah@vysusgroup.com', region: 'Malaysia', role: 'Region Lead', is_sentinel: 1, sentinel_role: 'Sentinel Lead' },
                { user_id: 2, username: 'shahrul.azri', password: 'password', full_name: 'Shahrul Azri', email: 'shahrul.azri@vysus.com', region: 'Malaysia', role: 'Engineer', is_sentinel: 0 },
                { user_id: 3, username: 'syafiq.ishamuddin', password: 'password', full_name: 'Syafiq Ishamuddin', email: 'syafiq.ishamuddin@vysus.com', region: 'Malaysia', role: 'Engineer', is_sentinel: 1, sentinel_role: 'Sentinel' },
                { user_id: 4, username: 'izzat.luqman', password: 'password', full_name: 'Izzat Luqman', email: 'izzat.luqman@vysus.com', region: 'Malaysia', role: 'Engineer', is_sentinel: 0 },
                { user_id: 5, username: 'robby.palackal', password: 'password', full_name: 'Robby Palackal', email: 'robby.palackal@vysusgroup.com', region: 'Australia', role: 'Region Lead', is_sentinel: 0 },
                { user_id: 6, username: 'eduardo.laygo', password: 'password', full_name: 'Eduardo Laygo', email: 'eduardo.laygo@vysus.com', region: 'Australia', role: 'Lead', is_sentinel: 0 },
                { user_id: 7, username: 'ajith.tennakoon', password: 'password', full_name: 'Ajith Tennakoon', email: 'ajith.tennakoon@vysus.com', region: 'Australia', role: 'Lead', is_sentinel: 0 },
                { user_id: 8, username: 'montazur.rahman', password: 'password', full_name: 'Montazur Rahman', email: 'montazur.rahman@vysus.com', region: 'Australia', role: 'Senior Engineer', is_sentinel: 0 },
                { user_id: 9, username: 'zabir.syed', password: 'password', full_name: 'Zabir Syed', email: 'zabir.syed@vysus.com', region: 'Australia', role: 'Senior Engineer', is_sentinel: 0 },
                { user_id: 10, username: 'komal.gaikwad', password: 'password', full_name: 'Komal Gaikwad', email: 'komal.gaikwad@vysusgroup.com', region: 'Australia', role: 'Senior Engineer', is_sentinel: 0 },
                { user_id: 11, username: 'dominic.moncada', password: 'password', full_name: 'Dominic Moncada', email: 'dominic.moncada@vysusgroup.com', region: 'Australia', role: 'Engineer', is_sentinel: 1, sentinel_role: 'Sentinel' },
                { user_id: 12, username: 'khadija.kobra', password: 'password', full_name: 'Khadija Kobra', email: 'khadija.kobra@vysus.com', region: 'Australia', role: 'Engineer', is_sentinel: 0 },
                { user_id: 13, username: 'hayden.brunjes', password: 'password', full_name: 'Hayden Brunjes', email: 'hayden.brunjes@vysus.com', region: 'Australia', role: 'Engineer', is_sentinel: 0 },
                { user_id: 14, username: 'parthena.savvidis', password: 'password', full_name: 'Parthena Savvidis', email: 'parthena.savvidis@vysusgroup.com', region: 'Australia', role: 'Engineer', is_sentinel: 0 },
                { user_id: 15, username: 'naveenkumar.rajagopal', password: 'password', full_name: 'Naveenkumar Rajagopal', email: 'Naveenkumar.Rajagopal@vysusgroup.com', region: 'Australia', role: 'Engineer', is_sentinel: 0 },
                { user_id: 16, username: 'faraz.khan', password: 'password', full_name: 'Faraz Khan', email: 'faraz.khan@vysusgroup.com', region: 'India', role: 'Region Lead', is_sentinel: 1, sentinel_role: 'Sentinel Lead' },
                { user_id: 17, username: 'mohammed.arif', password: 'password', full_name: 'Mohammed Arif', email: 'mohammed.arif@vysus.com', region: 'India', role: 'Lead', is_sentinel: 0 },
                { user_id: 18, username: 'abhinit.gaurav', password: 'password', full_name: 'Abhinit Gaurav', email: 'abhinit.gaurav@vysus.com', region: 'India', role: 'Senior Engineer', is_sentinel: 1, sentinel_role: 'Sentinel' },
                { user_id: 19, username: 'chirag.rohit', password: 'password', full_name: 'Chirag Rohit', email: 'chirag.rohit@vysus.com', region: 'India', role: 'Senior Engineer', is_sentinel: 0 },
                { user_id: 20, username: 'owais.raja', password: 'password', full_name: 'Owais Raja', email: 'owais.raja@vysus.com', region: 'India', role: 'Engineer', is_sentinel: 0 }
            ];
            localStorage.setItem('sentinel_users', JSON.stringify(defaultUsers));
            return defaultUsers;
        }
        return JSON.parse(users);
    }

    getAllUsers() {
        return this.getStoredUsers();
    }

    getUserById(userId) {
        const users = this.getStoredUsers();
        return users.find(u => u.user_id === userId);
    }

    // Submission Operations
    getSubmissions() {
        const submissions = localStorage.getItem('sentinel_submissions');
        return submissions ? JSON.parse(submissions) : [];
    }

    async saveSubmission(submission) {
        const submissions = this.getSubmissions();
        const currentUser = this.getCurrentUser();

        // Get user's submission history
        const userHistory = submissions.filter(s => s.user_id === currentUser.user_id);

        // Gaming detection check (if GamingDetectionML is available)
        let gamingCheck = null;
        if (typeof GamingDetectionML !== 'undefined') {
            const ml = new GamingDetectionML();
            gamingCheck = await ml.analyzeSubmission({
                title: submission.title,
                description: submission.description,
                category: submission.category,
                solution: submission.solution || ''
            }, userHistory);

            // Block submission if gaming detected
            if (!gamingCheck.allowed) {
                const errorMessages = gamingCheck.issues
                    .filter(i => i.action === 'BLOCK')
                    .map(i => i.message)
                    .join('\n');

                // Log gaming alert
                ml.logGamingAlert(currentUser.user_id, {
                    type: 'SUBMISSION_BLOCKED',
                    issues: gamingCheck.issues,
                    submission: submission
                });

                return {
                    success: false,
                    blocked: true,
                    message: 'Submission blocked due to gaming detection:\n\n' + errorMessages,
                    gamingCheck
                };
            }

            // Show warnings but allow submission
            if (gamingCheck.warnings.length > 0) {
                ml.logGamingAlert(currentUser.user_id, {
                    type: 'SUBMISSION_WARNING',
                    warnings: gamingCheck.warnings,
                    submission: submission
                });
            }
        }

        const newSubmission = {
            submission_id: submissions.length + 1,
            user_id: currentUser.user_id,
            submitter_name: currentUser.full_name,
            region: currentUser.region,
            title: submission.title,
            description: submission.description,
            category: submission.category,
            solution: submission.solution || '',
            status: 'pending',
            submitted_date: new Date().toISOString(),
            impact_score: 0,
            points_awarded: 0,
            gaming_check: gamingCheck
        };

        submissions.push(newSubmission);
        localStorage.setItem('sentinel_submissions', JSON.stringify(submissions));

        this.logAction(currentUser.user_id, 'submission', 'submission', newSubmission.submission_id, 'Submitted new process improvement');

        return {
            success: true,
            submission: newSubmission,
            warnings: gamingCheck?.warnings || []
        };
    }

    updateSubmissionStatus(submissionId, status, points, reviewerNotes) {
        const submissions = this.getSubmissions();
        const submission = submissions.find(s => s.submission_id === submissionId);

        if (submission) {
            submission.status = status;
            submission.points_awarded = points || 0;
            submission.reviewed_date = new Date().toISOString();
            submission.reviewed_by = this.getCurrentUser()?.user_id;
            submission.implementation_notes = reviewerNotes;

            localStorage.setItem('sentinel_submissions', JSON.stringify(submissions));

            // Update leaderboard
            this.updateLeaderboard(submission.user_id, points || 0, status);
        }
    }

    // Leaderboard Operations
    getLeaderboard() {
        const leaderboard = localStorage.getItem('sentinel_leaderboard');
        if (!leaderboard) {
            // Initialize empty leaderboard
            const users = this.getStoredUsers();
            const initialLeaderboard = users.map((user, index) => ({
                rank: index + 1,
                user_id: user.user_id,
                full_name: user.full_name,
                region: user.region,
                role: user.role,
                is_sentinel: user.is_sentinel,
                total_points: 0,
                submissions_count: 0,
                verified_count: 0,
                implemented_count: 0
            }));
            localStorage.setItem('sentinel_leaderboard', JSON.stringify(initialLeaderboard));
            return initialLeaderboard;
        }
        return JSON.parse(leaderboard);
    }

    updateLeaderboard(userId, points, status) {
        const leaderboard = this.getLeaderboard();
        const entry = leaderboard.find(l => l.user_id === userId);

        if (entry) {
            entry.total_points += points;
            if (status === 'approved') entry.verified_count++;
            if (status === 'implemented') entry.implemented_count++;
            entry.submissions_count++;

            // Re-rank
            leaderboard.sort((a, b) => b.total_points - a.total_points);
            leaderboard.forEach((entry, index) => entry.rank = index + 1);

            localStorage.setItem('sentinel_leaderboard', JSON.stringify(leaderboard));
        }
    }

    getSentinelLeaderboard() {
        const leaderboard = this.getLeaderboard();
        return leaderboard.filter(l => l.is_sentinel === 1)
            .sort((a, b) => b.total_points - a.total_points);
    }

    // Prize Operations
    getPrizes() {
        const prizes = localStorage.getItem('sentinel_prizes');
        if (!prizes) {
            const defaultPrizes = [
                { prize_id: 1, quarter_name: 'Q1 2025', start_date: '2024-12-22', end_date: '2025-03-21', is_sentinel_prize: 0, place: 1, prize_amount: 15000, prize_description: 'First Place - Quarterly Champion' },
                { prize_id: 2, quarter_name: 'Q1 2025', start_date: '2024-12-22', end_date: '2025-03-21', is_sentinel_prize: 0, place: 2, prize_amount: 7500, prize_description: 'Second Place - Runner Up' },
                { prize_id: 3, quarter_name: 'Q1 2025', start_date: '2024-12-22', end_date: '2025-03-21', is_sentinel_prize: 0, place: 3, prize_amount: 3000, prize_description: 'Third Place' },
                { prize_id: 4, quarter_name: 'Q1 2025', start_date: '2024-12-22', end_date: '2025-03-21', is_sentinel_prize: 1, place: 1, prize_amount: 5000, prize_description: 'Top Sentinel - Excellence in Process Leadership' },
                { prize_id: 5, quarter_name: 'Q1 2025', start_date: '2024-12-22', end_date: '2025-03-21', is_sentinel_prize: 1, place: 2, prize_amount: 2500, prize_description: 'Second Place Sentinel' },
                { prize_id: 6, quarter_name: 'Q1 2025', start_date: '2024-12-22', end_date: '2025-03-21', is_sentinel_prize: 1, place: 3, prize_amount: 1000, prize_description: 'Third Place Sentinel' }
            ];
            localStorage.setItem('sentinel_prizes', JSON.stringify(defaultPrizes));
            return defaultPrizes;
        }
        return JSON.parse(prizes);
    }

    getActivePrizes() {
        return this.getPrizes().filter(p => p.quarter_name === 'Q1 2025');
    }

    // Audit Log
    logAction(userId, action, entityType, entityId, details) {
        const logs = localStorage.getItem('sentinel_audit_log');
        const logArray = logs ? JSON.parse(logs) : [];

        logArray.push({
            log_id: logArray.length + 1,
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem('sentinel_audit_log', JSON.stringify(logArray));
    }

    // Countdown to prize
    getQuarterEndCountdown() {
        const prizes = this.getActivePrizes();
        if (prizes.length === 0) return null;

        const endDate = new Date(prizes[0].end_date);
        const now = new Date();
        const diff = endDate - now;

        if (diff <= 0) return { expired: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes, expired: false };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseOperations;
}
