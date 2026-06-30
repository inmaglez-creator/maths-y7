import { useState, useRef, useEffect } from "react";

const TOPICS = [
  {
    id: "algebra",
    label: "Algebra",
    icon: "𝑥",
    color: "#6C63FF",
    light: "#EEF0FF",
    description: "Expressions, equations & substitution",
    topics: ["Writing expressions", "Simplifying expressions", "Solving equations", "Substitution"],
  },
  {
    id: "fractions",
    label: "Fractions & %",
    icon: "½",
    color: "#F59E0B",
    light: "#FFFBEB",
    description: "Fractions, decimals & percentages",
    topics: ["Adding & subtracting fractions", "Multiplying fractions", "Converting decimals & %", "Percentage of amounts"],
  },
  {
    id: "geometry",
    label: "Geometry",
    icon: "△",
    color: "#10B981",
    light: "#ECFDF5",
    description: "Area, perimeter, angles & shapes",
    topics: ["Area & perimeter", "Angles in triangles", "Angles on a line", "Properties of shapes"],
  },
  {
    id: "number",
    label: "Number",
    icon: "#",
    color: "#3B82F6",
    light: "#EFF6FF",
    description: "Negatives, BIDMAS, factors, primes & rounding",
    topics: ["Negative numbers", "Order of operations (BIDMAS)", "Factors, multiples & primes", "Rounding & estimation"],
  },
  {
    id: "ratio",
    label: "Ratio & Proportion",
    icon: "∶",
    color: "#EC4899",
    light: "#FDF2F8",
    description: "Ratio, sharing & proportion",
    topics: ["Simplifying ratio", "Sharing in a ratio", "Direct proportion", "Best value problems"],
  },
  {
    id: "sequences",
    label: "Sequences",
    icon: "→",
    color: "#14B8A6",
    light: "#F0FDFA",
    description: "Patterns, nth term & function machines",
    topics: ["Term-to-term rules", "Finding the nth term", "Special sequences", "Function machines"],
  },
  {
    id: "graphs",
    label: "Coordinates & Graphs",
    icon: "📈",
    color: "#8B5CF6",
    light: "#F5F3FF",
    description: "Coordinates & straight-line graphs",
    topics: ["Coordinates (4 quadrants)", "Plotting straight-line graphs", "Reading graphs", "Real-life graphs"],
  },
  {
    id: "stats",
    label: "Statistics & Probability",
    icon: "📊",
    color: "#EF4444",
    light: "#FEF2F2",
    description: "Averages, charts & probability",
    topics: ["Mean, median, mode & range", "Bar charts & pictograms", "Pie charts", "Basic probability"],
  },
];

const SYSTEM_PROMPT = `You are a friendly, encouraging KS3 Maths tutor for a Year 7 student at a British curriculum school.

Your job:
1. Generate practice exercises for the topic requested.
2. Correct answers step by step, praising effort always.
3. Explain mistakes gently, re-explain clearly if needed.
4. Use British English and KS3 Maths vocabulary.
5. Keep responses concise and encouraging. Use emojis sparingly.

When generating exercises:
- Give ONE question at a time. After the student answers, say if it is correct and explain, then ask the next question.
- Number them clearly: 1. 2. 3.
- Include a mix of difficulty (easy → medium → slightly harder)
- After the question, add a small hint marked with 💡

When correcting:
- Mark each answer ✅ or ❌
- For wrong answers, show the correct working step by step
- End with a motivating sentence

Topic context you'll receive: the specific KS3 Y7 subtopic to focus on.

IMPORTANT FORMATTING RULE: Never use markdown. No asterisks, no hashtags, no backticks, no dollar signs for maths notation. Plain text only. Use numbered lists and emoji where helpful.`;

export default function MathsApp() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSubtopic, setActiveSubtopic] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("home"); // home | topic | chat
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startPractice = async (topic, subtopic) => {
    setActiveTopic(topic);
    setActiveSubtopic(subtopic);
    setMessages([]);
    setMode("chat");
    setLoading(true);

    const initMessage = `Generate 1 practice exercise (a single question) for: "${subtopic}" (part of ${topic.label}). Make them suitable for a bright Y7 student starting KS3.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: initMessage }],
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Something went wrong. Try again!";
      setMessages([
        { role: "assistant", content: reply, subtopic },
      ]);
    } catch {
      setMessages([{ role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const sendMessage = async (text) => {
    const userMsg = (typeof text === "string" ? text : input).trim();
    if (!userMsg || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    const apiMessages = newMessages.map((m) => ({ role: m.role, content: m.content }));
    // Prepend context
    apiMessages[0] = {
      role: "user",
      content: `Topic: ${activeTopic?.label} — Subtopic: ${activeSubtopic}\n\n${apiMessages[0].content}`,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Something went wrong.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Connection error." }]);
    }
    setLoading(false);
  };

  // HOME
  if (mode === "home") {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F7FF", fontFamily: "'Segoe UI', system-ui, sans-serif", padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📐</div>
            <a href="https://y7-hub.vercel.app/" style={{ position: "fixed", top: 12, left: 12, zIndex: 50, background: "#fff", color: "#475569", textDecoration: "none", fontWeight: 700, fontSize: 13, padding: "6px 12px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb" }}>← Hub</a>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1E1B4B", margin: 0 }}>Maths Y7</h1>
            <p style={{ color: "#6B7280", marginTop: 6, fontSize: 15 }}>Pick a topic and start practising with your AI tutor</p>
          </div>

          {/* Topics */}
          {TOPICS.map((topic) => (
            <div
              key={topic.id}
              style={{ background: "#fff", borderRadius: 16, marginBottom: 16, border: `2px solid ${topic.light}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
            >
              <div style={{ background: topic.light, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28, width: 40, textAlign: "center" }}>{topic.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: topic.color }}>{topic.label}</div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>{topic.description}</div>
                </div>
              </div>
              <div style={{ padding: "12px 20px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                {topic.topics.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => startPractice(topic, sub)}
                    style={{
                      background: topic.color,
                      color: "#fff",
                      border: "none",
                      borderRadius: 20,
                      padding: "7px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "opacity 0.15s",
                    }}
                    onMouseOver={(e) => (e.target.style.opacity = 0.85)}
                    onMouseOut={(e) => (e.target.style.opacity = 1)}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // CHAT
  return (
    <div style={{ minHeight: "100vh", background: "#F8F7FF", fontFamily: "'Segoe UI', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: activeTopic.color, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button
          onClick={() => setMode("home")}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}
        >
          ← Back
        </button>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{activeTopic.label}</div>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{activeSubtopic}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>
                📐
              </div>
            )}
            <div
              style={{
                background: msg.role === "user" ? activeTopic.color : "#fff",
                color: msg.role === "user" ? "#fff" : "#1F2937",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "12px 16px",
                maxWidth: "80%",
                fontSize: 14,
                lineHeight: 1.6,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: activeTopic.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📐</div>
            <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", padding: "12px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: activeTopic.color, animation: "bounce 1s infinite", animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div style={{ padding: "8px 16px 0", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["More exercises", "Explain again", "Hint", "Make it harder"].map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            style={{ background: activeTopic.light, color: activeTopic.color, border: `1px solid ${activeTopic.color}30`, borderRadius: 16, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px 20px", maxWidth: 680, margin: "0 auto", width: "100%", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your answers or ask a question..."
          style={{ flex: 1, border: "2px solid #E5E7EB", borderRadius: 24, padding: "10px 18px", fontSize: 14, outline: "none", fontFamily: "inherit" }}
          onFocus={(e) => (e.target.style.borderColor = activeTopic.color)}
          onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{ background: activeTopic.color, color: "#fff", border: "none", borderRadius: "50%", width: 44, height: 44, fontSize: 20, cursor: loading ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1, flexShrink: 0 }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
