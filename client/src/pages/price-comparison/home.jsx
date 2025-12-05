import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, TrendingUp, Shield, Zap, Bell, ShoppingBag, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/price-comparison/product-card";
import SEO from "@/components/seo/SEO";
import { generateWebsiteSchema, generateOrganizationSchema } from "@/utils/schema";
import axios from "axios";
import apiConfig from "@/config/api";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const checkAuthStatus = useCallback(() => {
    const userData = localStorage.getItem('user');
    const userToken = localStorage.getItem('userToken');
    setIsLoggedIn(!!(userData && userToken));
  }, []);

  const fetchFeaturedProducts = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiConfig.PRICE_COMPARISON}/search?limit=8`
       // `${apiConfig.PRICE_COMPARISON}/products?limit=8`
      );
      setFeaturedProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  const fetchTrendingProducts = useCallback(async () => {
    try {
      // Fetch only trending products
      const response = await axios.get(
        `${apiConfig.PRICE_COMPARISON}/search?trending=true&limit=8`
      );
      setTrendingProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching trending products:", error);
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useEffect(() => {
    // Parallel data fetching for faster initial load
    Promise.all([
      fetchFeaturedProducts(),
      fetchTrendingProducts(),
      Promise.resolve(checkAuthStatus())
    ]).catch(error => {
      console.error("Error loading initial data:", error);
    });
  }, [fetchFeaturedProducts, fetchTrendingProducts, checkAuthStatus]);


  // Natural language query parser - extracts category and subcategory from search queries
  const parseNaturalLanguageQuery = (query) => {
    if (!query || !query.trim()) return { cleanQuery: '', category: '', subcategory: '' };
    
    const queryLower = query.toLowerCase().trim();
    
    // Stop words to remove
    const stopWords = ['give', 'me', 'best', 'the', 'a', 'an', 'show', 'find', 'search', 'for', 'get', 'i', 'want', 'need', 'looking'];
    
    // Category mapping (including variations)
    const categoryMap = {
      'men': 'men',
      'mens': 'men',
      'man': 'men',
      'male': 'men',
      'women': 'women',
      'womens': 'women',
      'woman': 'women',
      'female': 'women',
      'kids': 'kids',
      'kid': 'kids',
      'children': 'kids',
      'child': 'kids',
      'boys': 'kids',
      'girls': 'kids',
      'baby': 'kids'
    };
    
    // Subcategory mapping (including variations)
    const subcategoryMap = {
      // Common subcategories (used across all categories)
      'tshirt': 't-shirts',
      'tshirts': 't-shirts',
      't-shirt': 't-shirts',
      't-shirts': 't-shirts',
      't shirt': 't-shirts',
      't shirts': 't-shirts',
      'tee': 't-shirts',
      'tees': 't-shirts',
      'oversized tshirt': 'oversized-t-shirts',
      'oversized tshirts': 'oversized-t-shirts',
      'oversized t-shirt': 'oversized-t-shirts',
      'oversized t-shirts': 'oversized-t-shirts',
      'oversized t shirts': 'oversized-t-shirts',
      'oversized tee': 'oversized-t-shirts',
      'oversized tees': 'oversized-t-shirts',
      'shirt': 'shirts',
      'shirts': 'shirts',
      'formal-shirt': 'shirts',
      'formal-shirts': 'shirts',
      'jean': 'jeans',
      'jeans': 'jeans',
      'trouser': 'trousers-pants',
      'trousers': 'trousers-pants',
      'pant': 'trousers-pants',
      'pants': 'trousers-pants',
      'trousers / pants': 'trousers-pants',
      'trousers pants': 'trousers-pants',
      'trouser pants': 'trousers-pants',
      'short': 'shorts',
      'shorts': 'shorts',
      'sweatshirt': 'sweatshirts-hoodies',
      'sweatshirts': 'sweatshirts-hoodies',
      'hoodie': 'sweatshirts-hoodies',
      'hoodies': 'sweatshirts-hoodies',
      'sweatshirts & hoodies': 'sweatshirts-hoodies',
      'sweatshirts and hoodies': 'sweatshirts-hoodies',
      'innerwear': 'innerwear',
      'inner wear': 'innerwear',
      'inner': 'innerwear',
      
      // Men's specific subcategories
      'jacket': 'jackets',
      'jackets': 'jackets',
      'blazer': 'blazers-coats',
      'blazers': 'blazers-coats',
      'coat': 'blazers-coats',
      'coats': 'blazers-coats',
      'blazers & coats': 'blazers-coats',
      'blazers and coats': 'blazers-coats',
      'kurta': 'kurta-ethnic-tops',
      'kurtas': 'kurta-ethnic-tops',
      'ethnic top': 'kurta-ethnic-tops',
      'ethnic tops': 'kurta-ethnic-tops',
      'kurta & ethnic tops': 'kurta-ethnic-tops',
      'kurta and ethnic tops': 'kurta-ethnic-tops',
      'tank top': 'tank-tops',
      'tank tops': 'tank-tops',
      'track pant': 'track-pants',
      'track pants': 'track-pants',
      'trackpants': 'track-pants',
      'trackpant': 'track-pants',
      'ethnic bottom': 'ethnic-bottoms',
      'ethnic bottoms': 'ethnic-bottoms',
      'jogger': 'joggers',
      'joggers': 'joggers',
      
      // Women's specific subcategories
      'top': 'tops',
      'tops': 'tops',
      'saree': 'sarees',
      'sarees': 'sarees',
      'sari': 'sarees',
      'saris': 'sarees',
      'lehenga': 'lehenga-choli',
      'lehenga choli': 'lehenga-choli',
      'lehenga-choli': 'lehenga-choli',
      'choli': 'lehenga-choli',
      'blouse': 'blouses',
      'blouses': 'blouses',
      'legging': 'leggings-jeggings',
      'leggings': 'leggings-jeggings',
      'jegging': 'leggings-jeggings',
      'jeggings': 'leggings-jeggings',
      'leggings / jeggings': 'leggings-jeggings',
      'leggings jeggings': 'leggings-jeggings',
      'legging jegging': 'leggings-jeggings',
      'cargo pant': 'joggers-cargo-pants',
      'cargo pants': 'joggers-cargo-pants',
      'joggers / cargo pants': 'joggers-cargo-pants',
      'joggers cargo pants': 'joggers-cargo-pants',
      'jogger cargo pant': 'joggers-cargo-pants',
      
      // Kids' specific subcategories
      'boy t-shirt': 't-shirts-boys-girls',
      'boys t-shirts': 't-shirts-boys-girls',
      'girl t-shirt': 't-shirts-boys-girls',
      'girls t-shirts': 't-shirts-boys-girls',
      'bottom wear': 'bottom-wear',
      'bottom-wear': 'bottom-wear',
      'bottom': 'bottom-wear',
      'bottoms': 'bottom-wear',
      'dress': 'dresses-casual-outfits',
      'dresses': 'dresses-casual-outfits',
      'casual outfit': 'dresses-casual-outfits',
      'casual outfits': 'dresses-casual-outfits',
      'dresses & casual outfits': 'dresses-casual-outfits',
      'dresses and casual outfits': 'dresses-casual-outfits',
      'everyday casual': 'everyday-casual-wear',
      'everyday casual wear': 'everyday-casual-wear',
      'casual wear': 'everyday-casual-wear',
      'everyday wear': 'everyday-casual-wear',
      'ethnic': 'ethnic-festive-wear',
      'ethnic wear': 'ethnic-festive-wear',
      'festive': 'ethnic-festive-wear',
      'festive wear': 'ethnic-festive-wear',
      'ethnic & festive wear': 'ethnic-festive-wear',
      'ethnic and festive wear': 'ethnic-festive-wear',
      'handbag': 'handbags',
      'handbags': 'handbags',
      'accessory': 'accessories',
      'accessories': 'accessories',
      'jewelry': 'jewelry',
      'jewellery': 'jewelry'
    };
    
    // Split query into words and remove stop words
    const words = queryLower.split(/\s+/).filter(word => 
      word.length > 0 && !stopWords.includes(word)
    );
    
    let extractedCategory = '';
    let extractedSubcategory = '';
    const remainingWords = [];
    
    // First pass: extract category
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const nextWord = words[i + 1] || '';
      const twoWords = `${word} ${nextWord}`;
      
      // Check for two-word category match (e.g., "for men", "for women")
      if (word === 'for' && categoryMap[nextWord]) {
        extractedCategory = categoryMap[nextWord];
        i++; // Skip next word
        continue;
      }
      
      // Check for single-word category match
      if (categoryMap[word]) {
        extractedCategory = categoryMap[word];
        continue;
      }
      
      // Check for two-word subcategory match
      if (subcategoryMap[twoWords]) {
        extractedSubcategory = subcategoryMap[twoWords];
        i++; // Skip next word
        continue;
      }
      
      // Check for single-word subcategory match
      if (subcategoryMap[word]) {
        extractedSubcategory = subcategoryMap[word];
        continue;
      }
      
      // If no match, keep the word for the search query
      remainingWords.push(word);
    }
    
    // Build clean query from remaining words
    const cleanQuery = remainingWords.join(' ').trim();
    
    return {
      cleanQuery: cleanQuery || query, // Use original query if all words were parsed
      category: extractedCategory,
      subcategory: extractedSubcategory
    };
  };

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Parse natural language query
      const parsed = parseNaturalLanguageQuery(searchQuery.trim());
      
      // Build search URL with extracted category and subcategory
      const params = new URLSearchParams();
      if (parsed.cleanQuery) params.set('q', parsed.cleanQuery);
      if (parsed.category) params.set('category', parsed.category);
      if (parsed.subcategory) params.set('subcategory', parsed.subcategory);
      
      window.location.href = `/search?${params.toString()}`;
    }
  }, [searchQuery]);


  // Memoize features to prevent re-creation on each render
  const features = useMemo(() => [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Real-time Price Comparison",
      description: "Get the latest prices from multiple e-commerce platforms instantly"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Trusted Sources",
      description: "Compare prices from Amazon, Flipkart, Myntra, and other trusted platforms"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Quick & Easy",
      description: "Find the best deals in seconds with our intuitive search interface"
    }
  ], []);

  const homeSchema = {
    "@context": "https://schema.org",
    "@graph": [
      generateWebsiteSchema(),
      generateOrganizationSchema(),
      {
        "@type": "WebPage",
        "@id": "https://pricecompare.com/#webpage",
        "url": "https://pricecompare.com/",
        "name": "PriceCompare - Search All Brands of Clothing | Men, Women & Kids Clothes",
        "description": "Search and compare prices for all brands of clothing - men, women, and kids clothes. Find best deals on shirts, dresses, jeans, t-shirts, shoes, and more from top brands.",
        "keywords": "clothing, clothes, all brands, men clothing, women clothing, kids clothing, shirts, t-shirts, dresses, jeans, fashion brands"
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Where can I find all brands of clothing?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PriceCompare offers a comprehensive collection of clothing from all major brands. Search for men's, women's, and kids' clothing including shirts, t-shirts, dresses, jeans, pants, shoes, and more from top brands. Compare prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho."
            }
          },
          {
            "@type": "Question",
            "name": "What types of clothes are available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We have all types of clothing for men, women, and kids including shirts, t-shirts, formal shirts, polo shirts, dresses, jeans, pants, cargo pants, formal pants, shoes, sneakers, casual wear, formal wear, and ethnic wear from all top brands."
            }
          },
          {
            "@type": "Question",
            "name": "Can I compare clothing prices from different websites?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! PriceCompare allows you to compare clothing prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho. Find the best deals on all brands of clothing and save money by comparing prices."
            }
          },
          {
            "@type": "Question",
            "name": "What clothing brands are available?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "PriceCompare features clothing from all major brands. Browse men's, women's, and kids' clothing from top fashion brands. Compare prices and find the best deals on brand clothing across multiple platforms."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO
        title="ClothNest - Search All Brands of Clothing | Men, Women & Kids Clothes | Compare Prices"
        description="Search and compare prices for all brands of clothing - men, women, and kids clothes. Find best deals on shirts, dresses, jeans, t-shirts, shoes, and more from top brands. Compare prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho."
        keywords="clothing, clothes, all brands, men clothing, women clothing, kids clothing, shirts, t-shirts, dresses, jeans, pants, shoes, sneakers, fashion, brands, top brands, clothing brands, compare clothing prices, best deals on clothes, affordable clothes, online clothing shopping, mens fashion, womens fashion, kids fashion, clothing store, clothes online, buy clothes online, discount clothing, clothing sale, price comparison, Amazon, Flipkart, Myntra, Ajio, Nykaa, Meesho, mens wear, womens wear, kids wear, clothing collection, all clothing brands, brand clothing, designer clothes, casual wear, formal wear, ethnic wear"
        url="/"
        schema={homeSchema}
      />
    <div className="min-h-screen">
      {/* Trending Products Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-orange-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-amber-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] bg-yellow-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          {/* Centered Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-5">
              <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl transform rotate-3 hover:rotate-6 transition-all duration-300 hover:scale-110">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent tracking-tight md:tracking-normal leading-tight md:leading-none drop-shadow-lg md:drop-shadow-xl [text-shadow:_0_2px_8px_rgba(251,146,60,0.3)] animate-fade-in">
                Trending Products
              </h2>
            </div>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold md:font-extrabold max-w-3xl mx-auto px-2 tracking-wide">
              Popular items everyone is searching for <span className="text-2xl md:text-3xl lg:text-4xl animate-bounce inline-block">🔥</span>
            </p>
          </div>
          
          {trendingLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg mb-2 sm:mb-3 md:mb-4"></div>
                  <div className="bg-gray-200 h-3 sm:h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 sm:h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
                <Link to="/search?trending=true">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 lg:px-12 py-4 sm:py-5 md:py-6 lg:py-7 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full border-0"
                  >
                    <span className="flex items-center justify-center gap-2">
                      View All Trending Products
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-pulse" />
                    </span>
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">No trending products available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/40 via-purple-600/30 to-indigo-700/40"></div>
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] md:w-[600px] h-[400px] sm:h-[500px] md:h-[600px] bg-indigo-400/20 rounded-full blur-3xl"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-4 sm:mb-6 animate-fade-in">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-white/20 backdrop-blur-xl rounded-full text-xs sm:text-xs md:text-sm font-semibold border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                <span className="hidden sm:inline">Compare prices from Amazon, Flipkart, Myntra & more</span>
                <span className="sm:hidden">Compare prices</span>
              </span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-4 sm:mb-6 md:mb-8 leading-tight tracking-tight px-2">
              <span className="bg-gradient-to-r from-white via-blue-50 to-purple-100 bg-clip-text text-transparent drop-shadow-2xl">
                Search All Brands of Clothing
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-50/90 max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 leading-relaxed font-medium px-2">
              Find all brands of clothes - Men, Women & Kids Clothing. Compare prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho.
            </p>
            <p className="text-xs sm:text-sm md:text-base text-blue-100/80 max-w-2xl mx-auto mb-8 sm:mb-10 md:mb-12 leading-relaxed px-2">
              Search for shirts, t-shirts, dresses, jeans, pants, shoes, and more from top brands. Your one-stop destination for all clothing brands and best deals.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8 md:mb-12 px-2">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 shadow-2xl rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl p-2 border border-white/20">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-200" />
                  <Input
                    type="text"
                    placeholder="Search clothes, brands, shirts, dresses, jeans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 md:py-5 text-sm sm:text-base bg-white/95 text-gray-900 placeholder:text-gray-400 border-0 rounded-lg sm:rounded-xl shadow-lg focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all duration-200"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-sm sm:text-base bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-lg sm:rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 whitespace-nowrap border-0"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Stats - Enhanced */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-center px-4">
              <div className="group flex-1 sm:flex-none">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 group-hover:scale-110 transition-transform duration-300">6+</div>
                <div className="text-xs sm:text-xs md:text-sm text-blue-100/90 font-medium">Platforms</div>
              </div>
              <div className="w-px h-8 sm:h-10 md:h-12 bg-white/30"></div>
              <div className="group flex-1 sm:flex-none">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 group-hover:scale-110 transition-transform duration-300">10K+</div>
                <div className="text-xs sm:text-xs md:text-sm text-blue-100/90 font-medium">Products</div>
              </div>
              <div className="w-px h-8 sm:h-10 md:h-12 bg-white/30"></div>
              <div className="group flex-1 sm:flex-none">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-1 group-hover:scale-110 transition-transform duration-300">50K+</div>
                <div className="text-xs sm:text-xs md:text-sm text-blue-100/90 font-medium">Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Brands & Types of Clothing Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-green-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6 px-2">
              All Brands of Clothing
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-4xl mx-auto font-bold leading-relaxed px-2 mb-2">
              Search and compare prices for <strong className="text-emerald-600">all brands of clothes</strong> - Men, Women & Kids Clothing
            </p>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto font-medium px-2">
              Find shirts, t-shirts, dresses, jeans, pants, shoes, sneakers, and more from top clothing brands. Compare prices across all platforms.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Men's Clothing */}
            <Link to="/search?category=men">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-emerald-400 bg-white overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-6 sm:p-8 md:p-10 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 group-hover:text-emerald-600 transition-colors">
                    Men's Clothing
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 font-medium leading-relaxed">
                    All brands of men's clothing including shirts, t-shirts, formal shirts, polo shirts, jeans, pants, cargo pants, formal pants, shoes, sneakers, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200">Shirts</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200">T-Shirts</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200">Jeans</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200">Shoes</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Women's Clothing */}
            <Link to="/search?category=women">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-pink-400 bg-white overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-6 sm:p-8 md:p-10 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 group-hover:text-pink-600 transition-colors">
                    Women's Clothing
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 font-medium leading-relaxed">
                    All brands of women's clothing including dresses, tops, t-shirts, jeans, pants, skirts, shoes, heels, sneakers, ethnic wear, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs sm:text-sm font-semibold border border-pink-200">Dresses</span>
                    <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs sm:text-sm font-semibold border border-pink-200">Tops</span>
                    <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs sm:text-sm font-semibold border border-pink-200">Jeans</span>
                    <span className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs sm:text-sm font-semibold border border-pink-200">Shoes</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Kids Clothing */}
            <Link to="/search?category=kids">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 hover:border-yellow-400 bg-white overflow-hidden transform hover:-translate-y-2 cursor-pointer">
                <CardContent className="p-6 sm:p-8 md:p-10 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 sm:mb-4 group-hover:text-orange-600 transition-colors">
                    Kids Clothing
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 font-medium leading-relaxed">
                    All brands of kids' clothing including boys clothing, girls clothing, baby clothing, t-shirts, dresses, jeans, pants, shoes, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs sm:text-sm font-semibold border border-yellow-200">Boys</span>
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs sm:text-sm font-semibold border border-yellow-200">Girls</span>
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs sm:text-sm font-semibold border border-yellow-200">Baby</span>
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs sm:text-sm font-semibold border border-yellow-200">All Ages</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] md:w-[700px] h-[400px] sm:h-[500px] md:h-[700px] bg-indigo-200/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          {/* Centered Header */}
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-xl transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Featured Products
              </h2>
            </div>
            <p className="text-gray-700 text-sm sm:text-base md:text-lg lg:text-xl font-semibold max-w-3xl mx-auto px-2">
              Handpicked best deals just for you ✨
            </p>
          </div>
          
          {featuredLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-40 sm:h-48 md:h-56 lg:h-64 rounded-lg mb-2 sm:mb-3 md:mb-4"></div>
                  <div className="bg-gray-200 h-3 sm:h-4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-3 sm:h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
                <Link to="/search">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 lg:px-12 py-4 sm:py-5 md:py-6 lg:py-7 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-full border-0"
                  >
                    <span className="flex items-center justify-center gap-2">
                      Explore All Products
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-pulse" />
                    </span>
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-500">No featured products available at the moment</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6 px-2">
              How ClothNest Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed px-2">
              We help you find the best deals by comparing prices across multiple platforms and alerting you when prices drop
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 mb-10 sm:mb-12 md:mb-16">
            {/* Price Comparison Card */}
            <Card className="border-2 border-blue-100 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl bg-white/80 backdrop-blur-sm transform hover:-translate-y-2">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 mb-6">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                    <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                      Compare Prices Across Platforms
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                      Search for any clothing item and instantly see prices from Amazon, Flipkart, Myntra, Ajio, and more. 
                      Our intelligent comparison engine shows you the best deals side by side, helping you save time and money.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-6">
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200 shadow-sm">Amazon</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200 shadow-sm">Flipkart</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200 shadow-sm">Myntra</span>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs sm:text-sm font-semibold border border-blue-200 shadow-sm">+ More</span>
                </div>
              </CardContent>
            </Card>

            {/* Price Alert Card */}
            <Card className="border-2 border-purple-100 hover:border-purple-400 transition-all duration-500 hover:shadow-2xl bg-white/80 backdrop-blur-sm transform hover:-translate-y-2">
              <CardContent className="p-6 sm:p-8 md:p-10">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 mb-6">
                  <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transform -rotate-3 hover:-rotate-6 transition-transform duration-300">
                    <Bell className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
                      Price Drop Alerts
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                      Never miss a deal! Set up price alerts for your favorite products. We'll notify you instantly 
                      when prices drop on any platform, ensuring you always get the best price available.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  {isLoggedIn ? (
                    <Button 
                      onClick={() => navigate("/search")}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white font-bold px-5 sm:px-6 py-4 sm:py-5 md:py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0"
                    >
                      Set Up Alerts
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate("/login")}
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-5 sm:px-6 py-4 sm:py-5 md:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
                    >
                      Login to Set Alerts
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
