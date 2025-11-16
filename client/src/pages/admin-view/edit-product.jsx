import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Upload, X } from "lucide-react";
import axios from "axios";
import apiConfig from "@/config/api";

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    brand: "",
    image: "",
    images: [],
    prices: [],
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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setFetching(true);
      try {
        const response = await axios.get(
          `${apiConfig.PRICE_COMPARISON}/product/${productId}`
        );

        if (response.data.success) {
          const product = response.data.data;
          
          // Set images
          const images = product.images && product.images.length > 0 
            ? product.images 
            : (product.image ? [product.image] : []);
          setUploadedImages(images);

          // Set form data
          setFormData({
            name: product.name || "",
            description: product.description || "",
            category: product.category || "",
            subcategory: product.subcategory || "",
            brand: product.brand || "",
            image: images[0] || product.image || "",
            images: images,
            prices: product.prices && product.prices.length > 0 
              ? product.prices.map(p => ({
                  website: p.website || "amazon",
                  price: p.price || "",
                  originalPrice: p.originalPrice || "",
                  discount: p.discount || "",
                  url: p.url || "",
                  inStock: p.inStock !== false,
                  rating: p.rating || "",
                  reviews: p.reviews || "",
                }))
              : [{
                  website: "amazon",
                  price: "",
                  originalPrice: "",
                  discount: "",
                  url: "",
                  inStock: true,
                  rating: "",
                  reviews: "",
                }],
            tags: product.tags && Array.isArray(product.tags) 
              ? product.tags.join(", ") 
              : (product.tags || ""),
            trending: product.trending || false,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch product details",
            variant: "destructive",
          });
          navigate("/admin/products");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch product",
          variant: "destructive",
        });
        navigate("/admin/products");
      } finally {
        setFetching(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, navigate, toast]);

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
    setFormData({
      ...formData,
      prices: newPrices,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
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

      setImageFiles(prev => [...prev, ...validFiles]);
    }
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
          image: newImages[0] || formData.image
        });
        
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
      image: newImages[0] || ""
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
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        image: uploadedImages[0] || formData.image,
        images: uploadedImages.length > 0 ? uploadedImages : (formData.image ? [formData.image] : []),
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
            url: price.url,
            inStock: price.inStock !== false,
            rating: price.rating ? parseFloat(price.rating) : undefined,
            reviews: price.reviews ? parseInt(price.reviews) : undefined,
          })),
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        trending: formData.trending || false,
      };

      const response = await axios.put(
        `${apiConfig.PRICE_COMPARISON}/product/${productId}`,
        productData
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
        navigate("/admin/products");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Product Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ 
                          ...formData, 
                          category: value,
                          subcategory: ""
                        })
                      }
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="subcategory">Subcategory *</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) =>
                        setFormData({ ...formData, subcategory: value })
                      }
                      disabled={!formData.category}
                      required
                    >
                      <SelectTrigger>
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
                </div>

                <div>
                  <Label htmlFor="brand">Brand *</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    required
                    placeholder="Enter brand name"
                  />
                </div>

                <div>
                  <Label htmlFor="images">Product Images *</Label>
                  <div className="space-y-4">
                    {/* Multiple Image Upload */}
                    <div>
                      <Input
                        id="image-file"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="image-file"
                        className="cursor-pointer flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors"
                      >
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Click to upload multiple images
                        </span>
                      </Label>
                    </div>

                    {/* Pending Upload Files */}
                    {imageFiles.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold text-gray-700">
                            Files to Upload ({imageFiles.length})
                          </Label>
                          <Button
                            type="button"
                            onClick={handleUploadAllImages}
                            disabled={uploadingIndex !== null}
                            size="sm"
                          >
                            Upload All
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {imageFiles.map((file, index) => (
                            <div key={index} className="relative border rounded-lg p-2">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                                onClick={() => handleRemoveImageFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleImageUpload(index)}
                                disabled={uploadingIndex === index}
                                className="w-full mt-2 text-xs"
                                size="sm"
                              >
                                {uploadingIndex === index ? "Uploading..." : "Upload"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uploaded Images */}
                    {uploadedImages.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">
                          Uploaded Images ({uploadedImages.length})
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {uploadedImages.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Product image ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-300"
                              />
                              <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                {index === 0 ? "Primary" : `${index + 1}`}
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alternative: URL Input */}
                    <div className="text-sm text-gray-500">
                      <Label htmlFor="image-url" className="text-xs text-gray-600">
                        Or enter image URL (will be added to images)
                      </Label>
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
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
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="e.g., cotton, casual, summer"
                  />
                </div>

                <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <input
                    type="checkbox"
                    id="trending"
                    checked={formData.trending}
                    onChange={(e) =>
                      setFormData({ ...formData, trending: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="trending" className="cursor-pointer text-base font-medium text-gray-700">
                    Mark as Trending Product
                  </Label>
                  <span className="text-sm text-gray-500 ml-2">
                    (This product will appear in the Trending Products section on the home page)
                  </span>
                </div>
              </div>

              {/* Price Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">
                    Price & Affiliate Links *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddPriceField}
                  >
                    Add More Platforms
                  </Button>
                </div>

                {formData.prices.map((price, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Platform {index + 1}</h4>
                        {formData.prices.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePriceField(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Website *</Label>
                          <Select
                            value={price.website}
                            onValueChange={(value) =>
                              handlePriceChange(index, "website", value)
                            }
                          >
                            <SelectTrigger>
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
                          <Label>Price (₹) *</Label>
                          <Input
                            type="number"
                            value={price.price}
                            onChange={(e) =>
                              handlePriceChange(index, "price", e.target.value)
                            }
                            required
                            placeholder="999"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Affiliate Link (URL) *</Label>
                        <Input
                          type="url"
                          value={price.url}
                          onChange={(e) =>
                            handlePriceChange(index, "url", e.target.value)
                          }
                          required
                          placeholder="https://amazon.in/affiliate-link"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Original Price (₹)</Label>
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
                          />
                        </div>

                        <div>
                          <Label>Discount (%)</Label>
                          <Input
                            type="number"
                            value={price.discount}
                            onChange={(e) =>
                              handlePriceChange(index, "discount", e.target.value)
                            }
                            placeholder="25"
                          />
                        </div>

                        <div>
                          <Label>Rating</Label>
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
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Reviews Count</Label>
                          <Input
                            type="number"
                            value={price.reviews}
                            onChange={(e) =>
                              handlePriceChange(index, "reviews", e.target.value)
                            }
                            placeholder="100"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-8">
                          <input
                            type="checkbox"
                            id={`inStock-${index}`}
                            checked={price.inStock}
                            onChange={(e) =>
                              handlePriceChange(index, "inStock", e.target.checked)
                            }
                            className="h-4 w-4"
                          />
                          <Label htmlFor={`inStock-${index}`} className="cursor-pointer">
                            In Stock
                          </Label>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Updating Product..." : "Update Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/products")}
                >
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

export default EditProduct;


