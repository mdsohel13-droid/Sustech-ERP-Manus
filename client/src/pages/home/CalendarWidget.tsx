import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, Video, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";

interface CalendarWidgetProps {
  actionItems: any[];
  users: any[];
}

export default function CalendarWidget({ actionItems, users }: CalendarWidgetProps) {
  const today = new Date();
  const todayStr = format(today, "EEEE");
  const dateStr = format(today, "MMM d");

  const todayTasks = (actionItems || [])
    .filter(a => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate);
      return due.toDateString() === today.toDateString() && a.status !== "resolved" && a.status !== "closed";
    })
    .slice(0, 3);

  const upcomingTasks = (actionItems || [])
    .filter(a => {
      if (!a.dueDate) return false;
      const due = new Date(a.dueDate);
      return due > today && a.status !== "resolved" && a.status !== "closed";
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  const displayTasks = todayTasks.length > 0 ? todayTasks : upcomingTasks;
  const eventCount = todayTasks.length;

  const timeSlots = ["10:00 AM", "2:00 PM", "4:30 PM"];
  const durations = ["1h", "45m", "30m"];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
            {todayStr}
          </CardTitle>
          <span className="text-xs text-gray-500">{dateStr} · {eventCount} event{eventCount !== 1 ? "s" : ""}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayTasks.length > 0 ? displayTasks.map((task, idx) => (
            <div key={task.id} className="border-l-2 border-blue-400 pl-3 py-2">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{timeSlots[idx % timeSlots.length]}</span>
                <span className="text-[10px] text-gray-400">({durations[idx % durations.length]})</span>
              </div>
              <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
              {task.description && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-[11px] text-gray-500 truncate">{task.description.slice(0, 40)}</span>
                </div>
              )}
              <div className="flex -space-x-1.5 mt-2">
                {[0, 1].map(i => (
                  <Avatar key={i} className="h-5 w-5 border border-white">
                    <AvatarFallback className="text-[8px] bg-blue-100 text-blue-600">
                      {String.fromCharCode(65 + ((idx + i) % 26))}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          )) : (
            <div className="text-center py-6 text-gray-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No events today</p>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Meeting
        </Button>
      </CardContent>
    </Card>
  );
}
