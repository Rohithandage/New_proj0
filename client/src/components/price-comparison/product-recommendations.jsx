import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import apiConfig from "@/config/api";

const ProductRecommendations = ({ productId, product, category, subcategory }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [productId, category, subcategory, product]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Filter by subcategory (same subcategory)
      if (subcategory) {
        params.append('subcategory', subcategory);
      }
      
      // Filter by similar price range
      if (product && product.prices && product.prices.length > 0) {
        const productPrices = product.prices.map(p => p.price);
        const minProductPrice = Math.min(...productPrices);
        const maxProductPrice = Math.max(...productPrices);
        
        // Calculate similar price range (within 30% of the product's price range)
        const priceRange = maxProductPrice - minProductPrice;
        const avgPrice = (minProductPrice + maxProductPrice) / 2;
        
        // Set min and max price to be within 30% of the average price
        const minPrice = Math.max(0, Math.floor(avgPrice * 0.7));
        const maxPrice = Math.ceil(avgPrice * 1.3);
        
        params.append('minPrice', minPrice.toString());
        params.append('maxPrice', maxPrice.toString());
      }
      
      params.append('limit', '20'); // Get more to filter better
      params.append('exclude', productId);

      const response = await axios.get(`${apiConfig.PRICE_COMPARISON}/search?${params.toString()}`);
      
      // Filter and limit to 4 best matches
      let filteredProducts = response.data.data || [];
      
      // Sort by price similarity (products with prices closest to the original)
      if (product && product.prices && product.prices.length > 0) {
        const productPrices = product.prices.map(p => p.price);
        const avgProductPrice = (Math.min(...productPrices) + Math.max(...productPrices)) / 2;
        
        filteredProducts = filteredProducts
          .map(p => {
            if (!p.prices || p.prices.length === 0) return null;
            const pPrices = p.prices.map(pr => pr.price);
            const avgPPrice = (Math.min(...pPrices) + Math.max(...pPrices)) / 2;
            const priceDiff = Math.abs(avgPPrice - avgProductPrice);
            return { ...p, priceDiff };
          })
          .filter(p => p !== null)
          .sort((a, b) => a.priceDiff - b.priceDiff)
          .slice(0, 4)
          .map(({ priceDiff, ...p }) => p);
      } else {
        filteredProducts = filteredProducts.slice(0, 4);
      }
      
      setRecommendations(filteredProducts);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
            <div className="bg-gray-200 h-4 rounded mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-8 sm:mt-12 md:mt-16">
      {/* Section Header */}
      <div className="mb-6 md:mb-8">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center">
          Similar Products You Might Like
        </h3>
        <p className="text-sm sm:text-base text-gray-600 text-center mt-2">
          Products with similar price range and {subcategory ? subcategory.replace(/-/g, ' ') : 'category'}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {recommendations.map((product) => {
              if (!product.prices || product.prices.length === 0) return null;

              const lowestPrice = Math.min(...product.prices.map(p => p.price));
              const bestDeal = product.prices.reduce((best, current) => {
                if (!best || current.price < best.price) return current;
                return best;
              });

              // Get all images - support both images array and single image
              const allImages = product.images && product.images.length > 0 
                ? product.images 
                : (product.image ? [product.image] : []);
              const mainImage = allImages[0] || product.image || '';

              return (
                <Link key={product._id} to={`/product/${product._id}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 overflow-hidden rounded-xl">
                <div className="relative w-full h-48 sm:h-52 md:h-56 lg:h-64 xl:h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain p-2 sm:p-3 md:p-4 group-hover:scale-105 transition-transform duration-300"
                      style={{
                        objectPosition: 'center center',
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400 text-sm">No image available</span>
                    </div>
                  )}
                </div>
                    
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">{product.brand}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.category}
                          </Badge>
                          {product.subcategory && (
                            <Badge variant="outline" className="text-xs">
                              {product.subcategory}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="text-lg font-bold text-green-600 mb-1">
                          ₹{lowestPrice}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span>{bestDeal.rating || 'N/A'}</span>
                            <span className="text-gray-400">
                              ({bestDeal.reviews || 0})
                            </span>
                          </div>
                          <div className="text-gray-500 capitalize">
                            {bestDeal.website}
                          </div>
                        </div>
                      </div>

                      <Button className="w-full text-sm" size="sm">
                        View Product
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* View All Button - Bottom Center */}
          <div className="flex justify-center mt-8 sm:mt-10 md:mt-12">
            <Link to={`/search?category=${category}&subcategory=${subcategory}`}>
              <Button variant="outline" size="lg" className="flex items-center gap-2 text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5">
                View All Products
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No similar products found at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default ProductRecommendations;




