import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Package,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Filter,
  Eye,
  ShoppingBag,
  TrendingUp,
  Sparkles,
  X,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import apiConfig from "@/config/api";
import { useToast } from "@/components/ui/use-toast";

const Products = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceSearch, setPriceSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiConfig.PRICE_COMPARISON}/categories`);
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      
      // Search by title (product name) - use query parameter
      // For admin panel, prioritize exact title matches
      if (searchQuery && searchQuery.trim()) {
        params.append("query", searchQuery.trim());
        params.append("exactMatch", "true"); // Flag for exact title matching in admin panel
      }
      
      // Search by price - if price is entered, use it as both min and max for exact match
      // Or allow range search (e.g., "100-500" or just "100")
      if (priceSearch && priceSearch.trim()) {
        const priceValue = priceSearch.trim();
        // Check if it's a range (e.g., "100-500")
        if (priceValue.includes('-')) {
          const [min, max] = priceValue.split('-').map(p => p.trim());
          if (min && !isNaN(min)) {
            params.append("minPrice", min);
          }
          if (max && !isNaN(max)) {
            params.append("maxPrice", max);
          }
        } else {
          // Single price value - search for products with this price (within ±10% range)
          const price = parseFloat(priceValue);
          if (!isNaN(price) && price > 0) {
            const minPrice = Math.floor(price * 0.9); // 10% below
            const maxPrice = Math.ceil(price * 1.1); // 10% above
            params.append("minPrice", minPrice.toString());
            params.append("maxPrice", maxPrice.toString());
          }
        }
      }
      
      // Increase limit to show all products
      params.append("limit", "1000");

      const response = await axios.get(
        `${apiConfig.PRICE_COMPARISON}/search?${params.toString()}`
      );

      if (response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setProducts([]);
        if (searchQuery || priceSearch || selectedCategory !== "all") {
          toast({
            title: "No products found",
            description: response.data.message || "Try adjusting your search criteria.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${apiConfig.PRICE_COMPARISON}/product/${productId}`
      );

      if (response.data.success) {
        // Remove product from the list
        setProducts(products.filter(product => product._id !== productId));
        
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to delete product.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Products are already filtered by backend API based on searchQuery and category
  // No need for additional client-side filtering unless needed for display
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
                className="hover:bg-blue-50 text-gray-700 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <ShoppingBag className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">All Products</h1>
                  <p className="text-xs md:text-sm text-gray-600">Manage and view all products</p>
                </div>
              </div>
            </div>
            <Link to="/admin/add-product">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Add New Product</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Filter className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search by Title */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  placeholder="Search by title/name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 md:pl-12 py-6 md:py-7 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      handleSearch();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search by Price */}
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search by price (e.g., 500 or 100-1000)..."
                  value={priceSearch}
                  onChange={(e) => {
                    // Allow only numbers, dashes, and spaces
                    const value = e.target.value.replace(/[^\d\s-]/g, '');
                    setPriceSearch(value);
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 md:pl-12 py-6 md:py-7 text-base border-2 border-gray-200 focus:border-green-500 rounded-xl transition-all"
                />
                {priceSearch && (
                  <button
                    onClick={() => {
                      setPriceSearch("");
                      handleSearch();
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="py-6 md:py-7 text-base border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6 md:px-8 rounded-xl py-6 md:py-7 text-base"
              >
                <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                <span className="hidden sm:inline">Search</span>
                <span className="sm:hidden">Go</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Count and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <p className="text-sm md:text-base font-semibold text-gray-900">
                Showing <span className="text-blue-600 font-extrabold">{products.length}</span> product{products.length !== 1 ? 's' : ''}
              </p>
              {products.length > 0 && (
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {selectedCategory !== 'all' && `Filtered by: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                  {searchQuery && ` • Title: "${searchQuery}"`}
                  {priceSearch && ` • Price: "${priceSearch}"`}
                </p>
              )}
            </div>
          </div>
          {(searchQuery || priceSearch || selectedCategory !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setPriceSearch("");
                setSelectedCategory("all");
                handleSearch();
              }}
              className="text-gray-700 hover:text-gray-900 border-gray-300 hover:border-gray-400"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardContent className="py-16 md:py-20 text-center">
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                No products found
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchQuery || priceSearch || selectedCategory !== "all"
                  ? "Try adjusting your filters or search query to find products."
                  : "Get started by adding your first product to the catalog."}
              </p>
              <Link to="/admin/add-product">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const prices = product.prices?.map((p) => p.price).filter(p => p != null) || [];
              const minPrice = prices.length > 0 ? Math.min(...prices) : null;
              const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
              const websiteCount = product.prices?.length || 0;
              
              return (
                <Card 
                  key={product._id} 
                  className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {product.image || (product.images && product.images.length > 0) ? (
                      <img
                        src={product.image || (product.images && product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-contain p-2 md:p-4 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          // Show fallback if main image fails
                          const fallbackDiv = e.target.nextElementSibling;
                          if (fallbackDiv) fallbackDiv.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {(!product.image && (!product.images || product.images.length === 0)) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.trending && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-gray-300">
                        {product.category?.charAt(0).toUpperCase() + product.category?.slice(1)}
                      </Badge>
                    </div>
                    
                    {/* Website Count Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-lg">
                        <ShoppingBag className="h-3 w-3 mr-1" />
                        {websiteCount} {websiteCount === 1 ? 'Platform' : 'Platforms'}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-base md:text-lg font-bold line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3.5rem]">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {product.brand}
                      </Badge>
                      {product.subcategory && (
                        <Badge variant="outline" className="text-xs">
                          {product.subcategory}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Description */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Description</p>
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                          {product.description || "No description available"}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                        <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Price Range</p>
                        {minPrice !== null ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl md:text-2xl font-extrabold text-blue-600">
                              ₹{minPrice.toLocaleString()}
                            </span>
                            {maxPrice !== minPrice && (
                              <>
                                <span className="text-gray-400">-</span>
                                <span className="text-lg md:text-xl font-bold text-gray-700">
                                  ₹{maxPrice.toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No prices available</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <Link
                          to={`/product/${product._id}`}
                          className="flex-1"
                        >
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 transition-all"
                          >
                            <Eye className="h-4 w-4 mr-1.5" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/edit-product/${product._id}`)
                          }
                          className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 hover:text-green-800 transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-red-800 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;

