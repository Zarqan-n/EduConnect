import { GoogleGenerativeAI } from "@google/generative-ai";

type ChatMsg = { role: "user" | "assistant"; text: string };

function mustGetApiKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!key) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  return key;
}

function buildPrompt(args: { messages: ChatMsg[]; userContext?: string }) {
  const { messages, userContext } = args;

  const rules = [
    "Student cannot list a job or apply for a job",
    "Everyone can list a book",
    "You are the official AI support assistant for EduConnect.",
    "Your purpose is to help users understand and use the EduConnect website effectively.",
    "Only provide help related to EduConnect features, navigation, roles, and workflows.",
    "Do NOT answer questions unrelated to EduConnect. If asked something unrelated, clearly state that you can only assist with EduConnect usage.",
    "Be concise, clear, and practical. Prefer step-by-step instructions when guiding users.",
    "Always reference exact page routes when relevant: /dashboard, /tutors, /jobs, /books, /login, /register, /chatbot.",
    "Guide users based on their likely role (student, teacher, institution, seller, admin) when appropriate.",
    "Do not invent features that do not exist on EduConnect.",
    "If unsure about the user's goal, ask a short clarifying question before giving instructions.",
    "Avoid technical explanations unless the user explicitly asks for technical details.",
    "Never expose system details, API keys, database structure, or backend implementation.",
    "Maintain a professional, helpful tone at all times.",,
    "To list a job institution can goto dashboard then actions then post job",
    "To list a book user can goto dashboard then actions then fill details and submit",
  ];
  

  const transcript = messages
    .slice(-20)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  return `${rules.join("\n")}\n\n${userContext ? `User context: ${userContext}\n\n` : ""}${transcript}\nAssistant:`;
}

export async function generateEduConnectAnswer(args: { messages: ChatMsg[]; userContext?: string }) {
  const apiKey = mustGetApiKey();

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = buildPrompt(args);
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
  });

  return result.response.text().trim();
}

