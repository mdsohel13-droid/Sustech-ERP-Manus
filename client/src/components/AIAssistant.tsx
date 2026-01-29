import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  Send, 
  Lightbulb, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Calculator,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { useLocation } from "wouter";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  action: () => void;
}

interface AIAssistantProps {
  open: boolean;
  onClose: () => void;
}

export function AIAssistant({ open, onClose }: AIAssistantProps) {
  const [location] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Context-aware suggestions based on current page
  const getSuggestions = (): Suggestion[] => {
    const baseSuggestions: Suggestion[] = [
      {
        id: "help",
        icon: Lightbulb,
        text: "How can I use this page?",
        action: () => handleSuggestionClick("How can I use this page effectively?")
      }
    ];

    if (location === "/" || location === "") {
      return [
        {
          id: "overview",
          icon: BarChart3,
          text: "Summarize today's business performance",
          action: () => handleSuggestionClick("Summarize today's business performance")
        },
        {
          id: "alerts",
          icon: AlertCircle,
          text: "What needs my attention today?",
          action: () => handleSuggestionClick("What needs my attention today?")
        },
        {
          id: "trends",
          icon: TrendingUp,
          text: "Show me revenue trends this month",
          action: () => handleSuggestionClick("Show me revenue trends this month")
        },
        ...baseSuggestions
      ];
    }

    if (location.includes("/sales")) {
      return [
        {
          id: "top-products",
          icon: TrendingUp,
          text: "What are my top selling products?",
          action: () => handleSuggestionClick("What are my top selling products?")
        },
        {
          id: "create-invoice",
          icon: FileText,
          text: "Help me create a new invoice",
          action: () => handleSuggestionClick("Help me create a new invoice")
        },
        {
          id: "sales-analysis",
          icon: Calculator,
          text: "Analyze my sales performance",
          action: () => handleSuggestionClick("Analyze my sales performance")
        },
        ...baseSuggestions
      ];
    }

    if (location.includes("/financial") || location.includes("/accounting")) {
      return [
        {
          id: "cash-flow",
          icon: DollarSign,
          text: "Forecast my cash flow for next 30 days",
          action: () => handleSuggestionClick("Forecast my cash flow for next 30 days")
        },
        {
          id: "explain-pnl",
          icon: FileText,
          text: "Explain my P&L statement",
          action: () => handleSuggestionClick("Explain my P&L statement in simple terms")
        },
        {
          id: "overdue",
          icon: AlertCircle,
          text: "Show overdue receivables",
          action: () => handleSuggestionClick("Show me all overdue receivables")
        },
        ...baseSuggestions
      ];
    }

    if (location.includes("/customers")) {
      return [
        {
          id: "top-customers",
          icon: Users,
          text: "Who are my most valuable customers?",
          action: () => handleSuggestionClick("Who are my most valuable customers?")
        },
        {
          id: "segment",
          icon: BarChart3,
          text: "Segment my customers by value",
          action: () => handleSuggestionClick("Segment my customers by purchase value")
        },
        {
          id: "inactive",
          icon: Clock,
          text: "Find inactive customers to re-engage",
          action: () => handleSuggestionClick("Find inactive customers I should re-engage")
        },
        ...baseSuggestions
      ];
    }

    if (location.includes("/projects")) {
      return [
        {
          id: "project-health",
          icon: CheckCircle2,
          text: "Show project health summary",
          action: () => handleSuggestionClick("Show me a health summary of all projects")
        },
        {
          id: "at-risk",
          icon: AlertCircle,
          text: "Which projects are at risk?",
          action: () => handleSuggestionClick("Which projects are at risk and why?")
        },
        {
          id: "timeline",
          icon: Clock,
          text: "Generate project timeline report",
          action: () => handleSuggestionClick("Generate a timeline report for active projects")
        },
        ...baseSuggestions
      ];
    }

    if (location.includes("/hr")) {
      return [
        {
          id: "attendance",
          icon: Clock,
          text: "Show attendance summary",
          action: () => handleSuggestionClick("Show me this week's attendance summary")
        },
        {
          id: "leave-balance",
          icon: Users,
          text: "Check team leave balances",
          action: () => handleSuggestionClick("Check team leave balances")
        },
        {
          id: "performance",
          icon: TrendingUp,
          text: "Review team performance metrics",
          action: () => handleSuggestionClick("Review team performance metrics")
        },
        ...baseSuggestions
      ];
    }

    return [
      {
        id: "general",
        icon: Sparkles,
        text: "What can you help me with?",
        action: () => handleSuggestionClick("What can you help me with?")
      },
      ...baseSuggestions
    ];
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    handleSend(text);
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (in production, this would call the LLM API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        "How can I use this page effectively?": `This page helps you manage your business operations. Here are some tips:\n\n• Use the sidebar to navigate between modules\n• Press ⌘K to quickly search and navigate\n• Check the KPI cards for quick insights\n• Use Quick Actions for common tasks`,
        "Summarize today's business performance": `📊 **Today's Performance Summary**\n\n• Revenue: ৳45,000 (+12% vs yesterday)\n• New Orders: 8\n• Active Projects: 5\n• Pending Invoices: 3\n\nOverall, business is performing well with positive growth trends.`,
        "What needs my attention today?": `⚠️ **Items Requiring Attention**\n\n1. **Overdue Invoice** - Invoice #INV-2024-001 is 5 days overdue (৳15,000)\n2. **Tender Deadline** - "Govt. IT Project" submission due in 2 days\n3. **Low Stock** - 3 products below reorder level\n4. **Pending Approval** - 2 leave requests awaiting approval`,
        "default": `I understand you're asking about "${text}". \n\nAs an AI assistant, I can help you with:\n• Analyzing business data and trends\n• Generating reports and summaries\n• Answering questions about your ERP system\n• Providing recommendations\n\nThis feature is being enhanced. For now, please use the navigation and search features to find what you need.`
      };

      const responseText = responses[text] || responses["default"];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!open) return null;

  const suggestions = getSuggestions();

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="font-medium">AI Assistant</span>
            <p className="text-xs text-muted-foreground">Powered by AI</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium">How can I help you?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ask me anything about your business data
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground px-1">Suggestions</p>
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  onClick={suggestion.action}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors text-left text-sm"
                >
                  <suggestion.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          AI responses are for guidance only. Verify important data.
        </p>
      </div>
    </div>
  );
}
