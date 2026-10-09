"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { FormState, LaptopType } from '@/lib/types';
import { addProduct, deleteProduct, deleteProductImage, getProducts, updateProduct } from '@/lib/productDataService';
import { getProductSummary, getPricing, isDealLive } from '@/lib/productDisplay';
import { Check, ChevronDown, Edit, Filter, Menu, Plus, Search, Trash2, X } from 'lucide-react';
import { categories, tags, dealBadges } from '@/lib/data';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useLaptopStore } from '@/store/laptopStore';
import { useSidebarStore } from '@/store/sidebarStore';


const page = () => {
  const [laptops, setLaptops] = useState<LaptopType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingLaptop, setEditingLaptop] = useState<LaptopType | null>(null);
  const [loading, setLoading] = useState<boolean>(true)
  const [formData, setFormData] = useState<FormState>({
    name: "",
    category: "premium",
    price: "",
    oldPrice: "",
    images: [],
    rating: "",
    reviews: "",
    stockQuantity: "1",
    tag: "",
    description: "",
    features: "",
    warranty: "",
    isDeal: false,
    dealEndsAt: "",
    dealBadge: "",
    discount: "",
    configurations: [],
    specSheet: [],
    condition: "used",
    conditionNotes: ""
  });
  const [uploading, setUploading] = useState(false);
  const { laptopStoreData, loadingStore } = useLaptopStore()
  const { toggleSidebar } = useSidebarStore()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleAddConfiguration = () => {
    setFormData(prev => ({
      ...prev,
      configurations: [
        ...prev.configurations,
        { id: `cfg_${Date.now()}`, processor: "", ram: "", storage: "", customLabel: "", price: "", oldPrice: "", stockQuantity: "" }
      ]
    }));
  };

  const handleRemoveConfiguration = (id: string) => {
    setFormData(prev => ({
      ...prev,
      configurations: prev.configurations.filter(c => c.id !== id)
    }));
  };

  const handleConfigurationChange = (
    id: string,
    field: "processor" | "ram" | "storage" | "customLabel" | "price" | "oldPrice" | "stockQuantity",
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      configurations: prev.configurations.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const handleAddSpec = () => {
    setFormData(prev => ({ ...prev, specSheet: [...prev.specSheet, { label: "", value: "" }] }));
  };
  const handleRemoveSpec = (index: number) => {
    setFormData(prev => ({ ...prev, specSheet: prev.specSheet.filter((_, i) => i !== index) }));
  };
  const handleSpecChange = (index: number, field: "label" | "value", value: string) => {
    setFormData(prev => ({
      ...prev,
      specSheet: prev.specSheet.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const deleteImageFunc = (productID: string, img: string, imgIndex: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imgIndex),
    }))
    deleteProductImage(productID, img)
  }


  const filteredLaptops = useMemo(() => {
    if (laptopStoreData.length === 0) return [];

    return laptopStoreData.filter((laptop) => {
      const name = laptop?.name?.toLowerCase() || "";
      const q = searchTerm.toLowerCase();

      const specSheetMatch = (laptop.specSheet || []).some(
        (s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q)
      );
      const configMatch = (laptop.configurations || []).some(
        (c) =>
          c.processor?.toLowerCase().includes(q) ||
          c.ram?.toLowerCase().includes(q) ||
          c.storage?.toLowerCase().includes(q)
      );

      const matchesSearch = name.includes(q) || specSheetMatch || configMatch;

      const matchesCategory =
        filterCategory === "all" || laptop?.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [laptopStoreData, searchTerm, filterCategory]);


  useEffect(() => {
    setLaptops(laptopStoreData)
  }, [laptopStoreData]);

  useEffect(() => {
    setLoading(loadingStore)
  }, [loadingStore]);


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        target instanceof HTMLInputElement && target.type === "checkbox"
          ? target.checked
          : value,
    }));
  };

  // Live preview of what the discount does, shown under the Discount field.
  const discountPct = parseFloat(formData.discount) || 0;
  const previewBases = (
    formData.configurations.length > 0
      ? formData.configurations.map((c) => parseFloat(c.price) || 0)
      : [parseFloat(formData.price) || 0]
  ).filter((p) => p > 0);
  const previewBase = previewBases.length ? Math.min(...previewBases) : 0;
  const previewDealPrice =
    previewBase > 0 && discountPct > 0 && discountPct < 100
      ? Math.round(previewBase * (1 - discountPct / 100))
      : null;

  const handleSubmit = async () => {
    const hasConfigurations = formData.configurations.length > 0;

    if (!formData.name || !formData.rating || !formData.reviews || (!hasConfigurations && !formData.price)) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.isDeal && !(discountPct > 0 && discountPct < 100)) {
      alert("A deal needs a Discount % between 1 and 99 — that is what lowers the price while the deal is live.");
      return;
    }

    const baseData = {
      id: editingLaptop ? editingLaptop.id : '',
      dbID: editingLaptop ? editingLaptop.dbID : '',
      name: formData.name,
      category: formData.category,
      price: formData.price ? parseFloat(formData.price) : 0,
      oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : 0,
      images: formData.images,
      rating: parseFloat(formData.rating),
      reviews: parseInt(formData.reviews),
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      tag: formData.tag,
      description: formData.description,
      features: formData.features
        ? formData.features.split("\n").filter((f) => f.trim())
        : [],
      warranty: formData.warranty,
      isDeal: formData.isDeal,
      dealEndsAt: formData.isDeal && formData.dealEndsAt ? new Date(formData.dealEndsAt).getTime() : null,
      dealBadge: formData.dealBadge,
      discount: formData.isDeal ? discountPct : 0,
      condition: (formData.condition || "used") as "new" | "used" | "refurbished",
      conditionNotes: formData.conditionNotes,
    };

    const laptopData: LaptopType = {
      ...baseData,
      ...(hasConfigurations
        ? {
          configurations: formData.configurations.map((c) => ({
            id: c.id,
            processor: c.processor,
            ram: c.ram,
            storage: c.storage,
            ...(c.customLabel ? { customLabel: c.customLabel } : {}),
            price: parseFloat(c.price) || 0,
            ...(c.oldPrice ? { oldPrice: parseFloat(c.oldPrice) } : {}),
            stockQuantity: parseInt(c.stockQuantity) || 0,
          })),
        }
        : {}),
      ...(formData.specSheet.length > 0
        ? { specSheet: formData.specSheet.filter(s => s.label.trim() && s.value.trim()) }
        : {}),
    };

    if (editingLaptop) {
      setLaptops((prev) =>
        prev.map((l) => (l.id === editingLaptop.id ? laptopData : l))
      );
      try {
        await updateProduct(editingLaptop.dbID!, laptopData)
      } catch (err) {
        console.log(err)
      }
    } else {
      setLaptops((prev) => [...prev, laptopData]);
      try {
        await addProductFunc(laptopData)
      } catch (err) {
        console.log(err)
      }
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "premium",
      price: "",
      oldPrice: "",
      images: [],
      rating: "",
      reviews: "",
      stockQuantity: "1",
      tag: "",
      description: "",
      features: "",
      warranty: "",
      isDeal: false,
      dealEndsAt: "",
      dealBadge: "",
      discount: "",
      configurations: [],
      specSheet: [],
      condition: "used",
      conditionNotes: ""
    });
    setEditingLaptop(null);
    setShowModal(false);
  };

  const handleEdit = async (laptop: LaptopType) => {
    setEditingLaptop(laptop);
    setFormData({
      name: laptop.name,
      category: laptop.category,
      price: laptop.price?.toString() || "",
      oldPrice: laptop.oldPrice ? laptop.oldPrice.toString() : "",
      images: laptop.images,
      rating: laptop.rating.toString(),
      reviews: laptop.reviews.toString(),
      stockQuantity: laptop.stockQuantity?.toString() || "0",
      tag: laptop.tag || "",
      description: laptop.description || "",
      features: laptop.features?.join("\n") || "",
      warranty: laptop.warranty || "",
      isDeal: laptop.isDeal || false,
      dealEndsAt: laptop.dealEndsAt
        ? new Date(laptop.dealEndsAt).toISOString().slice(0, 16)
        : "",
      dealBadge: laptop.dealBadge || "",
      discount: laptop.discount ? laptop.discount.toString() : "",
      configurations: (laptop.configurations || []).map((c) => ({
        id: c.id,
        processor: c.processor,
        ram: c.ram,
        storage: c.storage,
        customLabel: c.customLabel || "",
        price: c.price.toString(),
        oldPrice: c.oldPrice?.toString() || "",
        stockQuantity: c.stockQuantity.toString(),
      })),
      specSheet: laptop.specSheet || [],
      condition: laptop.condition || "used",
      conditionNotes: laptop.conditionNotes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
    } catch (err) {
      console.log(err)
    }
  };

  const addProductFunc = async (data: LaptopType) => {
    await addProduct(data)
  }

  const inputClass =
    "w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"

  return (
    <>
      <main className="min-h-screen bg-gray-50 flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-4 py-2.5 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleSidebar()}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                >
                  <Menu size={20} />
                </button>
                <h2 className="text-[18px] sm:text-2xl font-bold text-gray-900">All Products</h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-amber-500 text-neutral-950 text-[12px] sm:text-[16px] px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl hover:bg-amber-600 transition-all duration-200 font-semibold shadow-sm"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          </div>
        </header>

        <div className="px-3 sm:px-6 py-4">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search products by name or specs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-300 focus:outline-none transition-colors"
                />
              </div>
              <div className="relative">
                <Filter
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-300 focus:outline-none appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="text-center text-gray-500 py-10 col-span-full">Loading...</div>
            ) : filteredLaptops.length === 0 ? (
              <div className="text-center text-gray-500 py-10 col-span-full">No laptops found.</div>
            ) : (
              filteredLaptops.map((laptop, index) => {
                const hasConfigurations = (laptop.configurations?.length ?? 0) > 0;
                const configStock = hasConfigurations
                  ? laptop.configurations!.reduce((sum, c) => sum + c.stockQuantity, 0)
                  : laptop.stockQuantity;
                const pricing = getPricing(laptop);

                return (
                  <div
                    key={laptop.dbID || index}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="relative h-52 overflow-hidden bg-gray-100">
                      <img
                        src={laptop.images?.[0]}
                        alt={laptop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {isDealLive(laptop) && (
                        <span className="absolute top-4 left-4 bg-amber-500 text-neutral-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                          {laptop.dealBadge || "Deal"}
                        </span>
                      )}
                      <span className="absolute top-4 right-4 bg-white/70 backdrop-blur-md text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300">
                        {laptop.tag}
                      </span>
                      <div
                        className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-xs font-semibold ${configStock > 0
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                          }`}
                      >
                        {configStock > 0 ? `${configStock} in stock` : "Out of Stock"}
                      </div>
                      <span className="absolute bottom-4 right-4 bg-neutral-950/80 text-white text-xs font-semibold px-3 py-1.5 rounded-lg capitalize">
                        {laptop.condition || "used"}
                      </span>
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                        {laptop.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                        {getProductSummary(laptop)}
                      </p>

                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                          {pricing.isFrom && (
                            <span className="text-sm font-medium text-gray-500 mr-1">From</span>
                          )}
                          ₦{pricing.price.toLocaleString()}
                        </span>
                        {pricing.oldPrice && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₦{pricing.oldPrice.toLocaleString()}
                            </span>
                            {isDealLive(laptop) && (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">
                                -{pricing.percent}%
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-200">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400">★</span>
                          <span className="font-semibold text-gray-800 text-sm">
                            {laptop.rating}
                          </span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {laptop.reviews} reviews
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(laptop)}
                          className="flex-1 flex items-center justify-center gap-2 bg-neutral-950 text-white px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors font-semibold text-sm"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(laptop.dbID!)}
                          className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-neutral-800">
            <div className="bg-neutral-900 px-6 py-5 flex items-center justify-between border-b border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingLaptop ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-sm text-neutral-400 mt-0.5">
                  {editingLaptop ? 'Update product information' : 'Create a new laptop listing'}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-neutral-400 hover:text-white hover:bg-neutral-800 p-2 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Product Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Tag</label>
                  <div className="relative">
                    <select
                      name="tag"
                      value={formData.tag}
                      onChange={handleInputChange}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="">Select a tag</option>
                      {tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Condition <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Condition Notes</label>
                  <input
                    type="text"
                    name="conditionNotes"
                    value={formData.conditionNotes}
                    onChange={handleInputChange}
                    placeholder="e.g. Minor scuff on lid, battery health 92%"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Price (₦) {formData.configurations.length === 0 && <span className="text-amber-400">*</span>}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder={formData.configurations.length > 0 ? "Not used — configurations set the price" : "0.00"}
                    disabled={formData.configurations.length > 0}
                    className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                  />
                  {formData.isDeal && (
                    <p className="text-xs text-amber-500 mt-1.5">
                      Enter the regular price — the deal discount is applied to it automatically.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Old Price (₦)</label>
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder={formData.configurations.length > 0 ? "Not used — configurations set the price" : "0.00"}
                    disabled={formData.configurations.length > 0}
                    className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                  />
                  <p className="text-xs text-neutral-500 mt-1.5">
                    {formData.isDeal && discountPct > 0
                      ? "Ignored while this is a deal — the discount sets the struck-through price."
                      : "Optional permanent \"was\" price. For limited-time offers, use Is Deal + Discount % instead."}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Rating <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    step="0.1"
                    min="0"
                    max="5"
                    placeholder="0.0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Reviews <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Product Images <span className="text-amber-400">*</span>
                  </label>

                  <div className="flex items-center gap-4 flex-wrap">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4
      file:rounded-lg file:border-0 file:text-sm file:font-semibold
      file:bg-amber-500 file:text-neutral-950 hover:file:bg-amber-400"
                    />

                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={img}
                              alt={`Preview ${i + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-neutral-700"
                            />
                            {editingLaptop?.dbID &&
                              (<button
                                type="button"
                                onClick={() => deleteImageFunc(editingLaptop?.dbID!, img, i)}
                                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                              >
                                ✕
                              </button>)
                            }
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {uploading && (
                    <p className="text-sm text-amber-400 mt-2">Uploading images...</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter product description..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Features <span className="text-neutral-500 text-xs font-normal">(one per line)</span>
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder={"Feature 1\nFeature 2\nFeature 3"}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    placeholder="e.g., 1-year limited warranty"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-8 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Stock Quantity {formData.configurations.length === 0 && <span className="text-amber-400">*</span>}
                    </label>
                    <input
                      type="number"
                      name="stockQuantity"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      placeholder={formData.configurations.length > 0 ? "Not used — configurations set the stock" : "e.g., 5"}
                      disabled={formData.configurations.length > 0}
                      className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isDeal"
                        checked={formData.isDeal}
                        onChange={handleInputChange}
                        className="w-5 h-5 bg-black border-2 border-neutral-700 rounded-md appearance-none cursor-pointer checked:bg-amber-500 checked:border-amber-500 transition-all"
                      />
                      {formData.isDeal && (
                        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-950 pointer-events-none" size={14} />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white group-hover:text-neutral-300 transition-colors">Is Deal</span>
                  </label>
                </div>

                <div className="md:col-span-2 space-y-3 border-t border-neutral-800 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-semibold text-white">Configurations (optional)</label>
                      <p className="text-xs text-neutral-500 mt-1">
                        Add these only if this listing has multiple spec variants (e.g. different RAM/storage combos), each with its own price and stock. Leave empty for a simple single-price product.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddConfiguration}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg"
                    >
                      + Add Configuration
                    </button>
                  </div>

                  {formData.configurations.map((config) => (
                    <div key={config.id} className="bg-black border border-neutral-800 rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          placeholder="Processor (e.g. Intel Core i5-8350U)"
                          value={config.processor}
                          onChange={(e) => handleConfigurationChange(config.id, "processor", e.target.value)}
                          className="col-span-12 sm:col-span-4 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="RAM (e.g. 8GB)"
                          value={config.ram}
                          onChange={(e) => handleConfigurationChange(config.id, "ram", e.target.value)}
                          className="col-span-6 sm:col-span-4 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Storage (e.g. 256GB SSD)"
                          value={config.storage}
                          onChange={(e) => handleConfigurationChange(config.id, "storage", e.target.value)}
                          className="col-span-6 sm:col-span-4 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Custom label (optional — overrides the auto-generated one above, e.g. for a special edition)"
                        value={config.customLabel}
                        onChange={(e) => handleConfigurationChange(config.id, "customLabel", e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                      />
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="number"
                          placeholder="Price (₦)"
                          value={config.price}
                          onChange={(e) => handleConfigurationChange(config.id, "price", e.target.value)}
                          className="col-span-4 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Old price"
                          value={config.oldPrice}
                          onChange={(e) => handleConfigurationChange(config.id, "oldPrice", e.target.value)}
                          className="col-span-4 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={config.stockQuantity}
                          onChange={(e) => handleConfigurationChange(config.id, "stockQuantity", e.target.value)}
                          className="col-span-3 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveConfiguration(config.id)}
                          className="col-span-1 flex items-center justify-center py-2 text-red-500 hover:text-red-400"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.isDeal && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Deal Badge</label>
                      <div className="relative">
                        <select
                          name="dealBadge"
                          value={formData.dealBadge}
                          onChange={handleInputChange}
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option value="">Select badge</option>
                          {dealBadges.map(badge => (
                            <option key={badge} value={badge}>{badge}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Discount (%) <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="1"
                        max="99"
                        placeholder="e.g. 10"
                        className={inputClass}
                      />
                      <p className="text-xs text-neutral-500 mt-1.5">
                        Taken off the price automatically while the deal is live. When the deal ends, the price goes back to normal.
                      </p>
                      {previewDealPrice !== null && (
                        <p className="text-xs text-emerald-400 mt-1.5">
                          {formData.configurations.length > 0 ? "Cheapest configuration becomes " : "Customers will pay "}
                          ₦{previewDealPrice.toLocaleString()}{" "}
                          <span className="text-neutral-500 line-through">₦{previewBase.toLocaleString()}</span>
                        </p>
                      )}
                    </div>
                  </>
                )}

                {formData.isDeal && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Deal Ends At</label>
                    <input
                      type="datetime-local"
                      name="dealEndsAt"
                      value={formData.dealEndsAt}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="md:col-span-2 space-y-3 border-t border-neutral-800 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-semibold text-white">Specifications (optional)</label>
                      <p className="text-xs text-neutral-500 mt-1">
                        Shared specs that apply no matter which configuration is chosen — e.g. Display, Battery, Ports, Webcam, OS, Weight.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpec}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg"
                    >
                      + Add Spec
                    </button>
                  </div>
                  {formData.specSheet.map((spec, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. Display)"
                        value={spec.label}
                        onChange={(e) => handleSpecChange(i, "label", e.target.value)}
                        className="col-span-5 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 15.6&quot; FHD 1920x1080)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(i, "value", e.target.value)}
                        className="col-span-6 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(i)}
                        className="col-span-1 flex items-center justify-center text-red-500 hover:text-red-400"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-neutral-950 border-t border-neutral-800 flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 px-6 py-3 border border-neutral-700 text-white rounded-xl hover:bg-neutral-800 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-amber-500 text-neutral-950 rounded-xl hover:bg-amber-600 transition-colors font-semibold shadow-lg"
              >
                {editingLaptop ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>

      )}
    </>
  )
}

export default page