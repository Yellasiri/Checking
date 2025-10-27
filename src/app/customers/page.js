// "use client";

// import { useMemo, useState, useEffect, useRef } from "react";
// import { FiChevronDown, FiX } from "react-icons/fi";
// import { Poppins } from "next/font/google";
// import { IoIosArrowDown } from "react-icons/io";
// import { useGetCustomers } from "../hooks/usegetcustomerdetails";
// import { useGetStaff } from "../hooks/usegetstaff";
// import toast, { Toaster } from "react-hot-toast";
// import SendImagesModal from "../components/SendImagesModal"; // adjust path if needed

// const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// const Spinner = () => (
//   <div className="flex justify-center items-center h-24">
//     <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary-600"></div>
//   </div>
// );

// const INR = (n) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(n);

// /* group orders by day label like "01 Aug" */
// const groupByDateLabel = (items) => {
//   const m = new Map();
//   items.forEach((o) => {
//     const d = new Date(o.createdAt);
//     const key = d.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//     });
//     if (!m.has(key)) m.set(key, []);
//     m.get(key).push(o);
//   });
//   return Array.from(m.entries());
// };

// export default function CustomersPage() {
//   const [q, setQ] = useState("");
//   const [expandedId, setExpandedId] = useState(null);

//   const { customers, customerLoading, customerError } = useGetCustomers();
//   const { staff, loading: staffLoading } = useGetStaff();
//   const [staffList, setStaffList] = useState([]);

//   useEffect(() => {
//     if (!staffLoading && staff?.length > 0) setStaffList(staff);
//   }, [staff, staffLoading]);

//   // Deduplicate customers
//   const uniqueCustomers = useMemo(() => {
//     if (!customers) return [];
//     const m = new Map();
//     customers.forEach((c) => {
//       if (c && c._id) m.set(c._id, c);
//     });
//     return Array.from(m.values());
//   }, [customers]);

//   const filteredcustomers = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return uniqueCustomers;
//     return uniqueCustomers.filter(
//       (c) =>
//         (c?.customerName || "").toLowerCase().includes(s) ||
//         (c?.phone || c?.mobileNumber || "").toLowerCase().includes(s)
//     );
//   }, [q, uniqueCustomers]);

//   const toggle = (id) => setExpandedId((cur) => (cur === id ? null : id));

//   // filters
//   const [genderFilter, setGenderFilter] = useState("Gender");
//   const [contactedFilter, setContactedFilter] = useState("Contacted on WhatsApp");

//   // Add Order Modal State
//   const [showForm, setShowForm] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [form, setForm] = useState({
//     customerName: "",
//     phone: "",
//     garment: "",
//     deliveryDate: "",
//     designImage: "", // string URL or File
//     instructions: "",
//     measurements: [{ label: "", value: "" }],
//     handwrittenImageUrl: "",
//     staff: "",
//     totalPayment: "",
//     advancePayment: "",
//     sendWhatsapp: false,
//   });

//   const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

//   // measurements helpers
//   function updateMeasurement(idx, key, value) {
//     setForm((s) => ({
//       ...s,
//       measurements: s.measurements.map((m, i) =>
//         i === idx ? { ...m, [key === "area" ? "label" : key]: value } : m
//       ),
//     }));
//   }
//   function addMeasurementRow() {
//     setForm((s) => ({
//       ...s,
//       measurements: [...s.measurements, { label: "", value: "" }],
//     }));
//   }
//   function removeMeasurementRow(idx) {
//     setForm((s) => ({
//       ...s,
//       measurements: s.measurements.filter((_, i) => i !== idx) || [
//         { label: "", value: "" },
//       ],
//     }));
//   }

//   // preview + parsing state
//   const [handwrittenFile, setHandwrittenFile] = useState(null);
//   const prevUrlRef = useRef(null);
//   useEffect(
//     () => () => {
//       if (prevUrlRef.current) {
//         URL.revokeObjectURL(prevUrlRef.current);
//         prevUrlRef.current = null;
//       }
//     },
//     []
//   );

//   const [isParsingHandwritten, setIsParsingHandwritten] = useState(false);

//   // Date parser (same as your original)
//   function toISODate(raw) {
//     if (!raw) return null;
//     const s = String(raw).trim();

//     const isoMatch = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
//     if (isoMatch) {
//       const yyyy = isoMatch[1];
//       const mm = String(Number(isoMatch[2])).padStart(2, "0");
//       const dd = String(Number(isoMatch[3])).padStart(2, "0");
//       return `${yyyy}-${mm}-${dd}`;
//     }

//     const cleaned = s
//       .replace(/\./g, "-")
//       .replace(/\//g, "-")
//       .replace(/\s+/g, " ")
//       .replace(/–/g, "-")
//       .trim();
//     const months = {
//       jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
//       apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
//       aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10,
//       october: 10, nov: 11, november: 11, dec: 12, december: 12,
//     };

//     let m = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
//     if (m) {
//       let [_, d, mon, y] = m;
//       d = String(Number(d)).padStart(2, "0");
//       mon = Number(mon);
//       if (mon < 1 || mon > 12) return null;
//       if (String(y).length === 2) y = Number(y) > 50 ? "19" + y : "20" + y;
//       return `${String(y)}-${String(mon).padStart(2, "0")}-${d}`;
//     }

//     m = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
//     if (m) {
//       let [_, d, monName, y] = m;
//       const mn = monName.toLowerCase();
//       const monNum = months[mn];
//       if (!monNum) return null;
//       d = String(Number(d)).padStart(2, "0");
//       if (String(y).length === 2) y = Number(y) > 50 ? "19" + y : "20" + y;
//       return `${String(y)}-${String(monNum).padStart(2, "0")}-${d}`;
//     }

//     m = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/);
//     if (m) {
//       let [_, monName, d, y] = m;
//       const monNum = months[monName.toLowerCase()];
//       if (!monNum) return null;
//       d = String(Number(d)).padStart(2, "0");
//       if (String(y).length === 2) y = Number(y) > 50 ? "19" + y : "20" + y;
//       return `${String(y)}-${String(monNum).padStart(2, "0")}-${d}`;
//     }

//     const parsed = new Date(cleaned);
//     if (!isNaN(parsed.getTime())) {
//       const yyyy = parsed.getFullYear();
//       const mm = String(parsed.getMonth() + 1).padStart(2, "0");
//       const dd = String(parsed.getDate()).padStart(2, "0");
//       return `${yyyy}-${mm}-${dd}`;
//     }
//     return null;
//   }

//   function normalizeMeasurements(parsedMeasurements) {
//     const defaultOrder = ["Bust", "Waist", "Length", "Hip", "Shoulder", "Sleeve"];
//     if (!Array.isArray(parsedMeasurements)) return [{ label: "", value: "" }];
//     const mapped = parsedMeasurements.map((m, idx) => {
//       let label = (m.label || "").toString().trim();
//       if (!label) label = defaultOrder[idx] || `Measurement ${idx + 1}`;
//       return { label, value: m.value != null ? String(m.value).trim() : "" };
//     });
//     return mapped.length ? mapped : [{ label: "", value: "" }];
//   }

//   function findStaffIdByName(staffName, staffListLocal) {
//     if (!staffName || !staffListLocal?.length) return null;
//     const lc = staffName.trim().toLowerCase();
//     const exact = staffListLocal.find((s) => (s.name || "").toLowerCase() === lc);
//     if (exact) return exact._id;
//     const inc = staffListLocal.find((s) => (s.name || "").toLowerCase().includes(lc));
//     if (inc) return inc._id;
//     return null;
//   }

//   function applyParsedToForm(parsed) {
//     if (!parsed) return;
//     setForm((prev) => {
//       const next = { ...prev };
//       if (parsed.customerName) next.customerName = parsed.customerName;
//       if (parsed.phone) {
//         const digits = (parsed.phone || "").replace(/\D/g, "");
//         next.phone = digits.length ? (digits.length > 10 ? digits.slice(-10) : digits) : prev.phone;
//       }
//       if (parsed.garment) next.garment = parsed.garment;
//       if (parsed.deliveryDate) {
//         const iso = toISODate(parsed.deliveryDate);
//         if (iso) {
//           next.deliveryDate = iso;
//         } else {
//           next.instructions =
//             (next.instructions ? next.instructions + "; " : "") +
//             `Parsed delivery date: "${parsed.deliveryDate}" (please confirm)`;
//         }
//       }
//       if (parsed.instructions)
//         next.instructions = prev.instructions
//           ? `${prev.instructions}; ${parsed.instructions}`
//           : parsed.instructions;
//       if (parsed.measurements)
//         next.measurements = normalizeMeasurements(parsed.measurements);
//       if (parsed.totalPayment != null) next.totalPayment = String(parsed.totalPayment);
//       if (parsed.advancePayment != null) next.advancePayment = String(parsed.advancePayment);
//       if (parsed.staffName) {
//         const staffId = findStaffIdByName(parsed.staffName, staffList);
//         if (staffId) next.staff = staffId;
//         else
//           next.instructions =
//             (next.instructions ? next.instructions + "; " : "") +
//             `Parsed staff: ${parsed.staffName}`;
//       }
//       return next;
//     });
//   }

//   async function handleHandwrittenFileChange(e) {
//     const f = e.target.files?.[0];
//     if (!f) {
//       if (prevUrlRef.current) {
//         URL.revokeObjectURL(prevUrlRef.current);
//         prevUrlRef.current = null;
//       }
//       setHandwrittenFile(null);
//       setForm((s) => ({ ...s, handwrittenImageUrl: "" }));
//       return;
//     }

//     const url = URL.createObjectURL(f);
//     if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
//     prevUrlRef.current = url;
//     setHandwrittenFile({ file: f, url });

//     if (isParsingHandwritten) return;
//     setIsParsingHandwritten(true);

//     try {
//       const fd = new FormData();
//       fd.append("file", f);
//       const res = await fetch("/api/parse-handwritten", {
//         method: "POST",
//         body: fd,
//       });
//       const data = await res.json().catch(() => null);

//       if (data?.success && data.parsed) {
//         const parsed = { ...data.parsed };
//         if (parsed.deliveryDate) {
//           const iso = toISODate(parsed.deliveryDate);
//           if (iso) parsed.deliveryDate = iso;
//         }
//         applyParsedToForm(parsed);
//         toast.success("Fields auto-filled from handwritten note!");
//       } else {
//         if (data?.rawText) {
//           try {
//             await navigator.clipboard.writeText(data.rawText);
//           } catch (_) {}
//           toast.error("Could not reliably extract fields. Raw text copied to clipboard.");
//         } else {
//           toast.error("Could not extract fields, please fill manually.");
//         }
//       }
//     } catch (err) {
//       console.error("Error parsing handwritten image:", err);
//       toast.error("Error parsing handwritten image");
//     } finally {
//       setIsParsingHandwritten(false);
//     }
//   }

//   // Hidden fallback file input (kept in case you want to allow upload from computer)
//   const hiddenFileInputRef = useRef(null);
//   const handleHiddenFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     // store the File so upload flow remains the same
//     update("designImage", file);
//   };

//   // ---------- Gallery modal states ----------
//   const [showGalleryModal, setShowGalleryModal] = useState(false);
//   const [galleryItems, setGalleryItems] = useState([]);
//   const [galleryLoading, setGalleryLoading] = useState(false);
//   const [galleryError, setGalleryError] = useState(null);

//   // fetch gallery when needed

// useEffect(() => {
//   if (!showGalleryModal) return;
//   let mounted = true;

//   async function fetchGallery() {
//     setGalleryLoading(true);
//     setGalleryError(null);
//     try {
//       console.log("[Gallery] fetching gallery from /api/v1/gallery/get-gallery");
//       const res = await fetch("/api/v1/gallery/get-gallery", {
//         method: "GET",
//         headers: {
//           "Accept": "application/json",
//           // add Authorization if required
//         },
//       });

//       console.log("[Gallery] HTTP", res.status);
//       const data = await res.json().catch((err) => {
//         console.warn("[Gallery] json parse failed", err);
//         return null;
//       });

//       console.log("[Gallery] response body:", data);

//       if (!mounted) return;

//       // Try to find an array in the response in a flexible way (case-insensitive keys)
//       let arr = null;

//       if (Array.isArray(data)) {
//         arr = data;
//       } else if (data && typeof data === "object") {
//         // common exact keys
//         if (Array.isArray(data.items)) arr = data.items;
//         else if (Array.isArray(data.gallery)) arr = data.gallery;
//         else if (Array.isArray(data.GalleryItems)) arr = data.GalleryItems;
//         else if (Array.isArray(data.data)) arr = data.data;
//         else {
//           // fallback: pick the first value that is an array of objects with an _id or url
//           for (const key of Object.keys(data)) {
//             const val = data[key];
//             if (Array.isArray(val) && val.length > 0 && (val[0]._id || val[0].url || val[0].src)) {
//               arr = val;
//               break;
//             }
//           }
//         }
//       }

//       if (Array.isArray(arr)) {
//         setGalleryItems(arr);
//       } else {
//         setGalleryItems([]);
//         setGalleryError("Unexpected response shape (see console)");
//         console.warn("[Gallery] could not find array in response:", data);
//       }
//     } catch (err) {
//       console.error("[Gallery] fetch error:", err);
//       setGalleryError("Error loading gallery (check console/network)");
//     } finally {
//       if (mounted) setGalleryLoading(false);
//     }
//   }

//   fetchGallery();
//   return () => {
//     mounted = false;
//   };
// }, [showGalleryModal]);


//   // Called when user clicks the design-image area in Add Order form
//   function openGalleryForDesignImage() {
//     setShowGalleryModal(true);
//     document.body.style.overflow = "hidden";
//   }

//   function closeGalleryModal() {
//     setShowGalleryModal(false);
//     document.body.style.overflow = "";
//   }

//   // Handler when user selects images from gallery: we'll use the first selected image as sample design
//   function handleGallerySelection(selectedImageIds = [], activeCategory = null) {
//     // find first selected image's URL
//     const firstId = selectedImageIds?.[0];
//     const img = galleryItems.find((g) => g._id === firstId);
//     if (img) {
//       // store the URL string (our code will handle string vs File)
//       update("designImage", img.url || img.src || "");
//     }
//     closeGalleryModal();
//     toast.success("Selected image added to the form");
//   }

//   const handleDesignImageChange = (e) => {
//     // kept for fallback direct upload from computer if you ever want to enable it
//     const file = e.target.files?.[0];
//     if (!file) return;
//     update("designImage", file);
//   };

//   async function uploadFileToS3(file) {
//     if (!file) return "";
//     const fd = new FormData();
//     fd.append("file", file);
//     const res = await fetch("/api/s3/upload", { method: "POST", body: fd });
//     const data = await res.json();
//     if (res.ok && data.url) return data.url;
//     throw new Error(data.error || "Upload failed");
//   }

//   const handleAddOrder = async (e) => {
//     e.preventDefault();
//     const toastLoading = toast.loading("Creating order...");
//     try {
//       if (!form.customerName?.trim()) {
//         toast.error("Customer name is required", { id: toastLoading });
//         return;
//       }
//       if (!form.phone?.trim()) {
//         toast.error("Phone is required", { id: toastLoading });
//         return;
//       }
//       if (!form.garment?.trim()) {
//         toast.error("Garment is required", { id: toastLoading });
//         return;
//       }
//       if (!form.deliveryDate) {
//         toast.error("Delivery date is required", { id: toastLoading });
//         return;
//       }
//       if (!form.staff) {
//         toast.error("Please assign a staff", { id: toastLoading });
//         return;
//       }
//       if (
//         form.totalPayment &&
//         form.advancePayment &&
//         Number(form.advancePayment) > Number(form.totalPayment)
//       ) {
//         toast.error("Advance cannot be greater than total", { id: toastLoading });
//         return;
//       }

//       let sampleDesignImageUrl = "";
//       // If designImage is a File -> upload; if it's a string -> use directly
//       if (form.designImage instanceof File) {
//         const maxMB = 5;
//         if (form.designImage.size / (1024 * 1024) > maxMB) {
//           toast.error(`Image must be smaller than ${maxMB}MB`, { id: toastLoading });
//           return;
//         }
//         sampleDesignImageUrl = await uploadFileToS3(form.designImage);
//       } else if (typeof form.designImage === "string" && form.designImage.trim()) {
//         sampleDesignImageUrl = form.designImage;
//       }

//       const payload = {
//         customerName: form.customerName,
//         phoneNumber: form.phone,
//         garment: form.garment,
//         deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : null,
//         sampleDesignImageUrl,
//         specialInstructions: form.instructions || "",
//         measurements: form.measurements?.filter((m) => m.label && m.value),
//         handwrittenImageUrl: form.handwrittenImageUrl,
//         staffAssigned: form.staff,
//         advancePayment: Number(form.advancePayment) || 0,
//         totalPayment: Number(form.totalPayment) || 0,
//         sendWhatsAppSummary: !!form.sendWhatsapp,
//       };

//       const res = await fetch("/api/v1/orders/create-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       const data = await res.json().catch(() => ({}));
//       if (res.ok && !data.error) {
//         toast.success("Order created!", { id: toastLoading });
//         setShowForm(false);
//         setForm({
//           customerName: "",
//           phone: "",
//           garment: "",
//           deliveryDate: "",
//           designImage: "",
//           instructions: "",
//           measurements: [{ label: "", value: "" }],
//           handwrittenImageUrl: "",
//           staff: "",
//           totalPayment: "",
//           advancePayment: "",
//           sendWhatsapp: false,
//         });
//         // Optionally refetch customers here
//         window.location.reload();
//       } else {
//         console.error("Create order failed:", data);
//         toast.error(data?.error || "Error creating order", { id: toastLoading });
//       }
//     } catch (err) {
//       console.error("Error creating order:", err);
//       toast.error(err?.message || "Error creating order", { id: toastLoading });
//     }
//   };

//   const openAddOrderForm = (customer) => {
//     setSelectedCustomer(customer);
//     setForm({
//       customerName: customer.customerName || "",
//       phone: customer.mobileNumber || customer.phone || "",
//       garment: "",
//       deliveryDate: "",
//       designImage: "",
//       instructions: "",
//       measurements: [{ label: "", value: "" }],
//       handwrittenImageUrl: "",
//       staff: "",
//       totalPayment: "",
//       advancePayment: "",
//       sendWhatsapp: false,
//     });
//     setShowForm(true);
//     document.body.style.overflow = "hidden";
//   };

//   const closeAddOrderForm = () => {
//     setShowForm(false);
//     setSelectedCustomer(null);
//     document.body.style.overflow = "";
//   };

//   if (customerLoading) {
//     return <Spinner />;
//   }

//   return (
//     <div className={`${poppins.className} min-h-screen`}>
//       <Toaster />
//       <div className="mx-auto max-w-[1180px] h-[calc(100vh-48px)] rounded-[22px] bg-white p-3 sm:p-6 shadow-xl overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="sm:mb-5">
//           <h1 className="text-[18px] sm:text-[20px] leading-[35px] font-semibold text-[#252525]">
//             Customer Management
//           </h1>
//         </div>

//         {/* Filters */}
//         <div className="mb-3">
//           {/* desktop filter bar */}
//           <div className="hidden sm:block sm:px-[3rem]">
//             <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
//               <div className="flex flex-nowrap w-full rounded-xl bg-[#F9F8FC]">
//                 <div className="relative flex items-center justify-between gap-2 px-6 py-2 border-r border-slate-200 whitespace-nowrap min-w-[160px]">
//                   <span className="text-sm text-[#252525]">{genderFilter ?? "Gender"}</span>
//                   <IoIosArrowDown className="text-[#252525] text-[14px]" />
//                   <select
//                     value={genderFilter}
//                     onChange={(e) => setGenderFilter(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   >
//                     <option>Gender</option>
//                     <option>Female</option>
//                     <option>Male</option>
//                   </select>
//                 </div>

//                 <div className="relative flex items-center justify-between gap-2 px-6 py-2 border-r border-slate-200 whitespace-nowrap min-w-[220px]">
//                   <span className="text-sm text-[#252525]">{contactedFilter ?? "Contacted on WhatsApp"}</span>
//                   <IoIosArrowDown className="text-[#252525] text-[14px]" />
//                   <select
//                     value={contactedFilter}
//                     onChange={(e) => setContactedFilter(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   >
//                     <option>Contacted on WhatsApp</option>
//                     <option>Yes</option>
//                     <option>No</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center gap-2 px-4 py-2 flex-1 min-w-0">
//                   <input
//                     value={q}
//                     onChange={(e) => setQ(e.target.value)}
//                     placeholder="Search by name, phone..."
//                     className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60"
//                   />
//                   <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
//                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
//                       <path d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* mobile filters */}
//           <div className="sm:hidden">
//             <div className="flex gap-2">
//               <select
//                 value={genderFilter}
//                 onChange={(e) => setGenderFilter(e.target.value)}
//                 className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
//               >
//                 <option>Gender</option>
//                 <option>Female</option>
//                 <option>Male</option>
//               </select>

//               <select
//                 value={contactedFilter}
//                 onChange={(e) => setContactedFilter(e.target.value)}
//                 className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
//               >
//                 <option>Contacted on</option>
//                 <option>Yes</option>
//                 <option>No</option>
//               </select>
//             </div>

//             <div className="mt-2 flex items-center gap-2">
//               <input
//                 value={q}
//                 onChange={(e) => setQ(e.target.value)}
//                 placeholder="Search by name or phone"
//                 className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
//               />
//               <button className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white grid place-items-center">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
//                   <path d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Content area - scrollable */}
//         <div className="flex-1 overflow-y-auto sm:pr-4 mt-4 no-scrollbar">
//           <div className="space-y-6">
//             {!customerLoading &&
//               !customerError &&
//               filteredcustomers.map((cust) => {
//                 const isOpen = expandedId === cust._id;

//                 return (
//                   <div key={cust._id} className="rounded-lg overflow-hidden border border-slate-100">
//                     {/* header */}
//                     <div
//                       className={`text-[16px] font-medium leading-[12px] tracking-[0.5px] text-white px-6 py-3 flex justify-between items-center rounded-t-xl ${
//                         (cust.orders || []).length > 0
//                           ? "bg-gradient-to-r from-[#0FA958] to-[#47D58E]"
//                           : "bg-gradient-to-r from-[#4C2699] to-[#936EDD]"
//                       }`}
//                     >
//                       <div className="text-sm font-medium">
//                         {cust.customerName}{" "}
//                         <span className="text-xs font-normal">({cust.mobileNumber || cust.phone})</span>
//                       </div>

//                       <div className="flex items-center gap-3">
//                         {/* Add Order Button */}
//                         <button
//                           onClick={() => openAddOrderForm(cust)}
//                           className="rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
//                         >
//                           + Add Order
//                         </button>

//                         {(cust.orders || []).length > 0 && (
//                           <>
//                             <div className="text-sm hidden sm:block text-white/90 mr-2">
//                               {cust.orders.length} {cust.orders.length === 1 ? "order" : "orders"}
//                             </div>

//                             <button
//                               onClick={() => toggle(cust._id)}
//                               aria-expanded={isOpen}
//                               aria-controls={`orders-${cust._id}`}
//                               className="flex items-center gap-2 text-sm font-medium"
//                             >
//                               <span className="underline hidden sm:block">{isOpen ? "Hide Orders" : "View Orders"}</span>
//                               <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
//                                 <FiChevronDown />
//                               </span>
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </div>

//                     {/* animated container */}
//                     <div
//                       id={`orders-${cust._id}`}
//                       role="region"
//                       aria-hidden={!isOpen}
//                       style={{
//                         maxHeight: isOpen ? "1200px" : "0px",
//                         transition: "max-height 300ms ease-in-out",
//                       }}
//                       className="overflow-hidden"
//                     >
//                       {/* expanded orders panel */}
//                       <div className="p-4 sm:p-6 bg-[#F4F0FB] border-t border-slate-100">
//                         <div className="max-h-[560px] overflow-y-auto pr-2 no-scrollbar">
//                           <div className="relative">
//                             <div className="hidden md:block absolute top-6 bottom-6 left-[140px]">
//                               <div className="w-px h-full bg-dotted" />
//                             </div>

//                             <div className="space-y-6">
//                               {groupByDateLabel(cust.orders || []).map(([dateLabel, orders]) => (
//                                 <div
//                                   key={`${dateLabel}-${cust._id}`}
//                                   className="grid grid-cols-[140px_1fr_180px] text-[#252525D1] text-[12px] font-medium leading-[22px] tracking-[0.5px] gap-6 relative"
//                                 >
//                                   <div style={{ left: 140 }} className="absolute">
//                                     <div className="timeline-dot" />
//                                   </div>

//                                   <div className="flex items-center gap-2 md:block">
//                                     <div className="text-[15px] font-semibold">{dateLabel}</div>
//                                     <div className="md:hidden w-2 h-2 rounded-full bg-[#6b4fd3] ml-2" />
//                                   </div>

//                                   <div className="pr-4">
//                                     {orders.length > 0 &&
//                                       orders.map((o) => (
//                                         <div key={o._id} className="mb-6 pb-6 border-b last:border-b-0 border-slate-200">
//                                           <div className="text-sm text-[#252525D1]">
//                                             <div className="mb-2 text-[12px] leading-[22px] tracking-[0.5px] text-[#252525D1]">
//                                               Order ID:{" "}
//                                               <span className="text-[#252525D1] font-medium">{o._id.slice(-6).toUpperCase()}</span>
//                                             </div>

//                                             <div className="mb-1 text-[13px]">
//                                               <span className="font-semibold">Delivery Date:</span>{" "}
//                                               <span>
//                                                 {new Date(o.deliveryDate).toLocaleDateString("en-GB", {
//                                                   day: "numeric",
//                                                   month: "long",
//                                                   year: "numeric",
//                                                 })}
//                                               </span>
//                                             </div>

//                                             <div className="mb-1 text-[13px]">
//                                               <span className="font-semibold">Garment Type:</span>{" "}
//                                               <span>{o.garment}</span>
//                                             </div>

//                                             <div className="mb-1">
//                                               <span className="text-[#252525D1] font-medium leading-[22px] tracking-[0.5px] text-[13px]">
//                                                 Tailor Assigned: {o.staffAssigned?.name}
//                                               </span>
//                                             </div>

//                                             <div className="mt-3 text-[#D68B08] font-semibold leading-[22px] tracking-[0.5px] text-[13px]">
//                                               Amount Left: {INR(o.totalPayment - o.advancePayment)}
//                                             </div>

//                                             <div className="mt-3 font-semibold text-[14px] text-[#252525F7]">Measurements</div>

//                                             <div className="text-[13px] text-[#252525D1] leading-[22px] tracking-[0.5px]">
//                                               {o.measurements.map((m, idx) => (
//                                                 <span key={idx} className="inline-block mr-3">
//                                                   {m.label}: {m.value}
//                                                 </span>
//                                               ))}
//                                             </div>
//                                           </div>
//                                         </div>
//                                       ))}
//                                   </div>

//                                   <div className="text-right pt-1">
//                                     {orders.map((o) => (
//                                       <div key={o._id} className="mb-6">
//                                         <div className="text-[13px] text-[#5E3BA4] font-semibold leading-[22px] tracking-[0.5px]">
//                                           Total : {INR(o.totalPayment)}
//                                         </div>

//                                         <div
//                                           className={`mt-2 font-medium text-[12px] ${
//                                             o.status === "Completed" ? "text-[#026915]" : "text-[#D98C08]"
//                                           }`}
//                                         >
//                                           {o.status}
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>

//         {/* Add Order Form Modal (unchanged mostly) */}
//         <div
//           className={`fixed inset-0 z-50 ${showForm ? "pointer-events-auto" : "pointer-events-none"}`}
//           aria-hidden={!showForm}
//         >
//           <div
//             className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${showForm ? "opacity-100" : "opacity-0"}`}
//             onClick={closeAddOrderForm}
//           />
//           <div
//             className={`absolute left-[50%] sm:left-[58.5%] -translate-x-1/2 w-full max-w-[1220px] transition-transform duration-300 ${
//               showForm ? "translate-y-0" : "-translate-y-full"
//             }`}
//           >
//             <div className="mx-4 mt-6 rounded-2xl bg-white shadow-2xl max-h-[80vh] sm:max-h-[75vh] overflow-y-auto">
//               <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
//                 <h3 className="text-lg font-semibold text-[#252525]">
//                   Add Order for {selectedCustomer?.customerName}
//                 </h3>
//                 <button
//                   onClick={closeAddOrderForm}
//                   className="text-sm text-slate-500 hover:text-slate-700"
//                 >
//                   Cancel
//                 </button>
//               </div>

//               <form
//                 onSubmit={(e) => {
//                   handleAddOrder(e);
//                   e.preventDefault();
//                 }}
//                 className="px-6 py-6 bg-[#F6F7FA]"
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   {/* Handwritten file */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Upload handwritten image
//                     </label>
//                     <div className="flex items-center gap-3">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleHandwrittenFileChange}
//                         disabled={isParsingHandwritten}
//                         aria-label="Upload handwritten order image"
//                         aria-busy={isParsingHandwritten ? "true" : "false"}
//                         className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${
//                           isParsingHandwritten ? "opacity-60 cursor-not-allowed" : ""
//                         }`}
//                       />
//                       <div className="w-[96px] flex items-center gap-2">
//                         {isParsingHandwritten ? (
//                           <div className="flex items-center gap-2">
//                             <svg
//                               className="animate-spin h-5 w-5 text-[#13234B]"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               aria-hidden="true"
//                             >
//                               <circle
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="3"
//                                 className="opacity-20"
//                               />
//                               <path
//                                 d="M4 12a8 8 0 018-8"
//                                 stroke="currentColor"
//                                 strokeWidth="3"
//                                 strokeLinecap="round"
//                               />
//                             </svg>
//                             <span className="text-xs text-slate-600">Parsing…</span>
//                           </div>
//                         ) : (
//                           <div className="text-xs text-slate-400">Ready</div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   {/* Customer name */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Customer Name*
//                     </label>
//                     <input
//                       value={form.customerName}
//                       onChange={(e) => update("customerName", e.target.value)}
//                       placeholder="Enter full name"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                       required
//                     />
//                   </div>

//                   {/* Phone */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Phone Number*
//                     </label>
//                     <input
//                       type="tel"
//                       value={form.phone}
//                       onChange={(e) => update("phone", e.target.value)}
//                       placeholder="Enter number"
//                       maxLength={10}
//                       pattern="[0-9]*"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                       required
//                     />
//                   </div>

//                   {/* Garment */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       What garment is being stitched*
//                     </label>
//                     <input
//                       value={form.garment}
//                       onChange={(e) => update("garment", e.target.value)}
//                       placeholder="Enter"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                       required
//                     />
//                   </div>

//                   {/* Delivery date */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Delivery date*
//                     </label>
//                     <input
//                       type="date"
//                       value={form.deliveryDate}
//                       onChange={(e) => update("deliveryDate", e.target.value)}
//                       className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                       required
//                     />
//                   </div>

//                   {/* Instructions */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Any special instructions
//                     </label>
//                     <input
//                       value={form.instructions}
//                       onChange={(e) => update("instructions", e.target.value)}
//                       placeholder="Enter"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                     />
//                   </div>

//                   {/* Design image + Staff assigned */}
//                   <div className="md:col-span-2">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start rounded-lg p-4 border border-[#F3E8D6] bg-gradient-to-r from-[#FFF8EE] to-[#FFF3E8]">
//                       <div>
//                         <label className="block text-sm font-medium text-[#252525] mb-1">
//                           Sample design image
//                         </label>

//                         {/* Design image selector: clicking opens gallery modal (instead of file picker) */}
//                         <div className="flex items-center gap-3">
//                           <div
//                             role="button"
//                             onClick={openGalleryForDesignImage}
//                             className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none flex items-center gap-3 cursor-pointer hover:shadow-sm"
//                             aria-label="Choose sample design from gallery"
//                           >
//                             {form.designImage ? (
//                               <>
//                                 <div className="w-14 h-14 rounded-md overflow-hidden border">
//                                   {typeof form.designImage === "string" ? (
//                                     // preview URL
//                                     // eslint-disable-next-line @next/next/no-img-element
//                                     <img src={form.designImage} alt="design" className="w-full h-full object-cover" />
//                                   ) : form.designImage instanceof File ? (
//                                     // preview local File
//                                     <img
//                                       src={URL.createObjectURL(form.designImage)}
//                                       alt="design"
//                                       className="w-full h-full object-cover"
//                                     />
//                                   ) : null}
//                                 </div>
//                                 <div className="text-sm text-slate-700">Change / Select from gallery</div>
//                               </>
//                             ) : (
//                               <div className="text-sm text-slate-500">Click to select from gallery</div>
//                             )}
//                           </div>

//                           {/* Keep a hidden file input as fallback (optional) */}
//                           <input
//                             ref={hiddenFileInputRef}
//                             type="file"
//                             accept="image/*"
//                             onChange={handleHiddenFileChange}
//                             style={{ display: "none" }}
//                           />

//                           <div className="flex flex-col gap-2">
//                             {/* <button
//                               type="button"
//                               onClick={() => {
//                                 // provide a way to open native file picker as fallback (optional)
//                                 hiddenFileInputRef.current?.click();
//                               }}
//                               className="px-3 py-2 rounded-md border text-sm font-medium bg-white hover:bg-slate-50"
//                             >
//                               Upload
//                             </button> */}
//                             <button
//                               type="button"
//                               onClick={() => update("designImage", "")}
//                               className="px-3 py-2 rounded-md border text-sm font-medium bg-white hover:bg-slate-50"
//                             >
//                               Clear
//                             </button>
//                           </div>
//                         </div>

//                         <p className="mt-2 text-xs text-slate-500">
//                           Select a reference image from the gallery. (You can also upload if needed.)
//                         </p>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-[#252525] mb-1">
//                           Staff Assigned*
//                         </label>
//                         <div className="relative">
//                           <select
//                             value={form.staff}
//                             onChange={(e) => update("staff", e.target.value)}
//                             className="w-full appearance-none rounded-md border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                             required
//                             aria-label="Select staff assigned"
//                           >
//                             <option value="" disabled>
//                               Select
//                             </option>
//                             {staffList?.map((s) => (
//                               <option key={s._id} value={s._id}>
//                                 {s.name}
//                               </option>
//                             ))}
//                           </select>
//                           <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//                             <IoIosArrowDown />
//                           </span>
//                           <p className="mt-2 text-xs text-slate-500">
//                             Assign a staff member for this order.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Measurements */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Measurements*
//                     </label>
//                     <div className="space-y-3">
//                       {form.measurements.map((m, idx) => (
//                         <div key={idx} className="grid grid-cols-12 gap-3 items-center">
//                           <div className="col-span-5">
//                             <input
//                               value={m.label}
//                               onChange={(e) => updateMeasurement(idx, "area", e.target.value)}
//                               placeholder="Area of measurement (e.g., Bust)"
//                               className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                               required={idx === 0}
//                             />
//                           </div>
//                           <div className="col-span-5">
//                             <input
//                               value={m.value}
//                               onChange={(e) => updateMeasurement(idx, "value", e.target.value)}
//                               placeholder="Measurement (e.g., 34)"
//                               className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                               required={idx === 0}
//                             />
//                           </div>
//                           <div className="col-span-2 flex items-center gap-2">
//                             <button
//                               type="button"
//                               onClick={addMeasurementRow}
//                               className="px-3 py-2 rounded-md bg-white border text-sm font-medium hover:bg-slate-50"
//                               aria-label="Add measurement"
//                             >
//                               +
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => removeMeasurementRow(idx)}
//                               className="px-3 py-2 rounded-md bg-white border text-sm font-medium hover:bg-slate-50"
//                               aria-label="Remove measurement"
//                             >
//                               −
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="text-xs text-slate-500 mt-2">
//                       Click + to add another measurement row. You can remove rows with −.
//                     </div>
//                   </div>

//                   {/* Payments */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Total Payment*
//                     </label>
//                     <input
//                       value={form.totalPayment}
//                       type="number"
//                       min="0"
//                       onChange={(e) => update("totalPayment", e.target.value)}
//                       placeholder="Enter"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-[#252525] mb-1">
//                       Advance Payment
//                     </label>
//                     <input
//                       value={form.advancePayment}
//                       type="number"
//                       min="0"
//                       max={form.totalPayment}
//                       onChange={(e) => update("advancePayment", e.target.value)}
//                       placeholder="Enter"
//                       className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                     />
//                   </div>

//                   <div className="md:col-span-2">
//                     <label className="inline-flex items-center gap-3 text-sm text-[#252525]">
//                       <input
//                         type="checkbox"
//                         checked={form.sendWhatsapp}
//                         onChange={(e) => update("sendWhatsapp", e.target.checked)}
//                         className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
//                       />
//                       Send order summary to customer on WhatsApp
//                     </label>
//                   </div>
//                 </div>

//                 <div className="mt-8 flex items-center justify-end gap-3">
//                   <button
//                     type="button"
//                     onClick={closeAddOrderForm}
//                     className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm text-[#252525] hover:bg-slate-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="rounded-lg bg-[#13234B] text-white px-6 py-2 text-sm font-medium hover:brightness-110"
//                   >
//                     Save Order
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>

//         {/* Gallery modal used only for design-image selection */}
//         <SendImagesModal
//           isOpen={showGalleryModal}
//           onClose={closeGalleryModal}
//           selectedOrder={selectedCustomer}
//           galleryItems={galleryItems}
//           galleryLoading={galleryLoading}
//           galleryError={galleryError}
//           onSendImages={handleGallerySelection}
//         />

//         {/* Styles */}
//         <style jsx>{`
//           :global(.no-scrollbar) {
//             -ms-overflow-style: none;
//             scrollbar-width: none;
//           }
//           :global(.no-scrollbar::-webkit-scrollbar) {
//             display: none;
//           }

//           :global(.bg-dotted) {
//             background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
//             background-size: 1px 8px;
//             background-repeat: repeat-y;
//           }

//           :global(.timeline-dot) {
//             width: 10px;
//             height: 10px;
//             background-color: #6b4fd3;
//             border-radius: 50%;
//             box-shadow: 0 0 0 4px rgba(107, 79, 211, 0.06);
//           }

//           @media (max-width: 767px) {
//             .rounded-lg > div[role="region"] > div {
//               padding-left: 12px;
//               padding-right: 12px;
//             }
//           }
//         `}</style>
//       </div>
//     </div>
//   );
// }






















"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import { Poppins } from "next/font/google";
import { IoIosArrowDown } from "react-icons/io";
import { useGetCustomers } from "../hooks/usegetcustomerdetails";
import { useGetStaff } from "../hooks/usegetstaff";
import toast, { Toaster } from "react-hot-toast";
import SendImagesModal from "../components/SendImagesModal"; // adjust path if needed

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

const Spinner = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-secondary-600"></div>
  </div>
);

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

/* group orders by day label like "01 Aug" */
const groupByDateLabel = (items) => {
  const m = new Map();
  items.forEach((o) => {
    const d = new Date(o.createdAt);
    const key = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
    if (!m.has(key)) m.set(key, []);
    m.get(key).push(o);
  });
  return Array.from(m.entries());
};

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const { customers, customerLoading, customerError } = useGetCustomers();
  const { staff, loading: staffLoading } = useGetStaff();
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    if (!staffLoading && staff?.length > 0) setStaffList(staff);
  }, [staff, staffLoading]);

  // Deduplicate customers
  const uniqueCustomers = useMemo(() => {
    if (!customers) return [];
    const m = new Map();
    customers.forEach((c) => {
      if (c && c._id) m.set(c._id, c);
    });
    return Array.from(m.values());
  }, [customers]);

  const filteredcustomers = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return uniqueCustomers;
    return uniqueCustomers.filter(
      (c) =>
        (c?.customerName || "").toLowerCase().includes(s) ||
        (c?.phone || c?.mobileNumber || "").toLowerCase().includes(s)
    );
  }, [q, uniqueCustomers]);

  const toggle = (id) => setExpandedId((cur) => (cur === id ? null : id));

  // filters
  const [genderFilter, setGenderFilter] = useState("Gender");
  const [contactedFilter, setContactedFilter] = useState("Contacted on WhatsApp");

  // Add Order Modal State
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    garment: "",
    deliveryDate: "",
    designImage: "", // string URL or File
    instructions: "",
    measurements: [{ label: "", value: "" }],
    handwrittenImageUrl: "",
    staff: "",
    totalPayment: "",
    advancePayment: "",
    sendWhatsapp: false,
  });

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // measurements helpers
  function updateMeasurement(idx, key, value) {
    setForm((s) => ({
      ...s,
      measurements: s.measurements.map((m, i) =>
        i === idx ? { ...m, [key === "area" ? "label" : key]: value } : m
      ),
    }));
  }
  function addMeasurementRow() {
    setForm((s) => ({
      ...s,
      measurements: [...s.measurements, { label: "", value: "" }],
    }));
  }
  function removeMeasurementRow(idx) {
    setForm((s) => ({
      ...s,
      measurements: s.measurements.filter((_, i) => i !== idx) || [
        { label: "", value: "" },
      ],
    }));
  }

  // preview + parsing state
  const [handwrittenFile, setHandwrittenFile] = useState(null);
  const prevUrlRef = useRef(null);
  useEffect(
    () => () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    },
    []
  );

  const [isParsingHandwritten, setIsParsingHandwritten] = useState(false);

  // Date parser (same as your original)
  function toISODate(raw) {
    if (!raw) return null;
    const s = String(raw).trim();

    const isoMatch = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
    if (isoMatch) {
      const yyyy = isoMatch[1];
      const mm = String(Number(isoMatch[2])).padStart(2, "0");
      const dd = String(Number(isoMatch[3])).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    const cleaned = s
      .replace(/\./g, "-")
      .replace(/\//g, "-")
      .replace(/\s+/g, " ")
      .replace(/–/g, "-")
      .trim();
    const months = {
      jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
      apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
      aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10,
      october: 10, nov: 11, november: 11, dec: 12, december: 12,
    };

    let m = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
    if (m) {
      let [_, d, mon, y] = m;
      d = String(Number(d)).padStart(2, "0");
      mon = Number(mon);
      if (mon < 1 || mon > 12) return null;
      if (String(y).length === 2) y = Number(y) > 50 ? "19" + y : "20" + y;
      return `${String(y)}-${String(mon).padStart(2, "0")}-${d}`;
    }

    m = cleaned.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
    if (m) {
      let [_, d, monName, y] = m;
      const mn = monName.toLowerCase();
      const monNum = months[mn];
      if (!monNum) return null;
      d = String(Number(d)).padStart(2, "0");
      if (String(y).length === 2) y = Number(y) > 50 ? "19" + y : "20" + y;
      return `${String(y)}-${String(monNum).padStart(2, "0")}-${d}`;
    }

    m = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{2,4})$/);
    if (m) {
      let [_, monName, d, y] = m;
      const monNum = months[monName.toLowerCase()];
      if (!monNum) return null;
      d = String(Number(d)).padStart(2, "0");
      if (String(y).length === 2) y = Number(y) > 50 ? "19" + y : "20" + y;
      return `${String(y)}-${String(monNum).padStart(2, "0")}-${d}`;
    }

    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, "0");
      const dd = String(parsed.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return null;
  }

  function normalizeMeasurements(parsedMeasurements) {
    const defaultOrder = ["Bust", "Waist", "Length", "Hip", "Shoulder", "Sleeve"];
    if (!Array.isArray(parsedMeasurements)) return [{ label: "", value: "" }];
    const mapped = parsedMeasurements.map((m, idx) => {
      let label = (m.label || "").toString().trim();
      if (!label) label = defaultOrder[idx] || `Measurement ${idx + 1}`;
      return { label, value: m.value != null ? String(m.value).trim() : "" };
    });
    return mapped.length ? mapped : [{ label: "", value: "" }];
  }

  function findStaffIdByName(staffName, staffListLocal) {
    if (!staffName || !staffListLocal?.length) return null;
    const lc = staffName.trim().toLowerCase();
    const exact = staffListLocal.find((s) => (s.name || "").toLowerCase() === lc);
    if (exact) return exact._id;
    const inc = staffListLocal.find((s) => (s.name || "").toLowerCase().includes(lc));
    if (inc) return inc._id;
    return null;
  }

  function applyParsedToForm(parsed) {
    if (!parsed) return;
    setForm((prev) => {
      const next = { ...prev };
      if (parsed.customerName) next.customerName = parsed.customerName;
      if (parsed.phone) {
        const digits = (parsed.phone || "").replace(/\D/g, "");
        next.phone = digits.length ? (digits.length > 10 ? digits.slice(-10) : digits) : prev.phone;
      }
      if (parsed.garment) next.garment = parsed.garment;
      if (parsed.deliveryDate) {
        const iso = toISODate(parsed.deliveryDate);
        if (iso) {
          next.deliveryDate = iso;
        } else {
          next.instructions =
            (next.instructions ? next.instructions + "; " : "") +
            `Parsed delivery date: "${parsed.deliveryDate}" (please confirm)`;
        }
      }
      if (parsed.instructions)
        next.instructions = prev.instructions
          ? `${prev.instructions}; ${parsed.instructions}`
          : parsed.instructions;
      if (parsed.measurements)
        next.measurements = normalizeMeasurements(parsed.measurements);
      if (parsed.totalPayment != null) next.totalPayment = String(parsed.totalPayment);
      if (parsed.advancePayment != null) next.advancePayment = String(parsed.advancePayment);
      if (parsed.staffName) {
        const staffId = findStaffIdByName(parsed.staffName, staffList);
        if (staffId) next.staff = staffId;
        else
          next.instructions =
            (next.instructions ? next.instructions + "; " : "") +
            `Parsed staff: ${parsed.staffName}`;
      }
      return next;
    });
  }

  async function handleHandwrittenFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
      setHandwrittenFile(null);
      setForm((s) => ({ ...s, handwrittenImageUrl: "" }));
      return;
    }

    const url = URL.createObjectURL(f);
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = url;
    setHandwrittenFile({ file: f, url });

    if (isParsingHandwritten) return;
    setIsParsingHandwritten(true);

    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/parse-handwritten", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => null);

      if (data?.success && data.parsed) {
        const parsed = { ...data.parsed };
        if (parsed.deliveryDate) {
          const iso = toISODate(parsed.deliveryDate);
          if (iso) parsed.deliveryDate = iso;
        }
        applyParsedToForm(parsed);
        toast.success("Fields auto-filled from handwritten note!");
      } else {
        if (data?.rawText) {
          try {
            await navigator.clipboard.writeText(data.rawText);
          } catch (_) {}
          toast.error("Could not reliably extract fields. Raw text copied to clipboard.");
        } else {
          toast.error("Could not extract fields, please fill manually.");
        }
      }
    } catch (err) {
      console.error("Error parsing handwritten image:", err);
      toast.error("Error parsing handwritten image");
    } finally {
      setIsParsingHandwritten(false);
    }
  }

  // Hidden fallback file input (kept in case you want to allow upload from computer)
  const hiddenFileInputRef = useRef(null);
  const handleHiddenFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // store the File so upload flow remains the same
    update("designImage", file);
  };

  // ---------- Gallery modal states ----------
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState(null);

  // fetch gallery when needed

useEffect(() => {
  if (!showGalleryModal) return;
  let mounted = true;

  async function fetchGallery() {
    setGalleryLoading(true);
    setGalleryError(null);
    try {
      console.log("[Gallery] fetching gallery from /api/v1/gallery/get-gallery");
      const res = await fetch("/api/v1/gallery/get-gallery", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          // add Authorization if required
        },
      });

      

      console.log("[Gallery] HTTP", res.status);
      const data = await res.json().catch((err) => {
        console.warn("[Gallery] json parse failed", err);
        return null;
      });

      console.log("[Gallery] response body:", data);

      if (!mounted) return;

      // Try to find an array in the response in a flexible way (case-insensitive keys)
      let arr = null;

      if (Array.isArray(data)) {
        arr = data;
      } else if (data && typeof data === "object") {
        // common exact keys
        if (Array.isArray(data.items)) arr = data.items;
        else if (Array.isArray(data.gallery)) arr = data.gallery;
        else if (Array.isArray(data.GalleryItems)) arr = data.GalleryItems;
        else if (Array.isArray(data.data)) arr = data.data;
        else {
          // fallback: pick the first value that is an array of objects with an _id or url
          for (const key of Object.keys(data)) {
            const val = data[key];
            if (Array.isArray(val) && val.length > 0 && (val[0]._id || val[0].url || val[0].src)) {
              arr = val;
              break;
            }
          }
        }
      }

      if (Array.isArray(arr)) {
        setGalleryItems(arr);
      } else {
        setGalleryItems([]);
        setGalleryError("Unexpected response shape (see console)");
        console.warn("[Gallery] could not find array in response:", data);
      }
    } catch (err) {
      console.error("[Gallery] fetch error:", err);
      setGalleryError("Error loading gallery (check console/network)");
    } finally {
      if (mounted) setGalleryLoading(false);
    }
  }

  fetchGallery();
  return () => {
    mounted = false;
  };
}, [showGalleryModal]);


  // Called when user clicks the design-image area in Add Order form
  function openGalleryForDesignImage() {
    setShowGalleryModal(true);
    document.body.style.overflow = "hidden";
  }

  function closeGalleryModal() {
    setShowGalleryModal(false);
    document.body.style.overflow = "";
  }

  // Handler when user selects images from gallery: we'll use the first selected image as sample design
  function handleGallerySelection(selectedImageIds = [], activeCategory = null) {
    // find first selected image's URL
    const firstId = selectedImageIds?.[0];
    const img = galleryItems.find((g) => g._id === firstId);
    if (img) {
      // store the URL string (our code will handle string vs File)
      update("designImage", img.url || img.src || "");
    }
    closeGalleryModal();
    toast.success("Selected image added to the form");
  }

  const handleDesignImageChange = (e) => {
    // kept for fallback direct upload from computer if you ever want to enable it
    const file = e.target.files?.[0];
    if (!file) return;
    update("designImage", file);
  };

  async function uploadFileToS3(file) {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/s3/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.url) return data.url;
    throw new Error(data.error || "Upload failed");
  }

  const handleAddOrder = async (e) => {
    e.preventDefault();
    const toastLoading = toast.loading("Creating order...");
    try {
      if (!form.customerName?.trim()) {
        toast.error("Customer name is required", { id: toastLoading });
        return;
      }
      if (!form.phone?.trim()) {
        toast.error("Phone is required", { id: toastLoading });
        return;
      }
      if (!form.garment?.trim()) {
        toast.error("Garment is required", { id: toastLoading });
        return;
      }
      if (!form.deliveryDate) {
        toast.error("Delivery date is required", { id: toastLoading });
        return;
      }
      if (!form.staff) {
        toast.error("Please assign a staff", { id: toastLoading });
        return;
      }
      if (
        form.totalPayment &&
        form.advancePayment &&
        Number(form.advancePayment) > Number(form.totalPayment)
      ) {
        toast.error("Advance cannot be greater than total", { id: toastLoading });
        return;
      }

      let sampleDesignImageUrl = "";
      // If designImage is a File -> upload; if it's a string -> use directly
      if (form.designImage instanceof File) {
        const maxMB = 5;
        if (form.designImage.size / (1024 * 1024) > maxMB) {
          toast.error(`Image must be smaller than ${maxMB}MB`, { id: toastLoading });
          return;
        }
        sampleDesignImageUrl = await uploadFileToS3(form.designImage);
      } else if (typeof form.designImage === "string" && form.designImage.trim()) {
        sampleDesignImageUrl = form.designImage;
      }

      const payload = {
        customerName: form.customerName,
        phoneNumber: form.phone,
        garment: form.garment,
        deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : null,
        sampleDesignImageUrl,
        specialInstructions: form.instructions || "",
        measurements: form.measurements?.filter((m) => m.label && m.value),
        handwrittenImageUrl: form.handwrittenImageUrl,
        staffAssigned: form.staff,
        advancePayment: Number(form.advancePayment) || 0,
        totalPayment: Number(form.totalPayment) || 0,
        sendWhatsAppSummary: !!form.sendWhatsapp,
      };

      const res = await fetch("/api/v1/orders/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data.error) {
        toast.success("Order created!", { id: toastLoading });
        setShowForm(false);
        setForm({
          customerName: "",
          phone: "",
          garment: "",
          deliveryDate: "",
          designImage: "",
          instructions: "",
          measurements: [{ label: "", value: "" }],
          handwrittenImageUrl: "",
          staff: "",
          totalPayment: "",
          advancePayment: "",
          sendWhatsapp: false,
        });
        // Optionally refetch customers here
        window.location.reload();
      } else {
        console.error("Create order failed:", data);
        toast.error(data?.error || "Error creating order", { id: toastLoading });
      }
    } catch (err) {
      console.error("Error creating order:", err);
      toast.error(err?.message || "Error creating order", { id: toastLoading });
    }
  };

  const openAddOrderForm = (customer) => {
    setSelectedCustomer(customer);
    setForm({
      customerName: customer.customerName || "",
      phone: customer.mobileNumber || customer.phone || "",
      garment: "",
      deliveryDate: "",
      designImage: "",
      instructions: "",
      measurements: [{ label: "", value: "" }],
      handwrittenImageUrl: "",
      staff: "",
      totalPayment: "",
      advancePayment: "",
      sendWhatsapp: false,
    });
    setShowForm(true);
    document.body.style.overflow = "hidden";
  };

  const closeAddOrderForm = () => {
    setShowForm(false);
    setSelectedCustomer(null);
    document.body.style.overflow = "";
  };

  if (customerLoading) {
    return <Spinner />;
  }

  return (
   <div className={`${poppins.className} min-h-screen`}>
  <Toaster />
  <div className="mx-auto w-full max-w-[1180px] h-[calc(100vh-48px)] rounded-[22px] bg-white p-3 sm:p-6 shadow-xl overflow-hidden flex flex-col">
    {/* Header */}
    <div className="sm:mb-5">
      <h1 className="text-[18px] sm:text-[20px] leading-[35px] font-semibold text-[#252525]">
        Customer Management
      </h1>
    </div>

    {/* Filters */}
    <div className="mb-3">
      {/* desktop filter bar */}
      <div className="hidden sm:block px-4 sm:px-[3rem]">
        <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
          <div className="flex flex-nowrap w-full rounded-xl bg-[#F9F8FC]">
            <div className="relative flex items-center justify-between gap-2 px-4 sm:px-6 py-2 border-r border-slate-200 whitespace-nowrap min-w-[120px] sm:min-w-[160px]">
              <span className="text-sm text-[#252525]">{genderFilter ?? "Gender"}</span>
              <IoIosArrowDown className="text-[#252525] text-[14px]" />
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option>Gender</option>
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>

            <div className="relative flex items-center justify-between gap-2 px-4 sm:px-6 py-2 border-r border-slate-200 whitespace-nowrap min-w-[180px] sm:min-w-[220px]">
              <span className="text-sm text-[#252525]">{contactedFilter ?? "Contacted on WhatsApp"}</span>
              <IoIosArrowDown className="text-[#252525] text-[14px]" />
              <select
                value={contactedFilter}
                onChange={(e) => setContactedFilter(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              >
                <option>Contacted on WhatsApp</option>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 flex-1 min-w-0">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, phone..."
                className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60"
              />
              <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile filters */}
      <div className="sm:hidden">
        <div className="flex gap-2 px-1">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option>Gender</option>
            <option>Female</option>
            <option>Male</option>
          </select>

          <select
            value={contactedFilter}
            onChange={(e) => setContactedFilter(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option>Contacted on</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        <div className="mt-2 flex items-center gap-2 px-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white grid place-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    {/* Content area - scrollable */}
    <div className="flex-1 overflow-y-auto sm:pr-4 mt-4 no-scrollbar">
      <div className="space-y-6 px-1 sm:px-0">
        {!customerLoading &&
          !customerError &&
          filteredcustomers.map((cust) => {
            const isOpen = expandedId === cust._id;

            return (
              <div key={cust._id} className="rounded-lg overflow-hidden border border-slate-100">
                {/* header */}
                <div
                  className={`text-[16px] font-medium leading-[12px] tracking-[0.5px] text-white px-4 sm:px-6 py-3 flex justify-between items-center rounded-t-xl ${
                    (cust.orders || []).length > 0
                      ? "bg-gradient-to-r from-[#0FA958] to-[#47D58E]"
                      : "bg-gradient-to-r from-[#4C2699] to-[#936EDD]"
                  }`}
                >
                  <div className="text-sm font-medium truncate">
                    {cust.customerName}{" "}
                    <span className="text-xs font-normal">({cust.mobileNumber || cust.phone})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Add Order Button */}
                    <button
                      onClick={() => openAddOrderForm(cust)}
                      className="rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
                    >
                      + Add Order
                    </button>

                    {(cust.orders || []).length > 0 && (
                      <>
                        <div className="text-sm hidden sm:block text-white/90 mr-2">
                          {cust.orders.length} {cust.orders.length === 1 ? "order" : "orders"}
                        </div>

                        <button
                          onClick={() => toggle(cust._id)}
                          aria-expanded={isOpen}
                          aria-controls={`orders-${cust._id}`}
                          className="flex items-center gap-2 text-sm font-medium"
                        >
                          <span className="underline hidden sm:block">{isOpen ? "Hide Orders" : "View Orders"}</span>
                          <span className={`transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}>
                            <FiChevronDown />
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* animated container */}
                <div
                  id={`orders-${cust._id}`}
                  role="region"
                  aria-hidden={!isOpen}
                  style={{
                    maxHeight: isOpen ? "1200px" : "0px",
                    transition: "max-height 300ms ease-in-out",
                  }}
                  className="overflow-hidden"
                >
                  {/* expanded orders panel */}
                  <div className="p-3 sm:p-6 bg-[#F4F0FB] border-t border-slate-100">
                    <div className="max-h-[560px] overflow-y-auto pr-2 no-scrollbar">
                      <div className="relative">
                        {/* timeline vertical only on md+ */}
                        <div className="hidden md:block absolute top-6 bottom-6 left-[140px]">
                          <div className="w-px h-full bg-dotted" />
                        </div>

                        <div className="space-y-6">
                          {groupByDateLabel(cust.orders || []).map(([dateLabel, orders]) => (
                            <div
                              key={`${dateLabel}-${cust._id}`}
                              className={`relative text-[#252525D1] text-[12px] font-medium leading-[22px] tracking-[0.5px] gap-6 ${
                                // layout: small screens stack, md+ use three columns
                                "grid grid-cols-1 md:grid-cols-[140px_1fr_180px]"
                              }`}
                            >
                              {/* timeline dot placed responsively */}
                              <div className="md:absolute md:left-[140px]">
                                <div className="flex md:block items-center md:items-start gap-2">
                                  <div className="md:mt-0 mt-1 md:ml-0 ml-2">
                                    <div className="timeline-dot" />
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 md:pt-0 md:block">
                                <div className="text-[15px] font-semibold">{dateLabel}</div>
                                <div className="md:hidden w-2 h-2 rounded-full bg-[#6b4fd3] ml-2 mt-1" />
                              </div>

                              <div className="pr-0 md:pr-4">
                                {orders.length > 0 &&
                                  orders.map((o) => (
                                    <div key={o._id} className="mb-6 pb-6 border-b last:border-b-0 border-slate-200">
                                      <div className="text-sm text-[#252525D1]">
                                        <div className="mb-2 text-[12px] leading-[22px] tracking-[0.5px] text-[#252525D1]">
                                          Order ID:{" "}
                                          <span className="text-[#252525D1] font-medium">{o._id.slice(-6).toUpperCase()}</span>
                                        </div>

                                        <div className="mb-1 text-[13px]">
                                          <span className="font-semibold">Delivery Date:</span>{" "}
                                          <span>
                                            {new Date(o.deliveryDate).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "long",
                                              year: "numeric",
                                            })}
                                          </span>
                                        </div>

                                        <div className="mb-1 text-[13px]">
                                          <span className="font-semibold">Garment Type:</span>{" "}
                                          <span>{o.garment}</span>
                                        </div>

                                        <div className="mb-1">
                                          <span className="text-[#252525D1] font-medium leading-[22px] tracking-[0.5px] text-[13px]">
                                            Tailor Assigned: {o.staffAssigned?.name}
                                          </span>
                                        </div>

                                        <div className="mt-3 text-[#D68B08] font-semibold leading-[22px] tracking-[0.5px] text-[13px]">
                                          Amount Left: {INR(o.totalPayment - o.advancePayment)}
                                        </div>

                                        <div className="mt-3 font-semibold text-[14px] text-[#252525F7]">Measurements</div>

                                        <div className="text-[13px] text-[#252525D1] leading-[22px] tracking-[0.5px]">
                                          {o.measurements.map((m, idx) => (
                                            <span key={idx} className="inline-block mr-3">
                                              {m.label}: {m.value}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                              </div>

                              <div className="text-right pt-1 md:text-right">
                                {orders.map((o) => (
                                  <div key={o._id} className="mb-6">
                                    <div className="text-[13px] text-[#5E3BA4] font-semibold leading-[22px] tracking-[0.5px]">
                                      Total : {INR(o.totalPayment)}
                                    </div>

                                    <div
                                      className={`mt-2 font-medium text-[12px] ${
                                        o.status === "Completed" ? "text-[#026915]" : "text-[#D98C08]"
                                      }`}
                                    >
                                      {o.status}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>

    {/* Add Order Form Modal (unchanged behaviour) */}
    <div
      className={`fixed inset-0 z-50 ${showForm ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!showForm}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${showForm ? "opacity-100" : "opacity-0"}`}
        onClick={closeAddOrderForm}
      />
      <div
        className={`absolute left-1/2 sm:left-[58.5%] transform -translate-x-1/2 w-full max-w-[1220px] px-2 transition-transform duration-300 ${
          showForm ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-0 sm:mx-4 mt-6 rounded-2xl bg-white shadow-2xl max-h-[80vh] sm:max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-[#252525]">
              Add Order for {selectedCustomer?.customerName}
            </h3>
            <button
              onClick={closeAddOrderForm}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={(e) => {
              handleAddOrder(e);
              e.preventDefault();
            }}
            className="px-4 sm:px-6 py-6 bg-[#F6F7FA]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Handwritten file */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">
                  Upload handwritten image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHandwrittenFileChange}
                    disabled={isParsingHandwritten}
                    aria-label="Upload handwritten order image"
                    aria-busy={isParsingHandwritten ? "true" : "false"}
                    className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${
                      isParsingHandwritten ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  />
                  <div className="w-[96px] flex items-center gap-2">
                    {isParsingHandwritten ? (
                      <div className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-[#13234B]"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="opacity-20"
                          />
                          <path
                            d="M4 12a8 8 0 018-8"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-xs text-slate-600">Parsing…</span>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">Ready</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer name */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">Customer Name*</label>
                <input
                  value={form.customerName}
                  onChange={(e) => update("customerName", e.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">Phone Number*</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="Enter number"
                  maxLength={10}
                  pattern="[0-9]*"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Garment */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">
                  What garment is being stitched*
                </label>
                <input
                  value={form.garment}
                  onChange={(e) => update("garment", e.target.value)}
                  placeholder="Enter"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Delivery date */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">Delivery date*</label>
                <input
                  type="date"
                  value={form.deliveryDate}
                  onChange={(e) => update("deliveryDate", e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">Any special instructions</label>
                <input
                  value={form.instructions}
                  onChange={(e) => update("instructions", e.target.value)}
                  placeholder="Enter"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Design image + Staff assigned */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start rounded-lg p-4 border border-[#F3E8D6] bg-gradient-to-r from-[#FFF8EE] to-[#FFF3E8]">
                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">Sample design image</label>

                    {/* Design image selector: clicking opens gallery modal (instead of file picker) */}
                    <div className="flex items-center gap-3">
                      <div
                        role="button"
                        onClick={openGalleryForDesignImage}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none flex items-center gap-3 cursor-pointer hover:shadow-sm"
                        aria-label="Choose sample design from gallery"
                      >
                        {form.designImage ? (
                          <>
                            <div className="w-14 h-14 rounded-md overflow-hidden border flex-shrink-0">
                              {typeof form.designImage === "string" ? (
                                // preview URL
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={form.designImage} alt="design" className="w-full h-full object-cover" />
                              ) : form.designImage instanceof File ? (
                                // preview local File
                                <img
                                  src={URL.createObjectURL(form.designImage)}
                                  alt="design"
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="text-sm text-slate-700">Change / Select from gallery</div>
                          </>
                        ) : (
                          <div className="text-sm text-slate-500">Click to select from gallery</div>
                        )}
                      </div>

                      {/* Keep a hidden file input as fallback (optional) */}
                      <input
                        ref={hiddenFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleHiddenFileChange}
                        style={{ display: "none" }}
                      />

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => update("designImage", "")}
                          className="px-3 py-2 rounded-md border text-sm font-medium bg-white hover:bg-slate-50"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Select a reference image from the gallery. (You can also upload if needed.)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#252525] mb-1">Staff Assigned*</label>
                    <div className="relative">
                      <select
                        value={form.staff}
                        onChange={(e) => update("staff", e.target.value)}
                        className="w-full appearance-none rounded-md border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                        required
                        aria-label="Select staff assigned"
                      >
                        <option value="" disabled>
                          Select
                        </option>
                        {staffList?.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <IoIosArrowDown />
                      </span>
                      <p className="mt-2 text-xs text-slate-500">Assign a staff member for this order.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurements */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#252525] mb-1">Measurements*</label>
                <div className="space-y-3">
                  {form.measurements.map((m, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-12 md:col-span-5">
                        <input
                          value={m.label}
                          onChange={(e) => updateMeasurement(idx, "area", e.target.value)}
                          placeholder="Area of measurement (e.g., Bust)"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                          required={idx === 0}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-5">
                        <input
                          value={m.value}
                          onChange={(e) => updateMeasurement(idx, "value", e.target.value)}
                          placeholder="Measurement (e.g., 34)"
                          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                          required={idx === 0}
                        />
                      </div>
                      <div className="col-span-12 md:col-span-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={addMeasurementRow}
                          className="px-3 py-2 rounded-md bg-white border text-sm font-medium hover:bg-slate-50"
                          aria-label="Add measurement"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMeasurementRow(idx)}
                          className="px-3 py-2 rounded-md bg-white border text-sm font-medium hover:bg-slate-50"
                          aria-label="Remove measurement"
                        >
                          −
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mt-2">Click + to add another measurement row. You can remove rows with −.</div>
              </div>

              {/* Payments */}
              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">Total Payment*</label>
                <input
                  value={form.totalPayment}
                  type="number"
                  min="0"
                  onChange={(e) => update("totalPayment", e.target.value)}
                  placeholder="Enter"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#252525] mb-1">Advance Payment</label>
                <input
                  value={form.advancePayment}
                  type="number"
                  min="0"
                  max={form.totalPayment}
                  onChange={(e) => update("advancePayment", e.target.value)}
                  placeholder="Enter"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-3 text-sm text-[#252525]">
                  <input
                    type="checkbox"
                    checked={form.sendWhatsapp}
                    onChange={(e) => update("sendWhatsapp", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                  />
                  Send order summary to customer on WhatsApp
                </label>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeAddOrderForm}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm text-[#252525] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#13234B] text-white px-6 py-2 text-sm font-medium hover:brightness-110"
              >
                Save Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* Gallery modal used only for design-image selection */}
    <SendImagesModal
      isOpen={showGalleryModal}
      onClose={closeGalleryModal}
      selectedOrder={selectedCustomer}
      galleryItems={galleryItems}
      galleryLoading={galleryLoading}
      galleryError={galleryError}
      onSendImages={handleGallerySelection}
    />

    {/* Styles */}
    <style jsx>{`
      :global(.no-scrollbar) {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      :global(.no-scrollbar::-webkit-scrollbar) {
        display: none;
      }

      :global(.bg-dotted) {
        background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
        background-size: 1px 8px;
        background-repeat: repeat-y;
      }

      :global(.timeline-dot) {
        width: 10px;
        height: 10px;
        background-color: #6b4fd3;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(107, 79, 211, 0.06);
      }

      @media (max-width: 767px) {
        .rounded-lg > div[role="region"] > div {
          padding-left: 12px;
          padding-right: 12px;
        }
      }
    `}</style>
  </div>
</div>

  );
}
