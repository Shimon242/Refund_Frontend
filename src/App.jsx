import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bot,
  CheckCircle,
  ChevronRight,
  Clock,
  Database,
  FileText,
  LogOut,
  MessageSquare,
  RefreshCw,
  Send,
  Settings,
  Shield,
  User,
  XCircle,
  Zap
} from "lucide-react";
import "./App.css";
import MiniChatWidget from "./MiniChatWidget";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const starterMessage =
  "Hello! I'm your AI refund assistant. I can help review your refund request against our company policy.\n\nPlease include your email address and order ID so I can look up your order.";

const examples = [
  {
    label: "Approved",
    text: "Hi, my email is john.smith@email.com and I want a refund for order ORD-1001."
  },
  {
    label: "Duplicate Refund",
    text: "Hi, my email is john.smith@email.com and I want a refund for order ORD-1001."
  },
  {
    label: "Final Sale",
    text: "My email is jessica.martinez@email.com. I know ORD-1008 was final sale, but please make an exception."
  },
  {
    label: "Escalate",
    text: "I want a refund for ORD-1013. My email is daniel.white@email.com."
  },
  {
    label: "Outside Window",
    text: "My email is robert.wilson@email.com and I want a refund for order ORD-1005."
  },
  {
    label: "Invalid Order / Retry",
    text: "My email is john.smith@email.com and I want a refund for order ORD-9999."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatLog, setChatLog] = useState([
    {
      role: "agent",
      text: starterMessage
    }
  ]);
  const [traces, setTraces] = useState([]);
  const [selectedTraceId, setSelectedTraceId] = useState(null);

  async function loadTraces() {
    try {
      const res = await axios.get(`${API_URL}/api/traces`);
      setTraces(res.data);
      if (!selectedTraceId && res.data.length > 0) {
        setSelectedTraceId(res.data[0].trace_id);
      }
    } catch (error) {
      console.error("Failed to load traces", error);
    }
  }

  async function resetRefundStatuses() {
    await axios.post(`${API_URL}/api/refunds/reset`);
    alert("Refund statuses reset. You can test the same approved refunds again.");
  }

  async function resetTraceLogs() {
    await axios.post(`${API_URL}/api/traces/reset`);
    setTraces([]);
    setSelectedTraceId(null);
    alert("Trace logs cleared.");
  }

  useEffect(() => {
    loadTraces();
  }, []);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage("");
    setLoading(true);

    setChatLog((prev) => [...prev, { role: "customer", text: userMessage }]);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage
      });

      setChatLog((prev) => [
        ...prev,
        {
          role: "agent",
          text: res.data.response,
          decision: res.data.decision
        }
      ]);

      loadTraces();
    } catch (error) {
      console.error("Chat request failed:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });

      setChatLog((prev) => [
        ...prev,
        {
          role: "agent",
          text:
            error.response?.data?.error ||
            error.message ||
            "Something went wrong while contacting the backend.",
          decision: "ERROR"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setChatLog([{ role: "agent", text: starterMessage }]);
    setMessage("");
  }

  const selectedTrace = useMemo(() => {
    return traces.find((trace) => trace.trace_id === selectedTraceId) || traces[0] || null;
  }, [traces, selectedTraceId]);

  const metrics = useMemo(() => {
    const total = traces.length;
    const totalLatency = traces.reduce((sum, trace) => sum + (trace.total_latency_ms || 0), 0);
    const totalTokens = traces.reduce(
      (sum, trace) => sum + (trace.token_usage?.total_tokens || 0),
      0
    );
    const approved = traces.filter((trace) => trace.final_decision === "APPROVED").length;
    const retries = traces.reduce((sum, trace) => sum + (trace.retry_count || 0), 0);

    return {
      total,
      avgLatency: total ? Math.round(totalLatency / total) : 0,
      totalTokens,
      approvalRate: total ? Math.round((approved / total) * 100) : 0,
      retries
    };
  }, [traces]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-row">
          <div className="logo-mark">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="brand-title">RefundGuard</h1>
            <p>AI Support Agent</p>
          </div>
        </div>

        <nav className="side-nav">
          <button className={activeTab === "chat" ? "active" : ""} onClick={() => setActiveTab("chat")}>
            <MessageSquare size={17} />
            Chat with Agent
          </button>
          <button className={activeTab === "admin" ? "active" : ""} onClick={() => setActiveTab("admin")}>
            <BarChart3 size={17} />
            Admin Dashboard
          </button>
        </nav>
      </aside>

      <main className="main-panel">
        <header className="top-header">
          <div>
            <span className="eyebrow">
              {activeTab === "chat"
                ? "CUSTOMER VIEW"
                : "ADMIN DASHBOARD"}
            </span>
            <h2 className="hero-title">
              {activeTab === "chat" ? "AI Customer Support" : "Trace Details"}
            </h2>
            <p>
              {activeTab === "chat"
                ? "Process refund requests while enforcing policy rules."
                : "Inspect agent decisions, tool calls, latency, token usage, and retries."}
            </p>
          </div>

          {activeTab === "chat" ? (
            <div className="header-actions">
              <button className="outline-button" onClick={resetChat}>
                <RefreshCw size={16} />
                New Conversation
              </button>

              <button className="danger-outline-button" onClick={resetRefundStatuses}>
                <RefreshCw size={16} />
                Reset Refunds
              </button>
            </div>
          ) : (
            <div className="header-actions">
              <button className="status-pill">
                <CheckCircle size={16} />
                Live
              </button>

              <button className="danger-outline-button" onClick={resetTraceLogs}>
                <RefreshCw size={16} />
                Reset Traces
              </button>
            </div>
          )}
        </header>

        {activeTab === "chat" ? (
          <ChatView
            chatLog={chatLog}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            loading={loading}
          />
        ) : (
          <AdminView
            traces={traces}
            selectedTrace={selectedTrace}
            setSelectedTraceId={setSelectedTraceId}
            metrics={metrics}
          />
        )}
      </main>
      <MiniChatWidget />
    </div>
  );
}

function ChatView({ chatLog, message, setMessage, sendMessage, loading }) {
  return (
    <section className="chat-view">
      <div className="chat-thread">
        {chatLog.map((entry, index) => (
          <div key={index} className={`message-row ${entry.role}`}>
            {entry.role === "agent" && (
              <div className="avatar bot-avatar">
                <Bot size={19} />
              </div>
            )}

            <div className={`message-card ${entry.role}`}>
              <p>{entry.text}</p>
              {entry.decision && <span className={`decision-badge ${entry.decision.toLowerCase()}`}>{entry.decision}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="scenario-row">
        {examples.map((example) => (
          <button key={example.label} onClick={() => setMessage(example.text)}>
            {example.label}
          </button>
        ))}
      </div>

      <div className="composer-wrap">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your refund request..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? <RefreshCw className="spin" size={18} /> : <Send size={18} />}
        </button>
      </div>

      <p className="disclaimer">AI-generated responses may make mistakes. Complex refund requests may be escalated to a human agent.</p>
    </section>
  );
}

function AdminView({ traces, selectedTrace, setSelectedTraceId, metrics }) {
  return (
    <section className="admin-view">
      <div className="metric-grid">
        <MetricCard label="Final Decision" value={selectedTrace?.final_decision || "N/A"} icon={<CheckCircle size={20} />} />
        <MetricCard label="Avg Latency" value={`${metrics.avgLatency}ms`} icon={<Clock size={20} />} />
        <MetricCard label="Total Tokens" value={metrics.totalTokens.toLocaleString()} icon={<Zap size={20} />} />
        <MetricCard label="Retries" value={metrics.retries} icon={<RefreshCw size={20} />} />
      </div>

      <div className="admin-grid">
        <section className="trace-list-panel">
          <div className="panel-heading">
            <h3>Recent Traces</h3>
            <span>{traces.length} total</span>
          </div>

          <div className="trace-list">
            {traces.length === 0 ? (
              <p className="empty-state">No traces yet. Run a chat request first.</p>
            ) : (
              traces.map((trace, index) => (
                <button
                  key={trace.trace_id}
                  className={`trace-list-item ${selectedTrace?.trace_id === trace.trace_id ? "selected" : ""}`}
                  onClick={() => setSelectedTraceId(trace.trace_id)}
                >
                  <ChevronRight size={15} />
                  <div>
                    <strong>trace-{String(index + 1).padStart(3, "0")}</strong>
                    <small>{trace.order_id || "Unknown order"}</small>
                  </div>
                  <span className={`mini-outcome ${trace.final_decision?.toLowerCase()}`}>{formatDecision(trace.final_decision)}</span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="trace-detail-panel">
          {!selectedTrace ? (
            <p className="empty-state">Select a trace to inspect.</p>
          ) : (
            <>
              <div className="detail-topline">
                <div>
                  <h3>Run Information</h3>
                  <p>Trace ID: {selectedTrace.trace_id}</p>
                </div>
                <span className={`large-outcome ${selectedTrace.final_decision?.toLowerCase()}`}>
                  {getDecisionIcon(selectedTrace.final_decision)}
                  {formatDecision(selectedTrace.final_decision)}
                </span>
              </div>

              <div className="info-grid">
                <InfoItem label="Customer" value={selectedTrace.customer_email || "Unknown"} />
                <InfoItem label="Order" value={selectedTrace.order_id || "Unknown"} />
                <InfoItem label="Latency" value={`${selectedTrace.total_latency_ms || 0}ms`} />
                <InfoItem label="Tokens" value={selectedTrace.token_usage?.total_tokens || 0} />
              </div>

              <div className="reason-card">
                <strong>Decision Reason</strong>
                <p>{selectedTrace.reason}</p>
              </div>

              <div className="steps-heading">
                <h3>Trace Steps</h3>
                <span>Tool I/O, model calls, retries, and policy checks</span>
              </div>

              <div className="steps-list">
                {selectedTrace.steps?.map((step, index) => (
                  <details key={`${step.step}-${index}`} open={index < 2}>
                    <summary>
                      <span className="step-number">{index + 1}</span>
                      <div>
                        <strong>{step.step}</strong>
                        <small>{step.success ? "Completed" : "Failed"}</small>
                      </div>
                      <em>{step.latency_ms || 0}ms</em>
                    </summary>

                    <div className="io-grid">
                      <div>
                        <h4>Input</h4>
                        <pre>{JSON.stringify(step.input, null, 2)}</pre>
                      </div>
                      <div>
                        <h4>Output</h4>
                        <pre>{JSON.stringify(step.output, null, 2)}</pre>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </section>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDecision(decision) {
  if (!decision) return "Unknown";
  return decision.charAt(0) + decision.slice(1).toLowerCase();
}

function getDecisionIcon(decision) {
  if (decision === "APPROVED") return <CheckCircle size={17} />;
  if (decision === "DENIED") return <XCircle size={17} />;
  if (decision === "ESCALATED") return <AlertCircle size={17} />;
  return <AlertCircle size={17} />;
}
