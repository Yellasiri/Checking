"use client";
import { useState, useEffect } from "react";

export function useGetCustomers() {
  const [customers, setCustomers] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchCustomers() {
      setCustomerLoading(true);
      setCustomerError(null);
      try {
        const res = await fetch("/api/v1/customer/get-cutomer-details", {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          console.log("Error data:", data);
          setCustomerError(data.error || "Failed to fetch customers");
          setCustomers([]);
          return;
        }
        setCustomers(data.customers || []);
      } catch (err) {
        if (err.name !== "AbortError") setCustomerError(err.message);
      } finally {
        setCustomerLoading(false);
      }
    }
    fetchCustomers();
    return () => controller.abort();
  }, []);

  return { customers, customerLoading, customerError };
}
