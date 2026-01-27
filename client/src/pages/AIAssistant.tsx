import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageCircle, 
  Send, 
  Sparkles, 
  Brain, 
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: number;
  title: string;
  description: string;
  category: "optimization" | "insight" | "action" | "alert";
  priority: "low" | "medium" | "high";
  status: "pending" | "implemented" | "dismissed";
  createdAt: Date;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your AI Assistant. I can help you with business insights, data analysis, and operational recommendations. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions] = useState<Suggestion[]>([
    {
      id: 1,
      title: "Optimize Inventory Levels",
      description: "Based on current sales trends, consider increasing stock for Solar Panel 400W by 20%",
      category: "optimization",
      priority: "high",
      status: "pending",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      title: "Revenue Growth Opportunity",
      description: "Customer segment 'Hot' has 15% higher conversion rate. Consider targeted campaigns.",
      category: "insight",
      priority: "medium",
      status: "pending",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      title: "Payment Collection Alert",
      description: "3 invoices overdue by more than 30 days. Consider follow-up actions.",
      category: "alert",
      priority: "high",
      status: "pending",
      createdAt: new Date(),
    },
  ]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: `I understand you're asking about "${inputValue}". This is a placeholder response. In a real implementation, this would connect to an AI service to provide intelligent insights based on your business data.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "optimization":
        return <Zap className="h-4 w-4" />;
      case "insight":
        return <Brain className="h-4 w-4" />;
      case "action":
        return <CheckCircle2 className="h-4 w-4" />;
      case "alert":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "optimization":
        return "bg-blue-100 text-blue-700";
      case "insight":
        return "bg-purple-100 text-purple-700";
      case "action":
        return "bg-green-100 text-green-700";
      case "alert":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              AI Assistant
            </h1>
            <p className="text-muted-foreground mt-2">
              Get intelligent insights and recommendations for your business
            </p>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Suggestions
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat">
            <Card className="editorial-card">
              <CardHeader>
                <CardTitle>AI Chat Assistant</CardTitle>
                <CardDescription>
                  Ask questions about your business data and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages Display */}
                <div className="h-96 overflow-y-auto space-y-4 border rounded-lg p-4 bg-muted/30">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-background border text-foreground rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(message.timestamp, "HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-background border text-foreground rounded-lg rounded-bl-none px-4 py-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ask me anything about your business..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleSendMessage();
                      }
                    }}
                    rows={3}
                    className="resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suggestions Tab */}
          <TabsContent value="suggestions">
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="editorial-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${getCategoryColor(suggestion.category)}`}>
                            {getCategoryIcon(suggestion.category)}
                          </div>
                          <div>
                            <h3 className="font-medium">{suggestion.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {format(suggestion.createdAt, "MMM dd, yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground ml-10">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2 ml-10">
                          <Badge variant="outline" className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)} Priority
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              suggestion.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : suggestion.status === "implemented"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {suggestion.status.charAt(0).toUpperCase() + suggestion.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
