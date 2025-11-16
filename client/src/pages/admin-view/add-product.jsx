import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  GripVertical,
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  Tag,
  DollarSign,
  TrendingUp,
  Package,
  Info
} from "lucide-react";
import axios from "axios";
import apiConfig from "@/config/api";

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    image: "",
    images: [],
    prices: [
      {
        website: "amazon",
        price: "",
        originalPrice: "",
        discount: "",
        url: "",
        inStock: true,
        rating: "",
        reviews: "",
      },
    ],
    tags: "",
    trending: false,
  });

  const websiteOptions = [
    { id: "amazon", label: "Amazon" },
    { id: "flipkart", label: "Flipkart" },
    { id: "myntra", label: "Myntra" },
    { id: "ajio", label: "Ajio" },
    { id: "nykaa", label: "Nykaa" },
    { id: "meesho", label: "Meesho" },
  ];

  const categoryOptions = [
    { id: "men", label: "Men" },
    { id: "women", label: "Women" },
    { id: "kids", label: "Kids" },
  ];

  const subcategoryOptions = {
    men: [
      { id: "t-shirts", label: "T-Shirts" },
      { id: "oversized-t-shirts", label: "Oversized T-Shirts" },
      { id: "shirts", label: "Shirts" },
      { id: "sweatshirts-hoodies", label: "Sweatshirts & Hoodies" },
      { id: "jackets", label: "Jackets" },
      { id: "blazers-coats", label: "Blazers & Coats" },
      { id: "kurta-ethnic-tops", label: "Kurta & Ethnic Tops" },
      { id: "tank-tops", label: "Tank Tops" },
      { id: "jeans", label: "Jeans" },
      { id: "trousers-pants", label: "Trousers / Pants" },
      { id: "shorts", label: "Shorts" },
      { id: "track-pants", label: "Track Pants" },
      { id: "ethnic-bottoms", label: "Ethnic Bottoms" },
      { id: "joggers", label: "Joggers" },
      { id: "innerwear", label: "Innerwear" },
    ],
    women: [
      { id: "tops", label: "Tops" },
      { id: "t-shirts", label: "T-Shirts" },
      { id: "oversized-t-shirts", label: "OverSized T-Shirts" },
      { id: "shirts", label: "Shirts" },
      { id: "sarees", label: "Sarees" },
      { id: "lehenga-choli", label: "Lehenga Choli" },
      { id: "blouses", label: "Blouses" },
      { id: "jeans", label: "Jeans" },
      { id: "trousers-pants", label: "Trousers / Pants" },
      { id: "leggings-jeggings", label: "Leggings / Jeggings" },
      { id: "shorts", label: "Shorts" },
      { id: "joggers-cargo-pants", label: "Joggers / Cargo Pants" },
      { id: "sweatshirts-hoodies", label: "Sweatshirts & Hoodies" },
      { id: "innerwear", label: "InnerWear" },
    ],
    kids: [
      { id: "t-shirts-boys-girls", label: "T-Shirts (boys and girls)" },
      { id: "bottom-wear", label: "Bottom-wear" },
      { id: "dresses-casual-outfits", label: "Dresses & casual outfits" },
      { id: "everyday-casual-wear", label: "Everyday casual wear" },
      { id: "ethnic-festive-wear", label: "Ethnic & festive wear" },
    ],
  };


  const handleAddPriceField = () => {
    setFormData({
      ...formData,
      prices: [
        ...formData.prices,
        {
          website: "amazon",
          price: "",
          originalPrice: "",
          discount: "",
          url: "",
          inStock: true,
          rating: "",
          reviews: "",
        },
      ],
    });
  };

  const handleRemovePriceField = (index) => {
    const newPrices = formData.prices.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      prices: newPrices,
    });
  };

  const handlePriceChange = (index, field, value) => {
    const newPrices = [...formData.prices];
    newPrices[index] = {
      ...newPrices[index],
      [field]: value,
    };
    
    // Auto-calculate discount if original price and current price are provided
    if (field === 'price' || field === 'originalPrice') {
      const price = field === 'price' ? parseFloat(value) : parseFloat(newPrices[index].price);
      const originalPrice = field === 'originalPrice' ? parseFloat(value) : parseFloat(newPrices[index].originalPrice);
      
      if (price && originalPrice && originalPrice > price) {
        const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        newPrices[index].discount = discount.toString();
      }
    }
    
    setFormData({
      ...formData,
      prices: newPrices,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = (files) => {
    // Validate all files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: `${file.name} is not a valid image file`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `${file.name} is larger than 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setImageFiles(prev => [...prev, ...validFiles]);
      toast({
        title: "Success",
        description: `${validFiles.length} image(s) added to upload queue`,
      });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOverImage = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setUploadedImages(newImages);
    setFormData({
      ...formData,
      images: newImages,
      image: newImages[0] || formData.image
    });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...uploadedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setUploadedImages(newImages);
    setFormData({
      ...formData,
      images: newImages,
      image: newImages[0] || formData.image
    });
  };

  const handleImageUpload = async (index) => {
    const file = imageFiles[index];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("image", file);

      const response = await axios.post(
        `${apiConfig.UPLOAD}/upload`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const newImages = [...uploadedImages, response.data.data.url];
        setUploadedImages(newImages);
        setFormData({ 
          ...formData, 
          images: newImages,
          image: newImages[0] || formData.image // Set first image as main image for backward compatibility
        });
        
        // Remove uploaded file from queue
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        
        toast({
          title: "Success",
          description: "Image uploaded successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    setFormData({ 
      ...formData, 
      images: newImages,
      image: newImages[0] || "" // Update main image
    });
  };

  const handleRemoveImageFile = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAllImages = async () => {
    for (let i = 0; i < imageFiles.length; i++) {
      await handleImageUpload(i);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate images are provided
    if (uploadedImages.length === 0 && !formData.image) {
      toast({
        title: "Error",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare data
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        image: formData.images[0] || formData.image, // Use first image as main image
        images: formData.images.length > 0 ? formData.images : (formData.image ? [formData.image] : []),
        prices: formData.prices
          .filter(
            (price) =>
              price.website && price.price && price.url
          )
          .map((price) => ({
            website: price.website,
            price: parseFloat(price.price),
            originalPrice: price.originalPrice
              ? parseFloat(price.originalPrice)
              : undefined,
            discount: price.discount ? parseFloat(price.discount) : undefined,
            url: price.url, // Affiliate link
            inStock: price.inStock !== false,
            rating: price.rating ? parseFloat(price.rating) : undefined,
            reviews: price.reviews ? parseInt(price.reviews) : undefined,
          })),
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        trending: formData.trending || false,
      };

      const response = await axios.post(
        `${apiConfig.PRICE_COMPARISON}/product`,
        productData
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Product added successfully!",
        });
        setFormData({
          name: "",
          description: "",
          category: "",
          subcategory: "",
          brand: "",
          image: "",
          prices: [
            {
              website: "amazon",
              price: "",
              originalPrice: "",
              discount: "",
              url: "",
              inStock: true,
              rating: "",
              reviews: "",
            },
          ],
          tags: "",
          images: [],
          trending: false,
        });
        setImageFiles([]);
        setUploadedImages([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
              className="hover:bg-blue-50 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Add New Product
                </h1>
                <p className="text-sm text-gray-500 mt-1">Create a new product listing</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Product Info */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      placeholder="e.g., Men's Casual T-Shirt - Premium Cotton"
                      className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all shadow-sm"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-600" />
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      placeholder="Provide a detailed description of the product, including materials, features, and key selling points..."
                      rows={5}
                      className="text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all shadow-sm resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">{formData.description.length} characters</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="category" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ 
                          ...formData, 
                          category: value,
                          subcategory: "" // Reset subcategory when category changes
                        })
                      }
                    >
                      <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subcategory" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      Subcategory *
                    </Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subcategory: value })
                      }
                      disabled={!formData.category}
                      required
                    >
                      <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                        <SelectValue 
                          placeholder={
                            formData.category 
                              ? "Select subcategory" 
                              : "Select category first"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.category && subcategoryOptions[formData.category]?.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      Brand *
                    </Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) =>
                        setFormData({ ...formData, brand: e.target.value })
                      }
                      required
                      placeholder="e.g., Nike, Adidas, H&M"
                      className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="images" className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    Product Images *
                  </Label>
                  <div className="space-y-6">
                    {/* Drag and Drop Zone */}
                    <div
                      ref={dropZoneRef}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 transition-all duration-300 ${
                        isDragging
                          ? "border-blue-500 bg-blue-50 scale-105 shadow-lg"
                          : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
                      }`}
                    >
                      <Input
                        ref={fileInputRef}
                        id="image-file"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className={`p-4 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"} transition-colors`}>
                          <Upload className={`h-8 w-8 ${isDragging ? "text-blue-600" : "text-gray-400"} transition-colors`} />
                        </div>
                        <div className="text-center">
                          <Label
                            htmlFor="image-file"
                            className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold text-base"
                          >
                            Click to upload
                          </Label>
                          <span className="text-gray-500 mx-2">or</span>
                          <span className="text-gray-700 font-medium">drag and drop</span>
                        </div>
                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                      </div>
                    </div>

                    {/* Pending Upload Files */}
                    {imageFiles.length > 0 && (
                      <div className="space-y-4 bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border-2 border-amber-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-amber-600" />
                            Files to Upload ({imageFiles.length})
                          </Label>
                          <Button
                            type="button"
                            onClick={handleUploadAllImages}
                            disabled={uploadingIndex !== null}
                            size="sm"
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md"
                          >
                            {uploadingIndex !== null ? "Uploading..." : "Upload All"}
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative group border-2 border-gray-300 rounded-xl p-3 bg-white shadow-md hover:shadow-lg transition-all">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                onClick={() => handleRemoveImageFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleImageUpload(index)}
                                disabled={uploadingIndex === index}
                                className="w-full mt-3 text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                                size="sm"
                              >
                                {uploadingIndex === index ? (
                                  <span className="flex items-center gap-2">
                                    <span className="animate-spin">⏳</span> Uploading...
                                  </span>
                                ) : (
                                  "Upload"
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Images */}
                    {uploadedImages.length > 0 && (
                      <div className="space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            Uploaded Images ({uploadedImages.length})
                          </Label>
                          <p className="text-xs text-gray-600">Drag to reorder • First image is primary</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {uploadedImages.map((imageUrl, index) => (
                            <div
                              key={index}
                              draggable
                              onDragStart={() => handleDragStart(index)}
                              onDragOver={(e) => handleDragOverImage(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`relative group border-2 rounded-xl p-3 bg-white shadow-md hover:shadow-xl transition-all cursor-move ${
                                index === 0 ? "border-green-500 ring-2 ring-green-300" : "border-gray-300"
                              } ${draggedIndex === index ? "opacity-50 scale-95" : ""}`}
                            >
                              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                {index === 0 ? (
                                  <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-md">
                                    Primary
                                  </span>
                                ) : (
                                  <span className="bg-gray-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                                    {index + 1}
                                  </span>
                                )}
                              </div>
                              <img
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
                              <div className="absolute top-2 right-2 flex gap-2">
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border-blue-300"
                                    onClick={() => moveImage(index, 0)}
                                    title="Set as primary"
                                  >
                                    <Check className="h-3 w-3 text-blue-600" />
                                  </Button>
                                )}
                                {index > 0 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border-gray-300"
                                    onClick={() => moveImage(index, index - 1)}
                                    title="Move up"
                                  >
                                    ↑
                                  </Button>
                                )}
                                {index < uploadedImages.length - 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md border-gray-300"
                                    onClick={() => moveImage(index, index + 1)}
                                    title="Move down"
                                  >
                                    ↓
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                  onClick={() => handleRemoveImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alternative: URL Input (optional) */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Label htmlFor="image-url" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Or add image by URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-url"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              e.preventDefault();
                              const url = e.target.value;
                              const newImages = [...uploadedImages, url];
                              setUploadedImages(newImages);
                              setFormData({ 
                                ...formData, 
                                images: newImages,
                                image: newImages[0] || formData.image
                              });
                              e.target.value = '';
                              toast({
                                title: "Success",
                                description: "Image URL added!",
                              });
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            const input = e.target.parentElement.querySelector('#image-url');
                            if (input && input.value) {
                              const url = input.value;
                              const newImages = [...uploadedImages, url];
                              setUploadedImages(newImages);
                              setFormData({ 
                                ...formData, 
                                images: newImages,
                                image: newImages[0] || formData.image
                              });
                              input.value = '';
                              toast({
                                title: "Success",
                                description: "Image URL added!",
                              });
                            }
                          }}
                          className="px-4"
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="tags" className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      Tags (comma-separated)
                    </Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder="e.g., cotton, casual, summer, premium"
                      className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-2">Separate tags with commas</p>
                  </div>

                  <div className="flex items-start gap-3 p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 transition-all">
                    <input
                      type="checkbox"
                      id="trending"
                      checked={formData.trending}
                      onChange={(e) =>
                        setFormData({ ...formData, trending: e.target.checked })
                      }
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 cursor-pointer"
                    />
                    <div className="flex-1">
                      <Label htmlFor="trending" className="cursor-pointer text-base font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-orange-500" />
                        Mark as Trending Product
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">
                        This product will appear in the Trending Products section on the home page
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Information */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Price & Affiliate Links *
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddPriceField}
                      className="bg-white hover:bg-green-50 border-green-300 text-green-700 font-semibold shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Platform
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">

                {formData.prices.map((price, index) => (
                  <Card key={index} className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all bg-white">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-extrabold">
                            Platform {index + 1}
                          </span>
                        </h4>
                        {formData.prices.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePriceField(index)}
                            className="shadow-md hover:shadow-lg"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-base font-semibold text-gray-700 mb-2">Website *</Label>
                          <Select
                            value={price.website}
                            onValueChange={(value) =>
                              handlePriceChange(index, "website", value)
                            }
                          >
                            <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {websiteOptions.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-gray-700 mb-2">Price (₹) *</Label>
                          <Input
                            type="number"
                            value={price.price}
                            onChange={(e) =>
                              handlePriceChange(index, "price", e.target.value)
                            }
                            required
                            placeholder="999"
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold text-gray-700 mb-2">Affiliate Link (URL) *</Label>
                        <Input
                          type="url"
                          value={price.url}
                          onChange={(e) =>
                            handlePriceChange(index, "url", e.target.value)
                          }
                          required
                          placeholder="https://amazon.in/affiliate-link"
                          className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-base font-semibold text-gray-700 mb-2">Original Price (₹)</Label>
                          <Input
                            type="number"
                            value={price.originalPrice}
                            onChange={(e) =>
                              handlePriceChange(
                                index,
                                "originalPrice",
                                e.target.value
                              )
                            }
                            placeholder="1499"
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                          />
                          {price.originalPrice && price.price && parseFloat(price.originalPrice) > parseFloat(price.price) && (
                            <p className="text-xs text-green-600 mt-1 font-semibold">
                              Savings: ₹{Math.round(parseFloat(price.originalPrice) - parseFloat(price.price))}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            Discount (%)
                            {price.discount && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold">
                                Auto-calculated
                              </span>
                            )}
                          </Label>
                          <Input
                            type="number"
                            value={price.discount}
                            onChange={(e) =>
                              handlePriceChange(index, "discount", e.target.value)
                            }
                            placeholder="25"
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                            readOnly={price.originalPrice && price.price && parseFloat(price.originalPrice) > parseFloat(price.price)}
                          />
                        </div>

                        <div>
                          <Label className="text-base font-semibold text-gray-700 mb-2">Rating</Label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={price.rating}
                            onChange={(e) =>
                              handlePriceChange(index, "rating", e.target.value)
                            }
                            placeholder="4.5"
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-base font-semibold text-gray-700 mb-2">Reviews Count</Label>
                          <Input
                            type="number"
                            value={price.reviews}
                            onChange={(e) =>
                              handlePriceChange(index, "reviews", e.target.value)
                            }
                            placeholder="100"
                            className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
                          />
                        </div>

                        <div className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                          <input
                            type="checkbox"
                            id={`inStock-${index}`}
                            checked={price.inStock}
                            onChange={(e) =>
                              handlePriceChange(index, "inStock", e.target.checked)
                            }
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                          />
                          <Label htmlFor={`inStock-${index}`} className="cursor-pointer text-base font-semibold text-gray-700">
                            In Stock
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Adding Product...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-5 w-5" />
                      Add Product
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/dashboard")}
                  className="h-12 text-base font-semibold border-2 border-gray-300 hover:bg-gray-50 shadow-md"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProduct;

