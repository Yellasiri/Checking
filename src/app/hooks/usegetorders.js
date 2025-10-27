"use client";
import { useState, useEffect, useCallback } from "react";

export function useGetOrders() {
  const [orders, setOrders] = useState([]);
  const [orderloading, setOrderloading] = useState(true);
  const [ordererror, setOrdererror] = useState(null);

  const fetchOrders = useCallback(async (signal) => {
    setOrderloading(true);
    setOrdererror(null);
    try {
      const res = await fetch("/api/v1/orders/get-order-details", { signal });
      const data = await res.json();
      if (!res.ok) {
        setOrdererror(data.error || "Failed to fetch orders");
        setOrders([]);
        return;
      }
      setOrders(data.orders || []);
    } catch (err) {
      if (err.name !== "AbortError") setOrdererror(err.message);
    } finally {
      setOrderloading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
    return () => controller.abort();
  }, [fetchOrders]);

  // Refetch function
  const refetch = () => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
  };

  return { orders, orderloading, ordererror, refetch };
}