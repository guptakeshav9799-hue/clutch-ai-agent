const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getModel() {
  if (!model) {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY not set — AI features will use demo data');
      return null;
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

async function detectDeadlines(emailSubject, emailBody) {
  const m = getModel();
  if (!m) return getDemoDeadline(emailSubject);

  const prompt = `You are a deadline detection AI. Analyze this email and determine if it contains a deadline, task, assignment, meeting, exam, or time-sensitive commitment.

Email Subject: ${emailSubject}
Email Body: ${emailBody}

If a deadline exists, extract:
- task_title: short clear title (max 8 words)
- deadline_date: in ISO 8601 format (YYYY-MM-DDTHH:MM:SS)
- task_type: one of [assignment, exam, meeting, payment, interview, submission, other]
- priority: one of [critical, high, medium, low]
- estimated_hours: realistic number (1-20)
- context: one sentence of context

If no deadline exists, return null.

Respond ONLY in valid JSON. No explanation, no markdown.`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Gemini deadline detection error:', error.message);
    return null;
  }
}

async function breakdownTask(taskTitle, deadline, taskType, estimatedHours) {
  const m = getModel();
  if (!m) return getDemoBreakdown(taskTitle, deadline);

  const prompt = `You are an execution agent for a student/professional. Break down this task into micro-steps they can act on immediately.

Task: ${taskTitle}
Deadline: ${deadline}
Type: ${taskType}
Estimated Hours: ${estimatedHours}

Return a JSON object:
{
  "micro_steps": [
    {"step": "step description", "duration_mins": 30, "order": 1}
  ],
  "suggested_schedule": [
    {"date": "YYYY-MM-DD", "hours": 2, "focus": "what to do"}
  ],
  "quick_start_action": "The single first thing they should do RIGHT NOW (max 15 words)"
}

Respond ONLY in valid JSON. No explanation, no markdown.`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini breakdown error:', error.message);
    return getDemoBreakdown(taskTitle, deadline);
  }
}

async function generateDocContent(taskTitle, taskType, context) {
  const m = getModel();
  if (!m) return getDemoDocContent(taskTitle);

  const prompt = `Generate structured document content for a student/professional working on this task.

Task: ${taskTitle}
Type: ${taskType}
Context: ${context || 'No additional context'}

Return a JSON object:
{
  "overview": "2-3 sentence task overview",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "resources": ["search query 1", "search query 2", "search query 3", "search query 4", "search query 5"],
  "checklist": ["checklist item 1", "checklist item 2", "checklist item 3"]
}

Respond ONLY in valid JSON. No explanation, no markdown.`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini doc content error:', error.message);
    return getDemoDocContent(taskTitle);
  }
}

async function generateEmergencyPlan(taskTitle, hoursRemaining) {
  const m = getModel();
  if (!m) return getDemoEmergencyPlan(taskTitle, hoursRemaining);

  const prompt = `The user has ${hoursRemaining} hours left for: ${taskTitle}
Generate:
1. A polite deadline extension request email (to professor/manager)
2. A "minimum viable submission" — what's the absolute minimum they must submit to not fail
3. A 3-step survival plan for the next ${hoursRemaining} hours

Return as JSON: {"extension_email": "full email text", "mvs_description": "description", "survival_steps": ["step1", "step2", "step3"]}

Respond ONLY in valid JSON. No explanation, no markdown.`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini emergency plan error:', error.message);
    return getDemoEmergencyPlan(taskTitle, hoursRemaining);
  }
}

async function analyzeProcrastinationDNA(completionData) {
  const m = getModel();
  if (!m) return getDemoDNA();

  const prompt = `Analyze this user's task completion pattern and generate their procrastination profile.

Completion data: ${JSON.stringify(completionData)}

Return JSON:
{
  "procrastination_type": "one of: Last-Minute Hero / Chronic Avoider / Anxious Planner / Balanced Worker",
  "average_start_delay_hours": number,
  "best_performance_time": "morning/afternoon/evening",
  "strongest_task_type": "which type they complete earliest",
  "weakest_task_type": "which type they delay most",
  "prediction": "When will they likely panic for their next task",
  "personalized_tip": "one specific tip for this person",
  "dna_score": 0-100
}

Respond ONLY in valid JSON. No explanation, no markdown.`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Gemini DNA analysis error:', error.message);
    return getDemoDNA();
  }
}

// ---- Demo fallbacks ----

function getDemoDeadline(subject) {
  return {
    task_title: subject ? subject.slice(0, 40) : 'Sample Task',
    deadline_date: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    task_type: 'assignment',
    priority: 'high',
    estimated_hours: 6,
    context: 'Detected from email inbox',
  };
}

function getDemoBreakdown(taskTitle, deadline) {
  return {
    micro_steps: [
      { step: 'Research the topic and gather key resources', duration_mins: 45, order: 1 },
      { step: 'Create an outline with main sections', duration_mins: 30, order: 2 },
      { step: 'Write the first draft of the introduction', duration_mins: 40, order: 3 },
      { step: 'Develop the main body with supporting arguments', duration_mins: 60, order: 4 },
      { step: 'Write conclusion and review', duration_mins: 30, order: 5 },
      { step: 'Proofread and format the final version', duration_mins: 25, order: 6 },
    ],
    suggested_schedule: [
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], hours: 2, focus: 'Research and outline' },
      { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], hours: 3, focus: 'Draft writing' },
      { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], hours: 1, focus: 'Review and polish' },
    ],
    quick_start_action: 'Open Google Scholar and find 3 relevant papers right now',
  };
}

function getDemoDocContent(taskTitle) {
  return {
    overview: `This document serves as your starter template for "${taskTitle}". The AI agent has pre-filled key sections to help you get started immediately.`,
    key_points: [
      'Define the scope and objectives clearly',
      'Research existing literature and prior work',
      'Outline your methodology or approach',
      'Prepare data or examples to support your work',
      'Draft a preliminary conclusion',
    ],
    resources: [
      `${taskTitle} best practices`,
      `${taskTitle} research papers`,
      `${taskTitle} examples and templates`,
      `How to structure ${taskTitle}`,
      `${taskTitle} common mistakes to avoid`,
    ],
    checklist: [
      'Read through the requirements carefully',
      'Complete the research phase',
      'Create first draft',
      'Review and edit',
      'Final submission check',
    ],
  };
}

function getDemoEmergencyPlan(taskTitle, hours) {
  return {
    extension_email: `Subject: Request for Extension — ${taskTitle}\n\nDear Professor/Manager,\n\nI am writing to respectfully request a brief extension for "${taskTitle}." Due to unforeseen circumstances, I need additional time to ensure the quality of my submission meets the expected standards.\n\nI am committed to submitting the work within [X additional days] and would greatly appreciate your consideration.\n\nThank you for your understanding.\n\nBest regards,\n[Your Name]`,
    mvs_description: `For "${taskTitle}", the absolute minimum viable submission includes: a clear introduction stating your objective, the core content (even if not fully polished), and a brief conclusion. Focus on getting the structure right rather than perfection.`,
    survival_steps: [
      `Spend the first ${Math.floor(hours * 0.4)} hour(s) on the core content — just get words on paper`,
      `Use the next ${Math.floor(hours * 0.4)} hour(s) to structure and connect your ideas logically`,
      `Reserve the final ${Math.ceil(hours * 0.2)} hour(s) for formatting, spell-check, and submission`,
    ],
  };
}

function getDemoDNA() {
  return {
    procrastination_type: 'Last-Minute Hero',
    average_start_delay_hours: 36,
    best_performance_time: 'evening',
    strongest_task_type: 'assignment',
    weakest_task_type: 'exam',
    prediction: "You'll likely start panicking about your next task 8 hours before the deadline",
    personalized_tip: 'Try the 2-minute rule: commit to just 2 minutes of work. Once started, you usually keep going.',
    dna_score: 42,
  };
}

module.exports = {
  detectDeadlines,
  breakdownTask,
  generateDocContent,
  generateEmergencyPlan,
  analyzeProcrastinationDNA,
  getDemoDNA,
  getDemoBreakdown,
  getDemoDocContent,
  getDemoEmergencyPlan,
};
