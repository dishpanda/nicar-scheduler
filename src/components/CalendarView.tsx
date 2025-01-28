import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Workshop } from "@/types/types";

export const CalendarView = ({
  workshops,
  selectedWorkshops,
  onWorkshopSelect,
}: {
  workshops: Workshop[];
  selectedWorkshops: Set<number>;
  onWorkshopSelect: (workshop: Workshop) => void;
}) => {
  const days = ["Thursday", "Friday", "Saturday", "Sunday"];
  const timeSlots: Array<string> = [];

  for (let hour = 8; hour <= 18; hour++) {
    timeSlots.push(`${hour}:00`);
    if (hour !== 18) timeSlots.push(`${hour}:30`);
  }

  const formatTime = (time: string) => {
    const hour = parseInt(time.split(":")[0]);
    const minute = time.split(":")[1];
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour > 12 ? hour - 12 : hour;
    return `${formattedHour}:${minute} ${period}`;
  };

  const getWorkshopsForTimeSlot = (day: string, timeSlot: string) => {
    const [hour, minute] = timeSlot.split(":");
    const slotStartTime = new Date();
    slotStartTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

    return workshops
      .filter((workshop) => selectedWorkshops.has(workshop.session_id))
      .filter((workshop) => {
        const startTime = new Date(workshop.start_time);
        return (
          workshop.day === day &&
          startTime.getHours() === slotStartTime.getHours() &&
          Math.floor(startTime.getMinutes() / 30) ===
            Math.floor(parseInt(minute) / 30)
        );
      });
  };

  const calculateSessionHeight = (workshop: Workshop) => {
    const start = new Date(workshop.start_time);
    const end = new Date(workshop.end_time);
    const durationMinutes = (end.valueOf() - start.valueOf()) / (1000 * 60);
    return `${(durationMinutes / 30) * 4}rem`; // 4rem height for 30-minute slot
  };

  const calculateTopOffset = (workshop: Workshop) => {
    const startTime = new Date(workshop.start_time);
    const minutes = startTime.getMinutes() % 30;
    return `${(minutes / 30) * 4}rem`; // Proportional offset based on minutes
  };

  const hasSelectedWorkshops = selectedWorkshops.size > 0;

  return (
    <div>
      {!hasSelectedWorkshops ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 rounded-lg">
          <Info className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Sessions Selected</h3>
          <p>Use the grid view to select sessions and build your schedule</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-5 gap-2">
              {/* Time column */}
              <div className="pt-16">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-16 flex items-start justify-end pr-2 text-sm text-gray-600"
                  >
                    {formatTime(time)}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day) => (
                <div key={day} className="relative">
                  <div className="h-16 flex items-center justify-center font-bold border-b">
                    {day}
                  </div>
                  {timeSlots.map((timeSlot) => {
                    const slotWorkshops = getWorkshopsForTimeSlot(
                      day,
                      timeSlot,
                    );
                    return (
                      <div
                        key={`${day}-${timeSlot}`}
                        className="relative h-16 border-b border-gray-100"
                      >
                        {slotWorkshops.map((workshop) => (
                          <Card
                            key={workshop.session_id}
                            className="z-10 absolute left-1 right-1 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border-blue-500 border-2"
                            style={{
                              height: calculateSessionHeight(workshop),
                              backgroundColor: "#EBF5FF",
                              top: calculateTopOffset(workshop),
                            }}
                            onClick={() => onWorkshopSelect(workshop)}
                          >
                            <CardContent className="p-2">
                              <div className="text-sm font-semibold truncate">
                                {workshop.session_title}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {workshop.room?.room_name}
                              </div>
                              {workshop.session_type && (
                                <div className="text-xs mt-1">
                                  <span className="px-1 py-0.5 bg-gray-100 rounded-full">
                                    {workshop.session_type}
                                  </span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
