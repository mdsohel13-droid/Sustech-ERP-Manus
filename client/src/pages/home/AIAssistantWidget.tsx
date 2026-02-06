import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function AIAssistantWidget() {
  const [, navigate] = useLocation();

  const suggestions = [
    "Show today's sales summary",
    "What are my pending tasks?",
    "Generate inventory report",
    "Team performance this week",
  ];

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          AI Assistant
          <Badge variant="outline" className="text-[10px] bg-white/60">Powered by AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white/70 backdrop-blur-sm p-3.5 rounded-xl border border-white/50 mb-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            Hello! I'm your ERP AI Assistant. I can help you with reports, data analysis, task management, and more. What would you like to know?
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-gray-500">Suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <Button key={s} variant="outline" size="sm" className="text-[11px] h-7 bg-white/60 hover:bg-white border-white/80" onClick={() => navigate("/ai-assistant")}>
                {s}
              </Button>
            ))}
          </div>
        </div>
        <Button className="w-full mt-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => navigate("/ai-assistant")}>
          <MessageCircle className="h-4 w-4 mr-2" /> Open AI Assistant
        </Button>
      </CardContent>
    </Card>
  );
}
