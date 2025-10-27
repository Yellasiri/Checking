// // app/offers/page.jsx
// "use client";

// import { useMemo, useState, useRef } from "react";
// import { FiSearch } from "react-icons/fi";
// import { Poppins } from "next/font/google";
// import { useGetCustomers } from "../hooks/usegetcustomerdetails";
// import toast, { Toaster } from "react-hot-toast";

// const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

// export default function OffersPage() {
//   const [q, setQ] = useState("");
//   const [selectedMap, setSelectedMap] = useState({});
//   const [selectAll, setSelectAll] = useState(false);
//   const [offerText, setOfferText] = useState("");
//   const [selectAllAcross, setSelectAllAcross] = useState(false); // true = all customers selected
//   const touchStartY = useRef(null);
//   const touchCurrentY = useRef(null);
//   const [offerEndDate, setOfferEndDate] = useState("");

//   const { customers, customerLoading, customerError } = useGetCustomers();
//   console.log("Fetched customers:", customers);
//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return customers;
//     return customers.filter((r) => {
//       const name = (r.name || r.customerName || "").toLowerCase();
//       const phone = (r.phone || r.mobileNumber || "").toLowerCase();
//       return name.includes(s) || phone.includes(s);
//     });
//   }, [q, customers]);

//   const allIds = customers.map((r) => r._id);
//   const visibleIds = filtered.map((r) => r._id);
//   const allVisibleSelected =
//     visibleIds.length > 0 && visibleIds.every((id) => selectedMap[id]);

//   function setSelectionForIds(ids, val) {
//     setSelectedMap((prev) => {
//       const next = { ...prev };
//       ids.forEach((id) => {
//         next[id] = !!val;
//       });
//       return next;
//     });
//   }

//   function toggleRow(id) {
//     setSelectedMap((prev) => {
//       const next = { ...prev, [id]: !prev[id] };

//       const totalSelected = Object.values(next).filter(Boolean).length;
//       setSelectAll(totalSelected === customers.length);

//       return next;
//     });
//   }

//   function toggleAll() {
//     const isFiltered = q.trim().length > 0;
//     if (isFiltered) {
//       // handle only visible (filtered) customers
//       const visibleIds = filtered.map((r) => r._id);
//       const allVisibleSelected = visibleIds.every((id) => selectedMap[id]);

//       if (allVisibleSelected) {
//         // Deselect all visible
//         setSelectedMap((prev) => {
//           const next = { ...prev };
//           visibleIds.forEach((id) => delete next[id]);
//           return next;
//         });
//         setSelectAll(false);
//       } else {
//         // Select all visible
//         setSelectedMap((prev) => {
//           const next = { ...prev };
//           visibleIds.forEach((id) => (next[id] = true));
//           return next;
//         });
//         setSelectAll(true);
//       }
//     } else {
//       // No filter active → select / deselect all customers
//       if (selectAll) {
//         setSelectedMap({});
//         setSelectAll(false);
//       } else {
//         const all = {};
//         customers.forEach((c) => (all[c._id] = true));
//         setSelectedMap(all);
//         setSelectAll(true);
//       }
//     }
//   }

//   const selectedCount = Object.values(selectedMap).filter(Boolean).length;
//   const allSelectedCount = selectedCount === customers.length; // all dataset selected

//   function toggleSelectAllAcross() {
//     if (selectAllAcross || allSelectedCount) {
//       // clear all
//       setSelectedMap({});
//       setSelectAllAcross(false);
//     } else {
//       // select all customers entries
//       const next = {};
//       customers.forEach((r) => (next[r._id] = true));
//       setSelectedMap(next);
//       setSelectAllAcross(true);
//     }
//   }

//   async function handleSend() {
//     if (!offerText.trim()) return;
//     if (!offerEndDate.trim()) {
//       toast.error("Please select an offer end date");
//       return;
//     }

//     const selectedCustomerIds = Object.entries(selectedMap)
//       .filter(([id, val]) => val)
//       .map(([id]) => id);

//     if (selectedCustomerIds.length === 0) return;

//     const toastLoading = toast.loading("Sending offer...");

//     try {
//       const res = await fetch("/api/v1/offers/generate-offer", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           offerText,
//           offerEndDate,
//           selectedCustomers: selectedCustomerIds,
//         }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         toast.success(
//           `Offer sent to ${selectedCustomerIds.length} customer(s)`,
//           {
//             id: toastLoading,
//           }
//         );
//         setOfferText("");
//         setOfferEndDate("");
//         setSelectedMap({});
//         setSelectAllAcross(false);
//       } else {
//         toast.error(data.error || "Failed to send offer", { id: toastLoading });
//       }
//     } catch (err) {
//       toast.error(err.message || "Failed to send offer", { id: toastLoading });
//     }
//   }
//   function handleCancel() {
//     setOfferText("");
//     setSelectedMap({});
//     setSelectAllAcross(false);
//   }

//   const formatDateHeading = (iso) =>
//     console.log("iso::", iso) ||
//     new Date(iso).toLocaleDateString("en-GB", {
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     });

//   /* touch handlers for mobile bottom sheet (swipe down to dismiss selection) */
//   function onTouchStart(e) {
//     const t = e.touches?.[0];
//     if (!t) return;
//     touchStartY.current = t.clientY;
//     touchCurrentY.current = t.clientY;
//   }
//   function onTouchMove(e) {
//     const t = e.touches?.[0];
//     if (!t) return;
//     touchCurrentY.current = t.clientY;
//   }
//   function onTouchEnd() {
//     if (touchStartY.current == null || touchCurrentY.current == null) {
//       touchStartY.current = null;
//       touchCurrentY.current = null;
//       return;
//     }
//     const delta = touchCurrentY.current - touchStartY.current;
//     // if user swiped down at least 80px -> dismiss (clear selection)
//     if (delta > 80) {
//       setSelectedMap({});
//       setSelectAllAcross(false);
//       setOfferText("");
//     }
//     touchStartY.current = null;
//     touchCurrentY.current = null;
//   }

//   return (
//     <div className={`${poppins.className} min-h-screen`}>
//       <Toaster />

//       <div className="mx-auto w-full max-w-[1180px] h-[calc(100vh-48px)] rounded-[22px] bg-white p-4 sm:p-8 shadow-xl overflow-hidden flex flex-col">
//         {/* header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//           <h1 className="text-[20px] leading-[35px] text-[#252525] font-semibold">
//             Offer Management
//           </h1>

//           <div className="w-full sm:w-[360px]">
//             <div className="flex items-center gap-3 bg-[#F9F8FC] rounded-lg px-3 sm:px-4 py-1 shadow-sm sm:py-2">
//               <input
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 placeholder="Search name or phone"
//                 className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
//                 aria-label="Search offers"
//               />
//               <button
//                 type="button"
//                 className="w-8 h-8 rounded-full grid place-items-center bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8] text-white"
//                 aria-label="Search button"
//                 onClick={() => {}}
//               >
//                 <FiSearch />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* table area */}
//         <div className="flex-1 overflow-y-auto">
//           {/* Desktop / tablet: table */}
//           <div className="hidden sm:block">
//             {/* horizontal scroll wrapper so table doesn't break on narrower tablet widths */}
//             <div className="w-full overflow-x-auto">
//               <table className="w-full table-fixed border-collapse min-w-[720px]">
//                 <thead>
//                   <tr className="text-left text-sm text-slate-500">
//                     <th className="w-12 px-4 py-3">
//                       <label className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           checked={
//                             filtered.length > 0 &&
//                             filtered.every((r) => selectedMap[r._id])
//                           }
//                           onChange={toggleAll}
//                           className="h-4 w-4 rounded border-slate-300 accent-violet-500"
//                           aria-label="Select all customers"
//                         />
//                       </label>
//                     </th>
//                     <th className="px-6 py-3">Name</th>
//                     <th className="px-6 py-3">Phone</th>
//                     <th className="px-6 py-3">Last Ordered</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filtered.map((row) => {
//                     const isSelected = !!selectedMap[row._id];
//                     return (
//                       <tr
//                         key={row._id}
//                         className={`border-t border-slate-100 ${
//                           isSelected ? "bg-amber-50" : ""
//                         }`}
//                       >
//                         <td className="px-4 py-4 align-top">
//                           <input
//                             type="checkbox"
//                             checked={isSelected}
//                             onChange={() => toggleRow(row._id)}
//                             className="h-4 w-4 rounded border-slate-300 accent-violet-500"
//                             aria-label={`Select ${row.customerName}`}
//                           />
//                         </td>

//                         <td className="px-6 py-4 align-top">
//                           <div className="text-slate-800 font-medium">
//                             {row.customerName}
//                           </div>
//                         </td>

//                         <td className="px-6 py-4 align-top text-slate-600">
//                           {row.mobileNumber}
//                         </td>

//                         <td className="px-6 py-4 align-top text-slate-500">
//                           {row.orders?.length
//                             ? `Last Ordered on ${formatDateHeading(
//                                 row.orders[
//                                   row.orders.length - 1
//                                 ].createdAt.split("T")[0]
//                               )}`
//                             : "No orders yet"}
//                         </td>
//                       </tr>
//                     );
//                   })}

//                   {!filtered && filtered.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan={4}
//                         className="px-6 py-12 text-center text-slate-400"
//                       >
//                         No results
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <div className="sm:hidden space-y-3">
//             {/* MOBILE: select-all header */}
//             <div className="flex items-center justify-between px-2">
//               <label className="flex items-center gap-2 text-sm text-slate-700">
//                 <input
//                   type="checkbox"
//                   checked={filtered.length > 0 && filtered.every((r) => selectedMap[r._id])}
//                   onChange={toggleAll}
//                   className="h-4 w-4 rounded border-slate-300 accent-violet-500"
//                   aria-label="Select all visible customers"
//                 />
//                 <span>Select all</span>
//               </label>

//               {/* show select all across link if some visible selected but not all dataset */}
//               <div>
//                 {allVisibleSelected && !allSelectedCount && (
//                   <button
//                     onClick={toggleSelectAllAcross}
//                     className="text-sm underline text-[#6B4FD3]"
//                     aria-label="Select all customers across pages (mobile)"
//                   >
//                     Select all {customers.length}
//                   </button>
//                 )}
//                 {allSelectedCount && (
//                   <button
//                     onClick={toggleSelectAllAcross}
//                     className="text-sm underline text-[#6B4FD3]"
//                   >
//                     Clear selection
//                   </button>
//                 )}
//               </div>
//             </div>

//             {filtered.map((row) => {
//               const isSelected = !!selectedMap[row._id];
//               return (
//                 <div
//                   key={row._id}
//                   className={`rounded-lg border border-slate-100 p-3 ${
//                     isSelected ? "bg-amber-50" : "bg-white"
//                   }`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => toggleRow(row._id)}
//                       className="h-5 w-5 rounded border-slate-300 accent-violet-500 mt-1"
//                       aria-label={`Select ${row.customerName}`}
//                     />
//                     <div className="flex-1">
//                       <div className="text-sm font-medium text-slate-800">
//                         {row.customerName}
//                       </div>
//                       <div className="text-xs text-slate-600 mt-1">
//                         {row.mobileNumber}
//                       </div>
//                       <div className="text-xs text-slate-500 mt-1">{`Last Ordered on ${formatDateHeading(
//                         row.orders.slice(-1)[0]?.createdAt?.split("T")[0]
//                       )}`}</div>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}

//             {filtered.length === 0 && (
//               <div className="py-6 text-center text-slate-400">No results</div>
//             )}
//           </div>
//         </div>

//         {/* Offer composer area */}
//         {/* Desktop / tablet block */}
//         <div
//           className={`${
//             selectedCount > 0
//               ? "opacity-100 translate-y-0"
//               : "opacity-0 translate-y-6 pointer-events-none"
//           } transition-all duration-200 mt-6 hidden sm:block`}
//         >
//           <div className="rounded-lg bg-[#FAF7FB] border border-slate-100 p-4 sm:p-6">
//             <div className="mb-4 text-slate-600 flex flex-col sm:flex-row sm:items-start gap-4">
//               <textarea
//                 rows={4}
//                 value={offerText}
//                 onChange={(e) => setOfferText(e.target.value)}
//                 placeholder="Enter your offer details here... Eg: Get 20% OFF on festive wear this Diwali!"
//                 className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-slate-400"
//                 aria-label="Offer text"
//               />

//               <div className="flex flex-col text-sm text-slate-600 w-full sm:w-48">
//                 <label className="mb-1 font-medium">Offer valid till:</label>
//                 <input
//                   type="date"
//                   value={offerEndDate}
//                   onChange={(e) => setOfferEndDate(e.target.value)}
//                   className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 transition-colors"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
//               <div className="text-sm text-slate-600">
//                 Sending to:{" "}
//                 <span className="font-medium text-slate-800">
//                   {selectedCount} customer{selectedCount > 1 ? "s" : ""}
//                 </span>
//               </div>

//               <div className="flex items-center gap-3 w-full sm:w-auto">
//                 <button
//                   onClick={handleCancel}
//                   className="w-full sm:w-auto px-4 py-2 rounded-md border border-[#B78BFF33] text-[#6B4FD3] bg-transparent text-sm"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   onClick={handleSend}
//                   disabled={
//                     offerText.trim().length === 0 ||
//                     offerEndDate.trim().length === 0
//                   }
//                   className={`w-full sm:w-auto px-4 py-2 rounded-md text-white text-sm ${
//                     offerText.trim().length === 0 ||
//                     offerEndDate.trim().length === 0
//                       ? "bg-[#C7B6F7] cursor-not-allowed"
//                       : "bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8]"
//                   }`}
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Mobile bottom sheet when selectedCount > 0 */}
//         <div className={`sm:hidden`}>
//           <div
//             aria-hidden={selectedCount > 0 ? "false" : "true"}
//             onTouchStart={onTouchStart}
//             onTouchMove={onTouchMove}
//             onTouchEnd={onTouchEnd}
//             className={`fixed left-4 right-4 bottom-4 z-50 transition-transform duration-240 ease-in-out ${
//               selectedCount > 0
//                 ? "translate-y-0 opacity-100 pointer-events-auto"
//                 : "translate-y-6 opacity-0 pointer-events-none"
//             }`}
//             style={{
//               // narrower on very small phones
//               maxWidth: "calc(100% - 32px)",
//             }}
//           >
//             <div className="rounded-xl bg-white shadow-lg border border-slate-100 p-3">
//               <div className="mb-2 flex items-center justify-between">
//                 <div className="text-xs text-slate-600">
//                   Sending to{" "}
//                   <span className="font-medium text-slate-800">
//                     {selectedCount} customer{selectedCount > 1 ? "s" : ""}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setSelectedMap({});
//                     setSelectAllAcross(false);
//                     setOfferText("");
//                   }}
//                   className="text-xs text-slate-500 px-2 py-1"
//                   aria-label="Clear selection"
//                 >
//                   Clear
//                 </button>
//               </div>

//               <textarea
//                 rows={3}
//                 value={offerText}
//                 onChange={(e) => setOfferText(e.target.value)}
//                 placeholder="Type offer message..."
//                 className="w-full bg-[#FAF7FB] resize-none outline-none text-sm placeholder:text-slate-400 rounded-md px-3 py-2 mb-3"
//                 aria-label="Offer message mobile"
//               />
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleCancel}
//                   className="flex-1 px-4 py-2 rounded-md border border-[#B78BFF33] text-[#6B4FD3] bg-transparent text-sm"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   onClick={handleSend}
//                   disabled={offerText.trim().length === 0}
//                   className={`flex-1 px-4 py-2 rounded-md text-white text-sm ${
//                     offerText.trim().length === 0
//                       ? "bg-[#C7B6F7] cursor-not-allowed"
//                       : "bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8]"
//                   }`}
//                 >
//                   Send
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* spacer so content isn't obscured by bottom sheet */}
//           <div style={{ height: selectedCount > 0 ? 140 : 0 }} />
//         </div>
//       </div>

//       {/* small responsive helper styles */}
//       <style jsx>{`
//         @media (max-width: 360px) {
//           /* make fixed bottom sheet slightly narrower on very small phones */
//           .fixed[left-4] {
//             left: 8px;
//             right: 8px;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

// app/offers/page.jsx
"use client";

import { useMemo, useState, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { Poppins } from "next/font/google";
import { useGetCustomers } from "../hooks/usegetcustomerdetails";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

export default function OffersPage() {
  const [q, setQ] = useState("");
  const [selectedMap, setSelectedMap] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [offerText, setOfferText] = useState("");
  const [selectAllAcross, setSelectAllAcross] = useState(false); // true = all customers selected
  const touchStartY = useRef(null);
  const touchCurrentY = useRef(null);
  const [offerEndDate, setOfferEndDate] = useState("");

  const { customers, customerLoading, customerError } = useGetCustomers();
  console.log("Fetched customers:", customers);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((r) => {
      const name = (r.name || r.customerName || "").toLowerCase();
      const phone = (r.phone || r.mobileNumber || "").toLowerCase();
      return name.includes(s) || phone.includes(s);
    });
  }, [q, customers]);

  const allIds = customers.map((r) => r._id);
  const visibleIds = filtered.map((r) => r._id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedMap[id]);

  function setSelectionForIds(ids, val) {
    setSelectedMap((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = !!val;
      });
      return next;
    });
  }

  function toggleRow(id) {
    setSelectedMap((prev) => {
      const next = { ...prev, [id]: !prev[id] };

      const totalSelected = Object.values(next).filter(Boolean).length;
      setSelectAll(totalSelected === customers.length);

      return next;
    });
  }

  function toggleAll() {
    const isFiltered = q.trim().length > 0;
    if (isFiltered) {
      // handle only visible (filtered) customers
      const visibleIds = filtered.map((r) => r._id);
      const allVisibleSelected = visibleIds.every((id) => selectedMap[id]);

      if (allVisibleSelected) {
        // Deselect all visible
        setSelectedMap((prev) => {
          const next = { ...prev };
          visibleIds.forEach((id) => delete next[id]);
          return next;
        });
        setSelectAll(false);
      } else {
        // Select all visible
        setSelectedMap((prev) => {
          const next = { ...prev };
          visibleIds.forEach((id) => (next[id] = true));
          return next;
        });
        setSelectAll(true);
      }
    } else {
      // No filter active → select / deselect all customers
      if (selectAll) {
        setSelectedMap({});
        setSelectAll(false);
      } else {
        const all = {};
        customers.forEach((c) => (all[c._id] = true));
        setSelectedMap(all);
        setSelectAll(true);
      }
    }
  }

  const selectedCount = Object.values(selectedMap).filter(Boolean).length;
  const allSelectedCount = selectedCount === customers.length; // all dataset selected

  function toggleSelectAllAcross() {
    if (selectAllAcross || allSelectedCount) {
      // clear all
      setSelectedMap({});
      setSelectAllAcross(false);
    } else {
      // select all customers entries
      const next = {};
      customers.forEach((r) => (next[r._id] = true));
      setSelectedMap(next);
      setSelectAllAcross(true);
    }
  }

  async function handleSend() {
    if (!offerText.trim()) return;
    if (!offerEndDate.trim()) {
      toast.error("Please select an offer end date");
      return;
    }

    const selectedCustomerIds = Object.entries(selectedMap)
      .filter(([id, val]) => val)
      .map(([id]) => id);

    if (selectedCustomerIds.length === 0) return;

    const toastLoading = toast.loading("Sending offer...");

    try {
      const res = await fetch("/api/v1/offers/generate-offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerText,
          offerEndDate,
          selectedCustomers: selectedCustomerIds,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          `Offer sent to ${selectedCustomerIds.length} customer(s)`,
          {
            id: toastLoading,
          }
        );
        setOfferText("");
        setOfferEndDate("");
        setSelectedMap({});
        setSelectAllAcross(false);
      } else {
        toast.error(data.error || "Failed to send offer", { id: toastLoading });
      }
    } catch (err) {
      toast.error(err.message || "Failed to send offer", { id: toastLoading });
    }
  }
  function handleCancel() {
    setOfferText("");
    setSelectedMap({});
    setSelectAllAcross(false);
  }

  const formatDateHeading = (iso) =>
    console.log("iso::", iso) ||
    new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  /* touch handlers for mobile bottom sheet (swipe down to dismiss selection) */
  function onTouchStart(e) {
    const t = e.touches?.[0];
    if (!t) return;
    touchStartY.current = t.clientY;
    touchCurrentY.current = t.clientY;
  }
  function onTouchMove(e) {
    const t = e.touches?.[0];
    if (!t) return;
    touchCurrentY.current = t.clientY;
  }
  function onTouchEnd() {
    if (touchStartY.current == null || touchCurrentY.current == null) {
      touchStartY.current = null;
      touchCurrentY.current = null;
      return;
    }
    const delta = touchCurrentY.current - touchStartY.current;
    // if user swiped down at least 80px -> dismiss (clear selection)
    if (delta > 80) {
      setSelectedMap({});
      setSelectAllAcross(false);
      setOfferText("");
    }
    touchStartY.current = null;
    touchCurrentY.current = null;
  }

  return (
    <div className={`${poppins.className} min-h-screen`}>
      <Toaster />

      <div className="mx-auto w-full max-w-[1180px] h-[calc(100vh-48px)] rounded-[22px] bg-white p-4 sm:p-8 shadow-xl overflow-hidden flex flex-col">
        {/* header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-[20px] leading-[35px] text-[#252525] font-semibold">
            Offer Management
          </h1>

          <div className="w-full sm:w-[360px]">
            <div className="flex items-center gap-3 bg-[#F9F8FC] rounded-lg px-3 sm:px-4 py-1 shadow-sm sm:py-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or phone"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
                aria-label="Search offers"
              />
              <button
                type="button"
                className="w-8 h-8 rounded-full grid place-items-center bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8] text-white"
                aria-label="Search button"
                onClick={() => {}}
              >
                <FiSearch />
              </button>
            </div>
          </div>
        </div>

        {/* table area */}
        <div className="flex-1 overflow-y-auto">
          {/* Desktop / tablet: table */}
          <div className="hidden sm:block">
            {/* horizontal scroll wrapper so table doesn't break on narrower tablet widths */}
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed border-collapse min-w-[720px]">
                <thead>
                  <tr className="text-left text-sm text-slate-500">
                    <th className="w-12 px-4 py-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            filtered.length > 0 &&
                            filtered.every((r) => selectedMap[r._id])
                          }
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-slate-300 accent-violet-500"
                          aria-label="Select all customers"
                        />
                      </label>
                    </th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Last Ordered</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((row) => {
                    const isSelected = !!selectedMap[row._id];
                    return (
                      <tr
                        key={row._id}
                        className={`border-t border-slate-100 ${
                          isSelected ? "bg-amber-50" : ""
                        }`}
                      >
                        <td className="px-4 py-4 align-top">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row._id)}
                            className="h-4 w-4 rounded border-slate-300 accent-violet-500"
                            aria-label={`Select ${row.customerName}`}
                          />
                        </td>

                        <td className="px-6 py-4 align-top">
                          <div className="text-slate-800 font-medium">
                            {row.customerName}
                          </div>
                        </td>

                        <td className="px-6 py-4 align-top text-slate-600">
                          {row.mobileNumber}
                        </td>

                        <td className="px-6 py-4 align-top text-slate-500">
                          {row.orders?.length
                            ? `Last Ordered on ${formatDateHeading(
                                row.orders[
                                  row.orders.length - 1
                                ].createdAt.split("T")[0]
                              )}`
                            : "No orders yet"}
                        </td>
                      </tr>
                    );
                  })}

                  {!filtered && filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        No results
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sm:hidden space-y-3">
            {/* MOBILE: select-all header */}
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={
                    filtered.length > 0 &&
                    filtered.every((r) => selectedMap[r._id])
                  }
                  onChange={toggleAll}
                  className="h-4 w-4 rounded border-slate-300 accent-violet-500"
                  aria-label="Select all visible customers"
                />
                <span>Select all</span>
              </label>

              {/* show select all across link if some visible selected but not all dataset */}
              <div>
                {allVisibleSelected && !allSelectedCount && (
                  <button
                    onClick={toggleSelectAllAcross}
                    className="text-sm underline text-[#6B4FD3]"
                    aria-label="Select all customers across pages (mobile)"
                  >
                    Select all {customers.length}
                  </button>
                )}
                {allSelectedCount && (
                  <button
                    onClick={toggleSelectAllAcross}
                    className="text-sm underline text-[#6B4FD3]"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </div>

            {filtered.map((row) => {
              const isSelected = !!selectedMap[row._id];
              return (
                <div
                  key={row._id}
                  className={`rounded-lg border border-slate-100 p-3 ${
                    isSelected ? "bg-amber-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(row._id)}
                      className="h-5 w-5 rounded border-slate-300 accent-violet-500 mt-1"
                      aria-label={`Select ${row.customerName}`}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">
                        {row.customerName}
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {row.mobileNumber}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{`Last Ordered on ${formatDateHeading(
                        row.orders.slice(-1)[0]?.createdAt?.split("T")[0]
                      )}`}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="py-6 text-center text-slate-400">No results</div>
            )}
          </div>
        </div>

        {/* Offer composer area */}
        {/* Desktop / tablet block */}
        <div
          className={`${
            selectedCount > 0
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6 pointer-events-none"
          } transition-all duration-200 mt-6 hidden sm:block`}
        >
          <div className="rounded-lg bg-[#FAF7FB] border border-slate-100 p-4 sm:p-6">
            <div className="mb-4 text-slate-600 flex flex-col sm:flex-row sm:items-start gap-4">
              <textarea
                rows={4}
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                placeholder="Enter your offer details here... Eg: Get 20% OFF on festive wear this Diwali!"
                className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-slate-400"
                aria-label="Offer text"
              />

              <div className="flex flex-col text-sm text-slate-600 w-full sm:w-48">
                <label className="mb-1 font-medium">Offer valid till:</label>
                <input
                  type="date"
                  value={offerEndDate}
                  onChange={(e) => setOfferEndDate(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                Sending to:{" "}
                <span className="font-medium text-slate-800">
                  {selectedCount} customer{selectedCount > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-4 py-2 rounded-md border border-[#B78BFF33] text-[#6B4FD3] bg-transparent text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSend}
                  disabled={
                    offerText.trim().length === 0 ||
                    offerEndDate.trim().length === 0
                  }
                  className={`w-full sm:w-auto px-4 py-2 rounded-md text-white text-sm ${
                    offerText.trim().length === 0 ||
                    offerEndDate.trim().length === 0
                      ? "bg-[#C7B6F7] cursor-not-allowed"
                      : "bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8]"
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom sheet when selectedCount > 0 */}
        <div className="sm:hidden">
          <div
            aria-hidden={selectedCount > 0 ? "false" : "true"}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`fixed left-4 right-4 bottom-4 z-50 transition-transform duration-240 ease-in-out ${
              selectedCount > 0
                ? "translate-y-0 opacity-100 pointer-events-auto"
                : "translate-y-6 opacity-0 pointer-events-none"
            }`}
            style={{
              maxWidth: "calc(100% - 32px)",
            }}
          >
            <div className="rounded-xl bg-white shadow-lg border border-slate-100 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  Sending to{" "}
                  <span className="font-medium text-slate-800">
                    {selectedCount} customer{selectedCount > 1 ? "s" : ""}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSelectedMap({});
                    setSelectAllAcross(false);
                    setOfferText("");
                    setOfferEndDate("");
                  }}
                  className="text-xs text-slate-500 px-2 py-1"
                  aria-label="Clear selection"
                >
                  Clear
                </button>
              </div>

              <textarea
                rows={3}
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                placeholder="Type offer message..."
                className="w-full bg-[#FAF7FB] resize-none outline-none text-sm placeholder:text-slate-400 rounded-md px-3 py-2 mb-3"
                aria-label="Offer message mobile"
              />

              {/* 📅 Mobile Date Picker */}
              <div className="flex flex-col mb-3">
                <label className="text-xs text-slate-600 mb-1 font-medium">
                  Offer valid till:
                </label>
                <input
                  type="date"
                  value={offerEndDate}
                  onChange={(e) => setOfferEndDate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 rounded-md border border-[#B78BFF33] text-[#6B4FD3] bg-transparent text-sm"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSend}
                  disabled={
                    offerText.trim().length === 0 ||
                    offerEndDate.trim().length === 0
                  }
                  className={`flex-1 px-4 py-2 rounded-md text-white text-sm ${
                    offerText.trim().length === 0 ||
                    offerEndDate.trim().length === 0
                      ? "bg-[#C7B6F7] cursor-not-allowed"
                      : "bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8]"
                  }`}
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* spacer so content isn't obscured by bottom sheet */}
          <div style={{ height: selectedCount > 0 ? 180 : 0 }} />
        </div>
      </div>

      {/* small responsive helper styles */}
      <style jsx>{`
        @media (max-width: 360px) {
          /* make fixed bottom sheet slightly narrower on very small phones */
          .fixed[left-4] {
            left: 8px;
            right: 8px;
          }
        }
      `}</style>
    </div>
  );
}
