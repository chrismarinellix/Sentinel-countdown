/**
 * Project Sentinel - ML Gaming Detection System
 * Uses Anthropic Claude API for intelligent gaming detection and scoring
 */

class GamingDetectionML {
    constructor() {
        this.apiKey = localStorage.getItem('anthropic_api_key') || '';
        this.detectionRules = this.getDetectionRules();
        this.gamingAlerts = [];
    }

    // Detection Rules Configuration
    getDetectionRules() {
        const rules = localStorage.getItem('gaming_detection_rules');
        if (!rules) {
            const defaultRules = {
                max_submissions_per_day: 3,
                max_submissions_per_week: 10,
                min_solution_ratio: 0.4, // 40% of submissions must have solutions
                min_description_length: 100,
                min_solution_length: 50,
                duplicate_threshold: 0.85, // Similarity score
                rapid_submission_minutes: 5, // Minutes between submissions
                min_impact_score: 20
            };
            localStorage.setItem('gaming_detection_rules', JSON.stringify(defaultRules));
            return defaultRules;
        }
        return JSON.parse(rules);
    }

    updateDetectionRules(newRules) {
        localStorage.setItem('gaming_detection_rules', JSON.stringify(newRules));
        this.detectionRules = newRules;
    }

    // Check submission for gaming patterns
    async analyzeSubmission(submission, userHistory) {
        const issues = [];
        const warnings = [];

        // Rule 1: Too many submissions in a day
        const todaySubmissions = this.countSubmissionsToday(userHistory);
        if (todaySubmissions >= this.detectionRules.max_submissions_per_day) {
            issues.push({
                type: 'EXCESSIVE_DAILY_SUBMISSIONS',
                severity: 'HIGH',
                message: `User has submitted ${todaySubmissions} ideas today (max: ${this.detectionRules.max_submissions_per_day})`,
                action: 'BLOCK'
            });
        }

        // Rule 2: Too many submissions in a week
        const weekSubmissions = this.countSubmissionsThisWeek(userHistory);
        if (weekSubmissions >= this.detectionRules.max_submissions_per_week) {
            warnings.push({
                type: 'EXCESSIVE_WEEKLY_SUBMISSIONS',
                severity: 'MEDIUM',
                message: `User has submitted ${weekSubmissions} ideas this week (max: ${this.detectionRules.max_submissions_per_week})`,
                action: 'WARN'
            });
        }

        // Rule 3: Solution ratio check
        const solutionRatio = this.calculateSolutionRatio(userHistory);
        if (solutionRatio < this.detectionRules.min_solution_ratio && userHistory.length >= 5) {
            warnings.push({
                type: 'LOW_SOLUTION_RATIO',
                severity: 'MEDIUM',
                message: `Only ${(solutionRatio * 100).toFixed(0)}% of submissions include solutions (required: ${(this.detectionRules.min_solution_ratio * 100).toFixed(0)}%)`,
                action: 'WARN',
                recommendation: 'Please provide solutions for your process improvement ideas to earn bonus points'
            });
        }

        // Rule 4: Description length check
        if (submission.description.length < this.detectionRules.min_description_length) {
            issues.push({
                type: 'INSUFFICIENT_DESCRIPTION',
                severity: 'MEDIUM',
                message: `Description too short (${submission.description.length} chars, minimum: ${this.detectionRules.min_description_length})`,
                action: 'BLOCK'
            });
        }

        // Rule 5: Rapid submission detection
        const lastSubmissionTime = this.getLastSubmissionTime(userHistory);
        if (lastSubmissionTime) {
            const minutesSinceLastSubmission = (Date.now() - new Date(lastSubmissionTime)) / (1000 * 60);
            if (minutesSinceLastSubmission < this.detectionRules.rapid_submission_minutes) {
                warnings.push({
                    type: 'RAPID_SUBMISSION',
                    severity: 'LOW',
                    message: `Submission within ${minutesSinceLastSubmission.toFixed(1)} minutes of previous submission`,
                    action: 'WARN'
                });
            }
        }

        // Rule 6: Duplicate/similarity detection (if API key available)
        if (this.apiKey && userHistory.length > 0) {
            const similarityCheck = await this.checkDuplicates(submission, userHistory);
            if (similarityCheck.isDuplicate) {
                issues.push({
                    type: 'DUPLICATE_SUBMISSION',
                    severity: 'HIGH',
                    message: `Submission is ${(similarityCheck.similarity * 100).toFixed(0)}% similar to previous submission`,
                    action: 'BLOCK',
                    similar_to: similarityCheck.similarSubmissionId
                });
            }
        }

        // Use Claude API for advanced analysis if available
        let aiAnalysis = null;
        if (this.apiKey) {
            aiAnalysis = await this.performAIAnalysis(submission, userHistory, issues, warnings);
        }

        return {
            allowed: issues.filter(i => i.action === 'BLOCK').length === 0,
            issues,
            warnings,
            aiAnalysis,
            timestamp: new Date().toISOString()
        };
    }

    // AI-powered analysis using Claude
    async performAIAnalysis(submission, userHistory, issues, warnings) {
        if (!this.apiKey) {
            return null;
        }

        try {
            const prompt = `You are an AI assistant helping detect gaming behavior and score process improvement submissions.

SUBMISSION TO ANALYZE:
Title: ${submission.title}
Description: ${submission.description}
Category: ${submission.category}
Proposed Solution: ${submission.solution || 'None provided'}

USER HISTORY: ${userHistory.length} previous submissions
Recent submissions: ${userHistory.slice(-3).map(s => s.title).join(', ')}

CURRENT ISSUES: ${issues.length > 0 ? issues.map(i => i.message).join('; ') : 'None'}
CURRENT WARNINGS: ${warnings.length > 0 ? warnings.map(w => w.message).join('; ') : 'None'}

Please analyze this submission for:
1. Quality and genuine value (1-10)
2. Likelihood this is gaming behavior (0-100%)
3. Suggested impact score (0-100 points)
4. Red flags or concerns
5. Recommendations for improvement

Respond in JSON format:
{
  "quality_score": number,
  "gaming_likelihood": number,
  "suggested_impact_score": number,
  "red_flags": [array of strings],
  "recommendations": [array of strings],
  "should_allow": boolean,
  "reasoning": "explanation"
}`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                console.error('Claude API error:', response.status);
                return null;
            }

            const data = await response.json();
            const content = data.content[0].text;

            // Extract JSON from response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            return null;
        } catch (error) {
            console.error('AI analysis error:', error);
            return null;
        }
    }

    // Calculate automatic score based on submission quality
    async calculateScore(submission, userHistory) {
        let baseScore = 50; // Base points for submission
        let bonusPoints = 0;

        // Bonus for including a solution
        if (submission.solution && submission.solution.length >= this.detectionRules.min_solution_length) {
            bonusPoints += 50;
        }

        // Bonus for detailed description
        if (submission.description.length >= 200) {
            bonusPoints += 20;
        }

        // Use AI to calculate impact score if API available
        if (this.apiKey) {
            const analysis = await this.performAIAnalysis(submission, userHistory, [], []);
            if (analysis && analysis.suggested_impact_score) {
                return Math.min(analysis.suggested_impact_score, 200); // Cap at 200 points
            }
        }

        return Math.min(baseScore + bonusPoints, 150); // Cap at 150 without AI
    }

    // Helper methods
    countSubmissionsToday(history) {
        const today = new Date().setHours(0, 0, 0, 0);
        return history.filter(s => {
            const subDate = new Date(s.submitted_date).setHours(0, 0, 0, 0);
            return subDate === today;
        }).length;
    }

    countSubmissionsThisWeek(history) {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return history.filter(s => new Date(s.submitted_date) >= weekAgo).length;
    }

    calculateSolutionRatio(history) {
        if (history.length === 0) return 1;
        const withSolutions = history.filter(s => s.solution && s.solution.length >= 50).length;
        return withSolutions / history.length;
    }

    getLastSubmissionTime(history) {
        if (history.length === 0) return null;
        const sorted = history.sort((a, b) => new Date(b.submitted_date) - new Date(a.submitted_date));
        return sorted[0].submitted_date;
    }

    async checkDuplicates(submission, history) {
        // Simple text similarity check
        const currentText = (submission.title + ' ' + submission.description).toLowerCase();

        for (const prev of history) {
            const prevText = (prev.title + ' ' + prev.description).toLowerCase();
            const similarity = this.calculateTextSimilarity(currentText, prevText);

            if (similarity >= this.detectionRules.duplicate_threshold) {
                return {
                    isDuplicate: true,
                    similarity,
                    similarSubmissionId: prev.submission_id
                };
            }
        }

        return { isDuplicate: false, similarity: 0 };
    }

    calculateTextSimilarity(text1, text2) {
        // Simple word-based similarity
        const words1 = new Set(text1.split(/\s+/));
        const words2 = new Set(text2.split(/\s+/));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    // Generate gaming detection report for admin
    generateGamingReport(allSubmissions, allUsers) {
        const report = {
            timestamp: new Date().toISOString(),
            total_users: allUsers.length,
            total_submissions: allSubmissions.length,
            flagged_users: [],
            high_risk_submissions: [],
            statistics: {
                avg_submissions_per_user: 0,
                users_with_warnings: 0,
                blocked_submissions: 0
            }
        };

        // Analyze each user
        allUsers.forEach(user => {
            const userSubmissions = allSubmissions.filter(s => s.user_id === user.user_id);
            const solutionRatio = this.calculateSolutionRatio(userSubmissions);
            const avgDescriptionLength = userSubmissions.reduce((sum, s) => sum + s.description.length, 0) / userSubmissions.length || 0;

            const risks = [];

            if (userSubmissions.length > this.detectionRules.max_submissions_per_week) {
                risks.push('EXCESSIVE_SUBMISSIONS');
            }

            if (solutionRatio < this.detectionRules.min_solution_ratio && userSubmissions.length >= 5) {
                risks.push('LOW_SOLUTION_RATIO');
            }

            if (avgDescriptionLength < this.detectionRules.min_description_length) {
                risks.push('LOW_QUALITY_DESCRIPTIONS');
            }

            if (risks.length > 0) {
                report.flagged_users.push({
                    user_id: user.user_id,
                    full_name: user.full_name,
                    submission_count: userSubmissions.length,
                    solution_ratio: solutionRatio,
                    avg_description_length: avgDescriptionLength,
                    risk_factors: risks,
                    risk_level: risks.length >= 2 ? 'HIGH' : 'MEDIUM'
                });
            }
        });

        report.statistics.users_with_warnings = report.flagged_users.length;
        report.statistics.avg_submissions_per_user = allSubmissions.length / allUsers.length;

        return report;
    }

    // Store alert for user
    logGamingAlert(userId, alert) {
        const alerts = localStorage.getItem('gaming_alerts') || '[]';
        const alertArray = JSON.parse(alerts);

        alertArray.push({
            user_id: userId,
            alert,
            timestamp: new Date().toISOString(),
            acknowledged: false
        });

        localStorage.setItem('gaming_alerts', JSON.stringify(alertArray));
    }

    // Get alerts for user
    getUserAlerts(userId) {
        const alerts = localStorage.getItem('gaming_alerts') || '[]';
        const alertArray = JSON.parse(alerts);
        return alertArray.filter(a => a.user_id === userId);
    }

    // Clear user alerts
    acknowledgeAlerts(userId) {
        const alerts = localStorage.getItem('gaming_alerts') || '[]';
        const alertArray = JSON.parse(alerts);
        const updated = alertArray.map(a => {
            if (a.user_id === userId) {
                a.acknowledged = true;
            }
            return a;
        });
        localStorage.setItem('gaming_alerts', JSON.stringify(updated));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamingDetectionML;
}
