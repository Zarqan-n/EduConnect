import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Bot, BookOpen, Briefcase, GraduationCap, LayoutDashboard, RotateCcw, Send, Settings, Sparkles, User } from "lucide-react";

type ChatAction = { label: string; href: string };
type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: ChatAction[];
};

const STORAGE_KEY = "educonnect.chatbot.v1";

function initials(name?: string) {
  const n = (name || "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderMarkdown(text: string): ReactNode[] {
  // Very small markdown formatter: supports **bold** only, everything else is plain text.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) {
      return (
        <strong key={index}>
          {match[1]}
        </strong>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildReply(rawInput: string): Pick<ChatMessage, "text" | "actions"> {
  const input = normalize(rawInput);

  const actions: ChatAction[] = [];
  const add = (label: string, href: string) => actions.push({ label, href });

  const siteOverview =
    "EduConnect helps you find tutors, explore jobs, and buy/sell books. Tell me what you want to do and I’ll guide you to the right place.";

  if (!input || input === "help" || input.includes("what can you do") || input.includes("how to use")) {
    add("Open Dashboard", "/dashboard");
    add("Find Tutors", "/tutors");
    add("Job Board", "/jobs");
    add("Book Market", "/books");
    return {
      text:
        "I can help you use EduConnect.\n\nTry asking:\n- “How do I find a tutor?”\n- “How to apply for jobs?”\n- “How to sell a book?”\n- “Where are settings?”\n- “How does the dashboard work?”",
      actions,
    };
  }

  if (input.includes("tutor") || input.includes("tuition") || input.includes("teacher")) {
    add("Go to Find Tutors", "/tutors");
    add("Open Dashboard", "/dashboard");
    return {
      text:
        "To find tutors, open **Find Tutors** and browse available tutors.\n\nTip: If you’re using the dashboard Explore tab, you can also search by location to see nearby services.",
      actions,
    };
  }

  if (input.includes("job") || input.includes("vacanc") || input.includes("apply")) {
    add("Open Job Board", "/jobs");
    return {
      text: "For jobs, open the **Job Board** page, browse listings, and follow the listing details to apply.",
      actions,
    };
  }

  if (input.includes("book") || input.includes("sell") || input.includes("market") || input.includes("price")) {
    add("Open Book Market", "/books");
    add("Open Dashboard", "/dashboard");
    return {
      text:
        "To buy/sell books, use the **Book Market** page.\n\nIf you’re logged in, you can also list a book from the Dashboard (look for the Sell Books section).",
      actions,
    };
  }

  if (input.includes("dashboard") || input.includes("overview") || input.includes("tab")) {
    add("Open Dashboard", "/dashboard");
    return {
      text:
        "The Dashboard is your control center.\n\n- Students: use **Explore** to browse services and location search.\n- Teachers/Institutions: use **Actions** to manage postings and tools.\n\nIf you tell me your role (student/teacher/institution), I can guide you step-by-step.",
      actions,
    };
  }

  if (input.includes("setting") || input.includes("profile") || input.includes("account")) {
    add("Open Dashboard", "/dashboard");
    return {
      text:
        "Settings are available from the **Dashboard** (top right). You can update your details and preferences there.",
      actions,
    };
  }

  if (input.includes("login") || input.includes("log in") || input.includes("sign in")) {
    add("Go to Login", "/login");
    add("Create Account", "/register");
    return {
      text: "To access your dashboard and personalized features, log in with your account (or register if you’re new).",
      actions,
    };
  }

  if (input.includes("register") || input.includes("sign up") || input.includes("signup") || input.includes("create account")) {
    add("Create Account", "/register");
    add("Go to Login", "/login");
    return {
      text: "To create an account, open Register, fill in your details, then you’ll be able to use the Dashboard.",
      actions,
    };
  }

  if (input.includes("location") || input.includes("nearby") || input.includes("map")) {
    add("Open Dashboard", "/dashboard");
    return {
      text:
        "For nearby results, go to the Dashboard → Explore and use the location search. Then adjust the radius slider to filter results on the map.",
      actions,
    };
  }

  if (input.includes("what is") || input.includes("about") || input.includes("educonnect")) {
    add("Home", "/");
    add("Find Tutors", "/tutors");
    add("Job Board", "/jobs");
    add("Book Market", "/books");
    return { text: siteOverview, actions };
  }

  add("Open Dashboard", "/dashboard");
  add("Find Tutors", "/tutors");
  add("Job Board", "/jobs");
  add("Book Market", "/books");
  return {
    text:
      "I didn’t fully catch that, but I can help.\n\nTell me what you’re trying to do (tutors, jobs, books, dashboard, login), and I’ll guide you.",
    actions,
  };
}

const QUICK_PROMPTS: Array<{ label: string; prompt: string }> = [
  { label: "Find a tutor", prompt: "How do I find a tutor?" },
  { label: "Use dashboard", prompt: "How does the dashboard work?" },
  { label: "Sell a book", prompt: "How do I sell a book?" },
  { label: "Jobs", prompt: "How do I apply for jobs?" },
  { label: "Settings", prompt: "Where are settings?" },
];

export default function ChatbotPage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mode, setMode] = useState<"unknown" | "ai" | "offline">("unknown");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((m) => m && typeof m.text === "string" && (m.role === "user" || m.role === "assistant"));
    } catch {
      return [];
    }
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const greeting = useMemo<ChatMessage>(() => {
    const name = user?.name?.trim() || "there";
    return {
      id: "greeting",
      role: "assistant",
      text: `Hi ${name}! Ask me anything about using EduConnect — I’ll point you to the right page and steps.`,
      actions: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Tutors", href: "/tutors" },
        { label: "Jobs", href: "/jobs" },
        { label: "Books", href: "/books" },
      ],
    };
  }, [user?.name]);

  const allMessages = useMemo(() => [greeting, ...messages], [greeting, messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Clear chat when user logs out (or no user)
  useEffect(() => {
    if (!user) {
      setMessages([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    }
  }, [user]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed };
    const pendingId = uid();
    const botPending: ChatMessage = { id: pendingId, role: "assistant", text: "Thinking..." };

    const historyForApi = [...messages, userMsg]
      .slice(-20)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg, botPending]);
    setDraft("");

    try {
      setIsSending(true);
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForApi }),
      });

      if (!resp.ok) {
        if (resp.status === 503) {
          setMode("offline");
          throw new Error("AI service is offline. Using local responses.");
        }
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(`HTTP ${resp.status}: ${errorData?.message || "Request failed"}`);
      }

      const data: any = await resp.json();
      const aiText = typeof data?.text === "string" ? data.text : "";
      if (!aiText) throw new Error("Empty AI response");

      setMode("ai");
      setMessages((prev) => prev.map((m) => (m.id === pendingId ? { ...m, text: aiText } : m)));
    } catch (error) {
      // fallback to local help if AI isn't configured / fails
      setMode((prev) => (prev === "offline" ? "offline" : "unknown"));
      const reply = buildReply(trimmed);
      setMessages((prev) =>
        prev.map((m) => (m.id === pendingId ? { ...m, text: reply.text, actions: reply.actions } : m)),
      );
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => setMessages([]);

  return (
    <LayoutShell>
      <div className="space-y-6">
        <div className="gradient-primary rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-heading font-bold header-gradient-text flex items-center gap-2">
                <Bot className="w-7 h-7" />
                Chatbot
              </h1>
              <Badge
                variant={mode === "ai" ? "default" : mode === "offline" ? "secondary" : "outline"}
                className={mode === "offline" ? "bg-amber-50 text-amber-800 border-amber-200" : ""}
              >
                {mode === "ai" ? "AI: Gemini" : mode === "offline" ? "Offline help" : "AI: checking"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Ask about tutors, jobs, books, dashboard, settings, login/register.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 rounded-xl bg-white hover:bg-gray-50 border-gray-200"
              onClick={reset}
            >
              <RotateCcw className="w-4 h-4" /> Clear
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Card className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Quick help
                </CardTitle>
                <CardDescription>Click a prompt to ask instantly.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <Button
                    key={p.label}
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      if (!isSending) send(p.prompt);
                    }}
                    disabled={isSending}
                  >
                    {p.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardHeader>
                <CardTitle>Shortcuts</CardTitle>
                <CardDescription>Open the section you need.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link  href="/dashboard">
                  <Button variant="outline" className="w-full mb-2 justify-start gap-2 rounded-xl bg-white">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Button>
                </Link>
                <Link href="/tutors">
                  <Button variant="outline" className="w-full mb-2 justify-start gap-2 rounded-xl bg-white">
                    <GraduationCap className="w-4 h-4" /> Find Tutors
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button variant="outline" className="w-full mb-2 justify-start gap-2 rounded-xl bg-white">
                    <Briefcase className="w-4 h-4" /> Job Board
                  </Button>
                </Link>
                <Link href="/books">
                  <Button variant="outline" className="w-full justify-start gap-2 rounded-xl bg-white">
                    <BookOpen className="w-4 h-4" /> Book Market
                  </Button>
                </Link>
                <Separator className="my-2" />
                <div className="text-xs text-muted-foreground leading-relaxed">
                  Your AI key stays on the server. If AI isn’t configured, this page switches to offline help automatically.
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-8">
            <Card className="card-hover overflow-hidden">
              <CardHeader className="border-b bg-background/50">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Bot className="w-5 h-5" /> Conversation
                  </span>
                  <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Ask “where are settings?” anytime
                  </div>
                </CardTitle>
                <CardDescription className="sm:hidden">Ask “where are settings?” anytime.</CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <ScrollArea className="h-[520px]">
                  <div className="p-4 sm:p-6 space-y-4">
                    {allMessages.map((m) => (
                      <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                        <div className={m.role === "user" ? "flex flex-row-reverse items-end gap-3 max-w-[92%]" : "flex items-end gap-3 max-w-[92%]"}>
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className={m.role === "user" ? "bg-primary text-primary-foreground" : ""}>
                              {m.role === "user" ? initials(user?.name) : "AI"}
                            </AvatarFallback>
                          </Avatar>

                          <div
                            className={
                              m.role === "user"
                                ? "rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow-sm"
                                : "rounded-2xl bg-secondary/60 text-foreground px-4 py-3"
                            }
                          >
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {renderMarkdown(m.text)}
                            </div>
                            {m.role === "assistant" && m.actions && m.actions.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {m.actions.map((a) => (
                                  <Link key={`${m.id}-${a.href}-${a.label}`} href={a.href}>
                                    <Button size="sm" variant="outline" className="rounded-full bg-white">
                                      {a.label}
                                    </Button>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                </ScrollArea>

                <div className="border-t bg-background p-3 sm:p-4">
                  <div className="flex items-end gap-2">
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder='Example: "How do I sell a book?"'
                      className="min-h-[48px] resize-none rounded-xl"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (!isSending) send(draft);
                        }
                      }}
                    />
                    <Button className="rounded-xl gap-2" onClick={() => send(draft)} disabled={isSending}>
                      <Send className="w-4 h-4" /> {isSending ? "Sending" : "Send"}
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{user?.name ? `Signed in as ${user.name}` : "Not signed in"}</span>
                    </div>
                    <span>Enter to send • Shift+Enter for new line</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}

