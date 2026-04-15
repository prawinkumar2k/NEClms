import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AttendanceCalendar = ({
  courseName = "Data Structures",
  records = generateMockRecords(),
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceForDate = (day) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split("T")[0];
    return records.find((r) => r.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-success/20 text-success border-success";
      case "absent":
        return "bg-destructive/20 text-destructive border-destructive";
      case "od":
        return "bg-info/20 text-info border-info";
      case "not-marked":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-secondary text-foreground border-border";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "present":
        return "P";
      case "absent":
        return "A";
      case "od":
        return "OD";
      case "not-marked":
        return "-";
      default:
        return "?";
    }
  };

  const calculateAttendancePercentage = () => {
    const marked = records.filter((r) => r.status !== "not-marked");
    const present = records.filter((r) => r.status === "present");
    if (marked.length === 0) return 0;
    return Math.round((present.length / marked.length) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{courseName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Attendance Rate: {calculateAttendancePercentage()}%
            </p>
          </div>
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {calculateAttendancePercentage()}%
              </div>
              <div className="text-xs text-muted-foreground">Attended</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month/Year Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border border-border p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-bold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first day of month */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days of month */}
            {days.map((day) => {
              const record = getAttendanceForDate(day);
              const status = record?.status || "not-marked";

              return (
                <button
                  key={day}
                  className={`aspect-square flex items-center justify-center rounded-lg border-2 font-semibold text-sm transition-all hover:shadow-md ${getStatusColor(
                    status
                  )}`}
                  title={record?.remark || getStatusLabel(status)}
                >
                  <div className="text-center">
                    <div className="text-xs">{day}</div>
                    <div className="text-xs opacity-70">
                      {getStatusLabel(status)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success/20 border border-success rounded"></div>
            <span className="text-xs">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive/20 border border-destructive rounded"></div>
            <span className="text-xs">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-info/20 border border-info rounded"></div>
            <span className="text-xs">On Leave</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted border border-border rounded"></div>
            <span className="text-xs">Not Marked</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mock data generator
function generateMockRecords() {
  const records = [];
  const startDate = new Date(2024, 0, 1);

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const rand = Math.random();
    let status;
    if (rand < 0.85) {
      status = "present";
    } else if (rand < 0.93) {
      status = "absent";
    } else if (rand < 0.97) {
      status = "od";
    } else {
      status = "not-marked";
    }

    records.push({
      date: date.toISOString().split("T")[0],
      status,
      remark: status === "od" ? "Medical Leave" : undefined,
    });
  }

  return records;
}
