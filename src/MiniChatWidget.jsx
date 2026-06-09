import { useState } from "react";
import axios from "axios";
import { Bot, MessageSquare, Send, X, RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function MiniChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "agent",
      text: "Need refund help? Send your email and order ID."
    }
  ]);

  async function sendMiniMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessage("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "customer", text: userMessage }
    ]);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, {
        message: userMessage
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: res.data.response,
          decision: res.data.decision
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          text: error.response?.data?.error || error.message,
          decision: "ERROR"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mini-chat-root">
      {open && (
        <div className="mini-chat-box">
          <div className="mini-chat-header">
            <div>
              <strong>RefundAI</strong>
              <span>Mini Support Chat</span>
            </div>

            <button onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="mini-chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`mini-message ${msg.role}`}>
                <p>{msg.text}</p>
                {msg.decision && (
                  <span className={`mini-decision ${msg.decision.toLowerCase()}`}>
                    {msg.decision}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="mini-chat-input">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about a refund..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMiniMessage();
                }
              }}
            />

            <button onClick={sendMiniMessage} disabled={loading}>
              {loading ? <RefreshCw className="spin" size={15} /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}

      <button className="mini-chat-button" onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
    </div>
  );
}