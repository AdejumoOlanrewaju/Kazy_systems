"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { FormState, LaptopType } from '@/lib/types';
import { addProduct, deleteProduct, deleteProductImage, getProducts, updateProduct } from '@/lib/productDataService';
import { Check, ChevronDown, Edit, Filter, Link, Menu, Package, Plus, Search, Tag, Trash2, X } from 'lucide-react';
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
  // const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    category: "premium",
    price: "",
    oldPrice: "",
    images: [],
    specs: "",
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
  });
  const [uploading, setUploading] = useState(false);
  const { laptopStoreData, loadingStore } = useLaptopStore()
  const { toggleSidebar, isOpen } = useSidebarStore()

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


  const deleteImageFunc = (productID: string, img: string, imgIndex: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imgIndex),
    }))
    console.log("Product ID : ", productID)
    console.log("Image Url : ", img)

    deleteProductImage(productID, img)
  }


  const filteredLaptops = useMemo(() => {
    if (laptopStoreData.length === 0) return [];

    return laptopStoreData.filter((laptop) => {
      const name = laptop?.name?.toLowerCase() || "";
      const specs = laptop?.specs?.toLowerCase() || "";

      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) ||
        specs.includes(searchTerm.toLowerCase());

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


  // ✅ Typed handler
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

  // ✅ Submit
  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.rating || !formData.reviews) {
      alert("Please fill in all required fields");
      return;
    }

    const laptopData: LaptopType = {
      id: editingLaptop ? editingLaptop.id : '',
      dbID: editingLaptop ? editingLaptop.dbID : '',
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price),
      oldPrice: parseFloat(formData.oldPrice),
      images: formData.images,
      specs: formData.specs,
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
      discount: formData.discount ? parseInt(formData.discount) : 0,
    };

    if (editingLaptop) {
      setLaptops((prev) =>
        prev.map((l) => (l.id === editingLaptop.id ? laptopData : l))
      );
      try {
        await updateProduct(editingLaptop.dbID!, laptopData)
        console.log("Updated Product with this id")
      } catch (err) {
        console.log(err)
      }
    } else {
      setLaptops((prev) => [...prev, laptopData]);
      try {
        await addProductFunc(laptopData)
        console.log("Product added successfully")
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
      specs: "",
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
    });
    setEditingLaptop(null);
    setShowModal(false);
  };

  const handleEdit = async (laptop: LaptopType) => {
    console.log(laptop)
    setEditingLaptop(laptop);
    setFormData({
      name: laptop.name,
      category: laptop.category,
      price: laptop.price.toString(),
      oldPrice: laptop.oldPrice?.toString() || "",
      images: laptop.images,
      specs: laptop.specs,
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
      discount: laptop.discount?.toString() || "",
    });
    setShowModal(true);


  };

  const handleDelete = async (id: string) => {
    // if (confirm("Are you sure you want to delete this product?")) {
    //     setLaptops((prev) => prev.filter((l) => l.id !== id));
    // }

    try {
      await deleteProduct(id)
      console.log("Product deleted successfully")
    } catch (err) {
      console.log(err)
    }
  };

  const addProductFunc = async (data: LaptopType) => {
    await addProduct(data)
  }
  return (
    <>
      <main className="min-h-screen bg-gray-50  flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className=" px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleSidebar()}
                    className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-700 hover:text-white"
                  >
                    <Menu size={20} />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-black">All Products</h2>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm"
              >
                <Plus size={18} />
                Add Product
              </button>
            </div>
          </div>
        </header>

        <div className="px-6 mt-6">

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
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 focus:outline-none transition-colors"
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
                  className="pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:border-blue-400 focus:ring-1 focus:ring-blue-300 focus:outline-none appearance-none cursor-pointer min-w-[200px]"
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
              <div className="text-center text-gray-500 py-10">Loading...</div>
            ) : filteredLaptops.length === 0 ? (
              <div className="text-center text-gray-500 py-10">No laptops found.</div>
            ) : (
              filteredLaptops.map((laptop, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  {/* === IMAGE SECTION === */}
                  <div className="relative h-52 overflow-hidden bg-gray-100">
                    <img
                      src={laptop.images?.[0]}
                      alt={laptop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {laptop.isDeal && (
                      <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow">
                        {laptop.dealBadge}
                      </span>
                    )}
                    <span className="absolute top-4 right-4 bg-white/70 backdrop-blur-md text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300">
                      {laptop.tag}
                    </span>
                    <div
                      className={`absolute bottom-4 left-4 px-3 py-1.5 rounded-lg text-xs font-semibold ${laptop.stockQuantity > 0
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                    >
                      {laptop.stockQuantity > 0 ? `${laptop.stockQuantity} in stock` : "Out of Stock"}
                    </div>
                  </div>

                  {/* === DETAILS SECTION === */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                      {laptop.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                      {laptop.specs}
                    </p>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">
                        ₦{laptop.price.toLocaleString()}
                      </span>
                      {laptop.oldPrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ₦{laptop.oldPrice.toLocaleString()}
                          </span>
                          {laptop.discount! > 0 && (
                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md border border-green-200">
                              -{laptop.discount}%
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-5 pb-5 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
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
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(laptop.dbID!)}
                        className="flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-2.5 rounded-xl hover:bg-red-200 transition-colors border border-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>



        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-neutral-800">
            <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 px-6 py-5 flex items-center justify-between border-b border-neutral-800">
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
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white focus:border-neutral-600 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Tag</label>
                  <div className="relative">
                    <select
                      name="tag"
                      value={formData.tag}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white focus:border-neutral-600 focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select a tag</option>
                      {tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Price ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Old Price */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Old Price ($)</label>
                  <input
                    type="number"
                    name="oldPrice"
                    value={formData.oldPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Rating <span className="text-red-400">*</span>
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
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Reviews */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Reviews <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="reviews"
                    value={formData.reviews}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Image URL */}
                {/* Image Upload */}
                {/* Multiple Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Product Images <span className="text-red-400">*</span>
                  </label>

                  <div className="flex items-center gap-4 flex-wrap">
                    {/* File input */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 
      file:rounded-lg file:border-0 file:text-sm file:font-semibold
      file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700"
                    />

                    {/* Preview images */}
                    {formData.images.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-3">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={img}
                              alt={`Preview ${i + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-neutral-700"
                            />
                            {/* Remove button */}
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

                  {/* Uploading loader */}
                  {uploading && (
                    <p className="text-sm text-emerald-400 mt-2">Uploading images...</p>
                  )}
                </div>



                {/* Specs */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Specs <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="specs"
                    value={formData.specs}
                    onChange={handleInputChange}
                    placeholder="e.g., Intel i7, 16GB RAM, 512GB SSD"
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Enter product description..."
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Features */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Features <span className="text-neutral-500 text-xs font-normal">(one per line)</span>
                  </label>
                  <textarea
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Warranty */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">Warranty</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleInputChange}
                    placeholder="e.g., 1-year limited warranty"
                    className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 flex items-center gap-8 pt-2">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      placeholder="e.g., 5"
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isDeal"
                        checked={formData.isDeal}
                        onChange={handleInputChange}
                        className="w-5 h-5 bg-black border-2 border-neutral-700 rounded-md appearance-none cursor-pointer checked:bg-purple-500 checked:border-purple-500 transition-all"
                      />
                      {formData.isDeal && (
                        <Check className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none" size={14} />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white group-hover:text-neutral-300 transition-colors">Is Deal</span>
                  </label>
                </div>

                {/* Deal Badge & Discount */}
                {formData.isDeal && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Deal Badge</label>
                      <div className="relative">
                        <select
                          name="dealBadge"
                          value={formData.dealBadge}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white focus:border-neutral-600 focus:outline-none transition-colors appearance-none cursor-pointer"
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
                      <label className="block text-sm font-semibold text-white mb-2">Discount (%)</label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        placeholder="0"
                        className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none transition-colors"
                      />
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
                      className="w-full px-4 py-3 bg-black border border-neutral-800 rounded-xl text-white focus:border-neutral-600 focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 bg-neutral-950 border-t border-neutral-800 flex gap-3">
              <button
                onClick={resetForm}
                className="flex-1 px-6 py-3 border border-neutral-700 text-white rounded-xl hover:bg-neutral-800 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-white text-black rounded-xl hover:bg-neutral-100 transition-colors font-semibold shadow-lg"
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

// useEffect(() => {
//   const unsubscribe = getProducts((data) => {
//     setLaptops(data)
//     setLoading(false)
//   })
//   return () => unsubscribe()
// }, [])