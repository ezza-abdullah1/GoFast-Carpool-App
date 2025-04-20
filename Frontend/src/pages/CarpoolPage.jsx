import React, { useState } from "react";
import { Filter, MapPin, SlidersHorizontal, Car } from "lucide-react";
import CarpoolPost from "../Components/FindCarpool/CarpoolPost";
import CarpoolSearch from "../Components/FindCarpool/CarpoolSearch";
import Header from "../Components/layout/Header";
import Footer from "../Components/layout/Footer";
import { useEffect } from "react";
import axios from "axios"; // if using axios

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

  const [carpools, setCarpools] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
useEffect(() => {
  const fetchCarpools = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/carpools"); // Change to your backend URL
      setCarpools(response.data); // assuming backend sends an array
    } catch (err) {
      setError("Failed to fetch carpools");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchCarpools();
}, []);


const handleSearch = async (filters) => {
  console.log("Search filters:", filters);
  try {
    const response = await axios.post("http://localhost:5000/api/carpools/search", filters);
    setCarpools(response.data);
  } catch (error) {
    console.error("Search failed", error);
    setError("Search failed");
  }
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

              {loading ? (
  <div className="text-center text-muted-foreground">Loading...</div>
) : error ? (
  <div className="text-center text-red-500">{error}</div>
) : viewMode === "list" ? (
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
        <h3 className="text-lg font-medium mb-2">Map View Coming...</h3>
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
