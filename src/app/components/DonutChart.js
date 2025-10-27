"use client";

import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * DonutChart - computes status counts from `orders`
 *
 * Props:
 *  - orders: array of order objects (each should have a .status property)
 *  - size: pixel width/height of the chart (default 160)
 *  - showCenter: whether to display center summary (default true)
 */
export default function DonutChart({ orders = [], size = 160, showCenter = true }) {
  // keywords for matching variants of statuses (lowercased)
  const statusKeywords = useMemo(() => ({
    pending: ["pending", "awaiting", "awaiting confirmation", "awaiting_confirmation"],
    inProgress: ["in progress", "inprogress", "processing", "accepted", "working"],
    completed: ["completed", "complete", "delivered", "done"],
  }), []);

  // normalize helper
  const norm = (s) => (s ?? "").toString().toLowerCase();

  // compute counts from orders
  const [pendingCount, inProgressCount, completedCount, otherCount, total] = useMemo(() => {
    if (!Array.isArray(orders)) return [0, 0, 0, 0, 0];

    let pending = 0, inProg = 0, completed = 0, other = 0;

    for (const o of orders) {
      const s = norm(o?.status || "");
      if (statusKeywords.pending.some(k => s.includes(k))) pending++;
      else if (statusKeywords.inProgress.some(k => s.includes(k))) inProg++;
      else if (statusKeywords.completed.some(k => s.includes(k))) completed++;
      else other++;
    }

    const tot = pending + inProg + completed + other;
    return [pending, inProg, completed, other, tot];
  }, [orders, statusKeywords]);

  const labels = ["Pending", "In Progress", "Completed"];
  const counts = [pendingCount, inProgressCount, completedCount];

  const colors = ["#E6B000", "#D19CF9", "#F4E2B1"];

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors,
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  }), [counts]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const idx = context.dataIndex ?? 0;
            const value = context.raw ?? 0;
            const pct = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${context.label}: ${value} (${pct}%)`;
          }
        }
      }
    }
  }), [total]);

  // center summary values
  const pendingPct = total > 0 ? Math.round((pendingCount / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <div
        className="relative"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Order status donut chart"
      >
        <div style={{ position: "absolute", inset: 0 }}>
          <Doughnut data={chartData} options={options} />
        </div>

        {showCenter && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
            aria-hidden
          >
            <div className="text-[11px] text-slate-600">Total</div>
            <div className="font-semibold text-[14px] text-slate-800">{total}</div>
            {/* <div className="text-[12px] text-slate-600 mt-1">
              Pending {pendingCount} {total ? `• ${pendingPct}%` : ""}
            </div> */}
          </div>
        )}
      </div>

      {/* custom legend */}
      <div className="mt-3 w-full" style={{ maxWidth: size }}>
        <div className="flex flex-col gap-2">
          {labels.map((lab, i) => {
            const cnt = counts[i] ?? 0;
            const pct = total > 0 ? Math.round((cnt / total) * 100) : 0;
            const color = colors[i] ?? "#DDD";
            return (
              <div key={lab} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color, display: "inline-block" }}
                    aria-hidden
                  />
                  <span className="text-slate-700">{lab}</span>
                </div>
                <div className="text-slate-500">
                  {cnt} {total ? <span className="text-xs text-slate-400">• {pct}%</span> : null}
                </div>
              </div>
            );
          })}

        
          {otherCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#cbd5e1", display: "inline-block" }} />
                <span className="text-slate-700">Other</span>
              </div>
              <div className="text-slate-500">
                {otherCount} {total ? <span className="text-xs text-slate-400">• {Math.round((otherCount/total)*100)}%</span> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
