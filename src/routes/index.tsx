import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import {
  Mail,
  Search,
  MessageSquare,
  Sparkles,
  Loader2,
  Menu,
  X,
  Copy,
  Check,
  ShieldAlert,
  Send,
} from "lucide-react";
import { generateAi } from "@/lib/ai.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "AI-powered workplace tools: smart email generator, research assistant, and productivity chatbot.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content:
          "Generate professional emails, summarise research, and chat with an AI workplace assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tool = "email" | "research" | "chat";

const NAV_ITEMS: { id: Tool; label: string; icon: typeof Mail; blurb: string }[] = [
  { id: "email", label: "Email Generator", icon: Mail, blurb: "Professional emails in seconds" },
  { id: "research", label: "Research Assistant", icon: Search, blurb: "Summaries, insights & recommendations" },
  { id: "chat", label: "Workplace Chatbot", icon: MessageSquare, blurb: "Ask anything work-related" },
];

function Index() {
  const [tool, setTool] = useState<Tool>("email");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const active = NAV_ITEMS.find((n) => n.id === tool)!;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight text-sidebar-primary">
              AI Workplace
            </p>
            <p className="text-xs text-sidebar-foreground/70">Productivity Assistant</p>
          </div>
          <button
            className="ml-auto rounded-md p-1 hover:bg-sidebar-accent lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTool(item.id);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                tool === item.id
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-4">
          <div className="flex gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sidebar-foreground/60" />
            <p className="text-xs leading-relaxed text-sidebar-foreground/60">
              <span className="font-medium text-sidebar-foreground/80">Responsible AI:</span>{" "}
              Responses are AI-generated and may be inaccurate. Review all output before use and
              avoid sharing sensitive personal or company data.
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur sm:px-6">
          <button
            className="rounded-md p-1.5 hover:bg-accent lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold sm:text-lg">{active.label}</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">{active.blurb}</p>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-6">
          {tool === "email" && <EmailTool />}
          {tool === "research" && <ResearchTool />}
          {tool === "chat" && <ChatTool />}
        </div>
      </main>
    </div>
  );
}

/* ---------- Shared bits ---------- */

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {message}
    </div>
  );
}

function OutputCard({
  title,
  content,
  loading,
}: {
  title: string;
  content: string;
  loading: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {content && (
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating with AI…
          </div>
        ) : content ? (
          <div className="prose-chat text-sm text-card-foreground">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="py-6 text-sm text-muted-foreground">
            Your AI-generated result will appear here.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Email tool ---------- */

const TONES = [
  { id: "formal", label: "Formal" },
  { id: "friendly", label: "Friendly" },
  { id: "persuasive", label: "Persuasive" },
] as const;

function EmailTool() {
  const [tone, setTone] = useState<(typeof TONES)[number]["id"]>("formal");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!context.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await generateAi({ data: { mode: "email", tone, context } });
      setOutput(res.text);
    } catch {
      setError("Something went wrong generating your email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <form
        onSubmit={submit}
        className="h-fit rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold">Describe your email</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Who is it for, and what should it say? The AI writes the rest.
        </p>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">Tone</label>
          <div className="mt-1.5 flex gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  tone === t.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-foreground hover:bg-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="email-context" className="text-xs font-medium text-muted-foreground">
            Email details
          </label>
          <textarea
            id="email-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={7}
            placeholder="e.g. Ask my manager Sarah for approval on the Q4 marketing budget, highlighting the 20% ROI from last quarter…"
            className="mt-1.5 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && <div className="mt-3"><ErrorBox message={error} /></div>}

        <button
          type="submit"
          disabled={loading || !context.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Generate email
        </button>
      </form>

      <OutputCard title="Generated email" content={output} loading={loading} />
    </div>
  );
}

/* ---------- Research tool ---------- */

function ResearchTool() {
  const [topic, setTopic] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await generateAi({ data: { mode: "research", topic } });
      setOutput(res.text);
    } catch {
      setError("Something went wrong with the research. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <form
        onSubmit={submit}
        className="h-fit rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h2 className="text-sm font-semibold">What should I research?</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste a topic, article text, or URL — get a summary, insights, and recommendations.
        </p>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={9}
          placeholder="e.g. The impact of remote work on team productivity, or paste an article / URL…"
          className="mt-4 w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
        />

        {error && <div className="mt-3"><ErrorBox message={error} /></div>}

        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Research & summarise
        </button>
      </form>

      <OutputCard title="Research report" content={output} loading={loading} />
    </div>
  );
}

/* ---------- Chat tool ---------- */

type ChatMessage = { role: "user" | "assistant"; content: string };

function ChatTool() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await generateAi({ data: { mode: "chat", messages: next } });
      setMessages([...next, { role: "assistant", content: res.text }]);
    } catch {
      setError("The assistant couldn't respond. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-10.5rem)] max-w-3xl flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="mt-4 text-sm font-medium">Your AI workplace assistant</p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Ask about productivity, planning, communication, or any work task. Try: "Help me
              prioritise my tasks for today."
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {m.role === "assistant" ? (
                <div className="prose-chat">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          </div>
        )}
        {error && <ErrorBox message={error} />}
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-border p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          rows={1}
          placeholder="Ask your assistant anything…"
          className="max-h-32 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
