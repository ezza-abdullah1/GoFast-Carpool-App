import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Star,
  MessageCircle,
} from "lucide-react";
import Button from "../ui/compatibility-button";
import {cn}from "../../lib/utils"
const CarpoolPost = ({
  id,
  driver,
  route,
  schedule,
  seats,
  preferences = [],
  variant = "default",
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    if (variant === "default") {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md",
        variant === "compact" ? "p-4" : "p-5",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/40 overflow-hidden flex items-center justify-center">
            {driver?.image ? (
              <img
                src={driver.image}
                alt={driver?.name || "Driver"}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold text-primary-600 dark:text-primary-300">
                {driver?.name?.charAt(0) || "?"}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold truncate">{driver.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Star
                    className="h-3.5 w-3.5 text-yellow-500 mr-1"
                    fill="currentColor"
                  />
                  {driver.rating.toFixed(1)}
                </span>
                <span className="mx-1.5">•</span>
                <span>{driver.department}</span>
              </div>
            </div>

            {variant === "default" && (
              <div className="flex items-center text-sm">
                <span
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                    seats.available > 0
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  )}
                >
                  <Users className="h-3 w-3" />
                  {seats.available} seat{seats.available !== 1 ? "s" : ""}{" "}
                  available
                </span>
              </div>
            )}
          </div>

          {/* Route */}
          <div className={cn("mt-3", variant === "compact" && "text-sm")}>
            <div className="flex items-start gap-2">
              <MapPin
                className={cn(
                  "h-5 w-5 text-primary mt-0.5",
                  variant === "compact" && "h-4 w-4"
                )}
              />
              <div className="flex-1">
                <div className="font-medium">
                  From:{" "}
                  <span className="text-muted-foreground">{route.pickup}</span>
                </div>
                <div className="font-medium mt-1">
                  To:{" "}
                  <span className="text-muted-foreground">{route.dropoff}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div
            className={cn(
              "mt-3 grid",
              variant === "default" ? "grid-cols-2" : "grid-cols-1 text-sm"
            )}
          >
            <div className="flex items-center gap-2">
              <Calendar
                className={cn(
                  "h-5 w-5 text-primary",
                  variant === "compact" && "h-4 w-4"
                )}
              />
              <span>{schedule.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock
                className={cn(
                  "h-5 w-5 text-primary",
                  variant === "compact" && "h-4 w-4"
                )}
              />
              <span>{schedule.time}</span>
            </div>
          </div>

          {/* Recurring schedule */}
          {schedule.recurring &&
            schedule.recurring.length > 0 &&
            isExpanded && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {schedule.recurring.map((day, index) => (
                    <span
                      key={index}
                      className="bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Preferences */}
          {preferences.length > 0 && (isExpanded || variant === "compact") && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Preferences:</div>
              <div className="flex flex-wrap gap-2">
                {preferences.map((preference, index) => (
                  <span
                    key={index}
                    className="bg-accent text-accent-foreground px-2.5 py-0.5 rounded-full text-xs font-medium"
                  >
                    {preference}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {variant === "default" && (
            <div className="mt-4 flex gap-3">
              <Button className="flex-1">Request Seat</Button>
              <Button variant="outline" className="flex-1">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message
              </Button>
              {(schedule.recurring || preferences.length > 0) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleExpand}
                  aria-label={isExpanded ? "Show less" : "Show more"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Button>
              )}
            </div>
          )}

          {variant === "compact" && (
            <div className="mt-3 flex items-center justify-between">
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                  seats.available > 0
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                )}
              >
                <Users className="h-3 w-3" />
                {seats.available} seat{seats.available !== 1 ? "s" : ""}{" "}
                available
              </div>
              <Button size="sm">Details</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarpoolPost;
