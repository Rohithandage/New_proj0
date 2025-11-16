import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter, Bell, Check, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from "@/components/price-comparison/product-card";
import SubcategoryFilter from "@/components/price-comparison/subcategory-filter";
import SEO from "@/components/seo/SEO";
import { generateCollectionPageSchema } from "@/utils/schema";
import axios from "axios";
import apiConfig from "@/config/api";
import { useToast } from "@/components/ui/use-toast";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const debounceTimer = useRef(null);
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [subcategory, setSubcategory] = useState(searchParams.get('subcategory') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [website, setWebsite] = useState(searchParams.get('website') || '');
  // Show filters automatically when both category and subcategory are selected
  const bothSelectedInitially = searchParams.get('category') && searchParams.get('subcategory');
  const [showFilters, setShowFilters] = useState(bothSelectedInitially);
  
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  // Price alert states
  const [enableAlerts, setEnableAlerts] = useState(true); // Default to true
  const [showAlert, setShowAlert] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [alertMinPrice, setAlertMinPrice] = useState('');
  const [alertMaxPrice, setAlertMaxPrice] = useState('');
  const [alertWebsite, setAlertWebsite] = useState('');
  const [alertFilterWebsite, setAlertFilterWebsite] = useState('all'); // Filter products by website in alert view
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [creatingAlert, setCreatingAlert] = useState(false);
  const { toast } = useToast();

  const categories = ['men', 'women', 'kids'];
  const websites = ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho'];
  const subcategories = {
    men: [
      't-shirts', 'oversized-t-shirts', 'shirts', 'sweatshirts-hoodies', 'jackets', 
      'blazers-coats', 'kurta-ethnic-tops', 'tank-tops', 'jeans', 'trousers-pants', 
      'shorts', 'track-pants', 'ethnic-bottoms', 'joggers', 'innerwear'
    ],
    women: [
      'tops', 't-shirts', 'oversized-t-shirts', 'shirts', 'sarees', 'lehenga-choli', 
      'blouses', 'jeans', 'trousers-pants', 'leggings-jeggings', 'shorts', 
      'joggers-cargo-pants', 'sweatshirts-hoodies', 'innerwear'
    ],
    kids: [
      't-shirts-boys-girls', 'bottom-wear', 'dresses-casual-outfits', 
      'everyday-casual-wear', 'ethnic-festive-wear'
    ]
  };

  // Fetch alert settings
  useEffect(() => {
    const fetchAlertSettings = async () => {
      try {
        const response = await axios.get(`${apiConfig.BASE_URL}/api/settings/application`);
        if (response.data.success) {
          setEnableAlerts(response.data.data.enableAlerts !== false); // Default to true if undefined
        }
      } catch (error) {
        console.error('Error fetching alert settings:', error);
        // Default to true on error
        setEnableAlerts(true);
      }
    };
    
    fetchAlertSettings();
  }, []);

  useEffect(() => {
    // Update state from URL params when they change
    const urlCategory = searchParams.get('category') || '';
    const urlSubcategory = searchParams.get('subcategory') || '';
    const urlQuery = searchParams.get('q') || '';
    const urlSortBy = searchParams.get('sortBy') || '';
    const urlMinPrice = searchParams.get('minPrice') || '';
    const urlMaxPrice = searchParams.get('maxPrice') || '';
    const urlWebsite = searchParams.get('website') || '';
    const urlTrending = searchParams.get('trending') || '';
    
    setCategory(urlCategory);
    setSubcategory(urlSubcategory);
    setSearchQuery(urlQuery);
    setSortBy(urlSortBy);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
    setWebsite(urlWebsite);
    
    // Auto-show filters when both category and subcategory are selected, or when trending is active
    if (urlCategory && urlSubcategory) {
      setShowFilters(true);
    } else if (urlTrending === 'true') {
      setShowFilters(false); // Hide category filters when showing trending
    }
    
    // Fetch products when params change
    fetchProducts();
  }, [searchParams]);

  // Check authentication status
  useEffect(() => {
    checkAuthStatus();
    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-fill email when user is logged in
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      setAlertEmail(user.email);
    }
  }, [isLoggedIn, user]);

  const checkAuthStatus = () => {
    const userData = localStorage.getItem('user');
    const userToken = localStorage.getItem('userToken');
    
    if (userData && userToken) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  // Fetch trending products only once on mount
  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  // Update URL params immediately when category or subcategory changes from top bar
  const setParamAndFetch = (next) => {
    // Get current URL params to preserve existing values
    const currentParams = new URLSearchParams(searchParams);
    const merged = {
      q: next.searchQuery !== undefined ? next.searchQuery : (next.q !== undefined ? next.q : searchQuery),
      category: next.category !== undefined ? next.category : category,
      subcategory: next.subcategory !== undefined ? next.subcategory : subcategory,
      sortBy: next.sortBy !== undefined ? next.sortBy : sortBy,
      minPrice: next.minPrice !== undefined ? next.minPrice : minPrice,
      maxPrice: next.maxPrice !== undefined ? next.maxPrice : maxPrice,
      website: next.website !== undefined ? next.website : website,
    };
    
    // Build new params object
    const params = new URLSearchParams();
    if (merged.q) params.set('q', merged.q);
    if (merged.category) params.set('category', merged.category);
    if (merged.subcategory) params.set('subcategory', merged.subcategory);
    if (merged.sortBy) params.set('sortBy', merged.sortBy);
    if (merged.minPrice) params.set('minPrice', merged.minPrice);
    if (merged.maxPrice) params.set('maxPrice', merged.maxPrice);
    if (merged.website) params.set('website', merged.website);
    
    setSearchParams(params);
  };

  const handleCategorySwitch = (cat) => {
    const newParams = cat ? { category: cat, subcategory: '' } : { category: '', subcategory: '' };
    setCategory(cat || '');
    setSubcategory('');
    setParamAndFetch(newParams);
  };

  const handleSubcategoryChange = (sub) => {
    const newParams = sub ? { subcategory: sub } : { subcategory: '' };
    setSubcategory(sub || '');
    setParamAndFetch(newParams);
  };

  const handleSubcategoryChipClick = (sub) => {
    handleSubcategoryChange(sub);
  };

  const fetchTrendingProducts = async () => {
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
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Get latest values from URL params to ensure we have the correct filters
      const urlCategory = searchParams.get('category') || '';
      const urlSubcategory = searchParams.get('subcategory') || '';
      const urlQuery = searchParams.get('q') || '';
      const urlSortBy = searchParams.get('sortBy') || '';
      const urlMinPrice = searchParams.get('minPrice') || '';
      const urlMaxPrice = searchParams.get('maxPrice') || '';
      const urlWebsite = searchParams.get('website') || '';
      const urlTrending = searchParams.get('trending') || '';
      
      const params = new URLSearchParams();
      if (urlQuery) params.append('query', urlQuery);
      if (urlCategory) params.append('category', urlCategory);
      if (urlSubcategory) params.append('subcategory', urlSubcategory);
      if (urlSortBy) params.append('sortBy', urlSortBy);
      if (urlMinPrice) params.append('minPrice', urlMinPrice);
      if (urlMaxPrice) params.append('maxPrice', urlMaxPrice);
      if (urlWebsite) params.append('website', urlWebsite);
      if (urlTrending === 'true') params.append('trending', 'true');
      // Increase limit to show all products from all brands
      params.append('limit', '1000');

      const response = await axios.get(`${apiConfig.PRICE_COMPARISON}/search?${params.toString()}`);
      
      if (response.data.success) {
        const fetchedProducts = response.data.data || [];
        console.log('Response from backend:', response.data);
        console.log('Fetched products:', fetchedProducts);
        console.log(`Fetched ${fetchedProducts.length} products for category: ${urlCategory}, subcategory: ${urlSubcategory}`);
        
        // Log each product's structure
        if (fetchedProducts.length > 0) {
          fetchedProducts.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, {
              id: product._id,
              name: product.name,
              category: product.category,
              subcategory: product.subcategory,
              brand: product.brand,
              image: product.image,
              pricesCount: product.prices?.length || 0,
              prices: product.prices
            });
          });
        }
        
        setProducts(fetchedProducts);
        
        // Show toast if no products found but filters are applied
        if (fetchedProducts.length === 0 && (urlCategory || urlSubcategory)) {
          console.warn('No products found with current filters');
        }
      } else {
        console.error('Search response unsuccessful:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      console.error("Error details:", error.response?.data || error.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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
      // Men's subcategories
      'shirt': 'formal-shirts',
      'shirts': 'formal-shirts',
      'formal-shirt': 'formal-shirts',
      'formal-shirts': 'formal-shirts',
      'tshirt': 't-shirts',
      'tshirts': 't-shirts',
      't-shirt': 't-shirts',
      't-shirts': 't-shirts',
      'tee': 't-shirts',
      'tees': 't-shirts',
      't shirt': 't-shirts',
      't shirts': 't-shirts',
      'polo': 'polo-shirts',
      'polo-shirt': 'polo-shirts',
      'polo-shirts': 'polo-shirts',
      'kurta': 'kurtas',
      'kurtas': 'kurtas',
      'jean': 'jeans',
      'jeans': 'jeans',
      'pant': 'formal-pants',
      'pants': 'formal-pants',
      'trouser': 'formal-pants',
      'trousers': 'formal-pants',
      'formal-pant': 'formal-pants',
      'formal-pants': 'formal-pants',
      'short': 'shorts',
      'shorts': 'shorts',
      'shoe': 'shoes',
      'shoes': 'shoes',
      'sneaker': 'sneakers',
      'sneakers': 'sneakers',
      
      // Women's subcategories
      'dress': 'dresses',
      'dresses': 'dresses',
      'top': 'tops',
      'tops': 'tops',
      'blouse': 'blouses',
      'blouses': 'blouses',
      'skirt': 'skirts',
      'skirts': 'skirts',
      'legging': 'leggings',
      'leggings': 'leggings',
      'heel': 'heels',
      'heels': 'heels',
      'bag': 'bags',
      'bags': 'bags',
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

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearchParams();
  };

  const updateSearchParams = () => {
    // Parse natural language query to extract category and subcategory
    const parsed = parseNaturalLanguageQuery(searchQuery);
    
    const params = new URLSearchParams();
    // Use clean query (without category/subcategory keywords) or original if nothing extracted
    if (parsed.cleanQuery) params.set('q', parsed.cleanQuery);
    
    // Use extracted category if found, otherwise use manually selected category
    const finalCategory = parsed.category || category;
    if (finalCategory) params.set('category', finalCategory);
    
    // Use extracted subcategory if found, otherwise use manually selected subcategory
    const finalSubcategory = parsed.subcategory || subcategory;
    if (finalSubcategory) params.set('subcategory', finalSubcategory);
    
    if (sortBy) params.set('sortBy', sortBy);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (website) params.set('website', website);
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setSubcategory('');
    setSortBy('');
    setMinPrice('');
    setMaxPrice('');
    setWebsite('');
    // Clear all params including trending
    setSearchParams({});
    setShowAlert(false);
    setAlertEmail('');
    setAlertMinPrice('');
    setAlertMaxPrice('');
    setAlertWebsite('');
    setSelectedProducts(new Set());
    setShowFilters(false);
  };

  // Handle creating price alert for all visible products
  const handleCreateAlert = async () => {
    // Check if alerts are enabled
    if (!enableAlerts) {
      toast({
        title: "Alerts Disabled",
        description: "Price alerts are currently disabled. Please contact the administrator.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is logged in
    checkAuthStatus();
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to create price alerts",
        variant: "destructive",
      });
      // Redirect to login page
      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
      return;
    }

    // Use logged-in user's email
    const emailToUse = isLoggedIn && user?.email ? user.email : alertEmail;

    if (!emailToUse || !alertMinPrice || !alertMaxPrice) {
      toast({
        title: "Missing Information",
        description: "Please enter your price range",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToUse)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Price range validation
    const minPrice = parseFloat(alertMinPrice);
    const maxPrice = parseFloat(alertMaxPrice);
    
    if (isNaN(minPrice) || isNaN(maxPrice) || minPrice < 0 || maxPrice < 0) {
      toast({
        title: "Invalid Price Range",
        description: "Please enter valid positive numbers",
        variant: "destructive",
      });
      return;
    }

    if (minPrice > maxPrice) {
      toast({
        title: "Invalid Price Range",
        description: "Min price cannot be greater than max price",
        variant: "destructive",
      });
      return;
    }

    if (products.length === 0) {
      toast({
        title: "No Products",
        description: "Please search for products first",
        variant: "destructive",
      });
      return;
    }

    if (selectedProducts.size === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select at least one product to create an alert",
        variant: "destructive",
      });
      return;
    }

    setCreatingAlert(true);

    try {
      // Create alerts only for selected products
      const alertPromises = products
        .filter(product => selectedProducts.has(product._id))
        .map(product => {
          // Find the best price (lowest) or website-specific price
          let targetPrice = null;
          // Use alertFilterWebsite if set, otherwise use alertWebsite, otherwise null
          let targetWebsite = (alertFilterWebsite !== 'all' ? alertFilterWebsite : (alertWebsite || null));

          if (targetWebsite) {
            targetPrice = product.prices.find(p => p.website === targetWebsite);
          } else if (product.prices && product.prices.length > 0) {
            targetPrice = product.prices.reduce((lowest, current) => {
              return (current.price < lowest.price) ? current : lowest;
            });
            targetWebsite = targetPrice.website;
          }

          if (!targetPrice) {
            return null; // Skip products without prices
          }

          return axios.post(
            `${apiConfig.BASE_URL}/api/price-alerts`,
            {
              email: emailToUse,
              productId: product._id,
              minPrice: minPrice,
              maxPrice: maxPrice,
              website: targetWebsite || null,
            }
          );
        });

      // Filter out null promises and wait for all alerts to be created
      const results = await Promise.allSettled(alertPromises.filter(p => p !== null));
      
      // Check for errors (including disabled alerts)
      const errors = results.filter(r => r.status === 'rejected');
      if (errors.length > 0) {
        const errorMessage = errors[0].reason?.response?.data?.message || 'Some alerts failed to create';
        if (errorMessage.includes('disabled')) {
          toast({
            title: "Alerts Disabled",
            description: errorMessage,
            variant: "destructive",
          });
          setShowAlert(false);
          return;
        }
      }

      const successful = results.filter(r => r.status === 'fulfilled').length;

      toast({
        title: "Alert Created! 🎉",
        description: `Price alerts set up for ${successful} product(s). You'll receive an email when prices are between ₹${minPrice.toLocaleString()} and ₹${maxPrice.toLocaleString()}.`,
      });

      // Reset form
      setShowAlert(false);
      setAlertEmail('');
      setAlertMinPrice('');
      setAlertMaxPrice('');
      setAlertWebsite('');
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('Error creating price alerts:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create price alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingAlert(false);
    }
  };

  // Check if both category and subcategory are selected
  const bothSelected = category && subcategory;
  // Check if only category is selected (no subcategory)
  const onlyCategorySelected = category && !subcategory;
  // Check if trending is active
  const isTrendingView = searchParams.get('trending') === 'true';

  // Generate SEO meta based on current filters
  const getSearchPageTitle = () => {
    if (isTrendingView) return "Trending Products - Best Deals & Hot Deals | ClothNest";
    if (searchQuery) return `${searchQuery} - Price Comparison & Best Deals | ClothNest`;
    if (category) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      if (subcategory) {
        const subcategoryName = subcategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `${categoryName} ${subcategoryName} - Price Comparison & Best Deals | ClothNest`;
      }
      return `${categoryName} Clothing - Price Comparison & Best Deals | ClothNest`;
    }
    return "Search Products - Compare Prices Across Amazon, Flipkart, Myntra & More | ClothNest";
  };

  const getSearchPageDescription = () => {
    if (isTrendingView) return "Discover trending products with the best deals. Compare prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho.";
    if (searchQuery) return `Compare prices for ${searchQuery} across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho. Find the best deals and save money.`;
    if (category) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      return `Compare prices for ${categoryName} clothing across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho. Find the best deals on ${categoryName} fashion.`;
    }
    return "Search and compare prices across Amazon, Flipkart, Myntra, Ajio, Nykaa, and Meesho. Find the best deals on clothing for men, women, and kids.";
  };

  const getSearchKeywords = () => {
    const baseKeywords = "price comparison, best deals, online shopping, compare prices, Amazon, Flipkart, Myntra, Ajio, Nykaa, Meesho";
    if (searchQuery) return `${searchQuery}, ${baseKeywords}`;
    if (category) return `${category} clothing, ${category} fashion, ${baseKeywords}`;
    return baseKeywords;
  };

  const collectionSchema = category ? generateCollectionPageSchema(category, products) : null;
  const currentUrl = typeof window !== 'undefined' ? `/search${window.location.search}` : '/search';

  return (
    <>
      <SEO
        title={getSearchPageTitle()}
        description={getSearchPageDescription()}
        keywords={getSearchKeywords()}
        url={currentUrl}
        schema={collectionSchema}
      />
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className={`max-w-7xl mx-auto ${bothSelected ? 'px-3 sm:px-4' : 'px-4 sm:px-6 lg:px-8'} ${bothSelected ? 'py-3 sm:py-4' : 'py-4 md:py-8'}`}>
        
        {/* Search and Filters - Always at Top */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 backdrop-blur-sm rounded-xl shadow-lg border border-blue-100/50 mb-6 p-4 sm:p-5 md:p-6 relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl -z-0"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl -z-0"></div>
          
          <form onSubmit={handleSearch} className="space-y-4 relative z-10">
            {/* Main Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group">
                <Input
                  type="text"
                  placeholder="Search by description, category, brand..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    // Debounce search to avoid excessive API calls
                    const query = e.target.value;
                    if (debounceTimer.current) {
                      clearTimeout(debounceTimer.current);
                    }
                    debounceTimer.current = setTimeout(() => {
                      if (query.trim()) {
                        setParamAndFetch({ searchQuery: query, q: query });
                      } else {
                        // Clear search if input is empty
                        setParamAndFetch({ searchQuery: '', q: '' });
                      }
                    }, 500); // 500ms debounce delay
                  }}
                  onKeyDown={(e) => {
                    // Allow Enter key to trigger search
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch(e);
                    }
                  }}
                  className="pl-11 pr-4 h-11 sm:h-12 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                />
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <SearchIcon className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Button 
                  type="submit" 
                  className="px-6 md:px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Search
                </Button>
                {!isTrendingView && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 ${
                      showFilters 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 text-blue-700 shadow-md' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <Filter className={`h-4 w-4 mr-2 ${showFilters ? 'text-blue-600' : ''}`} />
                    Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Filters - Show when filters button clicked, category selected, or trending view */}
            {(bothSelected || onlyCategorySelected || showFilters || isTrendingView) && (
              <div className={`grid ${isTrendingView ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-5'} gap-3 sm:gap-4 pt-4 border-t border-blue-200/50`}>
                {!isTrendingView && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 px-1">Category</label>
                      <Select value={category || "all"} onValueChange={(value) => handleCategorySwitch(value === "all" ? "" : value)}>
                        <SelectTrigger className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 px-1">Subcategory</label>
                      <Select value={subcategory || "all"} onValueChange={(value) => handleSubcategoryChange(value === "all" ? "" : value)}>
                        <SelectTrigger className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50">
                          <SelectValue placeholder="All Subcategories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subcategories</SelectItem>
                          {category && subcategories[category]?.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub.charAt(0).toUpperCase() + sub.slice(1).replace(/-/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Compare - Website Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 px-1">Website</label>
                  <Select value={website || "all"} onValueChange={(value) => {
                    const websiteValue = value === "all" ? "" : value;
                    setWebsite(websiteValue);
                    setParamAndFetch({ website: websiteValue });
                  }}>
                    <SelectTrigger className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50">
                      <SelectValue placeholder="All Websites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Websites</SelectItem>
                      {websites.map((web) => (
                        <SelectItem key={web} value={web}>
                          {web.charAt(0).toUpperCase() + web.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 px-1">Min Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    onBlur={() => {
                      if (minPrice || maxPrice) {
                        setParamAndFetch({ minPrice, maxPrice });
                      }
                    }}
                    className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 px-1">Max Price (₹)</label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    onBlur={() => {
                      if (minPrice || maxPrice) {
                        setParamAndFetch({ minPrice, maxPrice });
                      }
                    }}
                    className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50"
                  />
                </div>
              </div>
            )}

            {/* Sort and Clear - Show when both are selected */}
            {bothSelected && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-blue-200/50">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-gray-700 px-1 mb-1.5 block">Sort By</label>
                  <Select value={sortBy || "default"} onValueChange={(value) => {
                    const sortValue = value === "default" ? "" : value;
                    setSortBy(sortValue);
                    setParamAndFetch({ sortBy: sortValue });
                  }}>
                    <SelectTrigger className="h-11 sm:h-12 rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm font-medium transition-all duration-300 hover:border-blue-300 hover:shadow-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end sm:items-center">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="h-11 sm:h-12 rounded-xl border-2 border-gray-300 hover:border-red-400 bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 font-semibold transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}

            {/* Price Alert Section - Show in all filters */}
            {(bothSelected || onlyCategorySelected || showFilters || isTrendingView || products.length > 0) && enableAlerts && (
              <div className="pt-4 border-t border-blue-200/50">
                <Button
                  type="button"
                  onClick={() => {
                    checkAuthStatus();
                    if (!isLoggedIn) {
                      toast({
                        title: "Login Required",
                        description: "Please login to create price alerts",
                        variant: "destructive",
                      });
                      navigate('/login', { state: { from: window.location.pathname + window.location.search } });
                      return;
                    }
                    setShowAlert(!showAlert);
                  }}
                  className={`w-full sm:w-auto mb-3 rounded-xl border-2 font-semibold transition-all duration-300 hover:scale-105 ${
                    showAlert 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-amber-600 shadow-lg' 
                      : 'bg-white hover:bg-amber-50 text-gray-700 border-amber-300 hover:border-amber-400 shadow-sm hover:shadow-md'
                  }`}
                >
                  <Bell className={`h-4 w-4 mr-2 ${showAlert ? 'text-white' : 'text-amber-600'}`} />
                  {showAlert ? 'Alert On' : 'Alert On'}
                </Button>

                {showAlert && (
                  <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 shadow-lg relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -z-0"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl -z-0"></div>
                    
                    <div className="relative z-10 space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-md">
                          <Bell className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg sm:text-xl text-amber-900 bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Get Price Drop Alerts</h3>
                      </div>
                      <p className="text-sm sm:text-base text-amber-800 mb-3 font-medium">
                        {isLoggedIn 
                          ? `You'll receive an email at ${user?.email || 'your registered email'} when prices fall within your desired range.`
                          : "Please login to create price alerts. You'll be redirected to the login page."
                        }
                      </p>
                      {isLoggedIn && user?.email && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 mb-3 border-2 border-amber-300 shadow-md">
                          <p className="text-xs sm:text-sm text-amber-900 font-semibold">
                            📧 Alert emails will be sent to: <span className="font-bold text-amber-700">{user.email}</span>
                          </p>
                        </div>
                      )}
                      
                      {/* Website Filter Dropdown */}
                      <div className="mb-3">
                        <label className="text-xs sm:text-sm font-bold text-amber-900 mb-2 block">Filter Products by Website</label>
                        <Select 
                          value={alertFilterWebsite} 
                          onValueChange={(value) => {
                            setAlertFilterWebsite(value);
                            // Clear selection when filter changes so user can select from filtered products
                            setSelectedProducts(new Set());
                          }}
                        >
                          <SelectTrigger className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-amber-400 hover:shadow-md focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50">
                            <SelectValue placeholder="All Websites" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">
                              All Websites ({products.length})
                            </SelectItem>
                            {websites.map((web) => {
                              const websiteProductCount = products.filter(product => 
                                product.prices && product.prices.some(p => p.website === web)
                              ).length;
                              return (
                                <SelectItem key={web} value={web}>
                                  {web.charAt(0).toUpperCase() + web.slice(1)} ({websiteProductCount})
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {alertFilterWebsite !== 'all' && (
                          <p className="text-xs sm:text-sm text-amber-700 mt-2 font-medium bg-white/60 rounded-lg px-3 py-2 border border-amber-300">
                            Showing only products available on <span className="font-bold">{alertFilterWebsite.charAt(0).toUpperCase() + alertFilterWebsite.slice(1)}</span>
                          </p>
                        )}
                      </div>
                    
                      {/* Selection controls */}
                      {(() => {
                        // Get filtered products for selection
                        let filteredProductsForSelection = products;
                        
                        if (alertFilterWebsite !== 'all') {
                          filteredProductsForSelection = products.filter(product => 
                            product.prices && product.prices.some(p => p.website === alertFilterWebsite)
                          );
                        }
                        
                        const allFilteredSelected = filteredProductsForSelection.length > 0 && 
                          filteredProductsForSelection.every(p => selectedProducts.has(p._id));
                        
                        return (
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-3 p-3 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-300 shadow-sm">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={allFilteredSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    const newSelected = new Set(selectedProducts);
                                    filteredProductsForSelection.forEach(p => newSelected.add(p._id));
                                    setSelectedProducts(newSelected);
                                  } else {
                                    const newSelected = new Set(selectedProducts);
                                    filteredProductsForSelection.forEach(p => newSelected.delete(p._id));
                                    setSelectedProducts(newSelected);
                                  }
                                }}
                                disabled={filteredProductsForSelection.length === 0}
                                className="border-2 border-amber-500 data-[state=checked]:bg-amber-500"
                              />
                              <label className="text-sm font-bold text-amber-900 cursor-pointer">
                                Select All {alertFilterWebsite !== 'all' ? `(${filteredProductsForSelection.length} available)` : ''} 
                                <span className="text-amber-700 ml-1">({selectedProducts.size} selected)</span>
                              </label>
                            </div>
                            {selectedProducts.size > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedProducts(new Set())}
                                className="text-xs h-8 px-3 rounded-lg hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-300 transition-all"
                              >
                                Clear Selection
                              </Button>
                            )}
                          </div>
                        );
                      })()}
                      
                      <div className="mb-3">
                        <label className="text-xs sm:text-sm font-bold text-amber-900 mb-2 block">Email Address</label>
                        <Input
                          type="email"
                          placeholder={isLoggedIn ? user?.email || "Your email address" : "Your email address"}
                          value={alertEmail}
                          onChange={(e) => setAlertEmail(e.target.value)}
                          disabled={isLoggedIn}
                          className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-amber-300 hover:shadow-md focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50 disabled:bg-gray-100 disabled:cursor-not-allowed w-full"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-bold text-amber-900 block">Min Price (₹)</label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={alertMinPrice}
                            onChange={(e) => setAlertMinPrice(e.target.value)}
                            className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-amber-300 hover:shadow-md focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-xs sm:text-sm font-bold text-amber-900 block">Max Price (₹)</label>
                          <Input
                            type="number"
                            placeholder="10000"
                            value={alertMaxPrice}
                            onChange={(e) => setAlertMaxPrice(e.target.value)}
                            className="rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm h-11 font-medium transition-all duration-300 hover:border-amber-300 hover:shadow-md focus:border-amber-500 focus:ring-2 focus:ring-amber-200/50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                        <Button
                          type="button"
                          onClick={handleCreateAlert}
                          disabled={creatingAlert || !alertEmail || !alertMinPrice || !alertMaxPrice || selectedProducts.size === 0}
                          className="flex-1 w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl disabled:opacity-50 py-2.5 sm:py-2 text-sm sm:text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                        {creatingAlert ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            <span className="hidden sm:inline">Creating Alerts...</span>
                            <span className="sm:hidden">Creating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="hidden sm:inline">
                              Create Alert for {selectedProducts.size} Product{selectedProducts.size !== 1 ? 's' : ''}
                            </span>
                            <span className="sm:hidden">
                              Create Alert ({selectedProducts.size})
                            </span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAlert(false);
                          setAlertEmail('');
                          setAlertMinPrice('');
                          setAlertMaxPrice('');
                          setAlertWebsite('');
                          setAlertFilterWebsite('all'); // Reset filter
                          setSelectedProducts(new Set());
                        }}
                        className="w-full sm:w-auto rounded-xl border-2 border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 py-2.5 sm:py-2 text-sm sm:text-base font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
                      >
                        Cancel
                      </Button>
                    </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>


        {/* Subcategory Filter (grid chooser) - Hide when category is selected */}
        {/* Removed - no longer showing subcategory filter grid when category is selected */}

        {/* Results Header - Show when not in trending view or when filters are active */}
        {(!isTrendingView || category || subcategory || searchQuery) && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isTrendingView 
                  ? 'Trending Products'
                  : searchQuery 
                  ? `Search results for "${searchQuery}"` 
                  : 'All Products'}
              </h1>
              <p className="text-gray-600">
                {loading ? 'Loading...' : (() => {
                  if (showAlert && alertFilterWebsite !== 'all') {
                    const filteredCount = products.filter(product => 
                      product.prices && product.prices.some(p => p.website === alertFilterWebsite)
                    ).length;
                    return `${filteredCount} product${filteredCount !== 1 ? 's' : ''} found on ${alertFilterWebsite.charAt(0).toUpperCase() + alertFilterWebsite.slice(1)}`;
                  }
                  return `${products.length} product${products.length !== 1 ? 's' : ''} found`;
                })()}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Select value={sortBy || "default"} onValueChange={(value) => {
                const sortValue = value === "default" ? "" : value;
                setSortBy(sortValue);
                setParamAndFetch({ sortBy: sortValue });
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || category || subcategory || minPrice || maxPrice || isTrendingView) && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Trending View Header */}
        {isTrendingView && !category && !subcategory && !searchQuery && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-orange-500" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Trending Products
                </h1>
              </div>
              <p className="text-gray-600 text-sm md:text-base">
                {loading ? 'Loading...' : `${products.length} trending product${products.length !== 1 ? 's' : ''} found`}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Select value={sortBy || "default"} onValueChange={(value) => {
                const sortValue = value === "default" ? "" : value;
                setSortBy(sortValue);
                setParamAndFetch({ sortBy: sortValue });
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Product Count - Show when both are selected */}
        {bothSelected && (
          <div className="mb-4 sm:mb-5">
            <p className="text-sm sm:text-base text-gray-600 font-medium">
              {loading ? 'Loading...' : (() => {
                if (showAlert && alertFilterWebsite !== 'all') {
                  const filteredCount = products.filter(product => 
                    product.prices && product.prices.some(p => p.website === alertFilterWebsite)
                  ).length;
                  return `${filteredCount} product${filteredCount !== 1 ? 's' : ''} found on ${alertFilterWebsite.charAt(0).toUpperCase() + alertFilterWebsite.slice(1)}`;
                }
                return `${products.length} product${products.length !== 1 ? 's' : ''} found`;
              })()}
            </p>
          </div>
        )}

        {/* Products Grid - Show after filters */}
        {loading ? (
          <div className={`grid ${bothSelected ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-3 sm:gap-4 md:gap-6`}>
            {[...Array(bothSelected ? 8 : 12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 sm:h-56 md:h-64 rounded-xl mb-3 sm:mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            {(() => {
              // Filter and sort products by website when alert filter is active
              let displayProducts = [...products];
              let displayedCount = products.length;
              
              if (showAlert && alertFilterWebsite !== 'all') {
                // Filter products to show ONLY those available on the selected website
                displayProducts = products
                  .filter(product => 
                    product.prices && product.prices.some(p => p.website === alertFilterWebsite)
                  )
                  .sort((a, b) => {
                    // Sort by price on the selected website
                    const aPrice = a.prices.find(p => p.website === alertFilterWebsite)?.price || Infinity;
                    const bPrice = b.prices.find(p => p.website === alertFilterWebsite)?.price || Infinity;
                    return aPrice - bPrice;
                  });
                displayedCount = displayProducts.length;
              }
              
              return (
                <div className={`grid ${bothSelected ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'} gap-3 sm:gap-4 md:gap-6`}>
                  {displayProducts.map((product) => {
                const isSelected = selectedProducts.has(product._id);
                
                return (
                  <div key={product._id} className="relative">
                    {/* Checkbox overlay - only show when alert is enabled */}
                    {showAlert && (bothSelected || onlyCategorySelected || showFilters || isTrendingView || products.length > 0) && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-white rounded-full p-1 shadow-lg">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedProducts);
                              if (checked) {
                                newSelected.add(product._id);
                              } else {
                                newSelected.delete(product._id);
                              }
                              setSelectedProducts(newSelected);
                            }}
                            className="border-2 border-amber-500 data-[state=checked]:bg-amber-500"
                          />
                        </div>
                      </div>
                    )}
                    {/* Selection highlight overlay */}
                    {showAlert && isSelected && (bothSelected || onlyCategorySelected || showFilters || isTrendingView || products.length > 0) && (
                      <div className="absolute inset-0 border-4 border-amber-500 rounded-xl pointer-events-none z-0 bg-amber-500/10" />
                    )}
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>
            );
            })()}
          </>
        ) : (
          <Card className={`${bothSelected ? 'p-8 sm:p-12' : 'p-12'} text-center rounded-xl border-gray-200`}>
            <CardContent>
              <div className="text-gray-400 mb-4">
                <SearchIcon className={`${bothSelected ? 'h-12 w-12 sm:h-16 sm:w-16' : 'h-16 w-16'} mx-auto`} />
              </div>
              <h3 className={`${bothSelected ? 'text-lg sm:text-xl' : 'text-xl'} font-semibold mb-2`}>No products found</h3>
              <p className={`${bothSelected ? 'text-sm sm:text-base' : 'text-base'} text-gray-600 mb-4`}>
                Try adjusting your search criteria or browse our categories
              </p>
              <Button onClick={clearFilters} variant="outline" className="rounded-lg">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
  );
};

export default Search;
