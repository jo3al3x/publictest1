// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS: allow local dev and your Vercel site via env
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_ORIGIN // e.g. https://publictest1-rust.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked for this origin"));
    }
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Business Consultancy API is running" });
});

// save Health Check ratings (stub for Google Sheets integration)
app.post("/api/healthcheck", async (req, res) => {
  try {
    const { ratings, assessor, observations } = req.body || {};
    if (!ratings || typeof ratings !== "object") {
      return res.status(400).json({ error: "ratings object is required" });
    }
    // TODO: Integrate with Google Sheets (bizAppForm) here.
    // Options:
    // 1) Service Account via googleapis (append rows)
    // 2) Apps Script Web App endpoint (forward JSON)
    // If a webhook is configured, forward payload for sheet append.
    if (process.env.HEALTHCHECK_WEBHOOK_URL) {
      try {
        await fetch(process.env.HEALTHCHECK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sheet: 'HealthCheck', ratings, ts: new Date().toISOString() })
        });
      } catch (err) {
        console.warn("Healthcheck webhook failed:", err.message);
      }
    }
    res.json({ status: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save healthcheck", details: e.message });
  }
});

// save Vision answers (stub for Google Sheets integration)
app.post("/api/vision", async (req, res) => {
  try {
    const { answers } = req.body || {};
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "answers object is required" });
    }
    if (process.env.VISION_WEBHOOK_URL) {
      try {
        await fetch(process.env.VISION_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sheet: 'VividVision', answers, ts: new Date().toISOString() })
        });
      } catch (err) {
        console.warn("Vision webhook failed:", err.message);
      }
    }
    res.json({ status: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save vision", details: e.message });
  }
});

// proxy chat to OpenAI

// generate plan
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { conversationHistory, ratings, vision } = req.body || {};

    let planPrompt = "";
    if (ratings && typeof ratings === "object") {
      const lines = Object.entries(ratings)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      const visionSummary = vision && typeof vision === "object"
        ? Object.entries(vision).map(([k, v]) => `${k}: ${String(v).slice(0, 280)}`).join("\n")
        : "(No vivid vision provided)";

      planPrompt = `Based on the following 10-dimension Business Health Check (1 = Poor, 5 = Excellent) and the Vivid Vision narrative, create a comprehensive 3-year strategic business roadmap that moves from current reality to the desired future state. Use lower-scoring areas as priorities for improvement and leverage higher-scoring areas as strengths. Provide realistic quarterly milestones and actionable steps.

Health Check Ratings:\n${lines}

Vivid Vision (summarized):\n${visionSummary}

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
    } else {
      if (!Array.isArray(conversationHistory)) {
        return res.status(400).json({ error: "Conversation history is required when ratings are not provided" });
      }
      const summary = conversationHistory
        .filter(m => m.role === "user")
        .map((m, i) => `Answer ${i + 1}: ${m.content}`)
        .join("\n\n");
      planPrompt = `Based on the following business consultation conversation, create a comprehensive 3-year strategic business plan.

Consultation Answers:
${summary}

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
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a business consultant creating detailed strategic plans. Always respond with valid JSON only." },
          { role: "user", content: planPrompt }
        ],
        max_tokens: 3000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: err.error?.message || response.statusText
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate business plan", details: e.message });
  }
});

// Present roadmap as Markdown slides with --- separators
app.post("/api/present-roadmap", async (req, res) => {
  try {
    const { ratings, vision, plan } = req.body || {};
    const ratingsLines = ratings && typeof ratings === 'object'
      ? Object.entries(ratings).map(([k, v]) => `${k}: ${v}`).join("\n")
      : '(No ratings provided)';
    const visionSummary = vision && typeof vision === 'object'
      ? Object.entries(vision).map(([k, v]) => `${k}: ${String(v).slice(0, 400)}`).join("\n")
      : '(No vision provided)';
    const planJson = plan ? JSON.stringify(plan) : '{}';

    const prompt = `Create a concise Markdown slide deck (use '---' between slides) to present a roadmap from current reality (health check) to the vivid vision. Keep it practical and executive-friendly. Use short bullets. Include: Title, Current Reality summary, Vision Highlights, Year 1 plan, Year 2 plan, Year 3 plan, Risks & Mitigations, and Next Steps.

Health Check (1-5):\n${ratingsLines}

Vivid Vision (summary):\n${visionSummary}

Plan (JSON):\n${planJson}

Output only Markdown with '---' between slides.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You create concise executive slide decks in Markdown. Return Markdown only." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: "OpenAI API error",
        details: err.error?.message || response.statusText
      });
    }

    const data = await response.json();
    res.json({ content: data.choices?.[0]?.message?.content || '' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to present roadmap", details: e.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log("Routes:");
  console.log("GET    /api/health");
  console.log("POST   /api/healthcheck");
  console.log("POST   /api/vision");
  console.log("POST   /api/generate-plan");
  console.log("POST   /api/present-roadmap");
});
