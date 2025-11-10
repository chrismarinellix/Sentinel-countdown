/**
 * AI Enhancement API Routes
 * Proxy for Anthropic API to avoid CORS issues
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
require('dotenv').config();

// Get API key status
router.get('/status', requireAuth, (req, res) => {
    const hasKey = !!process.env.ANTHROPIC_API_KEY;
    res.json({
        success: true,
        configured: hasKey,
        message: hasKey ? 'API key configured' : 'API key not configured'
    });
});

// Enhance submission (proxy to Anthropic API)
router.post('/enhance', requireAuth, async (req, res) => {
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                error: 'API key not configured on server'
            });
        }

        const { title, description, solution, category } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Build prompt
        const prompt = `You are an expert process improvement consultant helping to enhance a submission for a process excellence program.

**Original Submission:**
Title: ${title}
Category: ${category}
Current Process Description: ${description}
Proposed Solution: ${solution || 'Not provided'}

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

        // Call Anthropic API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
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
            return res.status(response.status).json({
                success: false,
                error: error.error?.message || 'API request failed'
            });
        }

        const data = await response.json();
        const content = data.content[0].text;

        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return res.status(500).json({
                success: false,
                error: 'Failed to parse AI response'
            });
        }

        const suggestions = JSON.parse(jsonMatch[0]);

        res.json({
            success: true,
            suggestions,
            raw: content
        });

    } catch (error) {
        console.error('AI enhancement error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test API connection
router.post('/test', requireAuth, async (req, res) => {
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                error: 'API key not configured'
            });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 10,
                messages: [{
                    role: 'user',
                    content: 'Test'
                }]
            })
        });

        if (response.ok) {
            res.json({
                success: true,
                message: 'API connection successful'
            });
        } else {
            const error = await response.json();
            res.status(response.status).json({
                success: false,
                error: error.error?.message || 'API test failed'
            });
        }

    } catch (error) {
        console.error('API test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
