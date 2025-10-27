// "use client";

// import Image from "next/image";
// import { Poppins } from "next/font/google";
// import { useState, useMemo, useEffect, useRef } from "react";
// import DonutChart from "../components/DonutChart";
// import toast, { Toaster } from "react-hot-toast";
// import { useGetOrders } from "../hooks/usegetorders";
// import Link from "next/link";

// const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// /* ---------- Skeleton components ---------- */
// function SkeletonCard() {
//   return (
//     <div className="min-w-[200px] bg-[#F6F3FF] rounded-xl p-4 shadow-sm animate-pulse flex flex-col gap-3 flex-shrink-0">
//       <div className="flex items-center justify-end">
//         <div className="h-5 w-12 bg-[#e0d6ff] rounded-full" />
//       </div>
//       <div className="space-y-2">
//         <div className="h-4 bg-[#e0d6ff] rounded w-3/4" />
//         <div className="h-4 bg-[#e0d6ff] rounded w-2/3" />
//         <div className="h-4 bg-[#e0d6ff] rounded w-1/2" />
//       </div>
//     </div>
//   );
// }

// function SkeletonRecentOrder() {
//   return (
//     <div className="rounded-lg bg-[#FDF0C2] p-3 px-4 flex items-center justify-between animate-pulse">
//       <div className="flex-1">
//         <div className="h-4 bg-[#f7e6b8] rounded w-40 mb-2" />
//         <div className="h-3 bg-[#f7e6b8] rounded w-28 mb-1" />
//         <div className="h-3 bg-[#f7e6b8] rounded w-20" />
//       </div>
//       <div className="w-24 ml-4">
//         <div className="h-8 bg-[#f7e6b8] rounded w-full" />
//       </div>
//     </div>
//   );
// }

// function SkeletonPending() {
//   return (
//     <div className="bg-white rounded-md p-3 shadow-sm animate-pulse">
//       <div className="h-4 bg-[#f3f3f3] rounded w-32 mb-2" />
//       <div className="h-3 bg-[#f3f3f3] rounded w-40" />
//     </div>
//   );
// }

// function SkeletonDonut() {
//   return (
//     <div className="bg-white rounded-md p-4 shadow-sm mt-4 h-[418px] flex flex-col items-center justify-center animate-pulse">
//       <div className="w-full md:w-40">
//         <div className="h-40 rounded-full bg-[#f3f3f3]" />
//       </div>
//       <div className="mt-4 space-y-2 w-full flex flex-col items-center">
//         <div className="h-3 bg-[#f3f3f3] rounded w-32" />
//         <div className="h-3 bg-[#f3f3f3] rounded w-20" />
//       </div>
//     </div>
//   );
// }

// /* ---------- Component ---------- */
// export default function DashboardPage() {
//   // modal/form state
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [customerName, setCustomerName] = useState("");
//   const [whatsapp, setWhatsapp] = useState("");
//   const [files, setFiles] = useState([]);
//   const fileInputRef = useRef(null);
//   const modalRef = useRef(null);
//   const [selectedImages, setSelectedImages] = useState([]);

//   const { orders, orderloading, ordererror } = useGetOrders();
//   // orders could be an array of objects like the screenshot you provided

//   useEffect(() => {
//     if (orderloading) return;
//     if (ordererror) return toast.error(ordererror);
//     if (!orders) return;
//   }, [orderloading, ordererror, orders]);

//   // helper: simple "time ago" string for pending items
//   function timeAgo(dateStr) {
//     if (!dateStr) return "";
//     const now = new Date();
//     const d = new Date(dateStr);
//     const sec = Math.floor((now - d) / 1000);
//     if (sec < 60) return `${sec}s ago`;
//     const min = Math.floor(sec / 60);
//     if (min < 60) return `${min}m ago`;
//     const hr = Math.floor(min / 60);
//     if (hr < 24) return `${hr}h ago`;
//     const days = Math.floor(hr / 24);
//     return `${days}d ago`;
//   }

//   // Build upcoming deliveries: group future orders by date, sort ascending, pick next 3 dates
//   const upcomingDeliveries = useMemo(() => {
//     if (!orders || !Array.isArray(orders) || orders.length === 0) return [];

//     const startOfToday = new Date();
//     startOfToday.setHours(0, 0, 0, 0);

//     // filter orders with valid deliveryDate >= today
//     const futureOrders = orders.filter((o) => {
//       if (!o.deliveryDate) return false;
//       const d = new Date(o.deliveryDate);
//       // ignore invalid dates
//       if (isNaN(d.getTime())) return false;
//       // include same-day and future
//       return d >= startOfToday;
//     });

//     if (futureOrders.length === 0) return [];

//     // group by ISO date key 'YYYY-MM-DD'
//     const groups = futureOrders.reduce((acc, o) => {
//       const d = new Date(o.deliveryDate);
//       const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
//       if (!acc[key]) acc[key] = [];
//       acc[key].push(o);
//       return acc;
//     }, {});

//     const sortedKeys = Object.keys(groups)
//       .sort((a, b) => new Date(a) - new Date(b))
//       .slice(0, 3);

//     // map to { dateLabel, list: [ "Name - garment" ] }
//     const result = sortedKeys.map((key) => {
//       const d = new Date(key);
//       const dateLabel = d.toLocaleDateString(undefined, {
//         month: "short",
//         day: "numeric",
//       });
//       const list = groups[key].map((o) => {
//         const name = o.customer?.customerName ?? "Unknown";
//         const garment = o.garment ?? "";
//         return `${name}${garment ? " - " + garment : ""}`;
//       });
//       return { dateLabel, list };
//     });

//     return result;
//   }, [orders]);

//   // Pending confirmations: filter orders with status === 'pending' (case-insensitive)
//   const pendingConfirmations = useMemo(() => {
//     if (!orders || !Array.isArray(orders)) return [];
//     return orders.filter(
//       (o) => (o.status ?? "").toString().toLowerCase() === "pending"
//     );
//   }, [orders]);

//   // Recent orders: sort by createdAt descending (newest first)
//   // const recentOrders = useMemo(() => {
//   //   if (!orders || !Array.isArray(orders)) return [];
//   //   // clone then sort by date (safely)
//   //   return [...orders].sort(
//   //     (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
//   //   );
//   // }, [orders]);

//   const [selectedMonth, setSelectedMonth] = useState(() => {
//     const now = new Date();
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
//       2,
//       "0"
//     )}`;
//   });

//   function getLastNMonths(n = 12) {
//     const months = [];
//     const now = new Date();
//     for (let i = 0; i < n; i++) {
//       const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//         2,
//         "0"
//       )}`;
//       const label = d.toLocaleDateString(undefined, {
//         month: "short",
//         year: "numeric",
//       });
//       months.push({ value, label });
//     }
//     return months;
//   }
//   const months = useMemo(() => getLastNMonths(12), []);

//  // helper to compute metrics for a month range
// // updated helper: tries common paths and includes `totalPayment`
// function extractAmountFromOrder(o) {
//   if (!o) return undefined;

//   const paths = [
//     "totalPayment",            // <- your field
//     "total",
//     "totalAmount",
//     "amount",
//     "price",
//     "orderTotal",
//     "amountPaid",
//     "paidAmount",
//     "grandTotal",
//     "finalAmount",
//     "payment.amount",
//     "payment.paidAmount",
//     "invoice.total",
//     "paymentDetails.amount",
//     "amountPaidByCustomer",
//   ];

//   const getNested = (obj, path) =>
//     path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);

//   for (const p of paths) {
//     const raw = getNested(o, p);
//     if (raw == null) continue;

//     if (typeof raw === "number" && !isNaN(raw)) return raw;

//     if (typeof raw === "string") {
//       const cleaned = raw.replace(/[^\d.\-]/g, "");
//       const n = cleaned === "" ? NaN : Number(cleaned);
//       if (!isNaN(n)) return n;
//     }
//   }

//   // fallback: if order has items, sum item.price * qty
//   if (Array.isArray(o.items) && o.items.length > 0) {
//     let sum = 0;
//     for (const it of o.items) {
//       const raw = it.price ?? it.amount ?? it.total ?? 0;
//       let n = 0;
//       if (typeof raw === "number") n = raw;
//       else if (typeof raw === "string") {
//         const cleaned = raw.replace(/[^\d.\-]/g, "");
//         n = cleaned === "" ? 0 : Number(cleaned) || 0;
//       }
//       const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
//       sum += n * qty;
//     }
//     if (sum > 0) return sum;
//   }

//   return undefined;
// }

// // updated computeMetricsForMonth that uses extractAmountFromOrder (sums only explicit amounts)
// function computeMetricsForMonth(ordersArr, yyyyMm) {
//   const [yy, mm] = yyyyMm.split("-");
//   const start = new Date(Number(yy), Number(mm) - 1, 1, 0, 0, 0, 0);
//   const end = new Date(Number(yy), Number(mm), 1, 0, 0, 0, 0); // exclusive

//   let totalOrders = 0;
//   let totalSales = 0;
//   const customerIds = new Set();

//   for (const o of ordersArr || []) {
//     const created = o.createdAt ? new Date(o.createdAt) : null;
//     if (!created || isNaN(created.getTime())) continue;
//     if (created >= start && created < end) {
//       totalOrders += 1;

//       // <-- extract amount (will pick up totalPayment if present)
//       const amount = extractAmountFromOrder(o);

//       if (typeof amount === "number" && !isNaN(amount) && amount > 0) {
//         totalSales += amount;
//       }

//       // unique customers (by id, name or mobile)
//       if (o.customer) {
//         if (o.customer._id) customerIds.add(String(o.customer._id));
//         else if (o.customer.customerName) customerIds.add(String(o.customer.customerName));
//       } else if (o.mobileNumber) {
//         customerIds.add(String(o.mobileNumber));
//       }
//     }
//   }

//   return { totalOrders, totalSales, totalCustomers: customerIds.size };
// }



//   // metrics for selected month
//   const monthMetrics = useMemo(
//     () => computeMetricsForMonth(orders, selectedMonth),
//     [orders, selectedMonth]
//   );

//   // metrics for previous month (for percent change)
//   const prevMonth = useMemo(() => {
//     const [yy, mm] = selectedMonth.split("-");
//     const d = new Date(Number(yy), Number(mm) - 1, 1);
//     const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1);
//     return `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, "0")}`;
//   }, [selectedMonth]);

//   const prevMetrics = useMemo(
//     () => computeMetricsForMonth(orders, prevMonth),
//     [orders, prevMonth]
//   );

//   function pctChange(current, previous) {
//     if (previous === 0 && current === 0) return 0;
//     if (previous === 0) return 100;
//     return Math.round(((current - previous) / Math.abs(previous)) * 100);
//   }


// const numberFormatter = new Intl.NumberFormat("en-IN", {
//   maximumFractionDigits: 0,
// });

// // helper to show "Rs 1,23,456"
// function formatRs(amount) {
//   if (amount == null || isNaN(amount)) return "Rs 0";
//   return `Rs ${numberFormatter.format(amount)}`;
// }


//   // modal stuff (unchanged)
//   useEffect(() => {
//     function onKey(e) {
//       if (e.key === "Escape") setIsModalOpen(false);
//     }
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   useEffect(() => {
//     if (!isModalOpen) return;
//     const prev = document.activeElement;
//     const firstFocusable = modalRef.current?.querySelector(
//       'input, button, [tabindex]:not([tabindex="-1"])'
//     );
//     firstFocusable?.focus?.();
//     return () => prev?.focus?.();
//   }, [isModalOpen]);

//   function openModal() {
//     setIsModalOpen(true);
//   }
//   function closeModal() {
//     setIsModalOpen(false);
//   }

//   function handleFilesChange(e) {
//     const selected = Array.from(e.target.files || []);
//     setFiles(selected);
//   }

//   async function uploadFileToS3(file) {
//     if (!file) return "";
//     const fd = new FormData();
//     fd.append("file", file);

//     const res = await fetch("/api/s3/upload", {
//       method: "POST",
//       body: fd,
//     });

//     const data = await res.json();
//     if (res.ok && data.url) return data.url;
//     throw new Error(data.error || "Upload failed");
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (!customerName.trim() || !whatsapp.trim()) {
//       toast.error("Please fill required fields.");
//       return;
//     }
//     if (selectedImages.length === 0) {
//       toast.error("Please select at least one image from gallery.");
//       return;
//     }

//     const toastLoading = toast.loading("Adding customer...");
//     try {
//       const res = await fetch("/api/v1/customer/add-customer", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           customerName,
//           mobileNumber: whatsapp,
//           imageUrls: selectedImages, // using selected gallery images
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to add customer");

//       toast.success("Customer added successfully!", { id: toastLoading });
//       setIsModalOpen(false);
//       setCustomerName("");
//       setWhatsapp("");
//       setSelectedImages([]);
//     } catch (err) {
//       toast.error(err.message || "Failed to add customer", {
//         id: toastLoading,
//       });
//     }
//   }

//   const [showGallery, setShowGallery] = useState(false);

//   return (
//     <div className={`${poppins.className} min-h-screen pt-6`}>
//       <Toaster />
//       <div className="mx-auto max-w-[1180px]">
//         {/* Outer fixed-height card */}
//         <div className="rounded-[22px] bg-white overflow-hidden shadow-xl h-screen flex flex-col">
//           {/* grid - main area will scroll, sidebar stays visually pinned */}
//           <div className="grid grid-cols-1 md:grid-cols-[740px_460px] h-full">
//             {/* Main (scrollable) */}
//             <main className="p-4 md:p-8 overflow-y-auto h-full">
//               <div className="flex items-start justify-between gap-4">
//                 <div>
//                   <h2 className="text-xl md:text-[20px] font-semibold text-[#252525] flex items-center ">
//                     <span className="text-[20px]">👋</span>
//                     Welcome, <span className=" text-[#252525]">Sreeja</span>
//                   </h2>
//                 </div>
//               </div>

//               <div className="mt-5">
//                 <div className="rounded-xl bg-gradient-to-r from-[#5E3BA4] to-[#5E3BA4] text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                   <div className="w-full sm:w-auto">
//                     <div className="text-[14px] sm:text-[15px] font-semibold">
//                       👗 No new Customers yet today!
//                     </div>
//                     <div className="text-[13px] sm:text-sm text-white/90 mt-1">
//                       Add details and keep orders running smoothly.
//                     </div>
//                   </div>
//                   <div className="w-full sm:w-auto flex justify-start sm:justify-end">
//                     <button
//                       onClick={openModal}
//                       className="bg-white text-[#252525] cursor-pointer sm:text-[14px] text-[12px] px-4 py-1.5 rounded-md font-medium shadow-sm w-auto"
//                     >
//                       Add Customer
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Upcoming Deliveries: use computed upcomingDeliveries */}
//               <section className="mt-6">
//                 <h3 className="text-[#000000] text-[16px] font-medium leading-[22px] tracking-[0.5px  ] mb-3">
//                   Upcoming Deliveries
//                 </h3>

//                 <div className="flex gap-3 overflow-x-auto pb-2">
//                   {orderloading ? (
//                     <>
//                       <SkeletonCard />
//                       <SkeletonCard />
//                       <SkeletonCard />
//                     </>
//                   ) : upcomingDeliveries && upcomingDeliveries.length > 0 ? (
//                     upcomingDeliveries.map((d, i) => (
//                       <div
//                         key={i}
//                         className="min-w-[200px] bg-[#F6F3FF] rounded-xl p-4 shadow-sm flex-shrink-0"
//                       >
//                         <div className="flex items-center justify-end mb-3">
//                           <div className="text-[10px] bg-[#E19616D1] text-[#FFFFFF] leading-[22px] px-2  rounded-full">
//                             {d.dateLabel}
//                           </div>
//                         </div>
//                         <ol className="text-sm leading-[22px] tracking-[0.5px] text-[#252525D1] space-y-1">
//                           {d.list.map((it, idx) => {
//                             const [name, ...rest] = it.split(" - ");
//                             const garment = rest.join(" - ");
//                             return (
//                               <li key={idx}>
//                                 <span className="font-semibold">
//                                   {idx + 1}.
//                                 </span>{" "}
//                                 <span className="font-medium">{name}</span>{" "}
//                                 {garment ? (
//                                   <span className="text-[#252525D1]">
//                                     {" "}
//                                     - {garment}
//                                   </span>
//                                 ) : null}
//                               </li>
//                             );
//                           })}
//                         </ol>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="min-w-[200px] bg-[#F6F3FF] rounded-xl p-4 shadow-sm">
//                       <div className="text-sm text-slate-600">
//                         No upcoming deliveries
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </section>

//               {/* Recent Orders */}
//               {/* <section className="mt-6">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-[#000000] text-[16px] font-medium leading-[22px] tracking-[0.5px  ] mb-3">
//                     Recent Orders
//                   </h3>
//                   <Link href="/orders">
//                     <button className="text-sm text-[#060656] bg-white border border-slate-200 px-3 py-1 rounded-md">
//                       View All
//                     </button>
//                   </Link>
//                 </div>

//                 <div className="mt-3 space-y-3">
//                   {orderloading ? (
//                     <>
//                       <SkeletonRecentOrder />
//                       <SkeletonRecentOrder />
//                       <SkeletonRecentOrder />
//                     </>
//                   ) : recentOrders.length > 0 ? (
//                     recentOrders.map((o) => (
//                       <div
//                         key={o._id}
//                         className="rounded-lg bg-[#FDF0C2] p-3 px-4 flex items-center justify-between"
//                       >
//                         <div>
//                           <div className="font-semibold text-[#252525D1]">
//                             {o.customer?.customerName}
//                           </div>
//                           <div className="text-sm text-slate-700">
//                             Garment: {o.garment}
//                           </div>
//                           <div className="text-sm text-slate-600 mt-1">
//                             {o.status}
//                           </div>
//                         </div>
//                         <div className="text-sm">
//                           <button className="text-[#026915D1] underline">
//                             send via whatsapp
//                           </button>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-sm text-slate-600">
//                       No recent orders
//                     </div>
//                   )}
//                 </div>
//               </section> */}

//               {/* sales cards */}
//               <section className="mt-6">
//                 <div className="flex items-center justify-between gap-4">
//                   <h3 className="text-[#000000] text-[16px] font-medium leading-[22px] tracking-[0.5px]">
//                     Overview
//                   </h3>

//                   <div className="flex items-center gap-3 ml-auto">
//                     <label className="text-sm text-slate-600 hidden sm:block">
//                       Month
//                     </label>

//                     <div className="relative  inline-flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
//                       <select
//                         value={selectedMonth}
//                         onChange={(e) => setSelectedMonth(e.target.value)}
//                         className="appearance-none cursor-pointer bg-transparent pr-6 text-sm focus:outline-none"
//                         aria-label="Select month"
//                       >
//                         {months.map((m) => (
//                           <option key={m.value} value={m.value}>
//                             {m.label}
//                           </option>
//                         ))}
//                       </select>
//                       <svg
//                         className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none"
//                         viewBox="0 0 20 20"
//                         fill="currentColor"
//                         aria-hidden="true"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01-.02-1.06z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                   {/* Card helper */}
//                   {/** card structure: accent bar, title + icon, big number, small meta + pct */}
//                   <div className="rounded-lg bg-white shadow-sm overflow-hidden">
//                     <div className="h-1 bg-gradient-to-r from-[#6b21a8] to-[#a78bfa]" />
//                     <div className="p-4">
//                       {orderloading ? (
//                         <div className="animate-pulse space-y-3">
//                           <div className="h-4 bg-gray-100 rounded w-24" />
//                           <div className="h-8 bg-gray-100 rounded w-28 mt-2" />
//                           <div className="h-3 bg-gray-100 rounded w-40 mt-4" />
//                         </div>
//                       ) : (
//                         <>
//                           <div className="flex items-start justify-between gap-3">
//                             <div>
//                               <div className="text-sm text-slate-500">
//                                 Total Orders
//                               </div>
//                               <div className="text-2xl font-semibold text-slate-800 mt-2">
//                                 {monthMetrics.totalOrders}
//                               </div>
//                             </div>
//                             <div className="text-3xl text-slate-400">📦</div>
//                           </div>

//                           <div className="mt-4 flex items-center justify-between">
//                             <div className="text-xs text-slate-500">
//                               For{" "}
//                               {new Date(
//                                 `${selectedMonth}-01`
//                               ).toLocaleDateString(undefined, {
//                                 month: "long",
//                                 year: "numeric",
//                               })}
//                             </div>

//                             <div className="text-sm flex items-center gap-2">
//                               {(() => {
//                                 const change = pctChange(
//                                   monthMetrics.totalOrders,
//                                   prevMetrics.totalOrders
//                                 );
//                                 const isUp = change > 0;
//                                 const isZero = change === 0;
//                                 return (
//                                   <div
//                                     className={`inline-flex items-center text-sm font-medium ${
//                                       isZero
//                                         ? "text-slate-500"
//                                         : isUp
//                                         ? "text-emerald-600"
//                                         : "text-rose-600"
//                                     }`}
//                                   >
//                                     <span className="text-xs">
//                                       {isUp ? "▲" : change < 0 ? "▼" : ""}
//                                     </span>
//                                     <span className="ml-1">
//                                       {Math.abs(change)}%
//                                     </span>
//                                     <span className="text-xs text-slate-400 ml-2">
//                                       vs prev
//                                     </span>
//                                   </div>
//                                 );
//                               })()}
//                             </div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="rounded-lg bg-white shadow-sm overflow-hidden">
//                     <div className="h-1 bg-gradient-to-r from-[#E19616] to-[#F3C06B]" />
//                     <div className="p-4">
//                       {orderloading ? (
//                         <div className="animate-pulse space-y-3">
//                           <div className="h-4 bg-gray-100 rounded w-24" />
//                           <div className="h-8 bg-gray-100 rounded w-32 mt-2" />
//                           <div className="h-3 bg-gray-100 rounded w-40 mt-4" />
//                         </div>
//                       ) : (
//                         <>
//                           <div className="flex items-start justify-between gap-3">
//                             <div>
//                               <div className="text-sm text-slate-500">
//                                 Total Sales
//                               </div>
//                               <div className="text-2xl font-semibold text-slate-800 mt-2">
//                                 {formatRs(monthMetrics.totalSales)}
//                               </div>
//                             </div>
//                             <div className="text-3xl text-slate-400">💰</div>
//                           </div>

//                           <div className="mt-4 flex items-center justify-between">
//                             <div className="text-xs text-slate-500">
//                               Sum of order amounts
//                             </div>

//                             <div className="text-sm flex items-center gap-2">
//                               {(() => {
//                                 const change = pctChange(
//                                   monthMetrics.totalSales,
//                                   prevMetrics.totalSales
//                                 );
//                                 const isUp = change > 0;
//                                 const isZero = change === 0;
//                                 return (
//                                   <div
//                                     className={`inline-flex items-center text-sm font-medium ${
//                                       isZero
//                                         ? "text-slate-500"
//                                         : isUp
//                                         ? "text-emerald-600"
//                                         : "text-rose-600"
//                                     }`}
//                                   >
//                                     <span className="text-xs">
//                                       {isUp ? "▲" : change < 0 ? "▼" : ""}
//                                     </span>
//                                     <span className="ml-1">
//                                       {Math.abs(change)}%
//                                     </span>
//                                     <span className="text-xs text-slate-400 ml-2">
//                                       vs prev
//                                     </span>
//                                   </div>
//                                 );
//                               })()}
//                             </div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="rounded-lg bg-white shadow-sm overflow-hidden">
//                     <div className="h-1 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]" />
//                     <div className="p-4">
//                       {orderloading ? (
//                         <div className="animate-pulse space-y-3">
//                           <div className="h-4 bg-gray-100 rounded w-24" />
//                           <div className="h-8 bg-gray-100 rounded w-24 mt-2" />
//                           <div className="h-3 bg-gray-100 rounded w-40 mt-4" />
//                         </div>
//                       ) : (
//                         <>
//                           <div className="flex items-start justify-between gap-3">
//                             <div>
//                               <div className="text-sm text-slate-500">
//                                 Total Customers
//                               </div>
//                               <div className="text-2xl font-semibold text-slate-800 mt-2">
//                                 {monthMetrics.totalCustomers}
//                               </div>
//                             </div>
//                             <div className="text-3xl text-slate-400">🧑‍🤝‍🧑</div>
//                           </div>

//                           <div className="mt-4 flex items-center justify-between">
//                             <div className="text-xs text-slate-500">
//                               Unique customers this month
//                             </div>

//                             <div className="text-sm flex items-center gap-2">
//                               {(() => {
//                                 const change = pctChange(
//                                   monthMetrics.totalCustomers,
//                                   prevMetrics.totalCustomers
//                                 );
//                                 const isUp = change > 0;
//                                 const isZero = change === 0;
//                                 return (
//                                   <div
//                                     className={`inline-flex items-center text-sm font-medium ${
//                                       isZero
//                                         ? "text-slate-500"
//                                         : isUp
//                                         ? "text-emerald-600"
//                                         : "text-rose-600"
//                                     }`}
//                                   >
//                                     <span className="text-xs">
//                                       {isUp ? "▲" : change < 0 ? "▼" : ""}
//                                     </span>
//                                     <span className="ml-1">
//                                       {Math.abs(change)}%
//                                     </span>
//                                     <span className="text-xs text-slate-400 ml-2">
//                                       vs prev
//                                     </span>
//                                   </div>
//                                 );
//                               })()}
//                             </div>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </section>
//             </main>

//             {/* Sidebar (visually pinned) */}
//             <aside className="bg-[#F0F2F7] border-l border-slate-100 p-6 md:p-8 flex-shrink-0 w-full md:w-auto">
//               {/* make the whole sidebar content sticky so it stays visible while main scrolls */}
//               <div className="sticky top-6 flex flex-col gap-6">
//                 {/* ---------- Order Status (Donut) ---------- */}
//                 <div className="bg-white rounded-md p-4 shadow-sm">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <div className="font-semibold text-slate-800">
//                         Order Status
//                       </div>
//                       <div className="text-xs text-slate-500 mt-1">
//                         Summary of current orders
//                       </div>
//                     </div>
//                     <Link href="/orders">
//                       <button className="text-xs border cursor-pointer border-slate-200 px-3 py-1 rounded-md text-slate-700">
//                         View All
//                       </button>
//                     </Link>
//                   </div>

//                   <div className="mt-6 flex flex-col items-center justify-center gap-4 h-[260px]">
//                     {orderloading ? (
//                       <div className="w-full flex flex-col items-center gap-4 animate-pulse">
//                         <div className="h-36 w-36 rounded-full bg-[#f3f3f3]" />
//                         <div className="h-3 w-28 rounded bg-[#f3f3f3]" />
//                         <div className="h-3 w-20 rounded bg-[#f3f3f3]" />
//                       </div>
//                     ) : (
//                       <>
//                         <div className="w-full md:w-40">
//                           <DonutChart orders={orders} size={160} />
//                         </div>

//                         {/* legend */}
//                         {/* <div className="w-full flex flex-wrap items-center justify-center gap-3 mt-1">
//                           <div className="flex items-center gap-2 text-sm">
//                             <span
//                               className="w-3 h-3 rounded-full"
//                               style={{ backgroundColor: "#E6B000" }}
//                             />
//                             <span className="text-slate-700">Pending</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm">
//                             <span
//                               className="w-3 h-3 rounded-full"
//                               style={{ backgroundColor: "#D19CF9" }}
//                             />
//                             <span className="text-slate-700">In Progress</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm">
//                             <span
//                               className="w-3 h-3 rounded-full"
//                               style={{ backgroundColor: "#F4E2B1" }}
//                             />
//                             <span className="text-slate-700">Completed</span>
//                           </div>
//                         </div> */}
//                       </>
//                     )}
//                   </div>
//                 </div>

//                 {/* ---------- Pending Confirmations ---------- */}
//                 <div className="bg-transparent">
//                   <h3 className="text-[#000000] text-[16px] font-medium leading-[22px] tracking-[0.5px] mb-3">
//                     Pending Confirmations
//                   </h3>

//                   {/* pending confirmations container */}
//                   <div
//                     className={`space-y-3 pr-2 ${
//                       pendingConfirmations.length > 3
//                         ? "max-h-[calc(100vh-420px)] overflow-y-auto"
//                         : ""
//                     }`}
//                   >
//                     {orderloading ? (
//                       <>
//                         <SkeletonPending />
//                         <SkeletonPending />
//                         <SkeletonPending />
//                       </>
//                     ) : pendingConfirmations.length > 0 ? (
//                       pendingConfirmations.map((p) => (
//                         <div
//                           key={p._id}
//                           className="bg-white rounded-md p-3 shadow-sm"
//                         >
//                           <div className="flex items-start gap-3">
//                             {/* optional avatar / avatar placeholder */}
//                             <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-sm text-slate-500">
//                               {p.customer?.customerName
//                                 ? p.customer.customerName[0]
//                                 : "U"}
//                             </div>

//                             <div className="flex-1">
//                               <div className="flex items-center justify-between gap-2">
//                                 <div className="font-medium text-slate-800 truncate">
//                                   {p.customer?.customerName ??
//                                     "Unknown Customer"}
//                                 </div>
//                                 <div className="text-xs text-[#252525D1]">
//                                   {timeAgo(p.createdAt)}
//                                 </div>
//                               </div>

//                               <div className="text-sm text-slate-600 mt-1 truncate">
//                                 {p.garment ?? "—"}
//                               </div>

//                               {/* <div className="mt-3 flex items-center justify-between gap-3">
//                                 <div className="text-xs text-[#252525D1]">
//                                   ⏳ Awaiting Confirmation
//                                 </div>

//                                 <div className="flex items-center gap-2">
//                                   <button
//                                     onClick={() => {
                                   
//                                     }}
//                                     className="text-[12px] text-[#026915D1] underline"
//                                   >
//                                     Resend
//                                   </button>

//                                   <button
//                                     onClick={() => {
                                     
//                                     }}
//                                     className="text-[12px] px-2 py-1 bg-[#6b21a8] text-white rounded-md"
//                                   >
//                                     Confirm
//                                   </button>
//                                 </div>
//                               </div> */}
//                             </div>
//                           </div>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="text-sm text-slate-600">
//                         No pending confirmations
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </aside>
//           </div>
//         </div>
//       </div>

//       {/* Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black/40"
//             onClick={closeModal}
//           ></div>
//           <div className="relative w-[92%] max-w-lg bg-white rounded-[14px] shadow-2xl p-6 z-10">
//             <h3 className="text-lg  font-semibold mb-4">Add Customer</h3>
//             <form onSubmit={handleSubmit} className="space-y-4" ref={modalRef}>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Customer Name*
//                 </label>
//                 <input
//                   value={customerName}
//                   onChange={(e) => setCustomerName(e.target.value)}
//                   placeholder="Enter name"
//                   className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   WhatsApp number*
//                 </label>
//                 <input
//                   type="tel"
//                   pattern="[0-9]{10}"
//                   value={whatsapp}
//                   onChange={(e) => setWhatsapp(e.target.value)}
//                   placeholder="Enter"
//                   className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
//                   required
//                 />
//               </div>

//               {/* GALLERY SELECTION */}
//               <div>
//                 <label className="block text-sm font-medium mb-1">
//                   Select Images
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setShowGallery(true)}
//                   className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-[#F9F8FC]"
//                 >
//                   Choose from Gallery
//                 </button>
//                 {selectedImages.length > 0 && (
//                   <div className="flex gap-2 mt-3 flex-wrap">
//                     {selectedImages.map((url) => (
//                       <img
//                         key={url}
//                         src={url}
//                         className="w-16 h-16 rounded-md object-cover border"
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 className="w-full rounded-md py-2 cursor-pointer text-white font-medium bg-gradient-to-r from-[#6b21a8] to-[#a78bfa]"
//               >
//                 Save
//               </button>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* GALLERY MODAL */}
//       {showGallery && (
//         <GallerySelectorModal
//           onClose={() => setShowGallery(false)}
//           onSelect={setSelectedImages}
//         />
//       )}
//     </div>
//   );
// }

// /* ---------- Gallery Selector Modal (unchanged) ---------- */
// function GallerySelectorModal({ onClose, onSelect }) {
//   const [galleryItems, setGalleryItems] = useState([]);
//   const [selected, setSelected] = useState([]);

//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await fetch("/api/v1/gallery/get-gallery");
//         const data = await res.json();
//         setGalleryItems(data.GalleryItems || []);
//       } catch (e) {
//         toast.error("Failed to load gallery");
//       }
//     })();
//   }, []);

//   function toggleSelect(url) {
//     setSelected((prev) =>
//       prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
//     );
//   }

//   function confirmSelection() {
//     onSelect(selected);
//     onClose();
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//       <div className="relative bg-white rounded-xl w-[95vw] max-w-[900px] max-h-[90vh] overflow-hidden shadow-2xl">
//         <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
//           <h3 className="font-semibold text-lg">Select from Gallery</h3>
//           <button
//             onClick={onClose}
//             className="text-slate-500 hover:text-slate-700"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {galleryItems.map((it) => (
//             <div
//               key={it._id}
//               onClick={() => toggleSelect(it.url)}
//               className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
//                 selected.includes(it.url)
//                   ? "border-[#6b21a8]"
//                   : "border-transparent"
//               }`}
//             >
//               <img src={it.url} className="w-full h-32 object-cover" />
//               {selected.includes(it.url) && (
//                 <div className="absolute inset-0 bg-[#6b21a8]/40 grid place-items-center text-white font-semibold">
//                   ✓
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="p-4 border-t border-slate-200 flex justify-end">
//           <button
//             onClick={confirmSelection}
//             className="bg-gradient-to-r from-[#6b21a8] to-[#a78bfa] text-white px-4 py-2 rounded-md"
//           >
//             Confirm Selection
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }









"use client";

import { Poppins } from "next/font/google";
import { useState, useMemo, useEffect, useRef } from "react";
import DonutChart from "../components/DonutChart";
import toast, { Toaster } from "react-hot-toast";
import { useGetOrders } from "../hooks/usegetorders";
import Link from "next/link";
import { FiX } from "react-icons/fi";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

/* ---------- Skeleton components (unchanged) ---------- */
function SkeletonCard() {
  return (
    <div className="min-w-[200px] bg-[#F6F3FF] rounded-xl p-4 shadow-sm animate-pulse flex flex-col gap-3 flex-shrink-0">
      <div className="flex items-center justify-end">
        <div className="h-5 w-12 bg-[#e0d6ff] rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-[#e0d6ff] rounded w-3/4" />
        <div className="h-4 bg-[#e0d6ff] rounded w-2/3" />
        <div className="h-4 bg-[#e0d6ff] rounded w-1/2" />
      </div>
    </div>
  );
}

function SkeletonRecentOrder() {
  return (
    <div className="rounded-lg bg-[#FDF0C2] p-3 px-4 flex items-center justify-between animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-[#f7e6b8] rounded w-40 mb-2" />
        <div className="h-3 bg-[#f7e6b8] rounded w-28 mb-1" />
        <div className="h-3 bg-[#f7e6b8] rounded w-20" />
      </div>
      <div className="w-24 ml-4">
        <div className="h-8 bg-[#f7e6b8] rounded w-full" />
      </div>
    </div>
  );
}

function SkeletonPending() {
  return (
    <div className="bg-white rounded-md p-3 shadow-sm animate-pulse">
      <div className="h-4 bg-[#f3f3f3] rounded w-32 mb-2" />
      <div className="h-3 bg-[#f3f3f3] rounded w-40" />
    </div>
  );
}

function SkeletonDonut() {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm mt-4 h-[418px] flex flex-col items-center justify-center animate-pulse">
      <div className="w-full md:w-40">
        <div className="h-40 rounded-full bg-[#f3f3f3]" />
      </div>
      <div className="mt-4 space-y-2 w-full flex flex-col items-center">
        <div className="h-3 bg-[#f3f3f3] rounded w-32" />
        <div className="h-3 bg-[#f3f3f3] rounded w-20" />
      </div>
    </div>
  );
}

/* ---------- SendImagesModal (the user-supplied component) ---------- */
function SendImagesModal({
  isOpen,
  onClose,
  selectedOrder,
  galleryItems = [],
  galleryLoading = false,
  galleryError = null,
  onSendImages,
}) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedImagesInternal, setSelectedImagesInternal] = useState([]);

  const SAMPLE_IMG =
    "https://images.unsplash.com/photo-1562158070-9b9b9b2f6a66?w=800&q=60&auto=format&fit=crop";

  const normalizedGalleryItems = Array.isArray(galleryItems)
    ? galleryItems
    : (galleryItems &&
        (galleryItems.items ||
          galleryItems.gallery ||
          galleryItems.GalleryItems ||
          galleryItems.data ||
          Object.values(galleryItems).find((v) => Array.isArray(v)))) ||
      [];

  const categories = Array.from(
    new Set(normalizedGalleryItems.map((g) => g.category || "Uncategorized"))
  );

  // Set initial category when modal opens
  if (isOpen && !activeCategory && categories.length > 0) {
    setActiveCategory(categories[0]);
  }

  function toggleSelectImage(id) {
    setSelectedImagesInternal((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  function handleClose() {
    setActiveCategory(null);
    setSelectedImagesInternal([]);
    onClose();
  }

  function handleSend() {
    if (!selectedImagesInternal.length) {
      alert("Select at least one image");
      return;
    }
    onSendImages(selectedImagesInternal, activeCategory);
    handleClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Desktop */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center p-8">
        <div className="w-[90%] max-w-[1100px] h-[76vh] bg-white rounded-[20px] shadow-2xl overflow-hidden relative flex flex-col">
          <div className="flex-1 flex overflow-hidden">
            {/* Left Categories Sidebar */}
            <div className="w-64 bg-gradient-to-b from-[#4C2699] to-[#936EDD] text-white px-6 py-8 flex flex-col gap-6 rounded-l-[20px]">
              <div className="text-[20px] font-semibold">Categories</div>
              <div className="flex-1 overflow-y-auto">
                {galleryLoading ? (
                  <div className="text-white/80">Loading...</div>
                ) : galleryError ? (
                  <div className="text-white/80">{galleryError}</div>
                ) : (
                  categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setActiveCategory(c)}
                      className={`w-full text-left py-2 rounded-md px-1 transition-colors ${
                        activeCategory === c
                          ? "bg-white/20 font-semibold"
                          : "opacity-95"
                      }`}
                    >
                      {c}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 bg-[#F8F9FB] p-8 flex flex-col">
              <div className="absolute top-4 right-4">
                <button
                  onClick={handleClose}
                  className="p-2 rounded-full text-slate-700 hover:bg-white/30"
                >
                  <FiX />
                </button>
              </div>

              {!activeCategory ? (
                <div className="text-[#707070] text-lg self-center mt-12">
                  Select a category to send images
                </div>
              ) : (
                <>
                  <div className="text-lg font-semibold mb-4">
                    {activeCategory}
                  </div>
                  <div className="flex-1 overflow-auto">
                    {galleryLoading ? (
                      <div className="h-full grid place-items-center text-slate-600">
                        Loading images…
                      </div>
                    ) : (
                      <>
                        {normalizedGalleryItems.filter(
                          (g) => (g.category || "Uncategorized") === activeCategory
                        ).length === 0 ? (
                          <div className="h-full grid place-items-center text-slate-500">
                            No images in this category.
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-4">
                            {normalizedGalleryItems
                              .filter(
                                (g) => (g.category || "Uncategorized") === activeCategory
                              )
                              .map((img) => {
                                const isSelected = selectedImagesInternal.includes(
                                  img._id
                                );
                                return (
                                  <div
                                    key={img._id}
                                    onClick={() => toggleSelectImage(img._id)}
                                    className={`relative rounded-lg overflow-hidden cursor-pointer border ${
                                      isSelected
                                        ? "ring-4 ring-[#6B4FD3]/30"
                                        : "border-transparent"
                                    }`}
                                  >
                                    <div className="w-full h-[140px] bg-slate-100 overflow-hidden">
                                      <img
                                        src={img.url || img.src || SAMPLE_IMG}
                                        alt={img.title || "gallery"}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                    <div className="absolute top-2 right-2">
                                      <div
                                        className={`w-7 h-7 rounded-full grid place-items-center ${
                                          isSelected
                                            ? "bg-white text-[#6B4FD3] shadow"
                                            : "bg-white/70 text-white/0"
                                        }`}
                                      >
                                        {isSelected ? (
                                          <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                          >
                                            <path
                                              d="M20 6L9 17l-5-5"
                                              stroke="#6B4FD3"
                                              strokeWidth="2.2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Footer with selection preview */}
                  <div className="mt-4 border-t pt-4 bg-white">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex -space-x-2">
                          {selectedImagesInternal.slice(0, 6).map((id) => {
                            const g = normalizedGalleryItems.find((x) => x._id === id);
                            return (
                              <div
                                key={id}
                                className="w-12 h-12 rounded-md overflow-hidden border"
                              >
                                <img
                                  src={g?.url || g?.src || SAMPLE_IMG}
                                  className="w-full h-full object-cover"
                                  alt="Selected"
                                />
                              </div>
                            );
                          })}
                        </div>
                        <div className="text-sm text-[#333] ml-2">
                          {selectedImagesInternal.length === 0
                            ? "No images selected"
                            : `${selectedImagesInternal.length} selected`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedImagesInternal([])}
                          className="px-4 py-2 rounded-md border"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleSend}
                          className="px-6 py-3 rounded-xl bg-[#EC9705] text-white font-semibold"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sheet */}
      <div className="md:hidden fixed left-0 right-0 bottom-0 top-8 p-4">
        <div className="h-full bg-transparent flex items-start justify-center">
          <div className="w-full max-w-[460px] mx-auto bg-white rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-lg font-semibold">Select Category</div>
              <button
                onClick={handleClose}
                className="p-2 rounded-md text-slate-600"
              >
                <FiX />
              </button>
            </div>

            <div className="flex gap-3 overflow-x-auto py-2 px-3">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ease-in-out ${
                    activeCategory === c
                      ? "bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8] text-white shadow-md"
                      : "bg-transparent text-[#6B4FD3] border border-[#EAE7F5] hover:bg-white hover:shadow-sm"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-4">
              {!activeCategory ? (
                <div className="text-[#777777] text-center mt-8">
                  Select a category to send images
                </div>
              ) : (
                <div className="w-full">
                  <div className="text-base font-semibold mb-4">
                    {activeCategory}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {normalizedGalleryItems
                      .filter(
                        (g) => (g.category || "Uncategorized") === activeCategory
                      )
                      .map((img) => {
                        const id = img._id;
                        const isSelected = selectedImagesInternal.includes(id);
                        return (
                          <div
                            key={id}
                            onClick={() => toggleSelectImage(id)}
                            className={`relative flex flex-col items-start rounded-lg overflow-hidden cursor-pointer border ${
                              isSelected
                                ? "ring-4 ring-[#6B4FD3]/30"
                                : "border-transparent"
                            }`}
                          >
                            <div className="w-[157px] h-[122px] bg-slate-100 overflow-hidden rounded-md">
                              <img
                                src={img.url || img.src || SAMPLE_IMG}
                                alt="sample"
                                loading="lazy"
                                className="w-full h-full object-cover block"
                              />
                            </div>
                            <div className="p-2 text-sm text-slate-700">
                              {img.title || "Sample product"}
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-3">
                                <div className="w-6 h-6 rounded-full grid place-items-center bg-white text-[#6B4FD3] shadow">
                                  <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M20 6L9 17l-5-5"
                                      stroke="#6B4FD3"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  <div className="mt-4 pb-6">
                    <button
                      onClick={handleSend}
                      className="w-full rounded-md bg-[#13234B] text-white py-3"
                    >
                      Send Images
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Component (DashboardPage) ---------- */
export default function DashboardPage() {
  // modal/form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);

  const { orders, orderloading, ordererror } = useGetOrders();

  // Gallery state (fetched centrally)
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState(null);

  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    if (orderloading) return;
    if (ordererror) return toast.error(ordererror);
    if (!orders) return;
  }, [orderloading, ordererror, orders]);

  useEffect(() => {
    // fetch gallery once
    (async () => {
      setGalleryLoading(true);
      setGalleryError(null);
      try {
        const res = await fetch("/api/v1/gallery/get-gallery");
        const data = await res.json();
        // prefer the common key but be flexible
        const items =
          data?.GalleryItems ||
          data?.gallery ||
          data?.items ||
          data?.data ||
          (Array.isArray(data) ? data : []);
        setGalleryItems(Array.isArray(items) ? items : []);
      } catch (e) {
        console.error(e);
        setGalleryError("Failed to load gallery");
        toast.error("Failed to load gallery");
      } finally {
        setGalleryLoading(false);
      }
    })();
  }, []);

  function timeAgo(dateStr) {
    if (!dateStr) return "";
    const now = new Date();
    const d = new Date(dateStr);
    const sec = Math.floor((now - d) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    return `${days}d ago`;
  }

  const upcomingDeliveries = useMemo(() => {
    if (!orders || !Array.isArray(orders) || orders.length === 0) return [];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const futureOrders = orders.filter((o) => {
      if (!o.deliveryDate) return false;
      const d = new Date(o.deliveryDate);
      if (isNaN(d.getTime())) return false;
      return d >= startOfToday;
    });

    if (futureOrders.length === 0) return [];

    const groups = futureOrders.reduce((acc, o) => {
      const d = new Date(o.deliveryDate);
      const key = d.toISOString().slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(o);
      return acc;
    }, {});

    const sortedKeys = Object.keys(groups)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(0, 3);

    const result = sortedKeys.map((key) => {
      const d = new Date(key);
      const dateLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const list = groups[key].map((o) => {
        const name = o.customer?.customerName ?? "Unknown";
        const garment = o.garment ?? "";
        return `${name}${garment ? " - " + garment : ""}`;
      });
      return { dateLabel, list };
    });

    return result;
  }, [orders]);

  const pendingConfirmations = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter((o) => (o.status ?? "").toString().toLowerCase() === "pending");
  }, [orders]);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  function getLastNMonths(n = 12) {
    const months = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
      months.push({ value, label });
    }
    return months;
  }
  const months = useMemo(() => getLastNMonths(12), []);

  function extractAmountFromOrder(o) {
    if (!o) return undefined;

    const paths = [
      "totalPayment",
      "total",
      "totalAmount",
      "amount",
      "price",
      "orderTotal",
      "amountPaid",
      "paidAmount",
      "grandTotal",
      "finalAmount",
      "payment.amount",
      "payment.paidAmount",
      "invoice.total",
      "paymentDetails.amount",
      "amountPaidByCustomer",
    ];

    const getNested = (obj, path) => path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);

    for (const p of paths) {
      const raw = getNested(o, p);
      if (raw == null) continue;

      if (typeof raw === "number" && !isNaN(raw)) return raw;

      if (typeof raw === "string") {
        const cleaned = raw.replace(/[^\d.\-]/g, "");
        const n = cleaned === "" ? NaN : Number(cleaned);
        if (!isNaN(n)) return n;
      }
    }

    if (Array.isArray(o.items) && o.items.length > 0) {
      let sum = 0;
      for (const it of o.items) {
        const raw = it.price ?? it.amount ?? it.total ?? 0;
        let n = 0;
        if (typeof raw === "number") n = raw;
        else if (typeof raw === "string") {
          const cleaned = raw.replace(/[^\d.\-]/g, "");
          n = cleaned === "" ? 0 : Number(cleaned) || 0;
        }
        const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
        sum += n * qty;
      }
      if (sum > 0) return sum;
    }

    return undefined;
  }

  function computeMetricsForMonth(ordersArr, yyyyMm) {
    const [yy, mm] = yyyyMm.split("-");
    const start = new Date(Number(yy), Number(mm) - 1, 1, 0, 0, 0, 0);
    const end = new Date(Number(yy), Number(mm), 1, 0, 0, 0, 0);

    let totalOrders = 0;
    let totalSales = 0;
    const customerIds = new Set();

    for (const o of ordersArr || []) {
      const created = o.createdAt ? new Date(o.createdAt) : null;
      if (!created || isNaN(created.getTime())) continue;
      if (created >= start && created < end) {
        totalOrders += 1;
        const amount = extractAmountFromOrder(o);
        if (typeof amount === "number" && !isNaN(amount) && amount > 0) {
          totalSales += amount;
        }
        if (o.customer) {
          if (o.customer._id) customerIds.add(String(o.customer._id));
          else if (o.customer.customerName) customerIds.add(String(o.customer.customerName));
        } else if (o.mobileNumber) {
          customerIds.add(String(o.mobileNumber));
        }
      }
    }

    return { totalOrders, totalSales, totalCustomers: customerIds.size };
  }

  const monthMetrics = useMemo(() => computeMetricsForMonth(orders, selectedMonth), [orders, selectedMonth]);

  const prevMonth = useMemo(() => {
    const [yy, mm] = selectedMonth.split("-");
    const d = new Date(Number(yy), Number(mm) - 1, 1);
    const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, "0")}`;
  }, [selectedMonth]);

  const prevMetrics = useMemo(() => computeMetricsForMonth(orders, prevMonth), [orders, prevMonth]);

  function pctChange(current, previous) {
    if (previous === 0 && current === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / Math.abs(previous)) * 100);
  }

  const numberFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
  function formatRs(amount) {
    if (amount == null || isNaN(amount)) return "Rs 0";
    return `Rs ${numberFormatter.format(amount)}`;
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setIsModalOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const prev = document.activeElement;
    const firstFocusable = modalRef.current?.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
    firstFocusable?.focus?.();
    return () => prev?.focus?.();
  }, [isModalOpen]);

  function openModal() {
    setIsModalOpen(true);
  }
  function closeModal() {
    setIsModalOpen(false);
  }

  function handleFilesChange(e) {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  }

  async function uploadFileToS3(file) {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/s3/upload", { method: "POST", body: fd });

    const data = await res.json();
    if (res.ok && data.url) return data.url;
    throw new Error(data.error || "Upload failed");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!customerName.trim() || !whatsapp.trim()) {
      toast.error("Please fill required fields.");
      return;
    }
    if (selectedImages.length === 0) {
      toast.error("Please select at least one image from gallery.");
      return;
    }

    const toastLoading = toast.loading("Adding customer...");
    try {
      const res = await fetch("/api/v1/customer/add-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, mobileNumber: whatsapp, imageUrls: selectedImages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add customer");

      toast.success("Customer added successfully!", { id: toastLoading });
      setIsModalOpen(false);
      setCustomerName("");
      setWhatsapp("");
      setSelectedImages([]);
    } catch (err) {
      toast.error(err.message || "Failed to add customer", { id: toastLoading });
    }
  }

  // Handler passed to SendImagesModal: receives array of _id values (selected ids)
  function handleSendImagesFromModal(selectedIds = [], activeCategory = null) {
    // map ids to urls using galleryItems
    const urls = selectedIds
      .map((id) => {
        const g = galleryItems.find((x) => x._id === id);
        if (!g) return null;
        return g.url || g.src || null;
      })
      .filter(Boolean);
    setSelectedImages(urls);
    setShowGallery(false);
  }

  useEffect(() => {
    if (galleryError) {
      // already toast-ed in fetch, but keep defensive
      toast.error(galleryError);
    }
  }, [galleryError]);

  return (
    <div className={`${poppins.className} min-h-screen pt-6 bg-slate-50`}>
      <Toaster />
      <div className="mx-auto max-w-[1180px] px-3">
        {/* Outer card: use min-h and allow inner scroll, avoid forcing h-screen which breaks mobile */}
        <div className="rounded-[22px] bg-white overflow-hidden shadow-xl min-h-[640px] flex flex-col">
          {/* grid - main area will scroll, sidebar stacks on small screens */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] h-full">
            {/* Main (scrollable) */}
            <main className="p-4 md:p-8 overflow-y-auto max-h-[80vh]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-[20px] font-semibold text-[#252525] flex items-center">
                    <span className="text-[20px] mr-2">👋</span>
                    <span className="truncate">Welcome</span>
                  </h2>
                </div>
              </div>

              <div className="mt-5">
                <div className="rounded-xl bg-gradient-to-r from-[#5E3BA4] to-[#5E3BA4] text-white px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <div className="text-[14px] sm:text-[15px] font-semibold">👗 No new Customers yet today!</div>
                    <div className="text-[13px] sm:text-sm text-white/90 mt-1">Add details and keep orders running smoothly.</div>
                  </div>
                  <div className="w-full sm:w-auto flex justify-start sm:justify-end">
                    <button onClick={openModal} className="bg-white text-[#252525] cursor-pointer sm:text-[14px] text-[12px] px-4 py-1.5 rounded-md font-medium shadow-sm w-full sm:w-auto">
                      Add Customer
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Deliveries */}
              <section className="mt-6">
                <h3 className="text-[#000000] text-[16px] font-medium leading-[22px] tracking-[0.5px] mb-3">Upcoming Deliveries</h3>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {orderloading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : upcomingDeliveries && upcomingDeliveries.length > 0 ? (
                    upcomingDeliveries.map((d, i) => (
                      <div key={i} className="min-w-[200px] bg-[#F6F3FF] rounded-xl p-4 shadow-sm flex-shrink-0">
                        <div className="flex items-center justify-end mb-3">
                          <div className="text-[10px] bg-[#E19616D1] text-[#FFFFFF] leading-[22px] px-2 rounded-full">{d.dateLabel}</div>
                        </div>
                        <ol className="text-sm leading-[22px] tracking-[0.5px] text-[#252525D1] space-y-1">
                          {d.list.map((it, idx) => {
                            const [name, ...rest] = it.split(" - ");
                            const garment = rest.join(" - ");
                            return (
                              <li key={idx}>
                                <span className="font-semibold">{idx + 1}.</span>{" "}
                                <span className="font-medium">{name}</span>{" "}
                                {garment ? <span className="text-[#252525D1]"> - {garment}</span> : null}
                              </li>
                            );
                          })}
                        </ol>
                      </div>
                    ))
                  ) : (
                    <div className="min-w-[200px] bg-[#F6F3FF] rounded-xl p-4 shadow-sm">
                      <div className="text-sm text-slate-600">No upcoming deliveries</div>
                    </div>
                  )}
                </div>
              </section>

              {/* Overview cards */}
              <section className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[#000000] text-[16px] font-medium leading-[22px] tracking-[0.5px]">Overview</h3>

                  <div className="flex items-center gap-3 ml-auto">
                    <label className="text-sm text-slate-600 hidden sm:block">Month</label>

                    <div className="relative inline-flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="appearance-none cursor-pointer bg-transparent pr-6 text-sm focus:outline-none">
                        {months.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <svg className="w-4 h-4 text-slate-400 absolute right-2 pointer-events-none" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.25 4a.75.75 0 01-1.04 0l-4.25-4a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Orders card */}
                  <div className="rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#6b21a8] to-[#a78bfa]" />
                    <div className="p-4">
                      {orderloading ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-100 rounded w-24" />
                          <div className="h-8 bg-gray-100 rounded w-28 mt-2" />
                          <div className="h-3 bg-gray-100 rounded w-40 mt-4" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm text-slate-500">Total Orders</div>
                              <div className="text-2xl md:text-3xl font-semibold text-slate-800 mt-2">{monthMetrics.totalOrders}</div>
                            </div>
                            <div className="text-3xl text-slate-400">📦</div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-slate-500">For {new Date(`${selectedMonth}-01`).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>

                            <div className="text-sm flex items-center gap-2">
                              {(() => {
                                const change = pctChange(monthMetrics.totalOrders, prevMetrics.totalOrders);
                                const isUp = change > 0;
                                const isZero = change === 0;
                                return (
                                  <div className={`inline-flex items-center text-sm font-medium ${isZero ? "text-slate-500" : isUp ? "text-emerald-600" : "text-rose-600"}`}>
                                    <span className="text-xs">{isUp ? "▲" : change < 0 ? "▼" : ""}</span>
                                    <span className="ml-1">{Math.abs(change)}%</span>
                                    <span className="text-xs text-slate-400 ml-2">vs prev</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sales card */}
                  <div className="rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#E19616] to-[#F3C06B]" />
                    <div className="p-4">
                      {orderloading ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-100 rounded w-24" />
                          <div className="h-8 bg-gray-100 rounded w-32 mt-2" />
                          <div className="h-3 bg-gray-100 rounded w-40 mt-4" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm text-slate-500">Total Sales</div>
                              <div className="text-2xl md:text-2xl font-semibold text-slate-800 mt-2">{formatRs(monthMetrics.totalSales)}</div>
                            </div>
                            <div className="text-3xl text-slate-400">💰</div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-slate-500">Sum of order amounts</div>

                            <div className="text-sm flex items-center gap-2">
                              {(() => {
                                const change = pctChange(monthMetrics.totalSales, prevMetrics.totalSales);
                                const isUp = change > 0;
                                const isZero = change === 0;
                                return (
                                  <div className={`inline-flex items-center text-sm font-medium ${isZero ? "text-slate-500" : isUp ? "text-emerald-600" : "text-rose-600"}`}>
                                    <span className="text-xs">{isUp ? "▲" : change < 0 ? "▼" : ""}</span>
                                    <span className="ml-1">{Math.abs(change)}%</span>
                                    <span className="text-xs text-slate-400 ml-2">vs prev</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Customers card */}
                  <div className="rounded-lg bg-white shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-[#06B6D4] to-[#3B82F6]" />
                    <div className="p-4">
                      {orderloading ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-100 rounded w-24" />
                          <div className="h-8 bg-gray-100 rounded w-24 mt-2" />
                          <div className="h-3 bg-gray-100 rounded w-40 mt-4" />
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm text-slate-500">Total Customers</div>
                              <div className="text-2xl md:text-3xl font-semibold text-slate-800 mt-2">{monthMetrics.totalCustomers}</div>
                            </div>
                            <div className="text-3xl text-slate-400">🧑‍🤝‍🧑</div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-slate-500">Unique customers this month</div>

                            <div className="text-sm flex items-center gap-2">
                              {(() => {
                                const change = pctChange(monthMetrics.totalCustomers, prevMetrics.totalCustomers);
                                const isUp = change > 0;
                                const isZero = change === 0;
                                return (
                                  <div className={`inline-flex items-center text-sm font-medium ${isZero ? "text-slate-500" : isUp ? "text-emerald-600" : "text-rose-600"}`}>
                                    <span className="text-xs">{isUp ? "▲" : change < 0 ? "▼" : ""}</span>
                                    <span className="ml-1">{Math.abs(change)}%</span>
                                    <span className="text-xs text-slate-400 ml-2">vs prev</span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </main>

            {/* Sidebar */}
            <aside className="bg-[#F0F2F7] border-l border-slate-100 p-4 md:p-8 flex-shrink-0 w-full md:w-auto">
              <div className="md:sticky md:top-6 flex flex-col gap-6">
                <div className="bg-white rounded-md p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Order Status</div>
                      <div className="text-xs text-slate-500 mt-1">Summary of current orders</div>
                    </div>
                    <Link href="/orders">
                      <button className="text-xs border cursor-pointer border-slate-200 px-3 py-1 rounded-md text-slate-700">View All</button>
                    </Link>
                  </div>

                  <div className="mt-6 flex flex-col items-center justify-center gap-4 h-[260px]">
                    {orderloading ? (
                      <div className="w-full flex flex-col items-center gap-4 animate-pulse">
                        <div className="h-36 w-36 rounded-full bg-[#f3f3f3]" />
                        <div className="h-3 w-28 rounded bg-[#f3f3f3]" />
                        <div className="h-3 w-20 rounded bg-[#f3f3f3]" />
                      </div>
                    ) : (
                      <>
                        <div className="w-full md:w-40">
                          <DonutChart orders={orders} size={160} />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-transparent">
                  <h3 className="text-[#000000] text-[16px] font-medium leading-[22px] tracking-[0.5px] mb-3">Pending Confirmations</h3>

                  <div className={`space-y-3 pr-2 ${pendingConfirmations.length > 4 ? "max-h-[calc(100vh-420px)] overflow-y-auto" : ""}`}>
                    {orderloading ? (
                      <>
                        <SkeletonPending />
                        <SkeletonPending />
                        <SkeletonPending />
                      </>
                    ) : pendingConfirmations.length > 0 ? (
                      pendingConfirmations.map((p) => (
                        <div key={p._id} className="bg-white rounded-md p-3 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-sm text-slate-500">
                              {p.customer?.customerName ? p.customer.customerName[0] : "U"}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-medium text-slate-800 truncate">{p.customer?.customerName ?? "Unknown Customer"}</div>
                                <div className="text-xs text-[#252525D1]">{timeAgo(p.createdAt)}</div>
                              </div>

                              <div className="text-sm text-slate-600 mt-1 truncate">{p.garment ?? "—"}</div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-600">No pending confirmations</div>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[14px] shadow-2xl p-4 md:p-6 z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Customer</h3>
            <form onSubmit={handleSubmit} className="space-y-4" ref={modalRef}>
              <div>
                <label className="block text-sm font-medium mb-1">Customer Name*</label>
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter name" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">WhatsApp number*</label>
                <input type="tel" pattern="[0-9]{10}" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Enter" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm" required />
              </div>

              {/* GALLERY SELECTION */}
              <div>
                <label className="block text-sm font-medium mb-1">Select Images</label>
                <button type="button" onClick={() => setShowGallery(true)} className="border border-slate-200 rounded-md px-3 py-2 text-sm bg-[#F9F8FC] w-full sm:w-auto">Choose from Gallery</button>
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {selectedImages.map((url) => (
                      <img key={url} src={url} className="w-16 h-16 rounded-md object-cover border" />
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full rounded-md py-2 cursor-pointer text-white font-medium bg-gradient-to-r from-[#6b21a8] to-[#a78bfa]">Save</button>
            </form>
          </div>
        </div>
      )}

      {/* Use SendImagesModal (replacement for the previous GallerySelectorModal) */}
      <SendImagesModal
        isOpen={showGallery}
        onClose={() => setShowGallery(false)}
        selectedOrder={null}
        galleryItems={galleryItems}
        galleryLoading={galleryLoading}
        galleryError={galleryError}
        onSendImages={handleSendImagesFromModal}
      />
    </div>
  );
}
