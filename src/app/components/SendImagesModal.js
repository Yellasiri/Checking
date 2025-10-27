"use client";
import { useState } from "react";
import { FiX } from "react-icons/fi";

export default function SendImagesModal({
  isOpen,
  onClose,
  selectedOrder,
  galleryItems = [],
  galleryLoading = false,
  galleryError = null,
  onSendImages,
}) {
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  const SAMPLE_IMG =
    "https://images.unsplash.com/photo-1562158070-9b9b9b2f6a66?w=800&q=60&auto=format&fit=crop";

  
const normalizedGalleryItems = Array.isArray(galleryItems)
  ? galleryItems
  : (galleryItems && (
      galleryItems.items ||
      galleryItems.gallery ||
      galleryItems.GalleryItems ||
      galleryItems.data ||
      Object.values(galleryItems).find(v => Array.isArray(v))
    )) || [];

const categories = Array.from(
  new Set(normalizedGalleryItems.map((g) => g.category || "Uncategorized"))
);


  // Set initial category when modal opens
  if (isOpen && !activeCategory && categories.length > 0) {
    setActiveCategory(categories[0]);
  }

  function toggleSelectImage(id) {
    setSelectedImages((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    );
  }

  function handleClose() {
    setActiveCategory(null);
    setSelectedImages([]);
    onClose();
  }

  function handleSend() {
    if (!selectedImages.length) {
      alert("Select at least one image");
      return;
    }
    onSendImages(selectedImages, activeCategory);
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
                        {galleryItems.filter(
                          (g) =>
                            (g.category || "Uncategorized") === activeCategory
                        ).length === 0 ? (
                          <div className="h-full grid place-items-center text-slate-500">
                            No images in this category.
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-4">
                            {galleryItems
                              .filter(
                                (g) =>
                                  (g.category || "Uncategorized") ===
                                  activeCategory
                              )
                              .map((img) => {
                                const isSelected = selectedImages.includes(
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
                                        src={
                                          img.url || img.src || SAMPLE_IMG
                                        }
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
                          {selectedImages.slice(0, 6).map((id) => {
                            const g = galleryItems.find((x) => x._id === id);
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
                          {selectedImages.length === 0
                            ? "No images selected"
                            : `${selectedImages.length} selected`}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedImages([])}
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
                    {galleryItems
                      .filter(
                        (g) =>
                          (g.category || "Uncategorized") === activeCategory
                      )
                      .map((img) => {
                        const id = img._id;
                        const isSelected = selectedImages.includes(id);
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