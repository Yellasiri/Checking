"use client"
import { useState, useEffect } from "react";

export function useGetStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchStaff() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/v1/staff/get-staff-details", {
          signal: controller.signal,
        });
        if (!res.ok) {
            const errorData = await res.json();
            console.log("Error data:", errorData);
        }
            
        const data = await res.json();
        setStaff(data.staff || []);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStaff();
    return () => controller.abort();
  }, []);

  return { staff, loading, error };
}
