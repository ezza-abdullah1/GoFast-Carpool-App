import React, { useState } from "react";
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Users,
  X,
} from "lucide-react";
import Button from "../ui/compatibility-button";
import { cn } from "../../lib/utils";

const CarpoolSearch = ({ onSearch, className }) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [minSeats, setMinSeats] = useState("1");
  const [selectedFilters, setSelectedFilters] = useState([]);

  const filterOptions = [
    "Female drivers only",
    "Male drivers only",
    "Same department",
    "Highest rated",
    "No smoking",
  ];

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setPickup("");
    setDropoff("");
    setDate("");
    setTime("");
    setMinSeats("1");
    setSelectedFilters([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSearch({
      pickup,
      dropoff,
      date,
      time,
      minSeats: parseInt(minSeats),
      filters: selectedFilters,
    });
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-xl overflow-hidden",
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Find a Carpool</h2>
          <button
            type="button"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={cn(
              "flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full transition-colors",
              isFilterExpanded
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {isFilterExpanded ? (
              <X className="h-4 w-4" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            {isFilterExpanded ? "Hide Filters" : "Filters"}
            {selectedFilters.length > 0 && (
              <span className="ml-1 flex items-center justify-center bg-primary-700 text-white text-xs rounded-full h-5 w-5">
                {selectedFilters.length}
              </span>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic search fields - always visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="search-pickup" className="text-sm font-medium">
                From
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  id="search-pickup"
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="input-base pl-10 bg-background text-foreground dark:bg-muted dark:text-white"
                  placeholder="Pickup location"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="search-dropoff" className="text-sm font-medium">
                To
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                </div>
                <input
                  id="search-dropoff"
                  type="text"
                  value={dropoff}
                  onChange={(e) => setDropoff(e.target.value)}
                  className="input-base pl-10 bg-background text-foreground dark:bg-muted dark:text-white"
                  placeholder="Drop-off location"
                />
              </div>
            </div>
          </div>

          {/* Advanced filters - expandable */}
          {isFilterExpanded && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
              <div className="space-y-2">
                <label htmlFor="search-date" className="text-sm font-medium">
                  Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    id="search-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-base pl-10 bg-background text-foreground dark:bg-muted dark:text-white"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="search-time" className="text-sm font-medium">
                  Departure Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                  <input
                    id="search-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input-base pl-10 bg-background text-foreground dark:bg-muted dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="search-seats" className="text-sm font-medium">
                  Minimum Seats
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <Users className="h-5 w-5" />
                  </div>
                  <select
                    id="search-seats"
                    value={minSeats}
                    onChange={(e) => setMinSeats(e.target.value)}
                    className="input-base pl-10 bg-background text-foreground :bg-mutedarkd dark:text-white"
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <option key={num} value={num}>
                        {num} seat{num !== 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-3 mt-2">
                <div className="text-sm font-medium mb-2">Filter by:</div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => toggleFilter(filter)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                        selectedFilters.includes(filter)
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search buttons */}
          <div className="mt-8 flex gap-3">
            <Button
              type="submit"
              variant="outline"
              className="flex-1 bg-primary text-sm h-10  dark:text-white  dark:bg-button-dark dark:hover:bg-button-hover text-white "
            >
              <Search className="mr-2 h-8 w-4" />
              Search
            </Button>

            {(pickup ||
              dropoff ||
              date ||
              time ||
              selectedFilters.length > 0) && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarpoolSearch;
