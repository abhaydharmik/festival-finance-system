import React, { createContext, useContext, useEffect, useState } from "react";

import { getFestivals } from "../services/festival.service";

const FestivalContext = createContext(null);

export const FestivalProvider = ({ children }) => {
  const [festivals, setFestivals] = useState([]);
  const [currentFestival, setCurrentFestival] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------
  // Load festivals
  // ----------------------------------

  const fetchFestivals = async () => {
    setLoading(true);

    try {
      const response = await getFestivals();

      const festivalList = response.data?.data || [];

      setFestivals(festivalList);

      // Get previously selected festival
      const savedFestivalId = localStorage.getItem("festivalId");

      if (savedFestivalId) {
        const savedFestival = festivalList.find(
          (festival) => festival._id === savedFestivalId,
        );

        if (savedFestival) {
          setCurrentFestival(savedFestival);
          setLoading(false);
          return;
        }
      }

      // If nothing is selected, use active festival
      const activeFestival = festivalList.find(
        (festival) => festival.status === "active" && festival.isActive,
      );

      if (activeFestival) {
        setCurrentFestival(activeFestival);

        localStorage.setItem("festivalId", activeFestival._id);
      }
    } catch (error) {
      console.error("Failed to fetch festivals:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // Change current festival
  // ----------------------------------

  const selectFestival = (festival) => {
    if (!festival) {
      setCurrentFestival(null);
      localStorage.removeItem("festivalId");
      return;
    }

    setCurrentFestival(festival);

    localStorage.setItem("festivalId", festival._id);
  };

  // ----------------------------------
  // Initial load
  // ----------------------------------

  useEffect(() => {
    fetchFestivals();
  }, []);

  const value = {
    festivals,
    currentFestival,
    selectFestival,
    loading,
    refreshFestivals: fetchFestivals,
  };

  return (
    <FestivalContext.Provider value={value}>
      {children}
    </FestivalContext.Provider>
  );
};

// ----------------------------------
// Custom hook
// ----------------------------------

export const useFestival = () => {
  const context = useContext(FestivalContext);

  if (!context) {
    throw new Error("useFestival must be used inside FestivalProvider");
  }

  return context;
};
