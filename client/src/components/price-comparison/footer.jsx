import { Link } from "react-router-dom";
import { ShoppingBag, Instagram, Mail, Phone, MapPin, TrendingUp, Star, Heart, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                  <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
              </div>
              <span className="ml-3 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PriceCompare
              </span>
            </div>
            <p className="text-gray-300 mb-6 text-sm sm:text-base leading-relaxed max-w-sm">
              Compare prices across multiple e-commerce platforms to find the best deals on clothing for men, women, and kids.
            </p>
            
            {/* Social Media */}
            <div className="flex items-center gap-4">
              <a 
                href="https://www.instagram.com/clothnest1/" 
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 bg-gray-800/50 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20"
              >
                <Instagram className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
              <a 
                href="mailto:info@clothnest.com" 
                className="group relative p-3 bg-gray-800/50 hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-600 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
              >
                <Mail className="h-5 w-5 text-gray-300 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Quick Links</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/search?category=men" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>Men's Clothing</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/search?category=women" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>Women's Clothing</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/search?category=kids" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>Kids' Clothing</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" />
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Support</span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>Contact</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy-policy" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms-of-service" 
                  className="group flex items-center gap-2 text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 text-sm sm:text-base"
                >
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                  <span>Terms of Service</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-6 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Stay Connected</span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300 text-sm sm:text-base">
                <div className="mt-1 p-1.5 bg-gray-800/50 rounded-lg">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-gray-400 text-xs sm:text-sm block mb-0.5">Email</span>
                  <a href="mailto:info@clothnest.com" className="hover:text-white transition-colors">
                    info@clothnest.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm sm:text-base">
                <div className="mt-1 p-1.5 bg-gray-800/50 rounded-lg">
                  <Phone className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <span className="text-gray-400 text-xs sm:text-sm block mb-0.5">Phone</span>
                  <a href="tel:+919876543210" className="hover:text-white transition-colors">
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm sm:text-base">
                <div className="mt-1 p-1.5 bg-gray-800/50 rounded-lg">
                  <MapPin className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <span className="text-gray-400 text-xs sm:text-sm block mb-0.5">Location</span>
                  <span>India</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-gray-700/50 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-sm sm:text-base">
                © {new Date().getFullYear()} <span className="font-semibold text-white">ClothNest</span>. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                <span className="text-gray-500">Powered by:</span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-1 bg-gray-800/50 rounded-md text-gray-300 hover:text-white transition-colors cursor-pointer">Amazon</span>
                  <span className="px-2 py-1 bg-gray-800/50 rounded-md text-gray-300 hover:text-white transition-colors cursor-pointer">Flipkart</span>
                  <span className="px-2 py-1 bg-gray-800/50 rounded-md text-gray-300 hover:text-white transition-colors cursor-pointer">Myntra</span>
                  <span className="text-gray-500">+ more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

