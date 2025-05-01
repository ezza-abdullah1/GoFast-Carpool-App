import React, { useState, useEffect } from "react";
import CarpoolPost from "../Components/FindCarpool/CarpoolPost";
import CarpoolSearch from "../Components/FindCarpool/CarpoolSearch";

import axios from "axios";

const CarpoolPage = () => {
  const [carpools, setCarpools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCarpools, setFilteredCarpools] = useState([]);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchCarpools = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/carpools");
        setCarpools(response.data);
        setFilteredCarpools(response.data);  // Initially, show all carpools
      } catch (err) {
        setError("Failed to fetch carpools");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarpools();
  }, []);

  const convert12HourToMinutes = (time12h) => {
    const [time, modifier] = time12h.toLowerCase().split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "pm" && hours !== 12) hours += 12;
    if (modifier === "am" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const convert24HourToMinutes = (time24h) => {
    const [hours, minutes] = time24h.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSearch = (newFilters) => {
    setFilters(newFilters); // Store the filters in state
    let filtered = [...carpools];

    // Filter by pickup location
    if (newFilters.pickup) {
      filtered = filtered.filter((c) =>
        c.route.pickup.toLowerCase().includes(newFilters.pickup.toLowerCase())
      );
    }

    // Filter by dropoff location
    if (newFilters.dropoff) {
      filtered = filtered.filter((c) =>
        c.route.dropoff.toLowerCase().trim().includes(newFilters.dropoff.toLowerCase().trim())
      );
    }

    // Filter by date
    if (newFilters.date) {
      filtered = filtered.filter((c) => c.schedule.date === newFilters.date);
    }

    // Filter by time (within ±30 minutes range)
    if (newFilters.time) {
      const targetMinutes = convert24HourToMinutes(newFilters.time);
      filtered = filtered.filter((c) => {
        const carpoolMinutes = convert12HourToMinutes(c.schedule.time);
        return Math.abs(carpoolMinutes - targetMinutes) <= 30;
      });
    }

    // Filter by minimum seats
    if (newFilters.minSeats) {
      filtered = filtered.filter((c) => c.seats.available >= newFilters.minSeats);
    }

    // Apply additional filters
    if (newFilters.filters && newFilters.filters.length > 0) {
      filtered = filtered.filter((c) => {
        if (newFilters.filters.includes("Female drivers only") && c.driver.gender !== "female") {
          return false;
        }

        if (newFilters.filters.includes("Male drivers only") && c.driver.gender !== "male") {
          return false;
        }

        if (newFilters.filters.includes("No smoking") &&
          (!c.preferences || !c.preferences.includes("No smoking"))) {
          return false;
        }

        return true;
      });
    }

    setFilteredCarpools(filtered); // Update the filtered carpools state
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-20">
        <section className="bg-muted/30 dark:bg-muted/5 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Find a Carpool</h1>
              <p className="text-lg text-muted-foreground">
                Browse available carpools offered by fellow FAST NUCES students.
              </p>
            </div>

            <div className="mb-8">
              <CarpoolSearch onSearch={handleSearch} />
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredCarpools.length}</span>{" "}
                carpools available
              </div>
            </div>

            {loading ? (
              <div className="text-center text-muted-foreground">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                {filteredCarpools.map((carpool) => (
                  <CarpoolPost key={carpool.id} {...carpool} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CarpoolPage;
