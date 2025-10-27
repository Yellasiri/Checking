"use client";

import { useMemo, useState } from "react";
import { Poppins } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";
import { IoIosArrowDown } from "react-icons/io";
import { useGetInventoryItems } from "../hooks/usegetinventoryitems";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// sample data (replace with API/props)
const SAMPLE = [
  {
    id: 1,
    name: "Zipper",
    category: "Accessories",
    qty: 100,
    units: "pcs",
    reorder: 30,
    updated: "08 Aug 2025",
  },
  {
    id: 2,
    name: "Cotton Fabric",
    category: "Fabrics",
    qty: 100,
    units: "m",
    reorder: 30,
    updated: "09 Aug 2025",
  },
  {
    id: 3,
    name: "Satin Lining",
    category: "Fabrics",
    qty: 100,
    units: "m",
    reorder: 30,
    updated: "01 Aug 2025",
  },
  {
    id: 4,
    name: "Thread – Black",
    category: "Accessories",
    qty: 20,
    units: "pcs",
    reorder: 30,
    updated: "10 Aug 2025",
  }, // low
  {
    id: 5,
    name: "Thread – White",
    category: "Accessories",
    qty: 100,
    units: "pcs",
    reorder: 30,
    updated: "18 Aug 2025",
  },
  {
    id: 6,
    name: "Buttons – Pearl",
    category: "Accessories",
    qty: 100,
    units: "pcs",
    reorder: 30,
    updated: "08 Aug 2025",
  },
  {
    id: 7,
    name: "Lace Trim",
    category: "Accessories",
    qty: 100,
    units: "m",
    reorder: 30,
    updated: "09 Aug 2025",
  },
  {
    id: 8,
    name: "Elastic Band",
    category: "Accessories",
    qty: 100,
    units: "pcs",
    reorder: 30,
    updated: "07 Aug 2025",
  },
  {
    id: 9,
    name: "Interlining",
    category: "Fabrics",
    qty: 100,
    units: "pcs",
    reorder: 30,
    updated: "06 Aug 2025",
  },
];




export default function InventoryPage() {
  const [data, setData] = useState(SAMPLE);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // item object or null
  const { inventoryItems, inventoryLoading, inventoryError } = useGetInventoryItems();
  console.log("inventoryItems", inventoryItems);
 const isLowStock = (qty, reorder) => Number(qty) <= Number(reorder);        // or < if you prefer
const isSufficientStock = (qty, reorder) => Number(qty) > Number(reorder);

const filtered = useMemo(() => {
  return inventoryItems.filter((it) => {
 
    const qty = Number(it.quantity ?? 0);
    const reorder = Number(it.reOrderLevel ?? 0);

    if (category !== "All" && it.category !== category) return false;
    if (q && !it.name.toLowerCase().includes(q.toLowerCase())) return false;

    if (stockFilter === "Low Stock" && !isLowStock(qty, reorder)) return false;
    if (stockFilter === "Sufficient" && !isSufficientStock(qty, reorder))
      return false;

    return true;
  });
}, [inventoryItems, q, category, stockFilter]);


 async function handleDelete(id,) {
  const toastId = toast.loading("Deleting item...");
  try {
    const res = await fetch("/api/v1/inventory/delete-item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id,  }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      // show server error (if any) and throw so caller knows it failed
      const message = json.error || "Failed to delete item";
      toast.error(message, { id: toastId });
     
    }

    // success
    const successMsg =  "Item deleted";
    toast.success(successMsg, { id: toastId });
    return json; // { id } or { item } depending on server response
  } catch (err) {
    // network/other errors
    toast.error(err?.message || "Failed to delete item", { id: toastId });
    throw err;
  }
}
const CATEGORIES = [
  "All",
  ...Array.from(new Set(inventoryItems.map((s) => s.category))),
];



// if quantity is less than (or) equal to reorder level, show low stock

const STOCK = ["All", "Low Stock", "Sufficient"];

  const handleOpenEdit = (item) => {
    setEditing(item);
    setShowForm(true);
  };

  const handleOpenAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  // Add/Edit form handler with backend integration
  const handleSave = async (e) => {
    e.preventDefault();
    const form = Object.fromEntries(new FormData(e.target).entries());
    console.log("form:", form);
    form.qty = Number(form.qty || 0);
    form.reorder = Number(form.reorder || 0);
    let endpoint = "/api/v1/inventory/add-item";
    let method = "POST";
    if (editing) {
      endpoint = "/api/v1/inventory/update-item";
      method = "PUT";
    }
    const toastLoading = toast.loading("Please wait...");
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { id: editing._id, ...form } : form),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save item", { id: toastLoading });
        return;
      }
      const data = await res.json();

      
      if (editing) {
      setData((prev) =>
        prev.map((it) =>
          // compare by _id if present, otherwise try id
          (it._id && editing._id && it._id === editing._id) ||
          (it.id && editing.id && it.id === editing.id)
            ? { ...it, ...updatedItem }
            : it
        )
      );
        toast.success("Item updated", { id: toastLoading });
      } else {
        const id = data.id || Math.max(0, ...data.map((d) => d.id)) + 1;
        setData((s) => [...s, { id, ...form }]);
        toast.success("Item added", { id: toastLoading });
      }
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      toast.error(err.message || "Failed to save item", { id: toastLoading });
    }
  };

  return (
    <div className={`${poppins.className} mx-auto max-w-[1180px] pt-6 h-full`}>
      <Toaster />
      <div className="h-[calc(100vh-48px)] rounded-[18px] bg-white shadow-xl overflow-hidden">
        <div className="h-[calc(100vh-48px)] rounded-[18px] bg-white shadow-xl overflow-hidden relative">
          {/* Header: tightened spacing */}
          <div className="flex items-center gap-3 px-4 md:px-6 pt-4">
            <h1 className="text-[14px] sm:text-[18px] sm:leading-[30px] text-[#252525] font-semibold flex-1">
              Inventory Management
            </h1>
            <button
              onClick={handleOpenAdd}
              className="rounded-md bg-[#EC9705] text-white text-[14px] font-semibold px-4 py-1 shadow hover:bg-amber-600"
            >
              + Add item
            </button>
          </div>

          {/* Filters (closer) */}
          <div className="mt-3 md:mt-3 px-4 md:px-6">
            {/* mobile compact */}
            <div className="md:hidden">
              <div className="flex items-center gap-2 bg-white rounded-md shadow-sm border border-[#F8F7FDD1] px-3 py-2 mb-2">
                <div className="w-6 h-6 rounded-lg grid place-items-center bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21l-4.35-4.35"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="11"
                      cy="11"
                      r="6"
                      stroke="white"
                      strokeWidth="1.6"
                    />
                  </svg>
                </div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by item name ...etc"
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#252525]/60"
                />
              </div>

              <div className="overflow-x-auto -mx-4 px-4">
                <div className="flex gap-2 text-[#666666] font-normal items-center">
                  <label className="relative inline-flex items-center gap-2 rounded-[4px] px-3 py-1.5 bg-white border border-[#E4E4E7B5] shadow-sm whitespace-nowrap">
                    <span className="text-sm">{category}</span>
                    <IoIosArrowDown className="text-[14px]" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="relative inline-flex items-center gap-2 rounded-[4px] px-3 py-1.5 bg-white border border-[#E4E4E7B5] shadow-sm whitespace-nowrap">
                    <span className="text-sm">{stockFilter}</span>
                    <IoIosArrowDown className="text-[14px]" />
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                    >
                      {STOCK.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {/* desktop filters (reduced padding) */}
            <div className="hidden md:block mt-2">
              <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                <div className="flex w-full rounded-xl bg-[#F9F8FC]">
                  <div className="relative flex items-center justify-between gap-2 px-8 py-2 border-r border-slate-200 whitespace-nowrap text-sm">
                    <span className="text-sm text-[#252525]">{category}</span>
                    <IoIosArrowDown className="text-[#252525] text-[14px]" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative flex items-center justify-between gap-2 px-8 py-2 border-r border-slate-200 whitespace-nowrap text-sm">
                    <span className="text-sm text-[#252525]">
                      {stockFilter}
                    </span>
                    <IoIosArrowDown className="text-[#252525] text-[14px]" />
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    >
                      {STOCK.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 flex-1 min-w-0">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search by item name ...etc"
                      className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60"
                    />
                    <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M21 21l-4.35-4.35"
                          stroke="white"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="11"
                          cy="11"
                          r="6"
                          stroke="white"
                          strokeWidth="1.6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table area: reduced spacing */}
          <div className="h-[calc(100%-126px)] md:h-[calc(100%-126px)] px-4 md:px-6 pb-28 md:pb-6 pt-4 overflow-y-auto">
            {/* header row (thinner) */}
            <div
              className="hidden md:grid grid-cols-7 items-center gap-3 px-4 py-2 text-[13px] font-semibold text-white rounded-md"
              style={{ background: "linear-gradient(90deg,#6f3ae8,#b48cf6)" }}
            >
              <div>Item Name</div>
              <div>Category</div>
              <div className="text-center">Quantity</div>
              <div className="text-center">Units</div>
              <div className="text-center">Reorder level</div>
              <div className="text-center">Last updated</div>
              <div className="text-center">Action</div>
            </div>

            <div className="space-y-3 mt-3">
              {filtered.length === 0 && (
                <div className="text-center text-slate-500 py-8">
                  No items match your filters.
                </div>
              )}

              {filtered.map((row, idx) => {
                const isLow = row.quantity < row.reOrderLevel;
                const baseBg = idx % 2 === 0 ? "bg-white" : "bg-[#faf9fe]";
                const lowBg = "bg-[#fdeaea]";
                return (
                  <div
                    key={row._id}
                    className={`${
                      isLow ? lowBg : baseBg
                    } w-full rounded-lg p-3 md:p-3 grid grid-cols-1 md:grid-cols-7 items-center gap-3`}
                  >
                    <div className="text-sm md:text-base font-normal text-[#000000]">
                      {row.name}
                    </div>
                    <div className="hidden md:block text-sm text-[#000000]">
                      {row.category}
                    </div>
                    <div className="hidden md:flex justify-center text-sm">
                      {row.quantity}
                    </div>
                    <div className="hidden md:flex justify-center text-sm text-[#000000]">
                      {row.units}
                    </div>
                    <div className="hidden md:flex justify-center text-sm text-[#000000]">
                      {row.reOrderLevel}
                    </div>
                    <div className="hidden md:flex justify-center text-sm text-[#000000]">
                     {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString('en-GB', {
  timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
}) : '-'}

                    </div>
                    <div className="hidden md:flex justify-center items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(row)}
                        className="p-1.5 rounded hover:bg-white/30"
                      >
                        {/* edit */}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                            stroke="#5E3BA4"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                            stroke="#5E3BA4"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(row._id)}
                        className="p-1.5 rounded hover:bg-white/30"
                      >
                        {/* delete */}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M3 6H5H21"
                            stroke="#"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                            stroke="#EC9705"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 11V17"
                            stroke="#EC9705"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 11V17"
                            stroke="#EC9705"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* mobile compact row */}
                    <div className="md:hidden flex justify-between items-center w-full">
                      <div className="text-sm text-[#000000]">
                        {row.category} · {row.quantity}
                        {row.units}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Edit button */}
                        <button
                          onClick={() => handleOpenEdit(row)}
                          className="p-2 rounded-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M11 4H4C3.47 4 2.96 4.21 2.59 4.59C2.21 4.96 2 5.47 2 6V20C2 20.53 2.21 21.04 2.59 21.41C2.96 21.79 3.47 22 4 22H18C18.53 22 19.04 21.79 19.41 21.41C19.79 21.04 20 20.53 20 20V13"
                              stroke="#5E3BA4"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18.5 2.5C18.9 2.1 19.44 1.88 20 1.88C20.56 1.88 21.1 2.1 21.5 2.5C21.9 2.9 22.12 3.44 22.12 4C22.12 4.56 21.9 5.1 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                              stroke="#5E3BA4"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-2 rounded-md"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6H21"
                              stroke="#EC9705"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8 6V4C8 3.47 8.21 2.96 8.59 2.59C8.96 2.21 9.47 2 10 2H14C14.53 2 15.04 2.21 15.41 2.59C15.79 2.96 16 3.47 16 4V6M19 6V20C19 20.53 18.79 21.04 18.41 21.41C18.04 21.79 17.53 22 17 22H7C6.47 22 5.96 21.79 5.59 21.41C5.21 21.04 5 20.53 5 20V6H19Z"
                              stroke="#EC9705"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 11V17M14 11V17"
                              stroke="#EC9705"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-end text-sm text-gray-500">
              Showing {filtered.length} of {data.length} items
            </div>
          </div>

          {/* -------------------------------
              MODAL: Desktop (slide-in from right inside canvas)
              ------------------------------- */}
          <div
            className={`absolute inset-0 z-40 pointer-events-none`}
            aria-hidden={!showForm}
          >
            {/* dim only inside canvas */}
            <div
              className={`absolute inset-0 bg-black/28 transition-opacity duration-300 ${
                showForm ? "opacity-100 pointer-events-auto" : "opacity-0"
              }`}
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />

            {/* Desktop panel: hidden on small screens */}
            <aside
              className={`hidden md:block absolute top-0 right-0 h-full md:w-[460px] max-w-[92vw] bg-white rounded-l-2xl shadow-2xl transform transition-transform duration-300 ease-in-out
                ${
                  showForm
                    ? "translate-x-0 pointer-events-auto"
                    : "translate-x-full pointer-events-none"
                }`}
              role="dialog"
              aria-modal="true"
            >
              <div className="h-full flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-[#252525]">
                    {editing ? "Edit Item" : "Add Item"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={handleSave}
                  className="px-6 py-6 bg-[#F6F7FA] flex-1"
                >
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Item Name*
                      </label>
                      <input
                        name="name"
                        defaultValue={editing?.name || ""}
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Category*
                      </label>
                      <input
                        name="category"
                        defaultValue={editing?.category || ""}
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Quantity*
                      </label>
                      <input
                        name="qty"
                        type="number"
                        defaultValue={editing?.quantity ?? 0}
                        min="0"
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Units
                      </label>
                      <select
                        name="units"
                        defaultValue={editing?.units || "pcs"}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="pcs">pcs</option>
                        <option value="m">m</option>
                        <option value="roll">roll</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Reorder level
                      </label>
                      <input
                        name="reorder"
                        type="number"
                        defaultValue={editing?.
reOrderLevel ?? 0}
                        min="0"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Last edited
                      </label>
                      <input
                        name="updated"
                        defaultValue={
                          editing?.updated ||
                          new Date().toLocaleDateString("en-GB")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditing(null);
                      }}
                      className="rounded-md border border-slate-300 bg-white px-4 py-1 text-sm text-[#252525] hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-md bg-[#13234B] text-white px-4 py-1 text-sm font-medium"
                    >
                      {editing ? "Save changes" : "Add item"}
                    </button>
                  </div>
                </form>
              </div>
            </aside>
          </div>

          {/* -------------------------------
              MODAL: Mobile bottom sheet (slides up)
              ------------------------------- */}
          {/* Mobile-only panel */}
          <div
            className={`md:hidden absolute inset-0 z-50 pointer-events-none`}
            aria-hidden={!showForm}
          >
            {/* dim inside canvas for mobile */}
            <div
              className={`absolute inset-0 bg-black/28 transition-opacity duration-300 ${
                showForm ? "opacity-100 pointer-events-auto" : "opacity-0"
              }`}
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />

            <section
              className={`absolute left-0 right-0 bottom-0 w-full bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-in-out ${
                showForm
                  ? "translate-y-0 pointer-events-auto"
                  : "translate-y-full pointer-events-none"
              } max-h-[92vh]`}
            >
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#252525]">
                  {editing ? "Edit Item" : "Add Item"}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              <form
                onSubmit={handleSave}
                className="px-5 py-4 bg-[#F6F7FA] overflow-auto"
              >
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">
                      Item Name*
                    </label>
                    <input
                      name="name"
                      defaultValue={editing?.name || ""}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">
                      Category*
                    </label>
                    <input
                      name="category"
                      defaultValue={editing?.category || ""}
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">
                      Quantity*
                    </label>
                    <input
                      name="qty"
                      type="number"
                      defaultValue={editing?.quantity ?? 0}
                      min="0"
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">
                      Units
                    </label>
                    <select
                      name="units"
                      defaultValue={editing?.units || "pcs"}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="pcs">pcs</option>
                      <option value="m">m</option>
                      <option value="roll">roll</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">
                      Reorder level
                    </label>
                    <input
                      name="reorder"
                      type="number"
                      defaultValue={editing?.reOrderLevel ?? 0}
                      min="0"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">
                      Last edited
                    </label>
                    <input
                      name="updated"
                      defaultValue={
                        editing?.updatedAt ? new Date(editing.updatedAt).toLocaleDateString('en-GB', {
  timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric'
}) : '-'
 ||
                        new Date().toLocaleDateString("en-GB")
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 pb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditing(null);
                    }}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-[#252525] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-[#13234B] text-white px-4 py-2 text-sm font-medium"
                  >
                    {editing ? "Save changes" : "Save"}
                  </button>
                </div>
              </form>
            </section>
          </div>
          {/* end mobile bottom sheet */}
        </div>
      </div>
    </div>
  );
}
