import React, { useState } from "react";
import { Filter, MapPin, SlidersHorizontal, Car } from "lucide-react";
import CarpoolPost from "../Components/FindCarpool/CarpoolPost";
import CarpoolSearch from "../Components/FindCarpool/CarpoolSearch";
import Header from "../Components/layout/Header";
import Footer from "../Components/layout/Footer";
const Button = ({ children, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark focus:outline-none transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

const CarpoolPage = () => {
  const [viewMode, setViewMode] = useState("list");

  const carpools = [
    {
      id: "1",
      driver: {
        name: "Ahmed Khan",
        rating: 4.8,
        department: "Computer Science",
      },
      route: {
        pickup: "FAST NUCES Main Campus",
        dropoff: "Gulistan-e-Johar",
      },
      schedule: {
        date: "Tomorrow",
        time: "4:30 PM",
        recurring: ["Monday", "Wednesday", "Friday"],
      },
      seats: {
        total: 4,
        available: 2,
      },
      preferences: ["No smoking", "Music lovers welcome"],
    },
    {
      id: "2",
      driver: {
        name: "Sara Malik",
        rating: 4.9,
        department: "Electrical Engineering",
      },
      route: {
        pickup: "North Nazimabad",
        dropoff: "FAST NUCES Main Campus",
      },
      schedule: {
        date: "Tomorrow",
        time: "8:15 AM",
        recurring: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      },
      seats: {
        total: 3,
        available: 1,
      },
      preferences: ["Female riders only"],
    },
    {
      id: "3",
      driver: {
        name: "Bilal Ahmed",
        rating: 4.7,
        department: "Business Administration",
      },
      route: {
        pickup: "DHA Phase 6",
        dropoff: "FAST NUCES Main Campus",
      },
      schedule: {
        date: "Friday",
        time: "9:00 AM",
        recurring: ["Friday"],
      },
      seats: {
        total: 4,
        available: 3,
      },
    },
    {
      id: "4",
      driver: {
        name: "Ayesha Tariq",
        rating: 4.6,
        department: "Computer Science",
      },
      route: {
        pickup: "FAST NUCES Main Campus",
        dropoff: "Gulshan-e-Iqbal",
      },
      schedule: {
        date: "Tomorrow",
        time: "4:30 PM",
        recurring: ["Monday", "Wednesday", "Friday"],
      },
      seats: {
        total: 3,
        available: 2,
      },
      preferences: ["Female riders only", "No smoking"],
    },
    {
      id: "5",
      driver: {
        name: "Usman Ali",
        rating: 4.5,
        department: "Software Engineering",
      },
      route: {
        pickup: "Clifton",
        dropoff: "FAST NUCES Main Campus",
      },
      schedule: {
        date: "Tomorrow",
        time: "8:00 AM",
        recurring: ["Monday", "Wednesday", "Friday"],
      },
      seats: {
        total: 4,
        available: 3,
      },
    },
    {
      id: "6",
      driver: {
        name: "Farah Khan",
        rating: 4.7,
        department: "Electrical Engineering",
      },
      route: {
        pickup: "FAST NUCES Main Campus",
        dropoff: "Defense Phase 2",
      },
      schedule: {
        date: "Tomorrow",
        time: "5:00 PM",
        recurring: ["Tuesday", "Thursday"],
      },
      seats: {
        total: 3,
        available: 1,
      },
      preferences: ["Music lovers welcome"],
    },
  ];

  const handleSearch = (filters) => {
    console.log("Search filters:", filters);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 pt-20">
          <section className="bg-muted/30 dark:bg-muted/5 py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">Find a Carpool</h1>
                <p className="text-lg text-muted-foreground">
                  Browse available carpools offered by fellow FAST NUCES
                  students.
                </p>
              </div>

              <div className="mb-8">
                <CarpoolSearch onSearch={handleSearch} />
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {carpools.length}
                  </span>{" "}
                  carpools available
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "list"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    List View
                  </button>
                  <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "map"
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    onClick={() => setViewMode("map")}
                  >
                    <MapPin className="h-4 w-4" />
                    Map View
                  </button>
                </div>
              </div>

              {viewMode === "list" ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                  {carpools.map((carpool) => (
                    <CarpoolPost key={carpool.id} {...carpool} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-border h-[700px] bg-card animate-fade-in">
                  <div className="h-full flex items-center justify-center bg-muted/30 dark:bg-muted/10">
                    <div className="text-center p-8">
                      <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">
                        Map View Coming Soon
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        We're working on an interactive map view to help you
                        find carpools more easily.
                      </p>
                      <Button onClick={() => setViewMode("list")}>
                        Switch to List View
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default CarpoolPage;
