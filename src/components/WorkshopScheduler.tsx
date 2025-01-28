import React, { useState, useMemo } from "react";
import {
  Clock,
  GraduationCap,
  MapPin,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  CalendarDays,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CalendarView } from "./CalendarView";
import scheduleData from "../assets/nicar-2025-schedule.json";

const DESCRIPTION_PREVIEW_LENGTH = 100;

type Workshop = {
  session_id: number;
  session_title: string;
  canceled: boolean;
  description: string;
  session_type: string;
  track: string;
  start_time: Date;
  end_time: Date;
  duration_mins: number;
  duration_formatted: string;
  evergreen: boolean;
  cost: string;
  prereg_link: string;
  sponsor: string;
  recorded: boolean;
  audio_recording_link: string;
  skill_level: string;
  speakers: Speaker[];
  tipsheets: string[];
  room: Room;
  day: string;
};

type Room = {
  level: string;
  recorded: boolean;
  room_name: string;
};

type Speaker = {
  first: string;
  last: string;
  affiliation: string;
  bio: string;
  social: string[];
};

const WorkshopScheduler = () => {
  const [selectedWorkshops, setSelectedWorkshops] = useState(new Set());
  const [conflictAlert, setConflictAlert] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'calendar'
  const [filters, setFilters] = useState({
    day: "all",
    skillLevel: "all",
    sessionType: "all",
  });

  const toggleCardExpansion = (
    sessionId: number,
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedCards(newExpanded);
  };

  const truncateDescription = (description: string) => {
    if (!description) return "No description available";
    if (description.length <= DESCRIPTION_PREVIEW_LENGTH) return description;
    return description.substring(0, DESCRIPTION_PREVIEW_LENGTH) + "...";
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const checkTimeConflict = (workshop: Workshop) => {
    for (const selectedId of selectedWorkshops) {
      const selected = scheduleData.find((w) => w.session_id === selectedId);
      if (
        new Date(selected.start_time) < new Date(workshop.end_time) &&
        new Date(selected.end_time) > new Date(workshop.start_time)
      ) {
        return selected;
      }
    }
    return null;
  };

  const handleWorkshopSelect = (workshop: Workshop) => {
    const newSelected = new Set(selectedWorkshops);

    if (newSelected.has(workshop.session_id)) {
      newSelected.delete(workshop.session_id);
      setSelectedWorkshops(newSelected);
      setConflictAlert(null);
    } else {
      const conflict = checkTimeConflict(workshop);
      if (conflict) {
        setConflictAlert({
          workshop: workshop,
          conflict: conflict,
        });
      } else {
        newSelected.add(workshop.session_id);
        setSelectedWorkshops(newSelected);
        setConflictAlert(null);
      }
    }
  };

  const filterOptions = useMemo(
    () => ({
      days: [...new Set(scheduleData.map((w) => w.day))].sort(),
      skillLevels: [...new Set(scheduleData.map((w) => w.skill_level))]
        .filter(Boolean)
        .sort(),
      sessionTypes: [...new Set(scheduleData.map((w) => w.session_type))]
        .filter(Boolean)
        .sort(),
    }),
    [],
  );

  const filteredWorkshops = useMemo(() => {
    return scheduleData.filter((workshop) => {
      return (
        (filters.day === "all" || workshop.day === filters.day) &&
        (filters.skillLevel === "all" ||
          workshop.skill_level === filters.skillLevel) &&
        (filters.sessionType === "all" ||
          workshop.session_type === filters.sessionType)
      );
    });
  }, [filters]);

  const sortedWorkshops = useMemo(() => {
    return [...filteredWorkshops].sort((a, b) => {
      const timeCompare = new Date(a.start_time) - new Date(b.start_time);
      if (timeCompare !== 0) return timeCompare;
      return (a.room?.room_name || "").localeCompare(b.room?.room_name || "");
    });
  }, [filteredWorkshops]);

  const generateICSFile = () => {
    const selectedSessions = scheduleData.filter((workshop) =>
      selectedWorkshops.has(workshop.session_id),
    );

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//NICAR 2025//Workshop Schedule//EN",
    ];

    selectedSessions.forEach((session) => {
      const startDate = new Date(session.start_time);
      const endDate = new Date(session.end_time);

      // ICS date format: YYYYMMDDTHHmmssZ
      const formatDateForICS = (date: Date) => {
        return date
          .toISOString()
          .replace(/[-:]/g, "")
          .replace(/\.\d{3}/g, "");
      };

      const escapeText = (text: string) => {
        return text.replace(/[,\\;]/g, "\\$&").replace(/\n/g, "\\n");
      };

      const location = session.room
        ? `${session.room.room_name}${session.room.level ? ` (Level: ${session.room.level})` : ""}`
        : "TBA";

      icsContent = icsContent.concat([
        "BEGIN:VEVENT",
        `UID:${session.session_id}@nicar2025`,
        `DTSTAMP:${formatDateForICS(new Date())}`,
        `DTSTART:${formatDateForICS(startDate)}`,
        `DTEND:${formatDateForICS(endDate)}`,
        `SUMMARY:${escapeText(session.session_title)}`,
        `LOCATION:${escapeText(location)}`,
        `DESCRIPTION:${escapeText(session.description || "No description available")}\\n\\nType: ${session.session_type || "N/A"}\\nSkill Level: ${session.skill_level || "N/A"}${
          session.speakers.length
            ? `\\nSpeakers: ${session.speakers
                .map(
                  (speaker) =>
                    `${speaker.first} ${speaker.last} (${speaker.affiliation})`,
                )
                .join(", ")}`
            : ""
        }`,
        "END:VEVENT",
      ]);
    });

    icsContent.push("END:VCALENDAR");

    const blob = new Blob([icsContent.join("\r\n")], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nicar-2025-schedule.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const groupedWorkshops = useMemo(() => {
    const groups = {};
    const sortedData = [...filteredWorkshops].sort((a, b) => {
      return new Date(a.start_time) - new Date(b.start_time);
    });

    sortedData.forEach((workshop) => {
      const day = workshop.day;
      const startTime = formatDateTime(workshop.start_time);

      if (!groups[day]) {
        groups[day] = {};
      }
      if (!groups[day][startTime]) {
        groups[day][startTime] = [];
      }
      groups[day][startTime].push(workshop);
    });

    return groups;
  }, [filteredWorkshops]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <img
          src="/nicar-2025-logo.png"
          alt="NICAR 2025 Logo"
          className="w-full mb-4"
        />
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-2">NICAR 2025 Scheduler</h1>
          <div className="flex gap-2">
            {selectedWorkshops.size > 0 && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={generateICSFile}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export to Calendar</span>
              </Button>
            )}
            <button
              className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded ${viewMode === "calendar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-gray-600">
          Select sessions to create your personal schedule
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          className="p-2 border rounded"
          value={filters.day}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, day: e.target.value }))
          }
        >
          <option value="all">All Days</option>
          {filterOptions.days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={filters.skillLevel}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, skillLevel: e.target.value }))
          }
        >
          <option value="all">All Skill Levels</option>
          {filterOptions.skillLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={filters.sessionType}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, sessionType: e.target.value }))
          }
        >
          <option value="all">All Session Types</option>
          {filterOptions.sessionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {conflictAlert && (
        <Alert className="mb-4 bg-yellow-50">
          <AlertTitle>Time Conflict Detected</AlertTitle>
          <AlertDescription>
            "{conflictAlert.workshop.session_title}" conflicts with "
            {conflictAlert.conflict.session_title}"
          </AlertDescription>
        </Alert>
      )}

      {viewMode === "calendar" ? (
        <CalendarView
          workshops={sortedWorkshops}
          selectedWorkshops={selectedWorkshops}
          onWorkshopSelect={handleWorkshopSelect}
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedWorkshops).map(([day, timeSlots]) => (
            <div key={day} className="space-y-6">
              <h2 className="text-2xl font-bold border-b pb-2">{day}</h2>
              {Object.entries(timeSlots).map(([timeSlot, workshops]) => (
                <div key={`${day}-${timeSlot}`} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {timeSlot}
                    <span className="text-sm text-gray-500 font-normal">
                      ({workshops.length} session
                      {workshops.length !== 1 ? "s" : ""})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workshops.map((workshop) => (
                      <Card
                        key={workshop.session_id}
                        className={`cursor-pointer transition-all ${
                          selectedWorkshops.has(workshop.session_id)
                            ? "border-blue-500 border-2"
                            : ""
                        } ${workshop.canceled ? "opacity-50" : ""}`}
                        onClick={() =>
                          !workshop.canceled && handleWorkshopSelect(workshop)
                        }
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {workshop.session_title}
                            </CardTitle>
                            {workshop.canceled && (
                              <span className="text-red-500 text-sm font-bold">
                                CANCELED
                              </span>
                            )}
                          </div>
                          <CardDescription>
                            {expandedCards.has(workshop.session_id)
                              ? workshop.description ||
                                "No description available"
                              : truncateDescription(workshop.description)}
                            {workshop.description &&
                              workshop.description.length >
                                DESCRIPTION_PREVIEW_LENGTH && (
                                <button
                                  className="ml-2 text-blue-500 hover:text-blue-700"
                                  onClick={(e) =>
                                    toggleCardExpansion(workshop.session_id, e)
                                  }
                                >
                                  {expandedCards.has(workshop.session_id) ? (
                                    <ChevronUp className="inline w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="inline w-4 h-4" />
                                  )}
                                </button>
                              )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {workshop.room && (
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {workshop.room.room_name}{" "}
                                {workshop.room.level &&
                                  `(Level: ${workshop.room.level})`}
                              </span>
                            </div>
                          )}
                          {workshop.skill_level && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <GraduationCap className="w-4 h-4" />
                              <span>{workshop.skill_level}</span>
                            </div>
                          )}
                          {workshop.session_type && (
                            <div className="mt-2">
                              <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">
                                {workshop.session_type}
                              </span>
                            </div>
                          )}
                          {workshop.speakers &&
                            workshop.speakers.length > 0 && (
                              <div className="mt-2 text-sm text-gray-600">
                                Speakers:{" "}
                                {workshop.speakers
                                  .map(
                                    (speaker) =>
                                      `${speaker.first} ${speaker.last} (${speaker.affiliation})`,
                                  )
                                  .join(", ")}
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      <footer className="mt-4 border-t">
        <div className="max-w-6xl mx-auto py-4 px-4">
          <p className="text-center text-gray-600">
            Created by{" "}
            <a
              href="https://rahuldeshpan.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Rahul Deshpande
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WorkshopScheduler;
