import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search as SearchIcon, Menu, X, ShoppingBag, ChevronDown, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is logged in
  useEffect(() => {
    checkAuthStatus();
    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]); // Re-check when route changes (e.g., after login)

  // Close search and menu when route changes
  useEffect(() => {
    setIsSearchOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userToken');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const categories = [
    {
      id: 'men',
      name: "Men",
      href: "/search?category=men",
      subcategories: [
        { id: 't-shirts', name: 'T-Shirts', href: '/search?category=men&subcategory=t-shirts' },
        { id: 'oversized-t-shirts', name: 'Oversized T-Shirts', href: '/search?category=men&subcategory=oversized-t-shirts' },
        { id: 'shirts', name: 'Shirts', href: '/search?category=men&subcategory=shirts' },
        { id: 'sweatshirts-hoodies', name: 'Sweatshirts & Hoodies', href: '/search?category=men&subcategory=sweatshirts-hoodies' },
        { id: 'jackets', name: 'Jackets', href: '/search?category=men&subcategory=jackets' },
        { id: 'blazers-coats', name: 'Blazers & Coats', href: '/search?category=men&subcategory=blazers-coats' },
        { id: 'kurta-ethnic-tops', name: 'Kurta & Ethnic Tops', href: '/search?category=men&subcategory=kurta-ethnic-tops' },
        { id: 'tank-tops', name: 'Tank Tops', href: '/search?category=men&subcategory=tank-tops' },
        { id: 'jeans', name: 'Jeans', href: '/search?category=men&subcategory=jeans' },
        { id: 'trousers-pants', name: 'Trousers / Pants', href: '/search?category=men&subcategory=trousers-pants' },
        { id: 'shorts', name: 'Shorts', href: '/search?category=men&subcategory=shorts' },
        { id: 'track-pants', name: 'Track Pants', href: '/search?category=men&subcategory=track-pants' },
        { id: 'ethnic-bottoms', name: 'Ethnic Bottoms', href: '/search?category=men&subcategory=ethnic-bottoms' },
        { id: 'joggers', name: 'Joggers', href: '/search?category=men&subcategory=joggers' },
        { id: 'innerwear', name: 'Innerwear', href: '/search?category=men&subcategory=innerwear' },
      ]
    },
    {
      id: 'women',
      name: "Women",
      href: "/search?category=women",
      subcategories: [
        { id: 'tops', name: 'Tops', href: '/search?category=women&subcategory=tops' },
        { id: 't-shirts', name: 'T-Shirts', href: '/search?category=women&subcategory=t-shirts' },
        { id: 'oversized-t-shirts', name: 'OverSized T-Shirts', href: '/search?category=women&subcategory=oversized-t-shirts' },
        { id: 'shirts', name: 'Shirts', href: '/search?category=women&subcategory=shirts' },
        { id: 'sarees', name: 'Sarees', href: '/search?category=women&subcategory=sarees' },
        { id: 'lehenga-choli', name: 'Lehenga Choli', href: '/search?category=women&subcategory=lehenga-choli' },
        { id: 'blouses', name: 'Blouses', href: '/search?category=women&subcategory=blouses' },
        { id: 'jeans', name: 'Jeans', href: '/search?category=women&subcategory=jeans' },
        { id: 'trousers-pants', name: 'Trousers / Pants', href: '/search?category=women&subcategory=trousers-pants' },
        { id: 'leggings-jeggings', name: 'Leggings / Jeggings', href: '/search?category=women&subcategory=leggings-jeggings' },
        { id: 'shorts', name: 'Shorts', href: '/search?category=women&subcategory=shorts' },
        { id: 'joggers-cargo-pants', name: 'Joggers / Cargo Pants', href: '/search?category=women&subcategory=joggers-cargo-pants' },
        { id: 'sweatshirts-hoodies', name: 'Sweatshirts & Hoodies', href: '/search?category=women&subcategory=sweatshirts-hoodies' },
        { id: 'innerwear', name: 'InnerWear', href: '/search?category=women&subcategory=innerwear' },
      ]
    },
    {
      id: 'kids',
      name: "Kids",
      href: "/search?category=kids",
      subcategories: [
        { id: 't-shirts-boys-girls', name: 'T-Shirts (boys and girls)', href: '/search?category=kids&subcategory=t-shirts-boys-girls' },
        { id: 'bottom-wear', name: 'Bottom-wear', href: '/search?category=kids&subcategory=bottom-wear' },
        { id: 'dresses-casual-outfits', name: 'Dresses & casual outfits', href: '/search?category=kids&subcategory=dresses-casual-outfits' },
        { id: 'everyday-casual-wear', name: 'Everyday casual wear', href: '/search?category=kids&subcategory=everyday-casual-wear' },
        { id: 'ethnic-festive-wear', name: 'Ethnic & festive wear', href: '/search?category=kids&subcategory=ethnic-festive-wear' },
      ]
    }
  ];


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchIconClick = () => {
    setIsSearchOpen(!isSearchOpen);
    // Close menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    if (!isSearchOpen) {
      // Focus on input when opening
      setTimeout(() => {
        const input = document.getElementById('mobile-search-input');
        if (input) input.focus();
      }, 100);
    }
  };

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="bg-gradient-to-r from-white via-blue-50/30 to-white backdrop-blur-md shadow-lg border-b border-blue-100/50 sticky top-0 z-40 md:shadow-xl md:border-blue-200/50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
            <Link to="/" className="flex items-center group relative">
              {/* Animated gradient background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10"></div>
              
              {/* Icon container with enhanced styling */}
              <div className="relative p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 transform md:group-active:scale-95">
                {/* Shine effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-xl sm:rounded-2xl"></div>
                {/* Icon - Larger on mobile for better visibility */}
                <ShoppingBag className="relative h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
              </div>
              
              {/* Logo text with enhanced styling - Better visibility on mobile */}
              <span className="ml-2 sm:ml-3 text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight drop-shadow-sm">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-600 transition-all duration-500 md:group-active:from-blue-500 md:group-active:via-purple-500 md:group-active:to-pink-500">
                  Cloth<span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Nest</span>
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Categories and Search */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            {/* Category Dropdowns */}
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => setActiveCategory(category.id)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <Link
                  to={category.href}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:scale-105 ${
                    category.id === 'men'
                      ? 'text-blue-700 hover:text-blue-800 hover:bg-blue-50/70'
                      : category.id === 'women'
                      ? 'text-pink-700 hover:text-pink-800 hover:bg-pink-50/70'
                      : 'text-green-700 hover:text-green-800 hover:bg-green-50/70'
                  }`}
                >
                  {category.name}
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                </Link>
                
                {/* Dropdown Menu */}
                {activeCategory === category.id && (
                  <div className={`absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 py-3 z-50 animate-in slide-in-from-top-2 duration-300 ${
                    category.id === 'men'
                      ? 'border-blue-200'
                      : category.id === 'women'
                      ? 'border-pink-200'
                      : 'border-green-200'
                  }`}>
                    <div className="grid grid-cols-2 gap-2 px-3">
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.href}
                          className={`px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-300 truncate hover:scale-105 ${
                            category.id === 'men'
                              ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-200'
                              : category.id === 'women'
                              ? 'text-gray-700 hover:bg-pink-50 hover:text-pink-700 border border-transparent hover:border-pink-200'
                              : 'text-gray-700 hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-200'
                          }`}
                          onClick={() => setActiveCategory(null)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-2.5 w-full rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <SearchIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </form>
          </div>

          {/* Right side navigation - About, Contact, Login/Logout */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {/* About and Contact Links */}
            {navigation.filter(item => item.name !== 'Home').map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 rounded-lg hover:bg-blue-50/50"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="hidden lg:inline">{user?.name || user?.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 font-semibold transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile menu button, search, and login */}
          <div className="md:hidden flex items-center gap-2">
            {/* Search Icon Button - Mobile Only */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchIconClick}
              className="h-10 w-10 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors relative"
            >
              <SearchIcon className="h-6 w-6 text-gray-700" />
              {isSearchOpen && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-blue-600 rounded-full animate-pulse"></span>
              )}
            </Button>
            
            {/* Login Button - Mobile Only */}
            {!isLoggedIn && (
              <Button
                onClick={() => navigate("/login")}
                size="sm"
                className="h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <LogIn className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs font-medium">Login</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                // Close search if open
                if (isSearchOpen) {
                  setIsSearchOpen(false);
                }
              }}
              className="h-10 w-10 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - Always visible when search icon is clicked */}
        {isSearchOpen && (
          <div className="md:hidden border-t border-blue-100/50 bg-gradient-to-r from-white via-blue-50/40 to-white backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
            <div className="px-3 py-3">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  id="mobile-search-input"
                  type="text"
                  placeholder="Search clothes, brands, shirts, dresses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-12 py-3 w-full rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white shadow-md transition-all duration-300 text-base"
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Search
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search for products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </form>

              {/* Mobile Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Categories with Subcategories */}
              {categories.map((category) => (
                <div key={category.id} className="border-t border-gray-200 mt-1 pt-1">
                  <button
                    onClick={() => setMobileActiveCategory(mobileActiveCategory === category.id ? null : category.id)}
                    className="w-full flex items-center justify-between text-gray-700 hover:text-blue-600 px-3 py-3 text-base font-medium"
                  >
                    <span>{category.name}</span>
                    <ChevronDown className={`h-5 w-5 transition-transform ${mobileActiveCategory === category.id ? 'rotate-180' : ''}`} />
                  </button>
                  {mobileActiveCategory === category.id && (
                    <div className="pl-4 pr-3 py-2 space-y-1 bg-gray-50">
                      <Link
                        to={category.href}
                        className="text-blue-600 hover:text-blue-700 block px-3 py-2.5 text-sm font-semibold border-b border-gray-200 mb-1"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMobileActiveCategory(null);
                        }}
                      >
                        View All {category.name} Products →
                      </Link>
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          to={sub.href}
                          className="text-gray-700 hover:text-blue-600 block px-3 py-2.5 text-sm transition-colors bg-white rounded-md hover:bg-blue-50"
                          onClick={() => {
                            setIsMenuOpen(false);
                            setMobileActiveCategory(null);
                          }}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile Login/Logout */}
              {isLoggedIn ? (
                <div className="border-t border-gray-200 mt-1 pt-1">
                  <div className="px-3 py-2 flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user?.name || user?.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full mt-2 mx-3 flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate("/login");
                    setIsMenuOpen(false);
                  }}
                  className="w-full mt-2 mx-3 flex items-center justify-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile top category bar with subcategories (always visible) */}
      <div className="md:hidden border-t border-blue-100/50 bg-gradient-to-r from-white via-blue-50/40 to-white backdrop-blur-sm sticky top-14 sm:top-16 z-30 shadow-md">
        <div className="py-2.5 sm:py-3">
          {/* Category Pills */}
          <div className="px-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-max pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setMobileActiveCategory(mobileActiveCategory === category.id ? null : category.id)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 sm:gap-2 shadow-md active:scale-95 ${
                    category.id === 'men'
                      ? mobileActiveCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                        : 'bg-white text-blue-700 active:bg-blue-50 border border-blue-200 hover:border-blue-300 hover:shadow-lg'
                      : category.id === 'women'
                      ? mobileActiveCategory === category.id
                        ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg scale-105'
                        : 'bg-white text-pink-700 active:bg-pink-50 border border-pink-200 hover:border-pink-300 hover:shadow-lg'
                      : mobileActiveCategory === category.id
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                        : 'bg-white text-green-700 active:bg-green-50 border border-green-200 hover:border-green-300 hover:shadow-lg'
                  }`}
                >
                  {category.name}
                  <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-300 ${mobileActiveCategory === category.id ? 'rotate-180' : ''}`} />
                </button>
              ))}
            </div>
          </div>
          
          {/* Active Category Subcategories */}
          {mobileActiveCategory && (
            <div className="px-2 mt-2.5 border-t border-blue-100/50 pt-3.5 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2.5">
                <Link
                  to={categories.find(c => c.id === mobileActiveCategory)?.href || '#'}
                  className={`block w-full px-4 py-3 rounded-xl text-sm font-bold text-center transition-all duration-300 active:scale-98 shadow-md hover:shadow-lg ${
                    mobileActiveCategory === 'men'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white active:from-blue-600 active:to-blue-700 border-2 border-blue-400'
                      : mobileActiveCategory === 'women'
                      ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white active:from-pink-600 active:to-pink-700 border-2 border-pink-400'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white active:from-green-600 active:to-green-700 border-2 border-green-400'
                  }`}
                  onClick={() => setMobileActiveCategory(null)}
                >
                  View All {categories.find(c => c.id === mobileActiveCategory)?.name} Products →
                </Link>
                <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pb-2">
                  {categories.find(c => c.id === mobileActiveCategory)?.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      to={sub.href}
                      className="px-3 py-3 rounded-xl text-xs font-semibold text-center bg-white text-gray-700 active:bg-gray-50 active:scale-95 transition-all duration-300 border-2 border-gray-200 hover:border-blue-400 hover:shadow-md shadow-sm"
                      onClick={() => setMobileActiveCategory(null)}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
