import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { ExternalLink, Star, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserCurrencyInfo, formatPrice, convertPrice } from "@/lib/currency-utils";
import apiConfig from "@/config/api";

const ProductCard = memo(({ product, isDetailPage = false }) => {
  // Get all images - support both images array and single image
  const allImages = useMemo(() => {
    return product.images && product.images.length > 0 
      ? product.images 
      : (product.image ? [product.image] : []);
  }, [product.images, product.image]);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currencyInfo, setCurrencyInfo] = useState(null);
  const [loadingCurrency, setLoadingCurrency] = useState(true);
  
  // Load currency info on mount
  useEffect(() => {
    const loadCurrencyInfo = async () => {
      try {
        setLoadingCurrency(true);
        // Fetch admin currency settings
        let adminCurrencySettings = null;
        try {
          const response = await fetch(`${apiConfig.BASE_URL}/api/settings/currency`);
          const data = await response.json();
          if (data.success && data.data) {
            adminCurrencySettings = data.data;
          }
        } catch (error) {
          console.log('Failed to fetch admin currency settings, using defaults:', error);
        }
        
        // Get user currency info
        const info = await getUserCurrencyInfo(adminCurrencySettings);
        setCurrencyInfo(info);
      } catch (error) {
        console.error('Error loading currency info:', error);
        // Set default (INR)
        setCurrencyInfo({
          countryCode: 'IN',
          countryName: 'India',
          currencyCode: 'INR',
          currencySymbol: '₹',
          exchangeRate: 1,
          isINR: true
        });
      } finally {
        setLoadingCurrency(false);
      }
    };
    
    loadCurrencyInfo();
  }, []);
  
  // Auto-rotate images every 5 seconds if multiple images
  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [allImages.length]);
  
  const goToNextImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages.length]);
  
  const goToPrevImage = useCallback((e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages.length]);
  
  const goToImage = useCallback((index, e) => {
    if (e) e.stopPropagation();
    setCurrentImageIndex(index);
  }, []);
  // Debug logging
  if (!product) {
    console.warn('ProductCard: No product provided');
    return null;
  }
  
  if (!product.prices || product.prices.length === 0) {
    console.warn('ProductCard: Product has no prices', {
      id: product._id,
      name: product.name,
      prices: product.prices
    });
    return null;
  }

  // Normalize prices - handle MongoDB extended JSON format or plain numbers
  const normalizePrice = useCallback((priceValue) => {
    if (typeof priceValue === 'number') return priceValue;
    if (typeof priceValue === 'object' && priceValue !== null) {
      return priceValue.$numberInt || priceValue.$numberDouble || priceValue.$numberLong || Number(priceValue);
    }
    return Number(priceValue) || 0;
  }, []);

  // Memoize price calculations
  const priceData = useMemo(() => {
    const priceValues = product.prices.map(p => normalizePrice(p.price)).filter(p => !isNaN(p) && p > 0);
    if (priceValues.length === 0) {
      return null;
    }
    
    const lowestPrice = Math.min(...priceValues);
    const highestPrice = Math.max(...priceValues);
    const priceRange = lowestPrice !== highestPrice;

    // Get the best deal (lowest price with good rating)
    const bestDeal = product.prices.reduce((best, current) => {
      const currentPrice = normalizePrice(current.price);
      const bestPrice = best ? normalizePrice(best.price) : Infinity;
      if (!best || currentPrice < bestPrice) return current;
      return best;
    });
    
    // Normalize bestDeal price for display
    const bestDealPrice = normalizePrice(bestDeal.price);
    
    // Calculate discount if original price exists
    const discount = bestDeal.originalPrice 
      ? Math.round(((bestDeal.originalPrice - bestDealPrice) / bestDeal.originalPrice) * 100)
      : null;

    return { lowestPrice, highestPrice, priceRange, bestDeal, bestDealPrice, discount };
  }, [product.prices, normalizePrice]);

  if (!priceData) {
    console.warn('ProductCard: No valid prices found', product);
    return null;
  }

  const { lowestPrice, highestPrice, priceRange, bestDeal, bestDealPrice, discount } = priceData;

  const handleExternalLink = useCallback(async (url, website, e) => {
    e.preventDefault();
    
    // Track affiliate click with country detection
    try {
      // Detect country using IP-based API (free service)
      let country = 'Unknown';
      let countryCode = null;
      
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        country = data.country_name || 'Unknown';
        countryCode = data.country_code || null;
      } catch (error) {
        console.log('Country detection failed, using default');
      }
      
      // Track the click
      const trackingData = {
        productId: product._id,
        productName: product.name,
        website: website,
        affiliateUrl: url,
        country: country,
        countryCode: countryCode,
        userAgent: navigator.userAgent
      };
      
      // Send tracking request (fire and forget)
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/price-comparison/track-affiliate-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      }).catch(error => {
        console.log('Tracking error:', error);
      });
    } catch (error) {
      console.log('Error tracking click:', error);
    }
    
    // Open the affiliate link
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [product._id, product.name]);

  // Website colors mapping
  const websiteColors = {
    amazon: 'from-orange-500 to-orange-600',
    flipkart: 'from-blue-500 to-blue-600',
    myntra: 'from-pink-500 to-pink-600',
    ajio: 'from-purple-500 to-purple-600',
    nykaa: 'from-rose-500 to-rose-600',
    meesho: 'from-green-500 to-green-600'
  };

  const websiteBgColors = {
    amazon: 'bg-orange-50 border-orange-200',
    flipkart: 'bg-blue-50 border-blue-200',
    myntra: 'bg-pink-50 border-pink-200',
    ajio: 'bg-purple-50 border-purple-200',
    nykaa: 'bg-rose-50 border-rose-200',
    meesho: 'bg-green-50 border-green-200'
  };

  const handleCardClick = useCallback((e) => {
    // Only handle card click if not clicking on buttons or links
    const target = e.target;
    const isButton = target.closest('button') || target.closest('[role="button"]');
    const isLink = target.closest('a');
    
    if (!isButton && !isLink && bestDeal.url) {
      handleExternalLink(bestDeal.url, bestDeal.website, e);
    }
  }, [bestDeal.url, bestDeal.website, handleExternalLink]);

  return (
    <Card 
      onClick={handleCardClick}
      className={`group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-xl sm:rounded-2xl ${isDetailPage ? 'lg:rounded-3xl' : ''} transform hover:-translate-y-1 cursor-pointer`}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 to-blue-50/0 group-hover:from-purple-50/30 group-hover:to-blue-50/30 transition-all duration-500 pointer-events-none rounded-xl sm:rounded-2xl" />
      
      {/* Image Section with Carousel */}
      <div className={`relative overflow-hidden rounded-t-xl sm:rounded-t-2xl ${isDetailPage ? 'lg:rounded-t-3xl' : ''} bg-white`}>
        {/* Image Container - Consistent height for desktop and phone */}
        <div className={`relative w-full ${
          isDetailPage 
            ? 'h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px]' 
            : 'h-64 md:h-64 lg:h-72 xl:h-80 min-h-[256px]'
        } overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100`}>
          {allImages.length > 0 ? (
            <>
              {/* Images */}
              <div className="relative w-full h-full flex items-center justify-center">
                {allImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} - ${product.brand} - ${product.category} clothing${index > 0 ? ` - Image ${index + 1}` : ''}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    className={`absolute ${
                      isDetailPage 
                        ? 'inset-0 w-full h-full object-contain p-2 sm:p-3 md:p-4 lg:p-6' 
                        : 'inset-0 w-full h-full object-contain p-2 sm:p-2 md:p-3 lg:p-4'
                    } transition-opacity duration-500 ${
                      index === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    } ${isDetailPage ? '' : 'group-hover:scale-105'} transition-transform duration-300`}
                    style={{
                      minHeight: isDetailPage ? 'auto' : '256px',
                      objectPosition: 'center center',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                      e.target.onerror = null;
                    }}
                  />
                ))}
              </div>
              
              {/* Navigation Arrows - Only show if multiple images */}
              {allImages.length > 1 && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when navigating images
                      goToPrevImage(e);
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white/90 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click when navigating images
                      goToNextImage(e);
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                  </Button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
                    {allImages.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click when selecting image
                          goToImage(index, e);
                        }}
                        className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'w-6 sm:w-8 bg-white'
                            : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No image available</span>
            </div>
          )}
        </div>

        {/* Rating Badge */}
        {bestDeal.rating && (
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 bg-white/95 backdrop-blur-sm px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg flex items-center gap-1 sm:gap-1.5">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
            <span className="text-xs sm:text-sm font-bold text-gray-800">{normalizePrice(bestDeal.rating).toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <CardContent className={`relative ${isDetailPage ? 'p-4 sm:p-6 md:p-8 lg:p-10' : 'p-2.5 sm:p-3 md:p-3.5'}`}>
        {/* Brand */}
        <div className="mb-1">
          <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[9px] sm:text-[10px] font-medium rounded capitalize">
            {product.brand}
          </span>
        </div>

        {/* Product Name */}
        <h3 className={`font-semibold mb-1 text-gray-900 group-hover:text-indigo-600 transition-colors duration-300 leading-tight ${
          isDetailPage 
            ? 'text-lg sm:text-xl md:text-2xl lg:text-3xl' 
            : 'text-xs sm:text-sm md:text-base line-clamp-2'
        }`}>
          {product.name}
        </h3>
        
        {/* Description */}
        {product.description && (
          <p className={`text-gray-600 mb-1 leading-relaxed ${
            isDetailPage 
              ? 'text-sm sm:text-base md:text-lg mb-4 sm:mb-6' 
              : 'text-[10px] sm:text-xs line-clamp-1'
          }`}>
            {product.description}
          </p>
        )}
        
        {/* Rating Stars */}
        {bestDeal.rating && (
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const rating = normalizePrice(bestDeal.rating);
                const filled = rating >= star;
                const halfFilled = rating >= star - 0.5 && rating < star;
                return (
                  <Star
                    key={star}
                    className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                      filled
                        ? 'text-amber-400 fill-amber-400'
                        : halfFilled
                        ? 'text-amber-400 fill-amber-400 opacity-60'
                        : 'text-gray-300'
                    } transition-all duration-300`}
                  />
                );
              })}
            </div>
            {bestDeal.reviews && (
              <span className="text-[9px] sm:text-[10px] text-gray-500">({bestDeal.reviews})</span>
            )}
          </div>
        )}

        {/* Price Display - Compact Design */}
        <div className={`mb-2 ${isDetailPage ? 'md:mb-6 lg:mb-8' : ''} ${isDetailPage ? 'p-4 lg:p-6 rounded-xl lg:rounded-2xl border-2' : ''} ${websiteBgColors[bestDeal.website] || 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'} relative overflow-hidden`}>
          <div className="relative z-10">
            {priceRange ? (
              <div>
                <div className={`flex items-baseline gap-1 mb-0.5 flex-wrap ${isDetailPage ? 'gap-2 sm:gap-3 mb-2' : ''}`}>
                  <span className={`font-bold text-emerald-600 ${
                    isDetailPage ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-base sm:text-lg md:text-xl'
                  }`}>
                    {loadingCurrency ? '₹...' : formatPrice(lowestPrice, currencyInfo)}
                  </span>
                  <span className={`text-gray-400 ${isDetailPage ? 'text-lg sm:text-xl md:text-2xl' : 'text-xs sm:text-sm'}`}>-</span>
                  <span className={`font-semibold text-gray-600 ${isDetailPage ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl' : 'text-sm sm:text-base'}`}>
                    {loadingCurrency ? '₹...' : formatPrice(highestPrice, currencyInfo)}
                  </span>
                  {discount && discount > 0 && (
                    <span className={`inline-flex items-center gap-0.5 bg-red-500 text-white px-1.5 py-0.5 rounded ${isDetailPage ? 'text-xs sm:text-sm px-2 py-1' : 'text-[9px] sm:text-[10px]'}`}>
                      <TrendingDown className={`${isDetailPage ? 'h-3 w-3 sm:h-3.5 sm:w-3.5' : 'h-2 w-2 sm:h-2.5 sm:w-2.5'}`} />
                      <span className="font-bold">{discount}% OFF</span>
                    </span>
                  )}
                </div>
                <div className={`flex items-center gap-1 flex-wrap ${isDetailPage ? 'gap-2 mt-2' : ''}`}>
                  <span className={`text-emerald-600 font-semibold ${isDetailPage ? 'text-xs sm:text-sm md:text-base' : 'text-[10px] sm:text-xs'}`}>
                    Best: {loadingCurrency ? '₹...' : formatPrice(bestDealPrice, currencyInfo)}
                  </span>
                  <span className={`text-gray-500 capitalize ${isDetailPage ? 'text-xs sm:text-sm md:text-base' : 'text-[9px] sm:text-[10px]'}`}>
                    on {bestDeal.website}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className={`flex items-baseline gap-1.5 mb-0.5 flex-wrap ${isDetailPage ? 'gap-2 mb-2' : ''}`}>
                  <span className={`font-bold text-emerald-600 ${isDetailPage ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl' : 'text-base sm:text-lg md:text-xl'}`}>
                    {loadingCurrency ? '₹...' : formatPrice(lowestPrice, currencyInfo)}
                  </span>
                  {discount && discount > 0 && (
                    <span className={`inline-flex items-center gap-0.5 bg-red-500 text-white px-1.5 py-0.5 rounded ${isDetailPage ? 'text-xs sm:text-sm px-2 py-1' : 'text-[9px] sm:text-[10px]'}`}>
                      <TrendingDown className={`${isDetailPage ? 'h-3 w-3 sm:h-3.5 sm:w-3.5' : 'h-2 w-2 sm:h-2.5 sm:w-2.5'}`} />
                      <span className="font-bold">{discount}% OFF</span>
                    </span>
                  )}
                </div>
                <div className={`text-gray-500 capitalize ${isDetailPage ? 'text-xs sm:text-sm md:text-base' : 'text-[9px] sm:text-[10px]'}`}>
                  on <span className="font-semibold">{bestDeal.website}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Other Platforms - Compact Design */}
        {product.prices.length > 1 && (
          <div className="mb-1.5">
            <div className="flex flex-wrap gap-1">
              {product.prices
                .sort((a, b) => normalizePrice(a.price) - normalizePrice(b.price))
                .filter((price) => price.website !== bestDeal.website)
                .slice(0, 3)
                .map((price, index) => {
                  const priceValue = normalizePrice(price.price);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 rounded px-1 py-0.5 transition-all duration-200 hover:bg-gray-100"
                    >
                      <span className="text-[9px] font-medium text-gray-600 capitalize">{price.website}</span>
                      <span className="text-[9px] font-semibold text-gray-800">
                        {loadingCurrency ? '₹...' : formatPrice(priceValue, currencyInfo)}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Category Badges - Compact Design */}
        <div className="flex items-center gap-1 mb-1.5 flex-wrap">
          <Badge className="px-1.5 py-0.5 bg-gray-100 text-gray-700 border-0 text-[9px] sm:text-[10px] font-medium capitalize">
            {product.category}
          </Badge>
          {product.subcategory && (
            <Badge variant="outline" className="px-1.5 py-0.5 border border-gray-200 text-gray-600 bg-white text-[9px] sm:text-[10px] font-medium capitalize">
              {product.subcategory.replace(/-/g, ' ')}
            </Badge>
          )}
        </div>

        {/* Action Buttons - Compact Design */}
        <div className="space-y-1">
          {/* Primary Buy Button */}
          {bestDeal.url && (
            <Button
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking button
                handleExternalLink(bestDeal.url, bestDeal.website, e);
              }}
              className={`w-full bg-gradient-to-r ${websiteColors[bestDeal.website] || 'from-emerald-500 to-teal-500'} hover:shadow-lg hover:scale-[1.02] text-white font-semibold rounded-md transition-all duration-200 ${
                isDetailPage 
                  ? 'text-base sm:text-lg md:text-xl lg:text-2xl py-4 sm:py-5 md:py-6 lg:py-7 sm:rounded-xl lg:rounded-2xl' 
                  : 'text-[10px] sm:text-xs py-1.5 sm:py-2'
              }`}
              size="lg"
            >
              <ExternalLink className={`mr-1 relative z-10 ${
                isDetailPage 
                  ? 'h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8' 
                  : 'h-3 w-3 sm:h-3.5 sm:w-3.5'
              }`} />
              <span className={`relative z-10 ${
                isDetailPage 
                  ? 'text-base sm:text-lg md:text-xl lg:text-2xl' 
                  : 'text-[10px] sm:text-xs'
              }`}>
                View Details
              </span>
            </Button>
          )}
          
          {/* Secondary Options */}
          {product.prices.length > 1 && (
            <div className="grid grid-cols-2 gap-1">
              {product.prices
                .sort((a, b) => normalizePrice(a.price) - normalizePrice(b.price))
                .filter((price) => price.url && price.website !== bestDeal.website)
                .slice(0, 2)
                .map((price, index) => {
                  const priceValue = normalizePrice(price.price);
                  return (
                    <Button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when clicking button
                        handleExternalLink(price.url, price.website, e);
                      }}
                      variant="outline"
                      className="w-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-[9px] sm:text-[10px] font-medium rounded-md py-1 transition-all duration-200"
                      size="sm"
                    >
                      <div className="flex flex-col items-center gap-0">
                        <span className="text-[9px] font-semibold capitalize text-gray-600">{price.website}</span>
                        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
                          {loadingCurrency ? '₹...' : formatPrice(priceValue, currencyInfo)}
                        </span>
                      </div>
                    </Button>
                  );
                })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.product?._id === nextProps.product?._id &&
    prevProps.product?.prices?.length === nextProps.product?.prices?.length &&
    prevProps.isDetailPage === nextProps.isDetailPage
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
