type ChatMsg = {
  role: "user" | "assistant";
  text: string;
};

function getApiKey(): string {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) {
    throw new Error("Missing HUGGINGFACE_API_KEY in environment.");
  }
  return key.trim();
}

function buildPrompt(messages: ChatMsg[], userContext?: string) {
  const rules = [
    "You are the official AI support assistant for EduConnect.",
    "Only help with EduConnect website usage and navigation.",
    "Be concise and practical.",
    "Reference exact routes when relevant: /dashboard, /tutors, /jobs, /books, /login, /register, /chatbot.",
    "Do not invent features that do not exist."
  ];

  const transcript = messages
    .slice(-15)
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  return `
${rules.join("\n")}

${userContext ? `User context: ${userContext}\n` : ""}

${transcript}

Assistant:
`.trim();
}

export async function generateEduConnectAnswer(args: {
  messages: ChatMsg[];
  userContext?: string;
}) {
  const apiKey = getApiKey();
  const prompt = buildPrompt(args.messages, args.userContext);

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: 0.3,
            max_new_tokens: 300,
          },
        }),
      }
    );

    // Read raw text first (prevents JSON crash)
    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`HF Error: ${rawText}`);
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Invalid JSON response: ${rawText}`);
    }

    const text =
      data?.[0]?.generated_text ||
      data?.generated_text ||
      "";

    if (!text) {
      throw new Error("Empty response from model.");
    }

    return text.trim();

  } catch (error: any) {
    if (error.message?.includes("401")) {
      throw new Error("Invalid Hugging Face API key.");
    }
    if (error.message?.includes("429")) {
      throw new Error("Rate limit exceeded. Try again later.");
    }
    if (error.message?.includes("503")) {
      throw new Error("Model is warming up. Try again in a few seconds.");
    }

    throw new Error(`AI request failed: ${error.message}`);
  }
}