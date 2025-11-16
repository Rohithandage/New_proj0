import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Plus, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign,
  Settings,
  LogOut,
  ShoppingBag,
  Globe,
  MousePointerClick,
  MapPin,
  Sparkles,
  BarChart3,
  Activity,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import apiConfig from "@/config/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalPlatforms: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [affiliateStats, setAffiliateStats] = useState({
    totalClicks: 0,
    clicksByCountry: [],
    clicksByWebsite: [],
    clicksByProduct: [],
    recentClicks: []
  });
  const [affiliateLoading, setAffiliateLoading] = useState(true);
  const [statsDays, setStatsDays] = useState('30');

  useEffect(() => {
    // Get user from localStorage or session
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchStats();
    fetchAffiliateStats();
  }, [statsDays]);

  const fetchStats = async () => {
    try {
      // Fetch all products
      const allProducts = await axios.get(`${apiConfig.PRICE_COMPARISON}/search?limit=1000`);

      setStats({
        totalProducts: allProducts.data.data?.length || allProducts.data.count || 0,
        totalPlatforms: 6, // Amazon, Flipkart, Myntra, Ajio, Nykaa, Meesho
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAffiliateStats = async () => {
    try {
      setAffiliateLoading(true);
      const response = await axios.get(`${apiConfig.PRICE_COMPARISON}/affiliate-stats?days=${statsDays}`);
      
      if (response.data.success) {
        setAffiliateStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching affiliate stats:", error);
    } finally {
      setAffiliateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const quickActions = [
    {
      title: "Add New Product",
      description: "Add a new product with affiliate links",
      icon: <Plus className="h-6 w-6" />,
      href: "/admin/add-product",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View All Products",
      description: "Browse and manage all products",
      icon: <Package className="h-6 w-6" />,
      href: "/admin/products",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "API Management",
      description: "Manage affiliate API configurations",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/api-management",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      title: "Web Scraping",
      description: "Manage automated price scraping tasks",
      icon: <Activity className="h-6 w-6" />,
      href: "/admin/web-scraping",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      title: "Settings",
      description: "Configure admin settings",
      icon: <Settings className="h-6 w-6" />,
      href: "/admin/settings",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Manage products and settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{user.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user.email || 'admin@example.com'}</p>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-gray-700">
                Total Products
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-2">
                {loading ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  stats.totalProducts.toLocaleString()
                )}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Products in database
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                Active listings
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-gray-700">
                E-commerce Platforms
              </CardTitle>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl md:text-4xl font-extrabold text-purple-600 mb-2">
                {stats.totalPlatforms}
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Platforms integrated
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 font-semibold">
                <Activity className="h-3 w-3" />
                All active
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.href}>
                <Card className="border-0 shadow-lg bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full group">
                  <CardHeader className="pb-4">
                    <div className={`${action.color} text-white rounded-xl p-4 w-fit mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {action.icon}
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                      <span>Go to page</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Affiliate Click Statistics */}
        <div className="mb-8">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-white via-green-50/30 to-emerald-50/20">
            <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Affiliate Click Statistics</h2>
                    <p className="text-sm text-gray-600 mt-1">Track user engagement and clicks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">Period:</span>
                  <Select value={statsDays} onValueChange={setStatsDays}>
                    <SelectTrigger className="w-[140px] h-10 border-2 border-green-200 focus:border-green-500 rounded-xl shadow-sm font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">

              {affiliateLoading ? (
                <div className="p-12 text-center">
                  <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
                  <p className="text-gray-600 font-semibold text-lg">Loading statistics...</p>
                </div>
              ) : (
                <>
                  {/* Total Clicks Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base font-bold text-gray-700">
                          Total Clicks
                        </CardTitle>
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                          <MousePointerClick className="h-5 w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-2">
                          {affiliateStats.totalClicks.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Affiliate link clicks
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base font-bold text-gray-700">
                          Countries
                        </CardTitle>
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                          <Globe className="h-5 w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl md:text-4xl font-extrabold text-green-600 mb-2">
                          {affiliateStats.clicksByCountry.length}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Unique countries
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base font-bold text-gray-700">
                          Platforms
                        </CardTitle>
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                          <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl md:text-4xl font-extrabold text-purple-600 mb-2">
                          {affiliateStats.clicksByWebsite.length}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          E-commerce platforms
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Clicks by Country */}
                  {affiliateStats.clicksByCountry.length > 0 && (
                    <Card className="mb-6 border-0 shadow-lg bg-white hover:shadow-xl transition-all">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          Clicks by Country
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {affiliateStats.clicksByCountry.slice(0, 10).map((item, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                                  <Badge variant="outline" className="font-mono text-xs font-bold bg-blue-50 border-blue-300">
                                    {item.countryCode || 'N/A'}
                                  </Badge>
                                </div>
                                <span className="font-bold text-gray-800 text-base">{item._id}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl md:text-3xl font-extrabold text-blue-600">{item.count.toLocaleString()}</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-bold">
                                  {((item.count / affiliateStats.totalClicks) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Clicks by Website */}
                  {affiliateStats.clicksByWebsite.length > 0 && (
                    <Card className="mb-6 border-0 shadow-lg bg-white hover:shadow-xl transition-all">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
                            <ShoppingBag className="h-5 w-5 text-white" />
                          </div>
                          Clicks by Website
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {affiliateStats.clicksByWebsite.map((item, index) => (
                            <div 
                              key={index} 
                              className="p-4 bg-gradient-to-br from-white to-purple-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all group"
                            >
                              <div className="flex flex-col items-center justify-center gap-2">
                                <span className="font-bold text-gray-800 capitalize text-base group-hover:text-purple-600 transition-colors">
                                  {item._id}
                                </span>
                                <span className="text-2xl md:text-3xl font-extrabold text-purple-600">
                                  {item.count.toLocaleString()}
                                </span>
                                {affiliateStats.totalClicks > 0 && (
                                  <span className="text-xs text-gray-500 font-semibold">
                                    {((item.count / affiliateStats.totalClicks) * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Products */}
                  {affiliateStats.clicksByProduct.length > 0 && (
                    <Card className="mb-6 border-0 shadow-lg bg-white hover:shadow-xl transition-all">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
                        <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-800">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          Top Products
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          {affiliateStats.clicksByProduct.map((item, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all group"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                                  {index + 1}
                                </div>
                                <span className="text-sm md:text-base font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                                  {item.productName}
                                </span>
                              </div>
                              <Badge className="ml-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold shadow-md text-sm">
                                {item.count.toLocaleString()} clicks
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

