"use client";

import { useEffect, useMemo, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import { Poppins } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

const formatDateHeading = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function GalleryPage() {
  const [categoryFilter, setCategoryFilter] = useState("Category");
  const [subCategoryFilter, setSubCategoryFilter] = useState("Sub Category");
  const [dateFilter, setDateFilter] = useState("Upload Date");
  const [colorFilter, setColorFilter] = useState("Color");
  const [q, setQ] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ file: null, preview: "", category: "", subCategory: "", color: "", date: today });

  const [galleryItems, setGalleryItems] = useState([]);
  const [deletingIds, setDeletingIds] = useState([]);
  const [pendingDelete, setPendingDelete] = useState(null);

  const categories = useMemo(() => ["Category", ...Array.from(new Set(galleryItems.map((it) => it.category).filter(Boolean)))], [galleryItems]);
  const subCategories = useMemo(() => ["Sub Category", ...Array.from(new Set(galleryItems.map((it) => it.subCategory).filter(Boolean)))], [galleryItems]);
  const colors = useMemo(() => ["Color", ...Array.from(new Set(galleryItems.map((it) => it.color).filter(Boolean)))], [galleryItems]);

  async function getGalleryItems() {
    try {
      const response = await fetch("/api/v1/gallery/get-gallery");
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch gallery items");
      }
      const data = await response.json();
      setGalleryItems(Array.isArray(data.GalleryItems) ? data.GalleryItems : []);
    } catch (err) {
      console.warn("Could not fetch gallery items:", err.message || err);
      setGalleryItems([]);
    }
  }

  useEffect(() => { getGalleryItems(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return galleryItems.filter((it) => {
      if (categoryFilter !== "Category" && it.category !== categoryFilter) return false;
      if (subCategoryFilter !== "Sub Category" && it.subCategory !== subCategoryFilter) return false;
      if (colorFilter !== "Color" && it.color !== colorFilter) return false;

      if (dateFilter !== "Upload Date") {
        const addedDate = (it.addedAt || "").split("T")[0];
        if (formatDateHeading(addedDate) !== dateFilter) return false;
      }

      if (!s) return true;
      const title = (it.title || "").toLowerCase();
      const category = (it.category || "").toLowerCase();
      const color = (it.color || "").toLowerCase();
      return title.includes(s) || category.includes(s) || color.includes(s);
    });
  }, [q, categoryFilter, subCategoryFilter, colorFilter, dateFilter, galleryItems]);

  const grouped = useMemo(() => {
    const m = new Map();
    filtered.forEach((it) => {
      const key = (it.addedAt || "").split("T")[0] || today;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(it);
    });
    return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setShowAddModal(false); setPendingDelete(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function uploadFileToS3(file) {
    if (!file) return "";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/s3/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok && data.url) return data.url;
    throw new Error(data.error || "Upload failed");
  }

  const handleFileChange = (evt) => {
    const f = evt.target.files?.[0] ?? null;
    if (!f) return setForm((prev) => ({ ...prev, file: null, preview: "" }));
    const url = URL.createObjectURL(f);
    setForm((prev) => ({ ...prev, file: f, preview: url }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.file) { alert("Please select an image file."); return; }
    const maxMB = 5;
    if (form.file.size / (1024 * 1024) > maxMB) { toast.error(`Image must be smaller than ${maxMB}MB`); return; }

    const toastLoading = toast.loading("Saving image...");
    try {
      const imageUrl = await uploadFileToS3(form.file);
      const payload = { category: form.category, subCategory: form.subCategory, color: form.color, date: form.date, imageUrl };
      const res = await fetch("/api/v1/gallery/add-gallery", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
      if (!res.ok) { const data = await res.json().catch(() => ({})); toast.error(data.error || "Failed to save image", { id: toastLoading }); return; }
      if (form.preview) URL.revokeObjectURL(form.preview);
      setForm({ file: null, preview: "", category: "", subCategory: "", color: "", date: today });
      setShowAddModal(false);
      await getGalleryItems();
      toast.success("Image saved successfully!", { id: toastLoading });
    } catch (err) {
      toast.error(err.message || "Failed to save image", { id: toastLoading });
    }
  };

  async function performDelete() {
    if (!pendingDelete?. _id) return;
    const id = pendingDelete._id;

    setDeletingIds((prev) => [...prev, id]);
    const prevItems = galleryItems;
    setGalleryItems((prev) => prev.filter((it) => it._id !== id));
    setPendingDelete(null);

    try {
      const res = await fetch("/api/v1/gallery/delete-gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || "Failed to delete image");
      }

      toast.success("Image deleted");
      await getGalleryItems();
    } catch (err) {
      setGalleryItems(prevItems);
      toast.error(err.message || "Could not delete image");
    } finally {
      setDeletingIds((prev) => prev.filter((x) => x !== id));
    }
  }

  function cancelPendingDelete() { setPendingDelete(null); }
  const isDeleting = (id) => deletingIds.includes(id);

  return (
    <div className={`${poppins.className} min-h-screen `}>
      <Toaster />

      {/* Confirm Delete Modal */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelPendingDelete} aria-hidden />

          <div role="dialog" aria-modal="true" className="relative z-10 w-[92vw] max-w-[520px] rounded-2xl bg-white shadow-2xl">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-[#252525] mb-3">Confirm delete</h3>

              <div className="flex gap-4 items-start">
                <div className="w-24 h-24 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                  <img src={pendingDelete.url} alt={pendingDelete.fileName ?? "image preview"} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#222] truncate">{pendingDelete.fileName ?? "Untitled"}</div>
                  <div className="text-xs text-slate-600 mt-2">
                    <div><span className="font-semibold">Category:</span> {pendingDelete.category ?? "—"}</div>
                    <div className="mt-1"><span className="font-semibold">Sub Category:</span> {pendingDelete.subCategory ?? "—"}</div>
                  </div>

                  <div className="text-xs text-slate-500 mt-3">This action cannot be undone.</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={cancelPendingDelete} className="rounded-lg px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200">Cancel</button>

                <button
                  type="button"
                  onClick={performDelete}
                  disabled={isDeleting(pendingDelete._id)}
                  className="rounded-lg px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
                >
                  {isDeleting(pendingDelete._id) ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1180px] h-full rounded-[22px] bg-white p-4 sm:p-8 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between mb-4 mt-4 sm:mt-0 gap-3">
          <h1 className="text-xl font-semibold text-[#252525]">Gallery</h1>

          <button onClick={() => setShowAddModal(true)} className="rounded-lg bg-[#EC9705] text-white text-[14px] font-semibold px-4 py-2 shadow hover:bg-amber-600 shrink-0" aria-label="Add image">+ Add image</button>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mb-6">
          <div className="flex items-center gap-3 bg-[#F9F8FC] rounded-lg px-3 py-2 shadow-sm">
            <div className="w-8 h-8 rounded-lg grid place-items-center bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0"><FiSearch /></div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images by title, category or color" className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#252525]/60" />
          </div>
        </div>

        {/* Desktop filters */}
        <div className="mb-6 px-1 hidden md:block">
          <div className="p-[1px] rounded-xl bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
            <div className="flex flex-nowrap w-full rounded-xl bg-[#F9F8FC]">
              {/* Category */}
              <div className="relative flex items-center justify-between gap-2 px-6 py-3 border-r border-slate-200 whitespace-nowrap">
                <span className="text-sm text-[#252525]">{categoryFilter}</span>
                <IoIosArrowDown className="text-[#252525] text-[14px]" />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">{categories.map((c) => (<option key={c}>{c}</option>))}</select>
              </div>

              {/* Sub Category */}
              <div className="relative flex items-center justify-between gap-2 px-6 py-3 border-r border-slate-200 whitespace-nowrap">
                <span className="text-sm text-[#252525]">{subCategoryFilter}</span>
                <IoIosArrowDown className="text-[#252525] text-[14px]" />
                <select value={subCategoryFilter} onChange={(e) => setSubCategoryFilter(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">{subCategories.map((t) => (<option key={t}>{t}</option>))}</select>
              </div>

              {/* Upload Date */}
              <div className="relative flex items-center justify-between gap-2 px-6 py-3 border-r border-slate-200 whitespace-nowrap">
                <span className="text-sm text-[#252525]">{dateFilter}</span>
                <IoIosArrowDown className="text-[#252525] text-[14px]" />
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">
                  <option>Upload Date</option>
                  {galleryItems.length > 0 && galleryItems.map((it) => (<option key={it._id}>{formatDateHeading((it.addedAt || "").split("T")[0])}</option>))}
                </select>
              </div>

              {/* Color */}
              <div className="relative flex items-center justify-between gap-2 px-6 py-3 border-r border-slate-200 whitespace-nowrap">
                <span className="text-sm text-[#252525]">{colorFilter}</span>
                <IoIosArrowDown className="text-[#252525] text-[14px]" />
                <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer">{colors.map((c) => (<option key={c}>{c}</option>))}</select>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2 px-4 py-2 flex-1 min-w-0">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images by title, category or color" className="bg-transparent text-sm focus:outline-none flex-1 min-w-0 whitespace-nowrap text-[#252525] placeholder:text-[#252525]/60" />
                <div className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-to-r from-[#4C2699] to-[#936EDD] text-white shrink-0"><FiSearch /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery content */}
        <div className="h-[calc(100vh-220px)] overflow-y-auto pr-3">
          <div className="space-y-8">
            {grouped.map(([date, items]) => (
              <section key={date}>
                <h2 className="text-[15px] font-semibold mb-4 text-[#222]">{formatDateHeading(date)}</h2>

                {/* Mobile grid */}
                <div className="sm:hidden px-1">
                  <div className="grid grid-cols-2 gap-3">
                    {items.map((it) => (
                      <figure key={it._id} className="bg-transparent rounded-lg overflow-hidden border border-slate-100 p-2">
                        <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100"><img src={it.url} alt={it.fileName?.split("_")?.[1] ?? "image"} className="w-full h-full object-cover" loading="lazy" /></div>
                        <figcaption className="mt-3 px-1 text-left">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium text-[#222] leading-5 truncate">{it.fileName?.split("_")?.[1] ?? "Untitled"}</div>
                            <button onClick={() => setPendingDelete(it)} disabled={isDeleting(it._id)} className="ml-2 rounded-md p-2 text-red-600 hover:bg-red-50" aria-label="Delete image" title="Delete"><FiTrash2 /></button>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-2 flex items-start gap-1"><span className="font-semibold">Category:</span><span className="font-normal">{it.category ?? "—"}</span></div>
                          <div className="text-[11px] text-slate-600 mt-1 flex items-start gap-1"><span className="font-semibold">Sub Category:</span><span className="font-normal">{it.subCategory ?? "—"}</span></div>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>

                {/* Desktop grid */}
                <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                  {items.map((it) => (
                    <figure key={it._id} className="bg-transparent rounded-lg overflow-hidden border border-slate-100 p-2 sm:p-3">
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100"><img src={it.url} alt={it.fileName?.split("_")?.[1] ?? "image"} className="w-full h-full object-cover" loading="lazy" /></div>
                      <figcaption className="mt-3 px-1">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-[#222] leading-5">{it.fileName?.split("_")?.[1] ?? "Untitled"}</div>
                          <button onClick={() => setPendingDelete(it)} disabled={isDeleting(it._id)} className="ml-2 rounded-md p-2 text-red-600 hover:bg-red-50" aria-label="Delete image" title="Delete"><FiTrash2 /></button>
                        </div>
                        <div className="text-xs text-slate-600 mt-2"><span className="font-semibold">Category:</span> <span className="font-normal">{it.category ?? "—"}</span></div>
                        <div className="text-xs text-slate-600 mt-1"><span className="font-semibold">Sub Category:</span> <span className="font-normal">{it.subCategory ?? "—"}</span></div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ))}

            {grouped.length === 0 && (<div className="py-16 text-center text-slate-500">No images match your filters.</div>)}
          </div>
        </div>
      </div>

      {/* Add Image Modal (same as before) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} aria-hidden />

          <div role="dialog" aria-modal="true" className="relative z-10 w-[92vw] max-w-[680px] max-h-[92vh] overflow-hidden rounded-2xl bg-[#f6f7fa] shadow-2xl">
            <form onSubmit={handleSave} className="h-full flex flex-col">
              <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#252525]">Add Image</h3>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-sm text-slate-600 hover:text-slate-800">Cancel</button>
              </div>

              <div className="px-4 sm:px-6 py-4 overflow-y-auto">
                {/* File */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#252525] mb-2">Image</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <label className="relative flex-1 w-full">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-3 min-h-[46px]">
                        <span className="text-sm text-slate-500 truncate">{form.file ? form.file.name : "Click to upload an image file"}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3v12" stroke="#6B4FD3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 7l4-4 4 4" stroke="#6B4FD3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 21H3" stroke="#6B4FD3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    </label>

                    <div className="w-20 h-20 rounded-md border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">{form.preview ? <img src={form.preview} alt="preview" className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400">Preview</div>}</div>
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#252525] mb-2">Category*</label>
                  <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="e.g. Bridal, Casual, Partywear" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" required />
                </div>

                {/* Sub Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#252525] mb-2">Sub Category*</label>
                  <input value={form.subCategory} onChange={(e) => setForm((prev) => ({ ...prev, subCategory: e.target.value }))} placeholder="e.g. Blouse, Lehenga, Dupatta" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" required />
                </div>

                {/* Color */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#252525] mb-2">Color*</label>
                  <input value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} placeholder="e.g. Red, Blue, Gold" className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" required />
                </div>

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#252525] mb-2">Date</label>
                  <input type="date" defaultValue={today} value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none" />
                </div>
              </div>

              <div className="px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-center">
                <button type="submit" className="w-full max-w-[420px] rounded-lg py-3 text-white font-semibold bg-gradient-to-r from-[#4C2699] to-[#936EDD] hover:brightness-105">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
