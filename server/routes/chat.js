const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { auth } = require('../middleware/auth');
const ChatMessage = require('../models/ChatMessage');
const reportCtrl = require('../controllers/reportController');
// session IDs provided by client

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const REPORT_MAP = {
  sectionAttendance: reportCtrl.sectionAttendance,
  subjectAttendance: reportCtrl.subjectAttendance,
  lowAttendance: reportCtrl.lowAttendance,
  exactAttendance: reportCtrl.exactAttendance,
  departmentAttendance: reportCtrl.departmentAttendance,
  internalMarks: reportCtrl.internalMarks,
  externalMarks: reportCtrl.externalMarks,
  semesterResults: reportCtrl.semesterResults,
  subjectPerformance: reportCtrl.subjectPerformance,
  backlogReport: reportCtrl.backlogReport,
  pendingCompletions: reportCtrl.pendingCompletions,
  cgpaDistribution: reportCtrl.cgpaDistribution,
  topPerformers: reportCtrl.topPerformers,
  studentRanking: reportCtrl.studentRanking,
  academicRisk: reportCtrl.academicRisk
};

const SYSTEM_PROMPT = `You are DataBot, an intelligent academic report assistant for university DEOs and administrative staff.
Your job is to understand user queries about academic data and extract a structured JSON intent.

Available report types and their supported params:

[ATTENDANCE REPORTS]
- sectionAttendance
  Params: department, section, semester, batch, academicYear
  Use for: attendance overview for a section or all sections

- subjectAttendance
  Params: department, subject, semester, batch, academicYear
  Use for: attendance for a specific subject across students

- lowAttendance
  Params: department, threshold (default 75), semester, batch, academicYear
  Use for: students BELOW a certain attendance %, e.g. "attendance below 60", "defaulters"
  Set threshold to the number mentioned (e.g. 60 for "below 60%")

- exactAttendance
  Params: department, percentage, minPct, maxPct, semester, batch, academicYear
  Use for: students with EXACTLY or AROUND a specific attendance %, or within a range
  Examples:
    "students with exactly 55% attendance" → percentage=55
    "students with attendance between 60 and 70" → minPct=60, maxPct=70
    "students with 80% attendance" → percentage=80
  IMPORTANT: Use this (NOT lowAttendance) when the user says "exactly", "around", "approximately", or gives a specific number without saying "below" or "above".

- departmentAttendance
  Params: department, semester, academicYear
  Use for: subject-wise average attendance across the whole department

[MARKS REPORTS]
- internalMarks
  Params: department, section, semester, batch, subject, academicYear
  Use for: internal/mid-term marks

- externalMarks
  Params: department, section, semester, batch, subject, academicYear
  Use for: external/end-semester marks and totals

- semesterResults
  Params: department, semester, batch, academicYear
  Use for: overall semester pass/fail summary per student

- subjectPerformance
  Params: department, subject, semester, academicYear
  Use for: pass rate, average marks, grade distribution for subjects

[BACKLOG REPORTS]
- backlogReport
  Params: department, semester, batch, subject
  Use for: students who have backlogs/arrears
  Set subject to filter by a specific subject (e.g. "DBMS", "Operating Systems")

- pendingCompletions
  Params: department
  Use for: which subjects have the most pending backlogs/completions

[CGPA / RANKING REPORTS]
- cgpaDistribution
  Params: department, batch, semester
  Use for: distribution of students across CGPA ranges

- topPerformers
  Params: department, batch, limit (default 10)
  Use for: top N students by CGPA — set limit to the number mentioned

- studentRanking
  Params: department, batch, semester
  Use for: full ranked list of students by CGPA

- academicRisk
  Params: department, batch
  Use for: students at academic risk (low CGPA, multiple backlogs, low attendance)

Respond ONLY in this exact JSON format (no markdown, no explanation):
{
  "intent": "report" | "greeting" | "unknown",
  "reportType": "<one of the report types above or null>",
  "params": {
    "department": "<dept or null>",
    "section": "<section letter or null>",
    "semester": <number or null>,
    "batch": "<batch year range e.g. 2021-2025 or null>",
    "subject": "<subject name or null>",
    "academicYear": "<e.g. 2024-25 or null>",
    "threshold": <number or null>,
    "percentage": <number or null>,
    "minPct": <number or null>,
    "maxPct": <number or null>,
    "limit": <number or null>
  },
  "response": "<friendly message to show user>"
}

Rules:
- Always set department from context if not mentioned by user.
- If the user says "below X%" → lowAttendance with threshold=X.
- If the user says "exactly X%", "around X%", "approximately X%", or just "X% attendance" → exactAttendance with percentage=X.
- If the user says "between X% and Y%" → exactAttendance with minPct=X, maxPct=Y.
- If the user is greeting, set intent to 'greeting' and write a warm response in 'response'.
- If you can't understand, set intent to 'unknown' and ask for clarification.
Current user department: {USER_DEPT}`;

// POST /api/chat/message
router.post('/message', auth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const sid = sessionId || Math.random().toString(36).substring(2);

    // Save user message
    await ChatMessage.create({ user: req.user._id, sessionId: sid, role: 'user', content: message });

    // Build conversation history for context
    const history = await ChatMessage.find({ user: req.user._id, sessionId: sid }).sort({ timestamp: 1 }).limit(10);
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT.replace('{USER_DEPT}', req.user.department) },
      ...history.map(m => ({ role: m.role, content: m.content }))
    ];

    // Call Groq LLM
    let llmResponse;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.1,
        max_tokens: 512
      });
      llmResponse = completion.choices[0].message.content.trim();
    } catch (llmErr) {
      console.error('LLM Error:', llmErr.message);
      llmResponse = JSON.stringify({
        intent: 'unknown',
        reportType: null,
        params: {},
        response: "I'm having trouble connecting to the AI engine. I'll try to help based on keywords in your message."
      });
    }

    let parsed;
    try {
      // Strip any markdown code fences if present
      const cleaned = llmResponse.replace(/```json?/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { intent: 'unknown', reportType: null, params: {}, response: "I couldn't understand that. Could you rephrase your request?" };
    }

    let reportData = null;
    let finalResponse = parsed.response || "I'm here to help! What report do you need?";

    if (parsed.intent === 'report' && parsed.reportType && REPORT_MAP[parsed.reportType]) {
      try {
        const params = { ...parsed.params };
        if (!params.department) params.department = req.user.department;
        reportData = await REPORT_MAP[parsed.reportType](params);
        const count = reportData.data ? reportData.data.length : 0;
        finalResponse = `${parsed.response || ''}

I found **${count} record(s)**. Here's your **${parsed.reportType}** report for the ${params.department} department.`;
      } catch (reportErr) {
        finalResponse = `I understood your request for a **${parsed.reportType}** report, but encountered an error fetching data: ${reportErr.message}`;
      }
    }

    // Save assistant message
    const savedMsg = await ChatMessage.create({
      user: req.user._id,
      sessionId: sid,
      role: 'assistant',
      content: finalResponse,
      reportData,
      reportType: parsed.reportType
    });

    res.json({
      sessionId: sid,
      messageId: savedMsg._id,
      role: 'assistant',
      content: finalResponse,
      reportData,
      reportType: parsed.reportType,
      timestamp: savedMsg.timestamp
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const sessions = await ChatMessage.aggregate([
      { $match: { user: req.user._id } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$sessionId', lastMessage: { $first: '$content' }, updatedAt: { $first: '$timestamp' }, count: { $sum: 1 } } },
      { $sort: { updatedAt: -1 } },
      { $limit: 20 }
    ]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ user: req.user._id, sessionId: req.params.sessionId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/chat/session/:sessionId
router.delete('/session/:sessionId', auth, async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id, sessionId: req.params.sessionId });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
