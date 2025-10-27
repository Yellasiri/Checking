"use client";
import { useState, useEffect } from "react";

export function useGetInventoryItems() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    async function fetchInventoryItems() {
      setInventoryLoading(true);
      setInventoryError(null);
      try {
        const res = await fetch("/api/v1/inventory/get-item", {
          method: "GET",
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) {
          console.log("Error data:", data);
          setInventoryError(data.error || "Failed to fetch inventory items");
          setInventoryItems([]);
          return;
        }
        setInventoryItems(data.items || []);
      } catch (err) {
        if (err.name !== "AbortError") setInventoryError(err.message);
      } finally {
        setInventoryLoading(false);
      }
    }
    fetchInventoryItems();
    return () => controller.abort();
  }, []);

  return { inventoryItems, inventoryLoading, inventoryError };
}
