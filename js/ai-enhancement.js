/**
 * Project Sentinel - AI Enhancement Feature
 * Uses Claude to improve submission descriptions and add implementation ideas
 */

class AIEnhancement {
    constructor() {
        this.apiKey = localStorage.getItem('anthropic_api_key') || '';
    }

    /**
     * Enhance submission with AI suggestions
     */
    async enhanceSubmission(submission) {
        try {
            const response = await this.callClaudeAPI(submission);

            if (response.success) {
                return {
                    success: true,
                    suggestions: this.parseEnhancements(response.content),
                    raw: response.content
                };
            } else {
                return {
                    success: false,
                    error: response.error
                };
            }
        } catch (error) {
            console.error('AI enhancement error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Build prompt for Claude
     */
    buildEnhancementPrompt(submission) {
        return `You are an expert process improvement consultant helping to enhance a submission for a process excellence program.

**Original Submission:**
Title: ${submission.title}
Category: ${submission.category}
Current Process Description: ${submission.description}
Proposed Solution: ${submission.solution || 'Not provided'}

**Your Task:**
Analyze this submission and provide enhanced versions that are:
1. More detailed and specific
2. Include measurable benefits
3. Consider potential challenges
4. Add implementation steps if missing
5. Suggest metrics for tracking impact

Please provide your response in the following JSON format:
{
  "enhanced_title": "An improved, more specific title",
  "enhanced_description": "A more detailed description of the current process and its pain points, including specific examples and quantifiable impacts",
  "enhanced_solution": "A comprehensive solution with step-by-step implementation, potential challenges addressed, and clear success criteria",
  "additional_ideas": [
    "Additional implementation idea 1",
    "Additional implementation idea 2",
    "Additional implementation idea 3"
  ],
  "suggested_metrics": [
    "Time saved per project (hours)",
    "Cost reduction per month ($)",
    "Error rate reduction (%)",
    "Other relevant metrics"
  ],
  "implementation_steps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "potential_challenges": [
    "Challenge 1 and how to address it",
    "Challenge 2 and how to address it"
  ],
  "estimated_impact": {
    "time_saved": "X hours per week/month",
    "cost_reduction": "$X per month/year",
    "quality_improvement": "Description of quality gains"
  }
}

Provide only the JSON response, no additional text.`;
    }

    /**
     * Call Claude API via backend proxy (avoids CORS issues)
     */
    async callClaudeAPI(submission) {
        try {
            // Check if running with backend server
            const apiUrl = window.location.protocol === 'file:'
                ? 'http://localhost:3000/api/ai/enhance'  // If opened as file, assume backend on port 3000
                : '/api/ai/enhance';  // If served from backend, use relative path

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',  // Include session cookie
                body: JSON.stringify(submission)
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: error.error || `API Error: ${response.status}`
                };
            }

            const data = await response.json();

            return {
                success: data.success,
                content: JSON.stringify(data.suggestions)
            };

        } catch (error) {
            // If backend is not available, try direct API call (will fail due to CORS, but worth a try)
            if (this.apiKey) {
                return await this.callClaudeAPIDirectly(submission);
            }

            return {
                success: false,
                error: 'Backend server not available. Please ensure the server is running or configure API key in admin settings.'
            };
        }
    }

    /**
     * Direct API call (will fail due to CORS unless configured properly)
     */
    async callClaudeAPIDirectly(submission) {
        try {
            const prompt = this.buildEnhancementPrompt(submission);
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 2048,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                })
            });

            if (!response.ok) {
                const error = await response.json();
                return {
                    success: false,
                    error: `API Error: ${response.status} - ${error.error?.message || 'Unknown error'}`
                };
            }

            const data = await response.json();
            const content = data.content[0].text;

            return {
                success: true,
                content: content
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Parse JSON response from Claude
     */
    parseEnhancements(content) {
        try {
            // Extract JSON from response (in case there's extra text)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error('No JSON found in response');
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            return null;
        }
    }

    /**
     * Generate HTML for suggestions display
     */
    generateSuggestionsHTML(suggestions) {
        if (!suggestions) {
            return '<p style="color: var(--orlando-red);">Failed to parse AI suggestions. Please try again.</p>';
        }

        return `
            <div class="ai-suggestions-container">
                <div class="suggestion-section">
                    <h3>📝 Enhanced Title</h3>
                    <div class="suggestion-content">
                        <div class="original-label">Original:</div>
                        <div class="original-text" id="original-title"></div>
                        <div class="enhanced-label">AI Suggestion:</div>
                        <div class="enhanced-text" id="enhanced-title">${suggestions.enhanced_title}</div>
                        <button class="accept-btn" onclick="acceptTitle()">✓ Accept</button>
                    </div>
                </div>

                <div class="suggestion-section">
                    <h3>📋 Enhanced Description</h3>
                    <div class="suggestion-content">
                        <div class="original-label">Original:</div>
                        <div class="original-text" id="original-description"></div>
                        <div class="enhanced-label">AI Suggestion:</div>
                        <div class="enhanced-text" id="enhanced-description">${suggestions.enhanced_description}</div>
                        <button class="accept-btn" onclick="acceptDescription()">✓ Accept</button>
                    </div>
                </div>

                <div class="suggestion-section">
                    <h3>💡 Enhanced Solution</h3>
                    <div class="suggestion-content">
                        <div class="original-label">Original:</div>
                        <div class="original-text" id="original-solution"></div>
                        <div class="enhanced-label">AI Suggestion:</div>
                        <div class="enhanced-text" id="enhanced-solution">${suggestions.enhanced_solution}</div>
                        <button class="accept-btn" onclick="acceptSolution()">✓ Accept</button>
                    </div>
                </div>

                <div class="suggestion-section">
                    <h3>🎯 Implementation Steps</h3>
                    <div class="suggestion-content">
                        <ul class="implementation-list">
                            ${suggestions.implementation_steps.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                        <button class="accept-btn" onclick="appendImplementation()">✓ Add to Solution</button>
                    </div>
                </div>

                <div class="suggestion-section">
                    <h3>💡 Additional Ideas</h3>
                    <div class="suggestion-content">
                        <ul class="ideas-list">
                            ${suggestions.additional_ideas.map(idea => `<li>${idea}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="suggestion-section">
                    <h3>📊 Suggested Metrics</h3>
                    <div class="suggestion-content">
                        <ul class="metrics-list">
                            ${suggestions.suggested_metrics.map(metric => `<li>${metric}</li>`).join('')}
                        </ul>
                        <button class="accept-btn" onclick="appendMetrics()">✓ Add to Solution</button>
                    </div>
                </div>

                <div class="suggestion-section">
                    <h3>⚠️ Potential Challenges</h3>
                    <div class="suggestion-content">
                        <ul class="challenges-list">
                            ${suggestions.potential_challenges.map(challenge => `<li>${challenge}</li>`).join('')}
                        </ul>
                        <button class="accept-btn" onclick="appendChallenges()">✓ Add to Solution</button>
                    </div>
                </div>

                <div class="suggestion-section">
                    <h3>📈 Estimated Impact</h3>
                    <div class="suggestion-content">
                        <div class="impact-grid">
                            <div><strong>Time Saved:</strong> ${suggestions.estimated_impact.time_saved}</div>
                            <div><strong>Cost Reduction:</strong> ${suggestions.estimated_impact.cost_reduction}</div>
                            <div><strong>Quality Improvement:</strong> ${suggestions.estimated_impact.quality_improvement}</div>
                        </div>
                        <button class="accept-btn" onclick="appendImpact()">✓ Add to Description</button>
                    </div>
                </div>

                <div class="suggestion-actions">
                    <button class="btn" onclick="acceptAllSuggestions()">✓ Accept All Suggestions</button>
                    <button class="btn btn-secondary" onclick="closeSuggestions()">✗ Dismiss</button>
                </div>
            </div>
        `;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEnhancement;
}
