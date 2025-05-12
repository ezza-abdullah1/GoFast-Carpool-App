import React, { useState, useEffect } from "react";
import CarpoolPost from "../Components/FindCarpool/CarpoolPost";
import CarpoolSearch from "../Components/FindCarpool/CarpoolSearch";
import { useSelector } from "react-redux"; 
import axiosInstance from "../Components/Authentication/redux/axiosInstance";

const CarpoolPage = () => {
  const [carpools, setCarpools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userDetails } = useSelector((state) => state.user); 

  useEffect(() => {
    const fetchCarpools = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/carpools");
  
        if (userDetails && userDetails.id) {
          const filteredCarpools = response.data.filter(
            (carpool) => carpool.driver.id !== userDetails.id
          );
          setCarpools(filteredCarpools);
        } else {
          setCarpools(response.data); 
        }
      } catch (err) {
        setError("Failed to fetch carpools");
      } finally {
        setLoading(false);
      }
    };

    fetchCarpools();
  }, [userDetails]); 

  const handleSearch = async (filters) => {
    try {
      const response = await axiosInstance.post(
        "/carpools/search",
        filters
      );
      if (userDetails && userDetails.id) {
        const filteredCarpools = response.data.filter(
          (carpool) => carpool.driver.id !== userDetails.id
        );
        setCarpools(filteredCarpools);
      } else {
        setCarpools(response.data);
      }
    } catch (error) {
      setError("Search failed");
    }
  };

  return (
    <>
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
              </div>

              {loading ? (
                <div className="text-center text-muted-foreground">
                  Loading...
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                  {carpools.map((carpool) => (
                    <CarpoolPost key={carpool.id} {...carpool} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default CarpoolPage;