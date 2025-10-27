// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { FiSearch, FiEdit2 } from "react-icons/fi";
// import { MdDelete } from "react-icons/md";
// import { IoIosArrowDown } from "react-icons/io";
// import { Poppins } from "next/font/google";
// import toast, { Toaster } from "react-hot-toast";
// import { useGetStaff } from "../hooks/usegetstaff";

// const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// const INR = (n) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(n);

// export default function StaffManagement() {
//   /* filters & search */
//   const [roleFilter, setRoleFilter] = useState("Role");
//   const [q, setQ] = useState("");

//   /* data */
//   const [staffList, setStaffList] = useState([]);

//   /* modals: add/edit & assign */
//   const [showAddEdit, setShowAddEdit] = useState(false);
//   const [editingStaffId, setEditingStaffId] = useState(null);
//   const [form, setForm] = useState({
//     name: "",
//     role: "",
//     phone: "",
//   });

//   const [showAssign, setShowAssign] = useState(false);
//   const [assigningStaffId, setAssigningStaffId] = useState(null);
//   const [selectedOrder, setSelectedOrder] = useState("");

//   /* view orders panel */
//   const [viewingStaffId, setViewingStaffId] = useState(null);

//   const roles = useMemo(
//     () => ["Role", ...Array.from(new Set((staffList || []).map((s) => s.role)))],
//     [staffList]
//   );

//   const { staff, loading, error } = useGetStaff();

//   useEffect(() => {
//     if (!loading && Array.isArray(staff) && staff.length > 0) {
//       // use server data
//       setStaffList(staff);
//     } else if (!loading && (!staff || staff.length === 0)) {
//       // no server data -> empty list (no INITIAL_STAFF fallback)
//       setStaffList([]);
//     }
//   }, [staff, loading]);

//   /* filtered staff */
//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!staffList) return [];
//     return staffList.filter((st) => {
//       if (roleFilter !== "Role" && st.role !== roleFilter) return false;
//       if (!s) return true;
//       return st.name.toLowerCase().includes(s) || st.role.toLowerCase().includes(s);
//     });
//   }, [q, roleFilter, staffList]);

//   /* add/edit helpers */
//   const openAdd = () => {
//     setEditingStaffId(null);
//     setForm({ name: "", role: "", phone: "" });
//     setShowAddEdit(true);
//   };
//   const openEdit = (id) => {
//     const st = staffList.find((x) => x._id === id);
//     if (!st) return;
//     setEditingStaffId(id);
//     setForm({
//       name: st.name || "",
//       role: st.role || "",
//       phone: st.phone || "",
//     });
//     setShowAddEdit(true);
//   };
//   const submitAddEdit = async (e) => {
//     e.preventDefault();
//     const toastLoading = toast.loading("Please wait...");

//     const { name, role, phone } = form;

//     if (!name.trim() || !role.trim()) {
//       toast.error("Please fill all fields", { id: toastLoading });
//       return;
//     }

//     if (editingStaffId) {
//       // Edit staff -- no availability sent
//       const res = await fetch("/api/v1/staff/add-staff", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: editingStaffId,
//           name,
//           role,
//           phone,
//         }),
//       });
//       if (res.ok) {
//         toast.success("Staff updated successfully", { id: toastLoading });
//       }
//     } else {
//       // Add staff -- no availability sent
//       const res = await fetch("/api/v1/staff/add-staff", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, role, phone }),
//       });
//       if (res.ok) {
//         toast.success("Staff added successfully", { id: toastLoading });
//       }
//     }
//     // Refresh staff list
//     try {
//       const res = await fetch("/api/v1/staff/get-staff-details");
//       const data = await res.json();
//       setStaffList(data.staff || []);
//     } catch (err) {
//       // keep whatever the client has if fetch fails
//     }
//     setShowAddEdit(false);
//   };

//   const openAssign = (id) => {
//     setAssigningStaffId(id);
//     setSelectedOrder("");
//     setShowAssign(true);
//   };
//   const submitAssign = (e) => {
//     e.preventDefault();
//     if (!selectedOrder || !assigningStaffId) return;
//     setStaffList((list) =>
//       list.map((s) =>
//         s._id === assigningStaffId ? { ...s, ordersCount: (s.ordersCount || 0) + 1 } : s
//       )
//     );
//     setShowAssign(false);
//   };

//   const openViewOrders = (id) => setViewingStaffId(id);
//   const closeViewOrders = () => setViewingStaffId(null);

//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.key === "Escape") {
//         setShowAddEdit(false);
//         setShowAssign(false);
//         setViewingStaffId(null);
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, []);

//   /* group orders utility for side panel */
//   const groupByDateLabel = (orders = []) => {
//     const m = new Map();
//     (orders || []).forEach((o) => {
//       const d = new Date(o.placedOn);
//       const key = d.toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//       });
//       if (!m.has(key)) m.set(key, []);
//       m.get(key).push(o);
//     });
//     return Array.from(m.entries());
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this staff member?")) return;
//     const toastLoading = toast.loading("Deleting staff...");
//     try {
//       const res = await fetch(`/api/v1/staff/delete-staff`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id }),
//       });
//       if (res.ok) {
//         toast.success("Staff deleted successfully", { id: toastLoading });
//         setStaffList((prev) => prev.filter((s) => s._id !== id));
//       } else {
//         const data = await res.json();
//         toast.error(data.error || "Failed to delete staff", { id: toastLoading });
//       }
//     } catch (err) {
//       toast.error(err.message || "Failed to delete staff", { id: toastLoading });
//     }
//   };

//   const viewingOrders = viewingStaffId
//     ? staffList?.find((s) => s._id === viewingStaffId) || [viewingStaffId]
//     : [];
//   return (
//     <div className={`${poppins.className} min-h-screen pt-6`}>
//       {/* White canvas */}
//       <div className="mx-auto max-w-[1180px] h-[calc(100vh-48px)] rounded-[22px] bg-white p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="flex items-start justify-between gap-6 mb-6">
//           <h1 className="text-[20px] leading-[35px] text-[#252525] font-semibold">Staff Management</h1>
//           <button
//             onClick={openAdd}
//             className="rounded-lg bg-[#EC9705] text-white text-[14px] font-semibold px-6 py-1 shadow hover:bg-[#f7a52a]"
//           >
//             + Add Staff
//           </button>
//         </div>

//         <Toaster />

//         {/* MOBILE FILTERS (stacked) */}
//         <div className="block sm:hidden mb-4">
//           {/* Search box */}
//           <div className="bg-[#F9F8FC] rounded-xl p-1 flex items-center gap-3 mb-3 shadow-sm">
//             <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white">
//               <FiSearch />
//             </div>
//             <input
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               placeholder="Search by staff name ....etc."
//               className="bg-transparent outline-none text-sm flex-1"
//             />
//           </div>

//           {/* Role */}
//           <div className="flex gap-3">
//             <div className="flex-1">
//               <div className="relative">
//                 <button className="w-full text-left px-4 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between">
//                   <span className="text-sm text-[#252525]">{roleFilter}</span>
//                   <IoIosArrowDown className="text-[#252525]" />
//                 </button>
//                 <select
//                   value={roleFilter}
//                   onChange={(e) => setRoleFilter(e.target.value)}
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                 >
//                   {roles.map((r) => (
//                     <option key={r}>{r}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* DESKTOP FILTERS (original pill) */}
//         <div className="hidden sm:block px-0 mb-6">
//           <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
//             <div className="flex flex-nowrap w-full rounded-xl bg-[#F9F8FC]">
//               {/* Role */}
//               <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
//                 <span className="text-sm text-[#252525]">{roleFilter}</span>
//                 <IoIosArrowDown className="text-[#252525] text-[14px]" />
//                 <select
//                   value={roleFilter}
//                   onChange={(e) => setRoleFilter(e.target.value)}
//                   className="absolute inset-0 opacity-0 cursor-pointer"
//                 >
//                   {roles.map((r) => (
//                     <option key={r}>{r}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Search */}
//               <div className="flex items-center gap-2 px-6 py-2 flex-1 min-w-0">
//                 <input
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                   placeholder="Search by staff name ....etc"
//                   className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60"
//                 />
//                 <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
//                   <FiSearch />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {loading && <div className="py-12 text-center text-[#4C2699]">Loading...</div>}

//         {/* Content grid (scroll inside white canvas) */}
//         <div className="flex-1 overflow-y-auto pr-3">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {!loading &&
//               filtered.length > 0 &&
//               filtered.map((st) => (
//                 <div key={st._id} className="relative rounded-[16px] bg-[#F6F3FF] p-6 shadow-sm border border-transparent">
//                   <div className="flex gap-2 absolute top-3 right-3">
//                     <button onClick={() => openEdit(st._id)} className="text-[#252525BA] p-1 hover:opacity-90" aria-label={`Edit ${st.name}`}>
//                       <FiEdit2 size={18} />
//                     </button>
//                     <button onClick={() => handleDelete(st._id)} className="text-[#252525BA] p-1 hover:opacity-90" aria-label={`Delete ${st.name}`}>
//                       <MdDelete size={20} />
//                     </button>
//                   </div>

//                   <div className="mb-3">
//                     <div className="text-[14px] text-[#252525D1] leading-[22px] tracking-[0.5px]">
//                       <span className="font-semibold">Role: </span>
//                       {st.role}
//                     </div>
//                     <div className="text-[14px] text-[#252525D1] leading-[22px] tracking-[0.5px] mt-2">
//                       <span className="font-semibold">Name: </span>
//                       {st.name}
//                     </div>
//                     {st.orders && st.orders.length > 0 && (
//                       <div className="text-[14px] text-[#252525D1] font-bold leading-[22px] tracking-[0.5px] mt-2">
//                         <span className="font-semibold">Current Orders: </span>
//                         {st.orders.length}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mt-4 flex items-center justify-between">
//                     <button
//                       onClick={() => {
//                         openViewOrders(st._id);
//                       }}
//                       className="text-[13px] font-medium tracking-[0.5px] leading-[22px] text-[#DE8F06] underline"
//                     >
//                       View Orders
//                     </button>

//                     {/* <button onClick={() => openAssign(st._id)} className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white text-[14px] font-medium shadow">
//                       Assign Order
//                     </button> */}
//                   </div>
//                 </div>
//               ))}
//           </div>

//           {!loading && filtered.length === 0 && <div className="py-12 text-center text-[#4C2699]">No staff found</div>}
//         </div>
//       </div>

//       <div aria-hidden={viewingStaffId ? "false" : "true"}>
//         {/* backdrop */}
//         <div
//           onClick={closeViewOrders}
//           className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${viewingStaffId ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
//         />

//         <aside
//           className={`
//             fixed z-50 left-0 right-0
//             ${viewingStaffId ? "translate-y-0" : "translate-y-full"}
//             sm:translate-y-0
//             ${viewingStaffId ? "sm:translate-x-0" : "sm:-translate-x-full"}
//             transition-transform duration-300 ease-in-out
//             bg-white shadow-2xl overflow-hidden
//             h-[78vh] sm:h-full
//             bottom-0 sm:top-0 sm:left-0 sm:w-[420px] sm:max-w-[90%]
//           `}
//           aria-hidden={!viewingStaffId}
//           role="dialog"
//           aria-label="Staff Orders"
//         >
//           {/* content (scrollable) */}
//           <div className="h-full overflow-y-auto p-6 pr-4">
//             {/* if no orders */}
//             {(!viewingOrders || viewingOrders.length === 0) && <div className="text-center text-slate-500 py-12">No orders for this staff.</div>}

//             {/* grouped by date label */}
//             {groupByDateLabel(viewingOrders.orders).map(([dateLabel, orders]) => (
//               <div key={dateLabel} className="mb-8">
//                 {orders.map((o) => (
//                   <div key={o._id} className="mb-6 pb-6 border-b last:border-b-0 border-slate-200">
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="text-sm text-slate-700 w-[70%]">
//                         <div className="mb-2 text-xs text-slate-500">
//                           Order ID: <span className="text-slate-800 font-medium">{o._id.slice(-6).toUpperCase()}</span>
//                         </div>

//                         <div className="mb-1">
//                           <span className="font-semibold text-slate-800">Customer:</span>{" "}
//                           <span className="text-slate-700">{o.customer.customerName}</span>
//                         </div>

//                         <div className="mb-1">
//                           <span className="font-semibold text-slate-800">Delivery Date:</span>{" "}
//                           <span className="text-slate-700">
//                             {new Date(o.deliveryDate).toLocaleDateString("en-GB", {
//                               day: "numeric",
//                               month: "long",
//                               year: "numeric",
//                             })}
//                           </span>
//                         </div>

//                         <div className="mb-1">
//                           <span className="font-semibold text-slate-800">Garment Type:</span>{" "}
//                           <span className="text-slate-700">{o.garment}</span>
//                         </div>
//                       </div>

//                       <div className="text-right min-w-[120px]">
//                         <div className={o.status === "Completed" ? "text-green-600 mt-2 font-medium" : "text-amber-500 mt-2 font-medium"}>
//                           {o.status}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ))}
//           </div>
//         </aside>
//       </div>

//       {/* ---------- Add / Edit Modal (responsive) */}
//       {showAddEdit && (
//         <div className="fixed inset-0 z-50 grid place-items-center">
//           <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddEdit(false)} aria-hidden />
//           <form onSubmit={submitAddEdit} className="relative z-10 w-[640px] max-w-[95%] bg-white rounded-[12px] shadow-2xl p-8" role="dialog" aria-modal="true">
//             <h3 className="text-lg font-semibold text-[#222] mb-6">{editingStaffId ? "Edit Staff" : "Add Staff"}</h3>

//             <label className="block text-sm font-medium text-[#222] mb-1">Name</label>
//             <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm mb-4" placeholder="Enter full name" required />

//             <label className="block text-sm font-medium text-[#222] mb-1">Role</label>
//             <input value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm mb-4" placeholder="Enter role" required />

//             <label className="block text-sm font-medium text-[#252525] mb-1">Phone Number</label>
//             <input
//               text="tel"
//               value={form.phone}
//               onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
//               placeholder="Enter number"
//               maxLength={10}
//               pattern="[0-9]*"
//               className="w-full rounded-lg border mb-3  border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
//               required
//             />

//             <div className="mt-4 flex items-center justify-end gap-3">
//               <button type="button" onClick={() => setShowAddEdit(false)} className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm text-[#252525] hover:bg-slate-50">
//                 Cancel
//               </button>
//               <button type="submit" className="rounded-lg bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8] text-white px-6 py-2 text-sm font-medium hover:brightness-105">
//                 Save
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* ---------- Assign Order Modal (responsive) */}
//       {/* {showAssign && (
//         <div className="fixed inset-0 z-50 grid place-items-center">
//           <div className="absolute inset-0 bg-black/40" onClick={() => setShowAssign(false)} aria-hidden />
//           <form onSubmit={submitAssign} className="relative z-10 w-[560px] max-w-[95%] bg-white rounded-[12px] shadow-2xl p-8">
//             <h3 className="text-lg font-semibold text-[#222] mb-6">Assign Order</h3>
//             <label className="block text-sm font-medium text-[#222] mb-1">Select Order</label>
//             <select value={selectedOrder} onChange={(e) => setSelectedOrder(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm mb-6" required>
//               <option value="">Select</option>
//               <option value="o1">#OD1247 - Priyanka</option>
//               <option value="o2">#OD1249 - Rahul</option>
//               <option value="o3">#OD1250 - Sneha</option>
//             </select>

//             <div className="mt-4 flex items-center justify-end gap-3">
//               <button type="button" onClick={() => setShowAssign(false)} className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm text-[#252525] hover:bg-slate-50">
//                 Cancel
//               </button>
//               <button type="submit" className="rounded-lg bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8] text-white px-6 py-2 text-sm font-medium hover:brightness-105">
//                 Assign
//               </button>
//             </div>
//           </form>
//         </div>
//       )} */}
//     </div>
//   );
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import { FiSearch, FiEdit2 } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { Poppins } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";
import { useGetStaff } from "../hooks/usegetstaff";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export default function StaffManagement() {
  /* filters & search */
  const [roleFilter, setRoleFilter] = useState("Role");
  const [q, setQ] = useState("");

  /* data */
  const [staffList, setStaffList] = useState([]);

  /* modals: add/edit & assign */
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
  });

  const [showAssign, setShowAssign] = useState(false);
  const [assigningStaffId, setAssigningStaffId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState("");

  /* view orders panel */
  const [viewingStaffId, setViewingStaffId] = useState(null);

  const roles = useMemo(
    () => [
      "Role",
      ...Array.from(new Set((staffList || []).map((s) => s.role))),
    ],
    [staffList]
  );

  const { staff, loading, error } = useGetStaff();

  useEffect(() => {
    if (!loading && Array.isArray(staff) && staff.length > 0) {
      // use server data
      setStaffList(staff);
    } else if (!loading && (!staff || staff.length === 0)) {
      // no server data -> empty list (no INITIAL_STAFF fallback)
      setStaffList([]);
    }
  }, [staff, loading]);

  /* keep page body from scrolling while component mounted so internal scroll is the only scroller */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* filtered staff */
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!staffList) return [];
    return staffList.filter((st) => {
      if (roleFilter !== "Role" && st.role !== roleFilter) return false;
      if (!s) return true;
      return (
        st.name.toLowerCase().includes(s) || st.role.toLowerCase().includes(s)
      );
    });
  }, [q, roleFilter, staffList]);

  /* add/edit helpers */
  const openAdd = () => {
    setEditingStaffId(null);
    setForm({ name: "", role: "", phone: "" });
    setShowAddEdit(true);
  };
  const openEdit = (id) => {
    const st = staffList.find((x) => x._id === id);
    if (!st) return;
    setEditingStaffId(id);
    setForm({
      name: st.name || "",
      role: st.role || "",
      phone: st.phone || "",
    });
    setShowAddEdit(true);
  };
  const submitAddEdit = async (e) => {
    e.preventDefault();
    const toastLoading = toast.loading("Please wait...");

    const { name, role, phone } = form;

    if (!name.trim() || !role.trim()) {
      toast.error("Please fill all fields", { id: toastLoading });
      return;
    }

    if (editingStaffId) {
      // Edit staff -- no availability sent
      const res = await fetch("/api/v1/staff/add-staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingStaffId,
          name,
          role,
          phone,
        }),
      });
      if (res.ok) {
        toast.success("Staff updated successfully", { id: toastLoading });
      } else {
        try {
          const data = await res.json();
          toast.error(data?.error || "Failed to update staff", {
            id: toastLoading,
          });
        } catch {
          toast.error("Failed to update staff", { id: toastLoading });
        }
      }
    } else {
      // Add staff -- no availability sent
      const res = await fetch("/api/v1/staff/add-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, phone }),
      });
      if (res.ok) {
        toast.success("Staff added successfully", { id: toastLoading });
      } else {
        try {
          const data = await res.json();
          toast.error(data?.error || "Failed to add staff", {
            id: toastLoading,
          });
        } catch {
          toast.error("Failed to add staff", { id: toastLoading });
        }
      }
    }
    // Refresh staff list
    try {
      const res = await fetch("/api/v1/staff/get-staff-details");
      const data = await res.json();
      setStaffList(data.staff || []);
    } catch (err) {
      // keep whatever the client has if fetch fails
    }
    setShowAddEdit(false);
  };

  const openAssign = (id) => {
    setAssigningStaffId(id);
    setSelectedOrder("");
    setShowAssign(true);
  };
  const submitAssign = (e) => {
    e.preventDefault();
    if (!selectedOrder || !assigningStaffId) return;
    setStaffList((list) =>
      list.map((s) =>
        s._id === assigningStaffId
          ? { ...s, ordersCount: (s.ordersCount || 0) + 1 }
          : s
      )
    );
    setShowAssign(false);
  };

  const openViewOrders = (id) => setViewingStaffId(id);
  const closeViewOrders = () => setViewingStaffId(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowAddEdit(false);
        setShowAssign(false);
        setViewingStaffId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* group orders utility for side panel */
  const groupByDateLabel = (orders = []) => {
    const m = new Map();
    (orders || []).forEach((o) => {
      const d = new Date(o.placedOn);
      const key = d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(o);
    });
    return Array.from(m.entries());
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?"))
      return;
    const toastLoading = toast.loading("Deleting staff...");
    try {
      const res = await fetch(`/api/v1/staff/delete-staff`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Staff deleted successfully", { id: toastLoading });
        setStaffList((prev) => prev.filter((s) => s._id !== id));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete staff", {
          id: toastLoading,
        });
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete staff", {
        id: toastLoading,
      });
    }
  };

  const viewingOrders = viewingStaffId
    ? staffList?.find((s) => s._id === viewingStaffId) || [viewingStaffId]
    : [];

  return (
    <div className={`${poppins.className} h-screen overflow-hidden`}>
      {/* White canvas */}
      <div className="mx-auto w-full max-w-[1180px] h-[calc(100vh-48px)] rounded-[22px] bg-white p-4 sm:p-8 shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-4 sm:mb-6">
          <h1 className="text-[20px] leading-[35px] text-[#252525] font-semibold">
            Staff Management
          </h1>
          <button
            onClick={openAdd}
            className="rounded-lg bg-[#EC9705] text-white text-[14px] font-semibold px-4 sm:px-6 py-1 shadow hover:bg-[#f7a52a]"
          >
            + Add Staff
          </button>
        </div>

        <Toaster />

        {/* MOBILE FILTERS (stacked) */}
        <div className="block sm:hidden mb-4">
          {/* Search box */}
          <div className="bg-[#F9F8FC] rounded-xl p-1 flex items-center gap-3 mb-3 shadow-sm">
            <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white">
              <FiSearch />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by staff name ....etc."
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>

          {/* Role */}
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <button className="w-full text-left px-4 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between">
                  <span className="text-sm text-[#252525]">{roleFilter}</span>
                  <IoIosArrowDown className="text-[#252525]" />
                </button>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP FILTERS (original pill) */}
        <div className="hidden sm:block px-0 mb-6">
          <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            <div className="flex flex-nowrap w-full rounded-xl bg-[#F9F8FC]">
              {/* Role */}
              <div className="relative flex items-center justify-between gap-2 px-10 py-2 border-r border-slate-200 whitespace-nowrap">
                <span className="text-sm text-[#252525]">{roleFilter}</span>
                <IoIosArrowDown className="text-[#252525] text-[14px]" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 px-6 py-2 flex-1 min-w-0">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by staff name ....etc"
                  className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60"
                />
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0">
                  <FiSearch />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="py-12 text-center text-[#4C2699]">Loading...</div>
        )}

        {/* Content grid (scroll inside white canvas) */}
        <div className="flex-1 overflow-y-auto pr-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {!loading &&
              filtered.length > 0 &&
              filtered.map((st) => (
                <div
                  key={st._id}
                  className="relative rounded-[16px] bg-[#F6F3FF] p-4 sm:p-6 shadow-sm border border-transparent"
                >
                  <div className="flex gap-2 absolute top-3 right-3">
                    <button
                      onClick={() => openEdit(st._id)}
                      className="text-[#252525BA] p-1 hover:opacity-90"
                      aria-label={`Edit ${st.name}`}
                    >
                      <FiEdit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(st._id)}
                      className="text-[#252525BA] p-1 hover:opacity-90"
                      aria-label={`Delete ${st.name}`}
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="text-[14px] text-[#252525D1] leading-[22px] tracking-[0.5px]">
                      <span className="font-semibold">Role: </span>
                      {st.role}
                    </div>
                    <div className="text-[14px] text-[#252525D1] leading-[22px] tracking-[0.5px] mt-2">
                      <span className="font-semibold">Name: </span>
                      {st.name}
                    </div>
                    {st.orders && st.orders.length > 0 && (
                      <div className="text-[14px] text-[#252525D1] font-bold leading-[22px] tracking-[0.5px] mt-2">
                        <span className="font-semibold">Current Orders: </span>
                        {st.orders.length}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => {
                        openViewOrders(st._id);
                      }}
                      className="text-[13px] font-medium tracking-[0.5px] leading-[22px] text-[#DE8F06] underline"
                    >
                      View Orders
                    </button>
                  </div>
                </div>
              ))}

            {!loading && filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#4C2699]">
                No staff found
              </div>
            )}
          </div>

          {/* small bottom padding so last card not flush against bottom on very small screens */}
          <div className="h-6" />
        </div>
      </div>

      <div aria-hidden={viewingStaffId ? "false" : "true"}>
        {/* backdrop */}
        <div
          onClick={closeViewOrders}
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
            viewingStaffId
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />

        <aside
          className={`fixed z-50 transition-transform duration-300 ease-in-out bg-white shadow-2xl overflow-hidden
            ${
              viewingStaffId ? "translate-y-0" : "translate-y-full"
            } sm:translate-y-0
            ${viewingStaffId ? "sm:translate-x-0" : "sm:translate-x-full"}
            h-[78vh] sm:h-full bottom-0 sm:top-0 sm:right-0 sm:left-auto sm:w-[420px] sm:max-w-[90%]
          `}
          aria-hidden={!viewingStaffId}
          role="dialog"
          aria-label="Staff Orders"
        >
          {/* content (scrollable) */}
          <div className="h-full overflow-y-auto p-4 sm:p-6 pr-4">
            {/* if no orders */}
            {(!viewingOrders || viewingOrders.length === 0) && (
              <div className="text-center text-slate-500 py-12">
                No orders for this staff.
              </div>
            )}

            {/* grouped by date label */}
            {(viewingOrders?.orders
              ? groupByDateLabel(viewingOrders.orders)
              : []
            ).map(([dateLabel, orders]) => (
              <div key={dateLabel} className="mb-6">
                <div className="text-[14px] font-semibold text-slate-700 mb-3">
                  {dateLabel}
                </div>
                {orders.map((o) => (
                  <div
                    key={o._id}
                    className="mb-4 pb-4 border-b last:border-b-0 border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-sm text-slate-700 w-[70%]">
                        <div className="mb-2 text-xs text-slate-500">
                          Order ID:{" "}
                          <span className="text-slate-800 font-medium">
                            {o._id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        <div className="mb-1">
                          <span className="font-semibold text-slate-800">
                            Customer:
                          </span>{" "}
                          <span className="text-slate-700">
                            {o.customer.customerName}
                          </span>
                        </div>

                        <div className="mb-1">
                          <span className="font-semibold text-slate-800">
                            Delivery Date:
                          </span>{" "}
                          <span className="text-slate-700">
                            {new Date(o.deliveryDate).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>

                        <div className="mb-1">
                          <span className="font-semibold text-slate-800">
                            Garment Type:
                          </span>{" "}
                          <span className="text-slate-700">{o.garment}</span>
                        </div>
                      </div>

                      <div className="text-right min-w-[100px]">
                        <div
                          className={
                            o.status === "Completed"
                              ? "text-green-600 mt-2 font-medium"
                              : "text-amber-500 mt-2 font-medium"
                          }
                        >
                          {o.status}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">
                          {INR(o.totalPayment)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* ---------- Add / Edit Modal (responsive) - REPLACE your current showAddEdit block with this */}
      {showAddEdit && (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAddEdit(false)}
            aria-hidden
          />
          <form
            onSubmit={submitAddEdit}
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-md sm:max-w-lg mx-auto bg-white rounded-[12px] shadow-2xl p-4 sm:p-6
                 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-[#222] mb-4">
              {editingStaffId ? "Edit Staff" : "Add Staff"}
            </h3>

            <label className="block text-sm font-medium text-[#222] mb-1">
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm mb-4"
              placeholder="Enter full name"
              required
            />

            <label className="block text-sm font-medium text-[#222] mb-1">
              Role
            </label>
            <input
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm mb-4"
              placeholder="Enter role"
              required
            />

            <label className="block text-sm font-medium text-[#252525] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((s) => ({ ...s, phone: e.target.value }))
              }
              placeholder="Enter number"
              maxLength={10}
              pattern="[0-9]*"
              className="w-full rounded-lg border mb-3 border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />

            {/* action buttons */}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddEdit(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-[#252525] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-[#6B4FD3] to-[#9C7AE8] text-white px-5 py-2 text-sm font-medium hover:brightness-105"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
