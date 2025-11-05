// // src/app/(your-path)/OrdersPage.jsx  (adjust path/name if needed)
// "use client";
// import { useEffect, useMemo, useState, useRef } from "react";
// import { useGetOrders } from "../hooks/usegetorders";
// import { useGetStaff } from "../hooks/usegetstaff";

// import { IoIosArrowDown } from "react-icons/io";
// import { FiX } from "react-icons/fi";
// import { Poppins } from "next/font/google";
// import toast, { Toaster } from "react-hot-toast";

// import SendImagesModal from "../components/SendImagesModal"; // <-- imported component

// const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

// const RAW = [
//   {
//     id: "ord-1001",
//     orderId: "#OD1247",
//     placedOn: "2025-08-03",
//     name: "Priya Sharma",
//   },
//   {
//     id: "ord-1000",
//     orderId: "#OD1246",
//     placedOn: "2025-08-02",
//     name: "Jeevana",
//   },
//   {
//     id: "ord-1003",
//     orderId: "#OD1248",
//     placedOn: "2025-08-03",
//     name: "Jeevna",
//   },
// ];

// const STATUS = ["All", "Pending", "In Progress", "Completed"];
// const WA_STATUS = ["All", "Not Sent", "Sent", "Delivered", "Read", "Replied"];
// const DELIVERY_RANGE = ["All", "Today", "Next 7 Days", "This Month", "Overdue"];

// const INR = (n) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(n);

// const endOfDay = (date) => {
//   const d = new Date(date);
//   d.setHours(23, 59, 59, 999);
//   return d;
// };
// const isInDeliveryRange = (iso, range) => {
//   if (range === "All") return true;
//   const d = new Date(iso);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const end7 = new Date(today);
//   end7.setDate(today.getDate() + 7);
//   const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
//   const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
//   monthEnd.setHours(23, 59, 59, 999);

//   if (range === "Today")
//     return (
//       d.getTime() >= today.getTime() && d.getTime() < endOfDay(today).getTime()
//     );
//   if (range === "Next 7 Days") return d >= today && d <= end7;
//   if (range === "This Month") return d >= monthStart && d <= monthEnd;
//   if (range === "Overdue") return d < today;
//   return true;
// };

// export default function OrdersPage() {
//   // Filters & lists
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [deliveryFilter, setDeliveryFilter] = useState("All");
//   const [staffFilter, setStaffFilter] = useState("All");
//   const [waFilter, setWaFilter] = useState("All");
//   const [query, setQuery] = useState("");
//   const [staffList, setStaffList] = useState([]);

//   // Orders
//   const { orders, orderloading, ordererror, refetch } = useGetOrders?.() || {};
//   const [localOrders, setLocalOrders] = useState([]);
//   useEffect(() => {
//     if (orders) setLocalOrders(orders);
//   }, [orders]);

//   // Order status local
//   const [orderStatus, setOrderStatus] = useState({});
//   useEffect(() => {
//     if (orders && orders.length > 0)
//       setOrderStatus(
//         Object.fromEntries(orders.map((o) => [o._id, o.status || "Pending"]))
//       );
//   }, [orders]);

//   const staffOptions = useMemo(
//     () => ["All", ...Array.from(new Set(RAW.map((o) => o.staff)))],
//     []
//   );

//   // Add/Edit order form
//   const [showForm, setShowForm] = useState(false);
//   const [editingOrderId, setEditingOrderId] = useState(null);
//   const [form, setForm] = useState({
//     customerName: "",
//     phone: "",
//     garment: "",
//     deliveryDate: "",
//     designImage: "", // will hold a URL string when chosen from gallery (or File if you later allow upload)
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

//   // preview + parsing state for handwritten (unchanged)
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

//   // robust date parser and helpers (kept from your file)
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
//       jan: 1,
//       january: 1,
//       feb: 2,
//       february: 2,
//       mar: 3,
//       march: 3,
//       apr: 4,
//       april: 4,
//       may: 5,
//       jun: 6,
//       june: 6,
//       jul: 7,
//       july: 7,
//       aug: 8,
//       august: 8,
//       sep: 9,
//       sept: 9,
//       september: 9,
//       oct: 10,
//       october: 10,
//       nov: 11,
//       november: 11,
//       dec: 12,
//       december: 12,
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
//     const defaultOrder = [
//       "Bust",
//       "Waist",
//       "Length",
//       "Hip",
//       "Shoulder",
//       "Sleeve",
//     ];
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
//     const exact = staffListLocal.find(
//       (s) => (s.name || "").toLowerCase() === lc
//     );
//     if (exact) return exact._id;
//     const inc = staffListLocal.find((s) =>
//       (s.name || "").toLowerCase().includes(lc)
//     );
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
//         next.phone = digits.length
//           ? digits.length > 10
//             ? digits.slice(-10)
//             : digits
//           : prev.phone;
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
//       if (parsed.totalPayment != null)
//         next.totalPayment = String(parsed.totalPayment);
//       if (parsed.advancePayment != null)
//         next.advancePayment = String(parsed.advancePayment);
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

//   // ------------------ HANDLER for handwritten file input ------------------
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
//           toast.error(
//             "Could not reliably extract fields. Raw text copied to clipboard."
//           );
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

//   // Design image local upload handler (kept, still supported if you keep file uploads)
//   const handleDesignImageChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     update("designImage", file);
//   };

//   // staff fetch
//   const { staff, loading, error } = useGetStaff();
//   useEffect(() => {
//     if (!loading && staff?.length > 0) setStaffList(staff);
//   }, [staff, loading]);

//   // filtered orders
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     return (localOrders || [])
//       .filter((o) => {
//         const matchesText =
//           !q ||
//           (o.customer?.customerName &&
//             o.customer.customerName.toLowerCase().includes(q)) ||
//           (o.garment && o.garment.toLowerCase().includes(q)) ||
//           (o._id && o._id.toLowerCase().includes(q));
//         const byStatus =
//           statusFilter === "All"
//             ? true
//             : (orderStatus[o._id] || "").toLowerCase() ===
//               statusFilter.toLowerCase();
//         const byDelivery = isInDeliveryRange(o.deliveryDate, deliveryFilter);
//         const byStaff =
//           staffFilter === "All" ? true : o?.staffAssigned?.name === staffFilter;
//         const byWA = waFilter === "All" ? true : o.waStatus === waFilter;
//         return matchesText && byStatus && byDelivery && byStaff && byWA;
//       })
//       .sort((a, b) => (a.placedOn < b.placedOn ? 1 : -1));
//   }, [
//     localOrders,
//     query,
//     statusFilter,
//     deliveryFilter,
//     staffFilter,
//     waFilter,
//     orderStatus,
//   ]);

//   // status change
//   const handleStatusChange = async (orderId, newStatus, prevStatus) => {
//     if (prevStatus === "Delivered" && newStatus !== "Delivered") {
//       toast.error("Cannot change status from Delivered to another status.");
//       return;
//     }
//     if (prevStatus === "Completed" && newStatus === "Pending") {
//       toast.error("Cannot change status from Completed to Pending.");
//       return;
//     }
//     const old = orderStatus[orderId] || prevStatus;
//     setOrderStatus((s) => ({ ...s, [orderId]: newStatus }));
//     const toastLoading = toast.loading("Updating status...");
//     try {
//       const res = await fetch("/api/v1/orders/update-order", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: orderId, status: newStatus }),
//       });
//       const data = await res.json();
//       if (res.ok && data.success) {
//         toast.success("Order status updated!", { id: toastLoading });
//       } else {
//         setOrderStatus((s) => ({ ...s, [orderId]: old }));
//         toast.error(data?.error || "Failed to update status", {
//           id: toastLoading,
//         });
//       }
//     } catch (err) {
//       setOrderStatus((s) => ({ ...s, [orderId]: old }));
//       toast.error(err?.message || "Error updating status", {
//         id: toastLoading,
//       });
//     }
//   };

//   // upload helper (unchanged)
//   async function uploadFileToS3(file) {
//     if (!file) return "";
//     const fd = new FormData();
//     fd.append("file", file);
//     const res = await fetch("/api/s3/upload", { method: "POST", body: fd });
//     const data = await res.json();
//     if (res.ok && data.url) return data.url;
//     throw new Error(data.error || "Upload failed");
//   }

//   // ---------------------------
//   // Unified save for create/update
//   // ---------------------------
//   const handleSaveOrder = async (e) => {
//     e?.preventDefault?.();
//     const toastId = toast.loading(
//       editingOrderId ? "Updating order..." : "Creating order..."
//     );

//     try {
//       // basic validation
//       if (!form.customerName?.trim()) {
//         toast.error("Customer name is required", { id: toastId });
//         return;
//       }
//       if (!form.phone?.trim()) {
//         toast.error("Phone is required", { id: toastId });
//         return;
//       }
//       if (!form.garment?.trim()) {
//         toast.error("Garment is required", { id: toastId });
//         return;
//       }
//       if (!form.deliveryDate) {
//         toast.error("Delivery date is required", { id: toastId });
//         return;
//       }
//       if (!form.staff) {
//         toast.error("Please assign a staff", { id: toastId });
//         return;
//       }
//       if (
//         form.totalPayment &&
//         form.advancePayment &&
//         Number(form.advancePayment) > Number(form.totalPayment)
//       ) {
//         toast.error("Advance cannot be greater than total", { id: toastId });
//         return;
//       }

//       // handle designImage file upload if File
//       let sampleDesignImageUrl = "";
//       if (form.designImage instanceof File) {
//         const maxMB = 5;
//         if (form.designImage.size / (1024 * 1024) > maxMB) {
//           toast.error(`Image must be smaller than ${maxMB}MB`, { id: toastId });
//           return;
//         }
//         sampleDesignImageUrl = await uploadFileToS3(form.designImage);
//       } else if (typeof form.designImage === "string" && form.designImage) {
//         sampleDesignImageUrl = form.designImage;
//       }

//       const payload = {
//         customerName: form.customerName,
//         phoneNumber: form.phone,
//         garment: form.garment,
//         deliveryDate: form.deliveryDate
//           ? new Date(form.deliveryDate).toISOString()
//           : null,
//         sampleDesignImageUrl,
//         specialInstructions: form.instructions || "",
//         measurements: form.measurements?.filter((m) => m.label && m.value),
//         handwrittenImageUrl: form.handwrittenImageUrl,
//         staffAssigned: form.staff,
//         advancePayment: Number(form.advancePayment) || 0,
//         totalPayment: Number(form.totalPayment) || 0,
//         sendWhatsAppSummary: !!form.sendWhatsapp,
//       };

//       let res, data;
//       if (editingOrderId) {
//         // update existing order
//         res = await fetch("/api/v1/orders/update-order", {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ id: editingOrderId, ...payload }),
//         });
//         data = await res.json().catch(() => ({}));
//         if (res.ok && data.success) {
//           toast.success("Order updated!", { id: toastId });
//           if (typeof refetch === "function") {
//             refetch();
//           } else {
//             // attempt to merge returned order or payload into localOrders
//             const updated = data.order || { ...payload, _id: editingOrderId };
//             setLocalOrders((prev) =>
//               prev.map((o) =>
//                 o._id === editingOrderId ? { ...o, ...updated } : o
//               )
//             );
//           }
//         } else {
//           throw new Error(data?.error || "Failed to update order");
//         }
//       } else {
//         // create new order
//         res = await fetch("/api/v1/orders/create-order", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         });
//         data = await res.json().catch(() => ({}));
//         if (res.ok && !data.error && data.order) {
//           toast.success("Order created!", { id: toastId });
//           if (typeof refetch === "function") refetch();
//           else setLocalOrders((prev) => [data.order, ...prev]);
//         } else {
//           throw new Error(data?.error || "Error creating order");
//         }
//       }

//       // close modal & clear
//       setShowForm(false);
//       setEditingOrderId(null);
//       setForm({
//         customerName: "",
//         phone: "",
//         garment: "",
//         deliveryDate: "",
//         designImage: "",
//         instructions: "",
//         measurements: [{ label: "", value: "" }],
//         handwrittenImageUrl: "",
//         staff: "",
//         totalPayment: "",
//         advancePayment: "",
//         sendWhatsapp: false,
//       });
//     } catch (err) {
//       console.error("Save order error:", err);
//       toast.error(err?.message || "Error saving order", { id: toastId });
//     }
//   };

//   // ---------------------------
//   // Edit flow helpers
//   // ---------------------------
//   function openEditOrder(order) {
//     if (!order) return;
//     setEditingOrderId(order._id);
//     setForm({
//       customerName: order.customer?.customerName || order.customerName || "",
//       phone: (order.phoneNumber || order.customer?.mobileNumber || "")
//         .toString()
//         .slice(-10),
//       garment: order.garment || "",
//       deliveryDate: order.deliveryDate
//         ? new Date(order.deliveryDate).toISOString().slice(0, 10)
//         : "",
//       designImage: order.sampleImages || order.sampleDesignImageUrl || "",
//       instructions: order.specialInstructions || "",
//       measurements:
//         Array.isArray(order.measurements) && order.measurements.length
//           ? order.measurements
//           : [{ label: "", value: "" }],
//       handwrittenImageUrl: order.handwrittenImageUrl || "",
//       staff: order.staffAssigned?._id || order.staffAssigned || "",
//       totalPayment:
//         order.totalPayment != null ? String(order.totalPayment) : "",
//       advancePayment:
//         order.advancePayment != null ? String(order.advancePayment) : "",
//       sendWhatsapp:
//         !!order.sendOrderSummaryWhatsapp || !!order.sendWhatsAppSummary,
//     });
//     setShowForm(true);
//   }

//   function cancelEdit() {
//     setEditingOrderId(null);
//     setShowForm(false);
//   }

//   // ---------------------------
//   // Delete flow
//   // ---------------------------
//   async function handleDeleteOrder(orderId) {
//     if (!orderId) return;
//     const ok = window.confirm(
//       "Are you sure you want to delete this order? This action cannot be undone."
//     );
//     if (!ok) return;

//     const toastId = toast.loading("Deleting order...");
//     const prevOrders = localOrders;
//     setLocalOrders((ls) => ls.filter((o) => o._id !== orderId));

//     try {
//       const res = await fetch("/api/v1/orders/delete-order", {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: orderId }),
//       });

//       const data = await res.json().catch(() => ({}));

//       if (res.ok && data.success) {
//         toast.success("Order deleted", { id: toastId });
//         if (typeof refetch === "function") refetch();
//       } else {
//         setLocalOrders(prevOrders);
//         throw new Error(
//           data?.error || `Failed to delete (status ${res.status})`
//         );
//       }
//     } catch (err) {
//       console.error("Delete failed:", err);
//       toast.error(err?.message || "Error deleting order", { id: toastId });
//     }
//   }

//   // grouped orders
//   const grouped = useMemo(() => {
//     const m = new Map();
//     (filtered || []).forEach((o) => {
//       const orderDate = o.createdAt
//         ? new Date(o.createdAt).toISOString().slice(0, 10)
//         : o.placedOn;
//       if (!m.has(orderDate)) m.set(orderDate, []);
//       m.get(orderDate).push(o);
//     });
//     return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
//   }, [filtered]);

//   // -- SEND IMAGES modal: dynamic gallery fetch --
//   const [showSendModal, setShowSendModal] = useState(false);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [galleryItems, setGalleryItems] = useState([]);
//   const [galleryLoading, setGalleryLoading] = useState(false);
//   const [galleryError, setGalleryError] = useState(null);

//   // Whether the gallery modal is opened to pick a sample design for Add Order
//   const [showGalleryForAdd, setShowGalleryForAdd] = useState(false);

//   // fetch gallery helper (re-used for both flows)
//   async function fetchGallery() {
//     try {
//       setGalleryLoading(true);
//       setGalleryError(null);
//       const res = await fetch("/api/v1/gallery/get-gallery");
//       if (!res.ok) {
//         const body = await res.json().catch(() => ({}));
//         throw new Error(body?.error || `HTTP ${res.status}`);
//       }
//       const data = await res.json();
//       const items =
//         data?.GalleryItems || data?.galleryItems || data?.items || [];
//       setGalleryItems(items);
//     } catch (err) {
//       console.error("Failed to load gallery", err);
//       setGalleryError(err.message || "Failed to load gallery");
//       toast.error("Failed to load gallery");
//     } finally {
//       setGalleryLoading(false);
//     }
//   }

//   // open modal and fetch gallery for per-order "Send Images"
//   async function openSendImagesModal(order) {
//     setSelectedOrder(order);
//     setShowSendModal(true);
//     document.body.style.overflow = "hidden";
//     await fetchGallery();
//   }

//   function closeSendImagesModal() {
//     setShowSendModal(false);
//     setSelectedOrder(null);
//     setGalleryItems([]);
//     setGalleryError(null);
//     document.body.style.overflow = "";
//   }

//   // open gallery modal for Add Order design picker
//   async function openGalleryForAddOrder() {
//     setShowGalleryForAdd(true);
//     document.body.style.overflow = "hidden";
//     await fetchGallery();
//   }

//   function closeGalleryForAddOrder() {
//     setShowGalleryForAdd(false);
//     setGalleryItems([]);
//     setGalleryError(null);
//     document.body.style.overflow = "";
//   }

//   // Handler when user sends images for an order (existing flow)
//   async function handleSendSelectedImagesForOrder(selectedImageIds = []) {
//     if (!selectedImageIds.length) {
//       toast.error("Select at least one image");
//       return;
//     }
//     toast.success(
//       `Sending ${selectedImageIds.length} images for order ${
//         selectedOrder?._id || selectedOrder?.orderId || ""
//       }`
//     );
//     closeSendImagesModal();
//   }

//   // Handler when user selects images while picking design for Add Order
//   function handleChooseImagesForAdd(selectedImageIds = []) {
//     if (!selectedImageIds.length) {
//       toast.error("Select at least one image");
//       return;
//     }
//     const firstId = selectedImageIds[0];
//     const item = galleryItems.find((g) => g._id === firstId) || {};
//     const url = item.url || item.src || item.imageUrl || item.path || "";
//     if (url) {
//       update("designImage", url);
//       toast.success("Design image chosen from gallery");
//     } else {
//       toast.error("Chosen image has no URL");
//     }
//     closeGalleryForAddOrder();
//   }

//   // Handler passed into imported SendImagesModal as onSendImages: detect mode by whether selectedOrder is set or showGalleryForAdd true
//   function onModalSendHandler(selectedImageIds = [], category = null) {
//     if (showGalleryForAdd) {
//       handleChooseImagesForAdd(selectedImageIds);
//     } else {
//       handleSendSelectedImagesForOrder(selectedImageIds);
//     }
//   }

//   const SAMPLE_IMG =
//     "https://images.unsplash.com/photo-1562158070-9b9b9b2f6a66?w=800&q=60&auto=format&fit=crop";

//   // UI render (mostly preserved)
//   return (
//     <div
//       className={`${poppins.className} mx-auto sm:max-w-[1180px] pt-6 h-screen`}
//     >
//       <Toaster />
//       <div className="h-[calc(100vh-48px)] rounded-[22px] bg-white shadow-xl overflow-hidden">
//         <div className="h-[calc(100vh-48px)] rounded-[22px] bg-white shadow-xl overflow-hidden relative">
//           {/* Header */}
//           <div className="flex items-center gap-4 px-6 md:px-8 pt-6">
//             <h1 className="text-[16px] sm:text-[20px] leading-[35px] text-[#252525] font-semibold flex-1">
//               Order Management
//             </h1>
//             <button
//               onClick={() => {
//                 setEditingOrderId(null);
//                 setShowForm(true);
//               }}
//               className="rounded-lg bg-[#EC9705] text-white text-[15px] font-semibold leading-[22px] tracking-[0.2px] px-6 py-1 shadow hover:bg-amber-600"
//             >
//               +Add Order
//             </button>
//           </div>

//           {/* Mobile filters (kept as-is) */}
//           <div className="md:hidden px-4 mt-4">
//             <div className="flex items-center gap-3 bg-white rounded-md shadow-sm border border-[#F8F7FDD1] px-3 py-2 mb-3">
//               <div className="w-6 h-6 rounded-lg grid place-items-center bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="16"
//                   height="16"
//                   viewBox="0 0 20 20"
//                   fill="none"
//                 >
//                   <path
//                     d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35"
//                     stroke="white"
//                     strokeWidth="1.6"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//               </div>
//               <input
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search by order id, name"
//                 className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#252525]/60"
//               />
//             </div>

//             <div className="overflow-x-auto -mx-4 px-4">
//               <div className="flex gap-3 text-[#666666] font-normal items-center">
//                 <label className="relative inline-flex items-center gap-2 rounded-[4px] px-4 py-2 bg-white border border-[#E4E4E7B5] shadow-sm whitespace-nowrap">
//                   <span className="text-sm">{statusFilter}</span>
//                   <IoIosArrowDown className=" text-[14px]" />
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="absolute inset-0 w-full h-full z-10 opacity-0 appearance-none cursor-pointer"
//                   >
//                     {STATUS.map((s) => (
//                       <option key={s} value={s}>
//                         {s}
//                       </option>
//                     ))}
//                   </select>
//                 </label>

//                 <label className="relative inline-flex items-center gap-2 rounded-[4px] px-4 py-2  bg-white border border-[#E4E4E7B5] shadow-sm whitespace-nowrap">
//                   <span className="text-sm">
//                     {deliveryFilter === "All"
//                       ? "Delivery Date"
//                       : deliveryFilter}
//                   </span>
//                   <IoIosArrowDown className="text-[14px]" />
//                   <select
//                     value={deliveryFilter}
//                     onChange={(e) => setDeliveryFilter(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
//                   >
//                     {DELIVERY_RANGE.map((s) => (
//                       <option key={s} value={s}>
//                         {s}
//                       </option>
//                     ))}
//                   </select>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Desktop filters (kept) */}
//           <div className="hidden md:block px-[3rem] pt-4">
//             <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
//               <div className="flex flex-nowrap w-full rounded-xl bg-[#F9F8FC]">
//                 <div className="relative flex items-center justify-between gap-2 px-[3rem] py-2 border-r border-slate-200 whitespace-nowrap">
//                   <span className="text-sm text-[#252525]">{statusFilter}</span>
//                   <IoIosArrowDown className="text-[#252525] text-[14px]" />
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="absolute inset-0 w-full h-full z-10 opacity-0 appearance-none cursor-pointer"
//                   >
//                     {STATUS.map((s) => (
//                       <option key={s} value={s}>
//                         {s}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
//                   <span className="text-sm text-[#252525]">
//                     {deliveryFilter === "All"
//                       ? "Delivery Date"
//                       : deliveryFilter}
//                   </span>
//                   <IoIosArrowDown className="text-[#252525] text-[14px]" />
//                   <select
//                     value={deliveryFilter}
//                     onChange={(e) => setDeliveryFilter(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   >
//                     {DELIVERY_RANGE.map((s) => (
//                       <option key={s} value={s}>
//                         {s}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
//                   <span className="text-sm text-[#252525]">
//                     {staffFilter === "All" ? "Staff Assigned" : staffFilter}
//                   </span>
//                   <IoIosArrowDown className="text-[#252525] text-[14px]" />
//                   <select
//                     value={staffFilter}
//                     onChange={(e) => setStaffFilter(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   >
//                     <option value="All">All</option>
//                     {staffList?.map((s) => (
//                       <option key={s._id} value={s.name}>
//                         {s.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
//                   <span className="text-sm text-[#252525]">
//                     {waFilter === "All" ? "WhatsApp Status" : waFilter}
//                   </span>
//                   <IoIosArrowDown className="text-[#252525] text-[14px]" />
//                   <select
//                     value={waFilter}
//                     onChange={(e) => setWaFilter(e.target.value)}
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                   >
//                     {WA_STATUS.map((s) => (
//                       <option key={s} value={s}>
//                         {s}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="flex items-center gap-2 px-6 py-2 flex-1 min-w-0">
//                   <input
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     placeholder="Search by order id, name"
//                     className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60"
//                   />
//                   <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="18"
//                       height="18"
//                       viewBox="0 0 20 20"
//                       fill="none"
//                     >
//                       <path
//                         d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35"
//                         stroke="white"
//                         strokeWidth="1.6"
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Orders list (kept) */}
//           <div className="h-[calc(100%-140px)] md:h-[calc(100%-140px)] px-4 md:px-8 pb-36 md:pb-6 pt-6 overflow-y-auto">
//             {grouped.map(([date, orders]) => (
//               <div key={date} className="space-y-3 mb-6">
//                 <div className="hidden md:block text-[#252525D1] text-[16px] font-semibold leading-[22px] tracking-[0.5px]">
//                   {new Date(date).toLocaleDateString("en-GB", {
//                     day: "numeric",
//                     month: "long",
//                     year: "numeric",
//                   })}
//                 </div>
//                 {!orderloading && !ordererror && orders.length > 0 && (
//                   <>
//                     {orders.map((o, i) => {
//                       const st = orderStatus[o._id];
//                       let cardSkin =
//                         "bg-[#EDF1F6] border border-[#E6EAF0] text-[#252525]";
//                       if (st === "In Progress")
//                         cardSkin =
//                           "border border-[rgba(139,109,199,0.41)] bg-[linear-gradient(90deg,rgba(76,38,153,0.91)_0%,rgba(147,110,221,0.91)_100%)] text-white";
//                       if (st === "Completed")
//                         cardSkin =
//                           "border border-[rgba(154,187,93,0.18)] bg-[linear-gradient(90deg,rgba(84,110,12,0.82)_0%,rgba(163,199,65,0.82)_100%)] text-white";
//                       const isGradient =
//                         st === "In Progress" || st === "Completed";
//                       const idChip = isGradient
//                         ? "bg-white/20 text-white"
//                         : "bg-gradient-to-r from-[#4C2699] to-[#9C7AE8] text-white";
//                       const mainText = isGradient
//                         ? "text-white"
//                         : "text-[#252525F7]";
//                       const subText = isGradient
//                         ? "text-white/90"
//                         : "text-[#252525D1]";
//                       const accentText = isGradient
//                         ? "text-white"
//                         : "text-[#252525]";
//                       const featured = i === 0;

//                       // parse sampleImages (array | single string | comma-separated string)
//                       const getImages = (val) => {
//                         if (!val) return [];
//                         if (Array.isArray(val)) return val.filter(Boolean);
//                         if (typeof val === "string") {
//                           return val
//                             .split(",")
//                             .map((s) => s.trim())
//                             .filter(Boolean);
//                         }
//                         return [];
//                       };
//                       const imgs = getImages(o.sampleImages || o.sampleImages);

//                       return (
//                         <div
//                           key={o._id}
//                           className={`w-full rounded-2xl md:rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.06)] ${cardSkin} ${
//                             featured ? "p-6 md:p-6 rounded-[18px]" : "p-5"
//                           }`}
//                         >
//                           <div className="flex items-center justify-between">
//                             <div
//                               className={`text-[11px] px-2 py-0.5 rounded inline-block ${idChip}`}
//                             >
//                               Order ID: {String(o._id).slice(-6).toUpperCase()}
//                             </div>
//                             <div
//                               className={`relative md:hidden flex items-center gap-2 rounded-md ${
//                                 isGradient ? "bg-white/30" : "bg-white"
//                               } border border-[#8F909185] px-3 py-1`}
//                             >
//                               <span
//                                 className={`${
//                                   isGradient ? "text-white" : "text-[#02143F]"
//                                 } text-[12px] font-semibold`}
//                               >
//                                 {" "}
//                                 {orderStatus[o._id]}
//                               </span>
//                               <IoIosArrowDown
//                                 className={`${
//                                   isGradient ? "text-white" : "text-[#02143F]"
//                                 }`}
//                               />
//                               <select
//                                 aria-label="Change status"
//                                 className="absolute inset-0 opacity-0 cursor-pointer md:hidden"
//                                 value={orderStatus[o._id]}
//                                 onChange={(e) =>
//                                   setOrderStatus((s) => ({
//                                     ...s,
//                                     [o._id]: e.target.value,
//                                   }))
//                                 }
//                               >
//                                 {STATUS.filter((s) => s !== "All").map((s) => (
//                                   <option key={s} value={s}>
//                                     {s}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                           </div>

//                           <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 mt-3">
//                             <div className="space-y-2">
//                               <div
//                                 className={`font-semibold ${
//                                   featured ? "text-[18px]" : "text-[15px]"
//                                 } leading-[22px] tracking-[0.5px] ${mainText}`}
//                               >
//                                 Name: {o.customer?.customerName}
//                               </div>
//                               <div
//                                 className={`text-[12px] leading-[20px] tracking-[0.5px] ${subText}`}
//                               >
//                                 <span className="font-semibold">
//                                   Delivery Date:
//                                 </span>{" "}
//                                 {o.deliveryDate
//                                   ? new Date(o.deliveryDate).toLocaleDateString(
//                                       "en-GB",
//                                       {
//                                         day: "numeric",
//                                         month: "long",
//                                         year: "numeric",
//                                       }
//                                     )
//                                   : "—"}
//                               </div>
//                               <div
//                                 className={`text-[12px] sm:text-[14px] leading-[20px] tracking-[0.5px] ${subText}`}
//                               >
//                                 <span className="font-semibold">
//                                   Garment Type:
//                                 </span>{" "}
//                                 {o.garment}
//                               </div>
//                               <div
//                                 className={`text-[12px] sm:text-[13px] leading-[20px] tracking-[0.5px] ${subText}`}
//                               >
//                                 <span className="font-normal">
//                                   Tailor Assigned:
//                                 </span>{" "}
//                                 {o?.staffAssigned?.name}
//                               </div>
//                               <div
//                                 className={`text-[12px] sm:text-[14px] leading-[20px] tracking-[0.5px] ${accentText}`}
//                               >
//                                 <span className="font-semibold">
//                                   Amount to pay:
//                                 </span>{" "}
//                                 <span className="font-bold">
//                                   {INR(
//                                     (o.totalPayment || 0) -
//                                       (o.advancePayment || 0)
//                                   )}
//                                 </span>
//                               </div>

//                               <div>
//                                 <div
//                                   className={`text-[12px] sm:text-[14px] font-semibold leading-[20px] tracking-[0.5px] ${subText}`}
//                                 >
//                                   Measurements
//                                 </div>
//                                 <div
//                                   className={`text-[12px] sm:text-[13px] font-medium leading-[20px] tracking-[0.5px] ${subText}`}
//                                 >
//                                   {(o.measurements || []).map((m, idx) => (
//                                     <span
//                                       key={idx}
//                                       className="inline-block mr-3"
//                                     >
//                                       {m.label}: {m.value}
//                                     </span>
//                                   ))}
//                                 </div>
//                               </div>

//                               {/* ---------- sampleImages gallery (square thumbnails) ---------- */}
//                               {imgs.length > 0 && (
//                                 <div className="mt-3">
//                                   <div
//                                     className={`text-[12px] sm:text-[14px] font-semibold leading-[20px] tracking-[0.5px] ${subText}`}
//                                   >
//                                     Sample Image{imgs.length > 1 ? "s" : ""}
//                                   </div>
//                                   <div className="mt-2 flex items-start gap-3">
//                                     {imgs.map((url, idx) => (
//                                       <a
//                                         key={idx}
//                                         href={url}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="inline-block rounded-md overflow-hidden shadow-sm"
//                                         title="Open image in new tab"
//                                       >
//                                         <img
//                                           src={url}
//                                           alt={`sample-${idx}`}
//                                           loading="lazy"
//                                           className="w-20 h-20 sm:w-28 sm:h-28 object-cover block"
//                                           onError={(e) => {
//                                             e.currentTarget.onerror = null;
//                                             e.currentTarget.src =
//                                               "/images/image-placeholder.png";
//                                           }}
//                                         />
//                                       </a>
//                                     ))}
//                                   </div>
//                                 </div>
//                               )}
//                               {/* ---------- end sampleImages ---------- */}
//                             </div>

//                             <div className="flex flex-col items-start md:items-end gap-3 sm:mt-4 md:mt-0 md:ml-4 md:shrink-0 md:min-w-[210px]">
//                               <div
//                                 className={`text-[13px] leading-[22px] font-bold tracking-[2px] ${subText}`}
//                               >
//                                 <span className="mr-2">Total :</span>
//                                 <span
//                                   className={`font-semibold text-[16px] ${accentText}`}
//                                 >
//                                   {INR(o.totalPayment || 0)}
//                                 </span>
//                               </div>

//                               <div
//                                 className={`relative hidden md:flex items-center gap-2 rounded-md ${
//                                   isGradient ? "bg-white/30" : "bg-white"
//                                 } border border-[#8F909185] px-4 py-1`}
//                               >
//                                 <span
//                                   className={`text-[13px] font-semibold ${
//                                     isGradient ? "text-white" : "text-[#02143F]"
//                                   }`}
//                                 >
//                                   {st}
//                                 </span>
//                                 <IoIosArrowDown
//                                   className={`${
//                                     isGradient ? "text-white" : "text-[#02143F]"
//                                   }`}
//                                 />
//                                 <select
//                                   value={orderStatus[o._id] ?? st}
//                                   onChange={(e) =>
//                                     handleStatusChange(
//                                       o._id,
//                                       e.target.value,
//                                       st
//                                     )
//                                   }
//                                   className="w-full bg-transparent px-2 py-1 border border-gray-300 rounded-md text-sm"
//                                 >
//                                   {STATUS.filter((s) => s !== "All").map(
//                                     (s) => (
//                                       <option key={s} value={s}>
//                                         {s}
//                                       </option>
//                                     )
//                                   )}
//                                 </select>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Buttons */}
//                           <div className="mt-6 flex flex-row items-center justify-end gap-3">
//                             <button
//                               type="button"
//                               onClick={() => openEditOrder(o)}
//                               className="rounded-md bg-white border text-[12px] font-medium leading-[22px] tracking-[0.5px] px-4 py-2 hover:bg-slate-50"
//                               aria-label={`Edit order ${o._id}`}
//                             >
//                               Edit
//                             </button>

//                             <button
//                               type="button"
//                               onClick={() => handleDeleteOrder(o._id)}
//                               className="rounded-md bg-red-50 text-red-700 border border-red-200 text-[12px] font-medium leading-[22px] tracking-[0.5px] px-4 py-2 hover:bg-red-100"
//                               aria-label={`Delete order ${o._id}`}
//                             >
//                               Delete
//                             </button>

//                             {/* <button className={`rounded-md text-[12px] font-medium leading-[22px] tracking-[0.5px] px-5 py-2 md:px-5 md:py-2 w-1/2 md:w-auto ${isGradient ? "bg-white text-[#252525] hover:bg-slate-50" : "bg-[#13234BD1] text-white hover:brightness-110"}`}>
//                               send Message
//                             </button> */}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </>
//                 )}
//               </div>
//             ))}

//             {!grouped || grouped.length === 0 ? (
//               <div className="text-center text-slate-500 py-16">
//                 No orders match your filters.
//               </div>
//             ) : null}
//           </div>

//           {/* Add/Edit Order form modal */}
//           <div
//             className={`fixed inset-0 z-50 ${
//               showForm ? "pointer-events-auto" : "pointer-events-none"
//             }`}
//             aria-hidden={!showForm}
//           >
//             <div
//               className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
//                 showForm ? "opacity-100" : "opacity-0"
//               }`}
//               onClick={() => cancelEdit()}
//             />
//             <div
//               className={`absolute left-[50%] sm:left-[58.5%] -translate-x-1/2 w-full max-w-[1220px] transition-transform duration-300 ${
//                 showForm ? "translate-y-0" : "-translate-y-full"
//               }`}
//             >
//               <div className="mx-4 mt-6 rounded-2xl bg-white shadow-2xl max-h-[80vh] sm:max-h-[75vh] overflow-y-auto">
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
//                   <h3 className="text-lg font-semibold text-[#252525]">
//                     {editingOrderId ? "Edit Order" : "Add Order"}
//                   </h3>
//                   <button
//                     onClick={() => cancelEdit()}
//                     className="text-sm text-slate-500 hover:text-slate-700"
//                   >
//                     Cancel
//                   </button>
//                 </div>

//                 <form
//                   onSubmit={handleSaveOrder}
//                   className="px-6 py-6 bg-[#F6F7FA]"
//                 >
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     {/* Handwritten file with inline loader */}
//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         Upload handwritten image
//                       </label>
//                       <div className="flex items-center gap-3">
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleHandwrittenFileChange}
//                           disabled={isParsingHandwritten}
//                           aria-label="Upload handwritten order image"
//                           aria-busy={isParsingHandwritten ? "true" : "false"}
//                           className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200 ${
//                             isParsingHandwritten
//                               ? "opacity-60 cursor-not-allowed"
//                               : ""
//                           }`}
//                         />
//                         <div className="w-[96px] flex items-center gap-2">
//                           {isParsingHandwritten ? (
//                             <div className="flex items-center gap-2">
//                               <svg
//                                 className="animate-spin h-5 w-5 text-[#13234B]"
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 aria-hidden="true"
//                               >
//                                 <circle
//                                   cx="12"
//                                   cy="12"
//                                   r="10"
//                                   stroke="currentColor"
//                                   strokeWidth="3"
//                                   className="opacity-20"
//                                 />
//                                 <path
//                                   d="M4 12a8 8 0 018-8"
//                                   stroke="currentColor"
//                                   strokeWidth="3"
//                                   strokeLinecap="round"
//                                 />
//                               </svg>
//                               <span className="text-xs text-slate-600">
//                                 Parsing…
//                               </span>
//                             </div>
//                           ) : (
//                             <div className="text-xs text-slate-400">Ready</div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Customer name */}
//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         Customer Name*
//                       </label>
//                       <input
//                         value={form.customerName}
//                         onChange={(e) => update("customerName", e.target.value)}
//                         placeholder="Enter full name"
//                         className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                         required
//                       />
//                     </div>

//                     {/* Phone */}
//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         Phone Number*
//                       </label>
//                       <input
//                         text="tel"
//                         value={form.phone}
//                         onChange={(e) => update("phone", e.target.value)}
//                         placeholder="Enter number"
//                         maxLength={10}
//                         pattern="[0-9]*"
//                         className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                         required
//                       />
//                     </div>

//                     {/* Garment */}
//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         What garment is being stitched*
//                       </label>
//                       <input
//                         value={form.garment}
//                         onChange={(e) => update("garment", e.target.value)}
//                         placeholder="Enter"
//                         className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                         required
//                       />
//                     </div>

//                     {/* Delivery date */}
//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         delivery date*
//                       </label>
//                       <input
//                         type="date"
//                         value={form.deliveryDate}
//                         onChange={(e) => update("deliveryDate", e.target.value)}
//                         className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                         required
//                       />
//                     </div>

//                     {/* Any special instructions */}
//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         Any special instructions
//                       </label>
//                       <input
//                         value={form.instructions}
//                         onChange={(e) => update("instructions", e.target.value)}
//                         placeholder="Enter"
//                         className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                       />
//                     </div>

//                     {/* --- Pair: sample design image + staff assigned (highlighted background) --- */}
//                     <div className="md:col-span-2">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start rounded-lg p-4 border border-[#F3E8D6] bg-gradient-to-r from-[#FFF8EE] to-[#FFF3E8]">
//                         {/* Sample design */}
//                         <div>
//                           <label className="block text-sm font-medium text-[#252525] mb-1">
//                             Sample design image
//                           </label>

//                           <div className="flex gap-3 items-center">
//                             <div className="flex-1">
//                               {form.designImage ? (
//                                 <div className="flex items-center gap-3">
//                                   <div className="w-20 h-20 rounded-md overflow-hidden border">
//                                     {typeof form.designImage === "string" ? (
//                                       <img
//                                         src={form.designImage}
//                                         alt="design"
//                                         className="w-full h-full object-cover"
//                                       />
//                                     ) : form.designImage instanceof File ? (
//                                       <img
//                                         src={URL.createObjectURL(
//                                           form.designImage
//                                         )}
//                                         alt="design"
//                                         className="w-full h-full object-cover"
//                                       />
//                                     ) : (
//                                       <div className="w-full h-full bg-slate-100" />
//                                     )}
//                                   </div>
//                                   <div className="text-sm text-slate-700 break-words">
//                                     {typeof form.designImage === "string"
//                                       ? form.designImage.split("/").pop()
//                                       : form.designImage.name}
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div className="text-sm text-slate-500">
//                                   No sample chosen
//                                 </div>
//                               )}
//                             </div>

//                             <div className="flex gap-2">
//                               <button
//                                 type="button"
//                                 onClick={openGalleryForAddOrder}
//                                 className="px-4 py-2 rounded-md bg-white border hover:bg-slate-50"
//                               >
//                                 Choose from gallery
//                               </button>
//                             </div>
//                           </div>

//                           {/* ?<p className="mt-2 text-xs text-slate-500">Optional — choose a reference image from the gallery or upload (max 5MB).</p> */}
//                         </div>

//                         {/* Staff assigned */}
//                         <div>
//                           <label className="block text-sm font-medium text-[#252525] mb-1">
//                             Staff Assigned*
//                           </label>
//                           <div className="relative">
//                             <select
//                               value={form.staff}
//                               onChange={(e) => update("staff", e.target.value)}
//                               className="w-full appearance-none rounded-md border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                               required
//                               aria-label="Select staff assigned"
//                             >
//                               <option value="" disabled>
//                                 Select
//                               </option>
//                               {staffList?.map((s) => (
//                                 <option key={s._id} value={s._id}>
//                                   {s.name}
//                                 </option>
//                               ))}
//                             </select>
//                             <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
//                               <IoIosArrowDown />
//                             </span>
//                             <p className="mt-2 text-xs text-slate-500">
//                               Assign a staff member for this order.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         Measurements*
//                       </label>

//                       <div className="space-y-3">
//                         {form.measurements.map((m, idx) => (
//                           <div
//                             key={idx}
//                             className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start sm:items-center"
//                           >
//                             {/* Area/Label */}
//                             <div className="sm:col-span-5">
//                               <input
//                                 value={m.label}
//                                 onChange={(e) =>
//                                   updateMeasurement(idx, "area", e.target.value)
//                                 }
//                                 placeholder="Area of measurement (e.g., Bust)"
//                                 className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-200 min-w-0"
//                                 required={idx === 0}
//                               />
//                             </div>

//                             {/* Value */}
//                             <div className="sm:col-span-5">
//                               <input
//                                 value={m.value}
//                                 onChange={(e) =>
//                                   updateMeasurement(
//                                     idx,
//                                     "value",
//                                     e.target.value
//                                   )
//                                 }
//                                 placeholder="Measurement (e.g., 34)"
//                                 className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-200 min-w-0"
//                                 required={idx === 0}
//                               />
//                             </div>

//                             {/* Actions */}
//                             <div className="sm:col-span-2 flex gap-2 sm:items-center sm:justify-start">
//                               <button
//                                 type="button"
//                                 onClick={addMeasurementRow}
//                                 className="px-3 py-2 sm:px-4 rounded-md bg-white border text-sm font-medium hover:bg-slate-50 shrink-0"
//                                 aria-label="Add measurement"
//                               >
//                                 +
//                               </button>
//                               <button
//                                 type="button"
//                                 onClick={() => removeMeasurementRow(idx)}
//                                 className="px-3 py-2 sm:px-4 rounded-md bg-white border text-sm font-medium hover:bg-slate-50 shrink-0"
//                                 aria-label="Remove measurement"
//                               >
//                                 −
//                               </button>
//                             </div>
//                           </div>
//                         ))}
//                       </div>

//                       <div className="text-xs text-slate-500 mt-2">
//                         Click + to add another measurement row. You can remove
//                         rows with −.
//                       </div>
//                     </div>

//                     {/* Payments */}
//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         Total Payment*
//                       </label>
//                       <input
//                         value={form.totalPayment}
//                         type="number"
//                         min="0"
//                         onChange={(e) => update("totalPayment", e.target.value)}
//                         placeholder="Enter"
//                         className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                         required
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-[#252525] mb-1">
//                         Advance Payment
//                       </label>
//                       <input
//                         value={form.advancePayment}
//                         type="number"
//                         min="0"
//                         max={form.totalPayment}
//                         onChange={(e) =>
//                           update("advancePayment", e.target.value)
//                         }
//                         placeholder="Enter"
//                         className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//                       />
//                     </div>

//                     <div className="md:col-span-2">
//                       <label className="inline-flex items-center gap-3 text-sm text-[#252525]">
//                         <input
//                           type="checkbox"
//                           checked={form.sendWhatsapp}
//                           onChange={(e) =>
//                             update("sendWhatsapp", e.target.checked)
//                           }
//                           className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
//                         />
//                         Send order summary to customer on WhatsApp
//                       </label>
//                     </div>
//                   </div>

//                   <div className="mt-8 flex items-center justify-end gap-3">
//                     <button
//                       type="button"
//                       onClick={() => cancelEdit()}
//                       className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm text-[#252525] hover:bg-slate-50"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="rounded-lg bg-[#13234B] text-white px-6 py-2 text-sm font-medium hover:brightness-110"
//                     >
//                       {editingOrderId ? "Update" : "Save"}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>

//           <SendImagesModal
//             isOpen={showSendModal || showGalleryForAdd}
//             onClose={() => {
//               if (showGalleryForAdd) closeGalleryForAddOrder();
//               else closeSendImagesModal();
//             }}
//             selectedOrder={showSendModal ? selectedOrder : null}
//             galleryItems={galleryItems}
//             galleryLoading={galleryLoading}
//             galleryError={galleryError}
//             onSendImages={(selectedImageIds, category) =>
//               onModalSendHandler(selectedImageIds, category)
//             }
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

















// src/app/(your-path)/OrdersPage.jsx  (adjust path/name if needed)
"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useGetOrders } from "../hooks/usegetorders";
import { useGetStaff } from "../hooks/usegetstaff";

import { IoIosArrowDown } from "react-icons/io";
import { FiX } from "react-icons/fi";
import { Poppins } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";

import SendImagesModal from "../components/SendImagesModal"; // <-- imported component

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600"] });

const RAW = [
  {
    id: "ord-1001",
    orderId: "#OD1247",
    placedOn: "2025-08-03",
    name: "Priya Sharma",
  },
  {
    id: "ord-1000",
    orderId: "#OD1246",
    placedOn: "2025-08-02",
    name: "Jeevana",
  },
  {
    id: "ord-1003",
    orderId: "#OD1248",
    placedOn: "2025-08-03",
    name: "Jeevna",
  },
];

const STATUS = ["All", "Pending", "In Progress", "Completed"];
const WA_STATUS = ["All", "Not Sent", "Sent", "Delivered", "Read", "Replied"];
const DELIVERY_RANGE = ["All", "Today", "Next 7 Days", "This Month", "Overdue"];

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};
const isInDeliveryRange = (iso, range) => {
  if (range === "All") return true;
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end7 = new Date(today);
  end7.setDate(today.getDate() + 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  if (range === "Today")
    return (
      d.getTime() >= today.getTime() && d.getTime() < endOfDay(today).getTime()
    );
  if (range === "Next 7 Days") return d >= today && d <= end7;
  if (range === "This Month") return d >= monthStart && d <= monthEnd;
  if (range === "Overdue") return d < today;
  return true;
};

export default function OrdersPage() {
  // Filters & lists
  const [statusFilter, setStatusFilter] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");
  const [staffFilter, setStaffFilter] = useState("All");
  const [waFilter, setWaFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [staffList, setStaffList] = useState([]);

  // Orders
  const { orders, orderloading, ordererror, refetch } = useGetOrders?.() || {};
  const [localOrders, setLocalOrders] = useState([]);
  useEffect(() => {
    if (orders) setLocalOrders(orders);
  }, [orders]);

  // Order status local
  const [orderStatus, setOrderStatus] = useState({});
  useEffect(() => {
    if (orders && orders.length > 0)
      setOrderStatus(
        Object.fromEntries(orders.map((o) => [o._id, o.status || "Pending"]))
      );
  }, [orders]);

  const staffOptions = useMemo(
    () => ["All", ...Array.from(new Set(RAW.map((o) => o.staff)))],
    []
  );

  // Add/Edit order form
  const [showForm, setShowForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    garment: "",
    deliveryDate: "",
    designImage: "", // will hold a URL string when chosen from gallery (or File if you later allow upload)
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

  // preview + parsing state for handwritten (unchanged)
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

  // robust date parser and helpers (kept from your file)
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
      jan: 1,
      january: 1,
      feb: 2,
      february: 2,
      mar: 3,
      march: 3,
      apr: 4,
      april: 4,
      may: 5,
      jun: 6,
      june: 6,
      jul: 7,
      july: 7,
      aug: 8,
      august: 8,
      sep: 9,
      sept: 9,
      september: 9,
      oct: 10,
      october: 10,
      nov: 11,
      november: 11,
      dec: 12,
      december: 12,
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
    const defaultOrder = [
      "Bust",
      "Waist",
      "Length",
      "Hip",
      "Shoulder",
      "Sleeve",
    ];
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
    const exact = staffListLocal.find(
      (s) => (s.name || "").toLowerCase() === lc
    );
    if (exact) return exact._id;
    const inc = staffListLocal.find((s) =>
      (s.name || "").toLowerCase().includes(lc)
    );
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
        next.phone = digits.length
          ? digits.length > 10
            ? digits.slice(-10)
            : digits
          : prev.phone;
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
      if (parsed.totalPayment != null)
        next.totalPayment = String(parsed.totalPayment);
      if (parsed.advancePayment != null)
        next.advancePayment = String(parsed.advancePayment);
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

  // ------------------ HANDLER for handwritten file input ------------------
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
          toast.error(
            "Could not reliably extract fields. Raw text copied to clipboard."
          );
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

  // Design image local upload handler (kept, still supported if you keep file uploads)
  const handleDesignImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    update("designImage", file);
  };

  // staff fetch
  const { staff, loading, error } = useGetStaff();
  useEffect(() => {
    if (!loading && staff?.length > 0) setStaffList(staff);
  }, [staff, loading]);

  // filtered orders
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (localOrders || [])
      .filter((o) => {
        const matchesText =
          !q ||
          (o.customer?.customerName &&
            o.customer.customerName.toLowerCase().includes(q)) ||
          (o.garment && o.garment.toLowerCase().includes(q)) ||
          (o._id && o._id.toLowerCase().includes(q));
        const byStatus =
          statusFilter === "All"
            ? true
            : (orderStatus[o._id] || "").toLowerCase() ===
              statusFilter.toLowerCase();
        const byDelivery = isInDeliveryRange(o.deliveryDate, deliveryFilter);
        const byStaff =
          staffFilter === "All" ? true : o?.staffAssigned?.name === staffFilter;
        const byWA = waFilter === "All" ? true : o.waStatus === waFilter;
        return matchesText && byStatus && byDelivery && byStaff && byWA;
      })
      .sort((a, b) => (a.placedOn < b.placedOn ? 1 : -1));
  }, [
    localOrders,
    query,
    statusFilter,
    deliveryFilter,
    staffFilter,
    waFilter,
    orderStatus,
  ]);

  // status change
  const handleStatusChange = async (orderId, newStatus, prevStatus) => {
    if (prevStatus === "Delivered" && newStatus !== "Delivered") {
      toast.error("Cannot change status from Delivered to another status.");
      return;
    }
    if (prevStatus === "Completed" && newStatus === "Pending") {
      toast.error("Cannot change status from Completed to Pending.");
      return;
    }
    const old = orderStatus[orderId] || prevStatus;
    setOrderStatus((s) => ({ ...s, [orderId]: newStatus }));
    const toastLoading = toast.loading("Updating status...");
    try {
      const res = await fetch("/api/v1/orders/update-order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Order status updated!", { id: toastLoading });
      } else {
        setOrderStatus((s) => ({ ...s, [orderId]: old }));
        toast.error(data?.error || "Failed to update status", {
          id: toastLoading,
        });
      }
    } catch (err) {
      setOrderStatus((s) => ({ ...s, [orderId]: old }));
      toast.error(err?.message || "Error updating status", {
        id: toastLoading,
      });
    }
  };

  // upload helper (unchanged)
  async function uploadFileToS3(file) {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/s3/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.url) return data.url;
    throw new Error(data.error || "Upload failed");
  }

  // ---------------------------
  // Unified save for create/update
  // ---------------------------
  const handleSaveOrder = async (e) => {
    e?.preventDefault?.();
    const toastId = toast.loading(
      editingOrderId ? "Updating order..." : "Creating order..."
    );

    try {
      // basic validation
      if (!form.customerName?.trim()) {
        toast.error("Customer name is required", { id: toastId });
        return;
      }
      if (!form.phone?.trim()) {
        toast.error("Phone is required", { id: toastId });
        return;
      }
      if (!form.garment?.trim()) {
        toast.error("Garment is required", { id: toastId });
        return;
      }
      if (!form.deliveryDate) {
        toast.error("Delivery date is required", { id: toastId });
        return;
      }
      if (!form.staff) {
        toast.error("Please assign a staff", { id: toastId });
        return;
      }
      if (
        form.totalPayment &&
        form.advancePayment &&
        Number(form.advancePayment) > Number(form.totalPayment)
      ) {
        toast.error("Advance cannot be greater than total", { id: toastId });
        return;
      }

      // handle designImage file upload if File
      let sampleDesignImageUrl = "";
      if (form.designImage instanceof File) {
        const maxMB = 5;
        if (form.designImage.size / (1024 * 1024) > maxMB) {
          toast.error(`Image must be smaller than ${maxMB}MB`, { id: toastId });
          return;
        }
        sampleDesignImageUrl = await uploadFileToS3(form.designImage);
      } else if (typeof form.designImage === "string" && form.designImage) {
        sampleDesignImageUrl = form.designImage;
      }

      const payload = {
        customerName: form.customerName,
        phoneNumber: form.phone,
        garment: form.garment,
        deliveryDate: form.deliveryDate
          ? new Date(form.deliveryDate).toISOString()
          : null,
        sampleDesignImageUrl,
        specialInstructions: form.instructions || "",
        measurements: form.measurements?.filter((m) => m.label && m.value),
        handwrittenImageUrl: form.handwrittenImageUrl,
        staffAssigned: form.staff,
        advancePayment: Number(form.advancePayment) || 0,
        totalPayment: Number(form.totalPayment) || 0,
        sendWhatsAppSummary: !!form.sendWhatsapp,
      };

      let res, data;
      if (editingOrderId) {
        // update existing order
        res = await fetch("/api/v1/orders/update-order", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingOrderId, ...payload }),
        });
        data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          toast.success("Order updated!", { id: toastId });
          if (typeof refetch === "function") {
            refetch();
          } else {
            // attempt to merge returned order or payload into localOrders
            const updated = data.order || { ...payload, _id: editingOrderId };
            setLocalOrders((prev) =>
              prev.map((o) =>
                o._id === editingOrderId ? { ...o, ...updated } : o
              )
            );
          }
        } else {
          throw new Error(data?.error || "Failed to update order");
        }
      } else {
        // create new order
        res = await fetch("/api/v1/orders/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await res.json().catch(() => ({}));
        if (res.ok && !data.error && data.order) {
          toast.success("Order created!", { id: toastId });
          if (typeof refetch === "function") refetch();
          else setLocalOrders((prev) => [data.order, ...prev]);
        } else {
          throw new Error(data?.error || "Error creating order");
        }
      }

      // close modal & clear
      setShowForm(false);
      setEditingOrderId(null);
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
    } catch (err) {
      console.error("Save order error:", err);
      toast.error(err?.message || "Error saving order", { id: toastId });
    }
  };

  // ---------------------------
  // Edit flow helpers
  // ---------------------------
  function openEditOrder(order) {
    if (!order) return;
    setEditingOrderId(order._id);
    setForm({
      customerName: order.customer?.customerName || order.customerName || "",
      phone: (order.phoneNumber || order.customer?.mobileNumber || "")
        .toString()
        .slice(-10),
      garment: order.garment || "",
      deliveryDate: order.deliveryDate
        ? new Date(order.deliveryDate).toISOString().slice(0, 10)
        : "",
      designImage: order.sampleImages || order.sampleDesignImageUrl || "",
      instructions: order.specialInstructions || "",
      measurements:
        Array.isArray(order.measurements) && order.measurements.length
          ? order.measurements
          : [{ label: "", value: "" }],
      handwrittenImageUrl: order.handwrittenImageUrl || "",
      staff: order.staffAssigned?._id || order.staffAssigned || "",
      totalPayment:
        order.totalPayment != null ? String(order.totalPayment) : "",
      advancePayment:
        order.advancePayment != null ? String(order.advancePayment) : "",
      sendWhatsapp:
        !!order.sendOrderSummaryWhatsapp || !!order.sendWhatsAppSummary,
    });
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingOrderId(null);
    setShowForm(false);
  }

  // ---------------------------
  // Delete flow
  // ---------------------------
  async function handleDeleteOrder(orderId) {
    if (!orderId) return;
    const ok = window.confirm(
      "Are you sure you want to delete this order? This action cannot be undone."
    );
    if (!ok) return;

    const toastId = toast.loading("Deleting order...");
    const prevOrders = localOrders;
    setLocalOrders((ls) => ls.filter((o) => o._id !== orderId));

    try {
      const res = await fetch("/api/v1/orders/delete-order", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        toast.success("Order deleted", { id: toastId });
        if (typeof refetch === "function") refetch();
      } else {
        setLocalOrders(prevOrders);
        throw new Error(
          data?.error || `Failed to delete (status ${res.status})`
        );
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err?.message || "Error deleting order", { id: toastId });
    }
  }

  // grouped orders
  const grouped = useMemo(() => {
    const m = new Map();
    (filtered || []).forEach((o) => {
      const orderDate = o.createdAt
        ? new Date(o.createdAt).toISOString().slice(0, 10)
        : o.placedOn;
      if (!m.has(orderDate)) m.set(orderDate, []);
      m.get(orderDate).push(o);
    });
    return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  // -- SEND IMAGES modal: dynamic gallery fetch --
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError] = useState(null);

  // Whether the gallery modal is opened to pick a sample design for Add Order
  const [showGalleryForAdd, setShowGalleryForAdd] = useState(false);

  // fetch gallery helper (re-used for both flows)
  async function fetchGallery() {
    try {
      setGalleryLoading(true);
      setGalleryError(null);
      const res = await fetch("/api/v1/gallery/get-gallery");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const items =
        data?.GalleryItems || data?.galleryItems || data?.items || [];
      setGalleryItems(items);
    } catch (err) {
      console.error("Failed to load gallery", err);
      setGalleryError(err.message || "Failed to load gallery");
      toast.error("Failed to load gallery");
    } finally {
      setGalleryLoading(false);
    }
  }

  // open modal and fetch gallery for per-order "Send Images"
  async function openSendImagesModal(order) {
    setSelectedOrder(order);
    setShowSendModal(true);
    document.body.style.overflow = "hidden";
    await fetchGallery();
  }

  function closeSendImagesModal() {
    setShowSendModal(false);
    setSelectedOrder(null);
    setGalleryItems([]);
    setGalleryError(null);
    document.body.style.overflow = "";
  }

  // open gallery modal for Add Order design picker
  async function openGalleryForAddOrder() {
    setShowGalleryForAdd(true);
    document.body.style.overflow = "hidden";
    await fetchGallery();
  }

  function closeGalleryForAddOrder() {
    setShowGalleryForAdd(false);
    setGalleryItems([]);
    setGalleryError(null);
    document.body.style.overflow = "";
  }

  // Handler when user sends images for an order (existing flow)
  async function handleSendSelectedImagesForOrder(selectedImageIds = []) {
    if (!selectedImageIds.length) {
      toast.error("Select at least one image");
      return;
    }
    toast.success(
      `Sending ${selectedImageIds.length} images for order ${
        selectedOrder?._id || selectedOrder?.orderId || ""
      }`
    );
    closeSendImagesModal();
  }

  // Handler when user selects images while picking design for Add Order
  function handleChooseImagesForAdd(selectedImageIds = []) {
    if (!selectedImageIds.length) {
      toast.error("Select at least one image");
      return;
    }
    const firstId = selectedImageIds[0];
    const item = galleryItems.find((g) => g._id === firstId) || {};
    const url = item.url || item.src || item.imageUrl || item.path || "";
    if (url) {
      update("designImage", url);
      toast.success("Design image chosen from gallery");
    } else {
      toast.error("Chosen image has no URL");
    }
    closeGalleryForAddOrder();
  }

  // Handler passed into imported SendImagesModal as onSendImages: detect mode by whether selectedOrder is set or showGalleryForAdd true
  function onModalSendHandler(selectedImageIds = [], category = null) {
    if (showGalleryForAdd) {
      handleChooseImagesForAdd(selectedImageIds);
    } else {
      handleSendSelectedImagesForOrder(selectedImageIds);
    }
  }

  const SAMPLE_IMG =
    "https://images.unsplash.com/photo-1562158070-9b9b9b2f6a66?w=800&q=60&auto=format&fit=crop";

  // UI render (mostly preserved)
  return (
    <div
      className={`${poppins.className} mx-auto sm:max-w-[1180px] pt-6 h-screen`}
    >
      <Toaster />
      <div className="h-[calc(100vh-48px)] rounded-[22px] bg-white shadow-xl overflow-hidden">
        <div className="h-[calc(100vh-48px)] rounded-[22px] bg-white shadow-xl overflow-hidden relative">
          {/* Header */}
          <div className="flex items-center gap-4 px-6 md:px-8 pt-6">
            <h1 className="text-[16px] sm:text-[20px] leading-[35px] text-[#252525] font-semibold flex-1">
              Order Management
            </h1>
            <button
              onClick={() => {
                setEditingOrderId(null);
                setShowForm(true);
              }}
              className="rounded-lg bg-[#EC9705] text-white text-[15px] font-semibold leading-[22px] tracking-[0.2px] px-6 py-1 shadow hover:bg-amber-600"
            >
              +Add Order
            </button>
          </div>

          {/* Mobile filters (kept as-is) */}
          <div className="md:hidden px-4 mt-4">
            <div className="flex items-center gap-3 bg-white rounded-md shadow-sm border border-[#F8F7FDD1] px-3 py-2 mb-3">
              <div className="w-6 h-6 rounded-lg grid place-items-center bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order id, name"
                className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#252525]/60"
              />
            </div>

            <div className="overflow-x-auto -mx-4 px-4">
              <div className="flex gap-3 text-[#666666] font-normal items-center">
                <label className="relative inline-flex items-center gap-2 rounded-[4px] px-4 py-2 bg-white border border-[#E4E4E7B5] shadow-sm whitespace-nowrap">
                  <span className="text-sm">{statusFilter}</span>
                  <IoIosArrowDown className=" text-[14px]" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="absolute inset-0 w-full h-full z-10 opacity-0 appearance-none cursor-pointer"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="relative inline-flex items-center gap-2 rounded-[4px] px-4 py-2  bg-white border border-[#E4E4E7B5] shadow-sm whitespace-nowrap">
                  <span className="text-sm">
                    {deliveryFilter === "All"
                      ? "Delivery Date"
                      : deliveryFilter}
                  </span>
                  <IoIosArrowDown className="text-[14px]" />
                  <select
                    value={deliveryFilter}
                    onChange={(e) => setDeliveryFilter(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                  >
                    {DELIVERY_RANGE.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          {/* Desktop filters (kept) */}
          <div className="hidden md:block px-[3rem] pt-4">
            <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
              <div className="flex flex-nowrap w-full rounded-xl bg-[#F9F8FC]">
                <div className="relative flex items-center justify-between gap-2 px-[3rem] py-2 border-r border-slate-200 whitespace-nowrap">
                  <span className="text-sm text-[#252525]">{statusFilter}</span>
                  <IoIosArrowDown className="text-[#252525] text-[14px]" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="absolute inset-0 w-full h-full z-10 opacity-0 appearance-none cursor-pointer"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
                  <span className="text-sm text-[#252525]">
                    {deliveryFilter === "All"
                      ? "Delivery Date"
                      : deliveryFilter}
                  </span>
                  <IoIosArrowDown className="text-[#252525] text-[14px]" />
                  <select
                    value={deliveryFilter}
                    onChange={(e) => setDeliveryFilter(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    {DELIVERY_RANGE.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
                  <span className="text-sm text-[#252525]">
                    {staffFilter === "All" ? "Staff Assigned" : staffFilter}
                  </span>
                  <IoIosArrowDown className="text-[#252525] text-[14px]" />
                  <select
                    value={staffFilter}
                    onChange={(e) => setStaffFilter(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    <option value="All">All</option>
                    {staffList?.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
                  <span className="text-sm text-[#252525]">
                    {waFilter === "All" ? "WhatsApp Status" : waFilter}
                  </span>
                  <IoIosArrowDown className="text-[#252525] text-[14px]" />
                  <select
                    value={waFilter}
                    onChange={(e) => setWaFilter(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  >
                    {WA_STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 px-6 py-2 flex-1 min-w-0">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by order id, name"
                    className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60"
                  />
                  <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm8.5 2.5-4.35-4.35"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders list (kept) */}
          <div className="h-[calc(100%-140px)] md:h-[calc(100%-140px)] px-4 md:px-8 pb-36 md:pb-6 pt-6 overflow-y-auto">
            {grouped.map(([date, orders]) => (
              <div key={date} className="space-y-3 mb-6">
                <div className="hidden md:block text-[#252525D1] text-[16px] font-semibold leading-[22px] tracking-[0.5px]">
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                {!orderloading && !ordererror && orders.length > 0 && (
                  <>
                    {orders.map((o, i) => {
                      const st = orderStatus[o._id];
                      let cardSkin =
                        "bg-[#EDF1F6] border border-[#E6EAF0] text-[#252525]";
                      if (st === "In Progress")
                        cardSkin =
                          "border border-[rgba(139,109,199,0.41)] bg-[linear-gradient(90deg,rgba(76,38,153,0.91)_0%,rgba(147,110,221,0.91)_100%)] text-white";
                      if (st === "Completed")
                        cardSkin =
                          "border border-[rgba(154,187,93,0.18)] bg-[linear-gradient(90deg,rgba(84,110,12,0.82)_0%,rgba(163,199,65,0.82)_100%)] text-white";
                      const isGradient =
                        st === "In Progress" || st === "Completed";
                      const idChip = isGradient
                        ? "bg-white/20 text-white"
                        : "bg-gradient-to-r from-[#4C2699] to-[#9C7AE8] text-white";
                      const mainText = isGradient
                        ? "text-white"
                        : "text-[#252525F7]";
                      const subText = isGradient
                        ? "text-white/90"
                        : "text-[#252525D1]";
                      const accentText = isGradient
                        ? "text-white"
                        : "text-[#252525]";
                      const featured = i === 0;

                      // parse sampleImages (array | single string | comma-separated string)
                      const getImages = (val) => {
                        if (!val) return [];
                        if (Array.isArray(val)) return val.filter(Boolean);
                        if (typeof val === "string") {
                          return val
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                        }
                        return [];
                      };
                      const imgs = getImages(o.sampleImages || o.sampleImages);

                      return (
                        <div
                          key={o._id}
                          className={`w-full rounded-2xl md:rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.06)] ${cardSkin} ${
                            featured ? "p-6 md:p-6 rounded-[18px]" : "p-5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div
                              className={`text-[11px] px-2 py-0.5 rounded inline-block ${idChip}`}
                            >
                              Order ID: {String(o._id).slice(-6).toUpperCase()}
                            </div>
                            <div
                              className={`relative md:hidden flex items-center gap-2 rounded-md ${
                                isGradient ? "bg-white/30" : "bg-white"
                              } border border-[#8F909185] px-3 py-1`}
                            >
                              <span
                                className={`${
                                  isGradient ? "text-white" : "text-[#02143F]"
                                } text-[12px] font-semibold`}
                              >
                                {" "}
                                {orderStatus[o._id]}
                              </span>
                              <IoIosArrowDown
                                className={`${
                                  isGradient ? "text-white" : "text-[#02143F]"
                                }`}
                              />
                              <select
                                aria-label="Change status"
                                className="absolute inset-0 opacity-0 cursor-pointer md:hidden"
                                value={orderStatus[o._id]}
                                onChange={(e) =>
                                  setOrderStatus((s) => ({
                                    ...s,
                                    [o._id]: e.target.value,
                                  }))
                                }
                              >
                                {STATUS.filter((s) => s !== "All").map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 mt-3">
                            <div className="space-y-2">
                              <div
                                className={`font-semibold ${
                                  featured ? "text-[18px]" : "text-[15px]"
                                } leading-[22px] tracking-[0.5px] ${mainText}`}
                              >
                                Name: {o.customer?.customerName}
                              </div>
                              <div
                                className={`text-[12px] leading-[20px] tracking-[0.5px] ${subText}`}
                              >
                                <span className="font-semibold">
                                  Delivery Date:
                                </span>{" "}
                                {o.deliveryDate
                                  ? new Date(o.deliveryDate).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )
                                  : "—"}
                              </div>
                              <div
                                className={`text-[12px] sm:text-[14px] leading-[20px] tracking-[0.5px] ${subText}`}
                              >
                                <span className="font-semibold">
                                  Garment Type:
                                </span>{" "}
                                {o.garment}
                              </div>
                              <div
                                className={`text-[12px] sm:text-[13px] leading-[20px] tracking-[0.5px] ${subText}`}
                              >
                                <span className="font-normal">
                                  Tailor Assigned:
                                </span>{" "}
                                {o?.staffAssigned?.name}
                              </div>
                              <div
                                className={`text-[12px] sm:text-[14px] leading-[20px] tracking-[0.5px] ${accentText}`}
                              >
                                <span className="font-semibold">
                                  Amount to pay:
                                </span>{" "}
                                <span className="font-bold">
                                  {INR(
                                    (o.totalPayment || 0) -
                                      (o.advancePayment || 0)
                                  )}
                                </span>
                              </div>

                              <div>
                                <div
                                  className={`text-[12px] sm:text-[14px] font-semibold leading-[20px] tracking-[0.5px] ${subText}`}
                                >
                                  Measurements
                                </div>
                                <div
                                  className={`text-[12px] sm:text-[13px] font-medium leading-[20px] tracking-[0.5px] ${subText}`}
                                >
                                  {(o.measurements || []).map((m, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block mr-3"
                                    >
                                      {m.label}: {m.value}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* ---------- sampleImages gallery (square thumbnails) ---------- */}
                              {imgs.length > 0 && (
                                <div className="mt-3">
                                  <div
                                    className={`text-[12px] sm:text-[14px] font-semibold leading-[20px] tracking-[0.5px] ${subText}`}
                                  >
                                    Sample Image{imgs.length > 1 ? "s" : ""}
                                  </div>
                                  <div className="mt-2 flex items-start gap-3">
                                    {imgs.map((url, idx) => (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block rounded-md overflow-hidden shadow-sm"
                                        title="Open image in new tab"
                                      >
                                        <img
                                          src={url}
                                          alt={`sample-${idx}`}
                                          loading="lazy"
                                          className="w-20 h-20 sm:w-28 sm:h-28 object-cover block"
                                          onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src =
                                              "/images/image-placeholder.png";
                                          }}
                                        />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {/* ---------- end sampleImages ---------- */}
                            </div>

                            <div className="flex flex-col items-start md:items-end gap-3 sm:mt-4 md:mt-0 md:ml-4 md:shrink-0 md:min-w-[210px]">
                              <div
                                className={`text-[13px] leading-[22px] font-bold tracking-[2px] ${subText}`}
                              >
                                <span className="mr-2">Total :</span>
                                <span
                                  className={`font-semibold text-[16px] ${accentText}`}
                                >
                                  {INR(o.totalPayment || 0)}
                                </span>
                              </div>

                              <div
                                className={`relative hidden md:flex items-center gap-2 rounded-md ${
                                  isGradient ? "bg-white/30" : "bg-white"
                                } border border-[#8F909185] px-4 py-1`}
                              >
                                <span
                                  className={`text-[13px] font-semibold ${
                                    isGradient ? "text-white" : "text-[#02143F]"
                                  }`}
                                >
                                  {st}
                                </span>
                                <IoIosArrowDown
                                  className={`${
                                    isGradient ? "text-white" : "text-[#02143F]"
                                  }`}
                                />
                                <select
                                  value={orderStatus[o._id] ?? st}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      o._id,
                                      e.target.value,
                                      st
                                    )
                                  }
                                  className="w-full bg-transparent px-2 py-1 border border-gray-300 rounded-md text-sm"
                                >
                                  {STATUS.filter((s) => s !== "All").map(
                                    (s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Buttons */}
                          <div className="mt-6 flex flex-row items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => openEditOrder(o)}
                              className="rounded-md bg-white border text-[12px] font-medium leading-[22px] tracking-[0.5px] px-4 py-2 hover:bg-slate-50"
                              aria-label={`Edit order ${o._id}`}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o._id)}
                              className="rounded-md bg-red-50 text-red-700 border border-red-200 text-[12px] font-medium leading-[22px] tracking-[0.5px] px-4 py-2 hover:bg-red-100"
                              aria-label={`Delete order ${o._id}`}
                            >
                              Delete
                            </button>

                            {/* <button className={`rounded-md text-[12px] font-medium leading-[22px] tracking-[0.5px] px-5 py-2 md:px-5 md:py-2 w-1/2 md:w-auto ${isGradient ? "bg-white text-[#252525] hover:bg-slate-50" : "bg-[#13234BD1] text-white hover:brightness-110"}`}>
                              send Message
                            </button> */}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            ))}

            {!grouped || grouped.length === 0 ? (
              <div className="text-center text-slate-500 py-16">
                No orders match your filters.
              </div>
            ) : null}
          </div>

          {/* Add/Edit Order form modal */}
          <div
            className={`fixed inset-0 z-50 ${
              showForm ? "pointer-events-auto" : "pointer-events-none"
            }`}
            aria-hidden={!showForm}
          >
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                showForm ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => cancelEdit()}
            />
            <div
              className={`absolute left-[50%] sm:left-[58.5%] -translate-x-1/2 w-full max-w-[1220px] transition-transform duration-300 ${
                showForm ? "translate-y-0" : "-translate-y-full"
              }`}
            >
              <div className="mx-4 mt-6 rounded-2xl bg-white shadow-2xl max-h-[80vh] sm:max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-[#252525]">
                    {editingOrderId ? "Edit Order" : "Add Order"}
                  </h3>
                  <button
                    onClick={() => cancelEdit()}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                </div>

                <form
                  onSubmit={handleSaveOrder}
                  className="px-6 py-6 bg-[#F6F7FA]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Handwritten file with inline loader */}
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
                            isParsingHandwritten
                              ? "opacity-60 cursor-not-allowed"
                              : ""
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
                              <span className="text-xs text-slate-600">
                                Parsing…
                              </span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400">Ready</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Customer name */}
                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Customer Name*
                      </label>
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
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Phone Number*
                      </label>
                      <input
                        text="tel"
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
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        delivery date*
                      </label>
                      <input
                        type="date"
                        value={form.deliveryDate}
                        onChange={(e) => update("deliveryDate", e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                        required
                      />
                    </div>

                    {/* Any special instructions */}
                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Any special instructions
                      </label>
                      <input
                        value={form.instructions}
                        onChange={(e) => update("instructions", e.target.value)}
                        placeholder="Enter"
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    {/* --- Pair: sample design image + staff assigned (highlighted background) --- */}
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start rounded-lg p-4 border border-[#F3E8D6] bg-gradient-to-r from-[#FFF8EE] to-[#FFF3E8]">
                        {/* Sample design */}
                        <div>
                          <label className="block text-sm font-medium text-[#252525] mb-1">
                            Sample design image
                          </label>

                          <div className="flex gap-3 items-center">
                            <div className="flex-1">
                              {form.designImage ? (
                                <div className="flex items-center gap-3">
                                  <div className="w-20 h-20 rounded-md overflow-hidden border">
                                    {typeof form.designImage === "string" ? (
                                      <img
                                        src={form.designImage}
                                        alt="design"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : form.designImage instanceof File ? (
                                      <img
                                        src={URL.createObjectURL(
                                          form.designImage
                                        )}
                                        alt="design"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-slate-100" />
                                    )}
                                  </div>
                                  <div className="text-sm text-slate-700 break-words">
                                    {typeof form.designImage === "string"
                                      ? form.designImage.split("/").pop()
                                      : form.designImage.name}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-slate-500">
                                  No sample chosen
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={openGalleryForAddOrder}
                                className="px-4 py-2 rounded-md bg-white border hover:bg-slate-50"
                              >
                                Choose from gallery
                              </button>
                            </div>
                          </div>

                          {/* ?<p className="mt-2 text-xs text-slate-500">Optional — choose a reference image from the gallery or upload (max 5MB).</p> */}
                        </div>

                        {/* Staff assigned */}
                        <div>
                          <label className="block text-sm font-medium text-[#252525] mb-1">
                            Staff Assigned*
                          </label>
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
                            <p className="mt-2 text-xs text-slate-500">
                              Assign a staff member for this order.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Measurements*
                      </label>

                      <div className="space-y-3">
                        {form.measurements.map((m, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start sm:items-center"
                          >
                            {/* Area/Label */}
                            <div className="sm:col-span-5">
                              <input
                                value={m.label}
                                onChange={(e) =>
                                  updateMeasurement(idx, "area", e.target.value)
                                }
                                placeholder="Area of measurement (e.g., Bust)"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-200 min-w-0"
                                required={idx === 0}
                              />
                            </div>

                            {/* Value */}
                            <div className="sm:col-span-5">
                              <input
                                value={m.value}
                                onChange={(e) =>
                                  updateMeasurement(
                                    idx,
                                    "value",
                                    e.target.value
                                  )
                                }
                                placeholder="Measurement (e.g., 34)"
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-200 min-w-0"
                                required={idx === 0}
                              />
                            </div>

                            {/* Actions */}
                            <div className="sm:col-span-2 flex gap-2 sm:items-center sm:justify-start">
                              <button
                                type="button"
                                onClick={addMeasurementRow}
                                className="px-3 py-2 sm:px-4 rounded-md bg-white border text-sm font-medium hover:bg-slate-50 shrink-0"
                                aria-label="Add measurement"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMeasurementRow(idx)}
                                className="px-3 py-2 sm:px-4 rounded-md bg-white border text-sm font-medium hover:bg-slate-50 shrink-0"
                                aria-label="Remove measurement"
                              >
                                −
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-xs text-slate-500 mt-2">
                        Click + to add another measurement row. You can remove
                        rows with −.
                      </div>
                    </div>

                    {/* Payments */}
                    <div>
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Total Payment*
                      </label>
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
                      <label className="block text-sm font-medium text-[#252525] mb-1">
                        Advance Payment
                      </label>
                      <input
                        value={form.advancePayment}
                        type="number"
                        min="0"
                        max={form.totalPayment}
                        onChange={(e) =>
                          update("advancePayment", e.target.value)
                        }
                        placeholder="Enter"
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="inline-flex items-center gap-3 text-sm text-[#252525]">
                        <input
                          type="checkbox"
                          checked={form.sendWhatsapp}
                          onChange={(e) =>
                            update("sendWhatsapp", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                        />
                        Send order summary to customer on WhatsApp
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => cancelEdit()}
                      className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm text-[#252525] hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#13234B] text-white px-6 py-2 text-sm font-medium hover:brightness-110"
                    >
                      {editingOrderId ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <SendImagesModal
            isOpen={showSendModal || showGalleryForAdd}
            onClose={() => {
              if (showGalleryForAdd) closeGalleryForAddOrder();
              else closeSendImagesModal();
            }}
            selectedOrder={showSendModal ? selectedOrder : null}
            galleryItems={galleryItems}
            galleryLoading={galleryLoading}
            galleryError={galleryError}
            onSendImages={(selectedImageIds, category) =>
              onModalSendHandler(selectedImageIds, category)
            }
          />
        </div>
      </div>
    </div>
  );
}
