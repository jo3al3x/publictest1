// server.js - Node.js/Express Backend
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Chat endpoint - handles conversation messages
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      details: error.message 
    });
  }
});

// Generate business plan endpoint
app.post('/api/generate-plan', async (req, res) => {
  try {
    const { conversationHistory } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: 'Conversation history is required' });
    }

    // Extract user answers from conversation
    const conversationSummary = conversationHistory
      .filter(msg => msg.role === 'user')
      .map((msg, index) => `Answer ${index + 1}: ${msg.content}`)
      .join('\n\n');

    const planPrompt = `Based on the following business consultation conversation, create a comprehensive 3-year strategic business plan.

Consultation Answers:
${conversationSummary}

Create a detailed business plan in JSON format with the following structure:

{
  "executiveSummary": "2-3 sentence overview of the business and strategic direction",
  "businessOverview": {
    "industry": "Industry name",
    "stage": "Current business stage",
    "keyStrengths": ["strength1", "strength2", "strength3"],
    "primaryChallenge": "Main challenge to address"
  },
  "yearOne": {
    "focus": "Primary focus for year 1",
    "keyObjectives": ["objective1", "objective2", "objective3"],
    "quarterlyMilestones": {
      "Q1": "Specific milestone",
      "Q2": "Specific milestone",
      "Q3": "Specific milestone",
      "Q4": "Specific milestone"
    },
    "revenueTarget": "Realistic revenue target",
    "teamGrowth": "Team size/hiring plan"
  },
  "yearTwo": {
    "focus": "Primary focus for year 2",
    "keyObjectives": ["objective1", "objective2", "objective3"],
    "quarterlyMilestones": {
      "Q1": "Specific milestone",
      "Q2": "Specific milestone",
      "Q3": "Specific milestone",
      "Q4": "Specific milestone"
    },
    "revenueTarget": "Realistic revenue target",
    "teamGrowth": "Team size/hiring plan"
  },
  "yearThree": {
    "focus": "Primary focus for year 3",
    "keyObjectives": ["objective1", "objective2", "objective3"],
    "quarterlyMilestones": {
      "Q1": "Specific milestone",
      "Q2": "Specific milestone",
      "Q3": "Specific milestone",
      "Q4": "Specific milestone"
    },
    "revenueTarget": "Realistic revenue target",
    "teamGrowth": "Team size/hiring plan"
  },
  "actionSteps": {
    "immediate": ["action1", "action2", "action3"],
    "nextThreeMonths": ["action1", "action2", "action3"],
    "nextSixMonths": ["action1", "action2", "action3"]
  },
  "riskAssessment": {
    "primaryRisks": ["risk1", "risk2", "risk3"],
    "mitigationStrategies": ["strategy1", "strategy2", "strategy3"]
  },
  "resourceRequirements": {
    "funding": "Estimated funding needs",
    "keyHires": ["role1", "role2", "role3"],
    "toolsAndSystems": ["tool1", "tool2", "tool3"]
  }
}

Respond ONLY with valid JSON. Do not include any markdown formatting or explanations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a business consultant creating detailed strategic plans. Always respond with valid JSON only.' },
          { role: 'user', content: planPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Error in /api/generate-plan:', error);
    res.status(500).json({ 
      error: 'Failed to generate business plan',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Business Consultancy API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at:`);
  console.log(`   - POST http://localhost:${PORT}/api/chat`);
  console.log(`   - POST http://localhost:${PORT}/api/generate-plan`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
});