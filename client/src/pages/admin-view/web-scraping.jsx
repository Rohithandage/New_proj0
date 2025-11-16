import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Trash2,
  Plus,
  RefreshCw,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Package,
  Globe,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  Users,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import apiConfig from "@/config/api";

const WebScraping = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [scrapingResults, setScrapingResults] = useState(null);
  const [scrapingAll, setScrapingAll] = useState(false);
  const [filter, setFilter] = useState({ status: "all", platform: "all" });
  const [formData, setFormData] = useState({
    productId: "",
    affiliateUrl: "",
    platform: "",
    taskType: "all"
  });
  const [bulkFormData, setBulkFormData] = useState({
    platform: "",
    taskType: "all"
  });
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  useEffect(() => {
    if (dialogOpen && formData.productId === "") {
      fetchProducts();
    }
  }, [dialogOpen]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const params = {};
      if (filter.status !== "all") params.status = filter.status;
      if (filter.platform !== "all") params.platform = filter.platform;

      const response = await axios.get(`${apiConfig.WEB_SCRAPING}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching scraping tasks:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch scraping tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await axios.get(`${apiConfig.PRICE_COMPARISON}/search?limit=1000`);

      if (response.data.success || response.data.data) {
        const productsList = response.data.data || [];
        setProducts(productsList);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setProductsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${apiConfig.WEB_SCRAPING}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Scraping task created successfully!"
        });
        setDialogOpen(false);
        resetForm();
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create scraping task",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${apiConfig.WEB_SCRAPING}/bulk/create`,
        bulkFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Created ${response.data.count} scraping tasks for ${bulkFormData.platform}!`
        });
        setBulkDialogOpen(false);
        setBulkFormData({ platform: "", taskType: "all" });
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create bulk scraping tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScrapeAll = async () => {
    if (!confirm("Are you sure you want to scrape all products? This may take a few minutes.")) {
      return;
    }

    setScrapingAll(true);
    setResultsDialogOpen(true);
    setScrapingResults(null);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${apiConfig.WEB_SCRAPING}/bulk/execute`,
        { taskType: "all" },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setScrapingResults(response.data);
        toast({
          title: "Scraping Complete",
          description: response.data.message
        });
        fetchTasks(); // Refresh tasks list
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to scrape products",
        variant: "destructive"
      });
      setResultsDialogOpen(false);
    } finally {
      setScrapingAll(false);
    }
  };

  const handleExecute = async (id) => {
    setExecuting({ ...executing, [id]: true });

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${apiConfig.WEB_SCRAPING}/${id}/execute`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Scraping task executed successfully!"
        });
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to execute scraping task",
        variant: "destructive"
      });
    } finally {
      setExecuting({ ...executing, [id]: false });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this scraping task?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(
        `${apiConfig.WEB_SCRAPING}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Scraping task deleted successfully!"
        });
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete scraping task",
        variant: "destructive"
      });
    }
  };

  const handleProductSelect = (productId) => {
    const product = products.find((p) => p._id === productId);
    if (product) {
      // Find the first price entry with an affiliate URL
      const priceWithUrl = product.prices?.find((p) => p.url);
      if (priceWithUrl) {
        setFormData({
          ...formData,
          productId: productId,
          affiliateUrl: priceWithUrl.url,
          platform: priceWithUrl.website
        });
      } else {
        setFormData({
          ...formData,
          productId: productId,
          affiliateUrl: "",
          platform: ""
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      productId: "",
      affiliateUrl: "",
      platform: "",
      taskType: "all"
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
      running: "bg-blue-100 text-blue-700 border-blue-300",
      completed: "bg-green-100 text-green-700 border-green-300",
      failed: "bg-red-100 text-red-700 border-red-300"
    };
    return badges[status] || badges.pending;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getPlatformColor = (platform) => {
    const colors = {
      amazon: "bg-orange-100 text-orange-700 border-orange-300",
      flipkart: "bg-blue-100 text-blue-700 border-blue-300",
      myntra: "bg-pink-100 text-pink-700 border-pink-300",
      ajio: "bg-purple-100 text-purple-700 border-purple-300",
      nykaa: "bg-rose-100 text-rose-700 border-rose-300",
      meesho: "bg-green-100 text-green-700 border-green-300"
    };
    return colors[platform] || "bg-gray-100 text-gray-700 border-gray-300";
  };

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
                  Web Scraping
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Manage product price scraping tasks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/dashboard")}
                className="border-2 border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold"
              >
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-2 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 font-semibold"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Actions */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Scraping Tasks</h2>
            <p className="text-gray-600 mt-1">Monitor and manage automated price scraping</p>
          </div>
          <div className="flex gap-3">
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setBulkFormData({ platform: "", taskType: "all" })}
                  className="border-2 border-purple-200 hover:bg-purple-50 text-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Bulk Create
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Create Scraping Tasks</DialogTitle>
                  <DialogDescription>
                    Create scraping tasks for all products on a platform
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBulkSubmit} className="space-y-4">
                  <div>
                    <Label>Platform *</Label>
                    <Select
                      value={bulkFormData.platform}
                      onValueChange={(value) =>
                        setBulkFormData({ ...bulkFormData, platform: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="flipkart">Flipkart</SelectItem>
                        <SelectItem value="myntra">Myntra</SelectItem>
                        <SelectItem value="ajio">Ajio</SelectItem>
                        <SelectItem value="nykaa">Nykaa</SelectItem>
                        <SelectItem value="meesho">Meesho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Task Type *</Label>
                    <Select
                      value={bulkFormData.taskType}
                      onValueChange={(value) =>
                        setBulkFormData({ ...bulkFormData, taskType: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price Only</SelectItem>
                        <SelectItem value="review">Review Only</SelectItem>
                        <SelectItem value="availability">Availability Only</SelectItem>
                        <SelectItem value="all">All (Price, Review, Availability)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setBulkDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      Create Tasks
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Scraping Task</DialogTitle>
                  <DialogDescription>
                    Create a new task to scrape product data from an affiliate link
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Product *</Label>
                    <Select
                      value={formData.productId}
                      onValueChange={(value) => {
                        handleProductSelect(value);
                      }}
                      required
                      disabled={productsLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {productsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading products...
                          </SelectItem>
                        ) : (
                          products.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Affiliate URL *</Label>
                    <Input
                      value={formData.affiliateUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, affiliateUrl: e.target.value })
                      }
                      placeholder="https://amazon.in/affiliate-link"
                      required
                    />
                  </div>

                  <div>
                    <Label>Platform *</Label>
                    <Select
                      value={formData.platform}
                      onValueChange={(value) =>
                        setFormData({ ...formData, platform: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="flipkart">Flipkart</SelectItem>
                        <SelectItem value="myntra">Myntra</SelectItem>
                        <SelectItem value="ajio">Ajio</SelectItem>
                        <SelectItem value="nykaa">Nykaa</SelectItem>
                        <SelectItem value="meesho">Meesho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Task Type *</Label>
                    <Select
                      value={formData.taskType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, taskType: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price Only</SelectItem>
                        <SelectItem value="review">Review Only</SelectItem>
                        <SelectItem value="availability">Availability Only</SelectItem>
                        <SelectItem value="all">All (Price, Review, Availability)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      Create Task
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ ...filter, status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filter.platform}
            onValueChange={(value) => setFilter({ ...filter, platform: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="amazon">Amazon</SelectItem>
              <SelectItem value="flipkart">Flipkart</SelectItem>
              <SelectItem value="myntra">Myntra</SelectItem>
              <SelectItem value="ajio">Ajio</SelectItem>
              <SelectItem value="nykaa">Nykaa</SelectItem>
              <SelectItem value="meesho">Meesho</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={fetchTasks}
            className="border-2 border-blue-200 hover:bg-blue-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 font-semibold">Loading scraping tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Scraping Tasks</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first scraping task</p>
              <Button
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task._id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-lg font-bold">
                          {task.productId?.name || "Product"}
                        </CardTitle>
                        {getStatusIcon(task.status)}
                        <Badge className={getStatusBadge(task.status)}>
                          {task.status}
                        </Badge>
                        <Badge className={getPlatformColor(task.platform)}>
                          {task.platform}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {task.taskType}
                        </Badge>
                        {task.executionTime > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {task.executionTime}ms
                          </Badge>
                        )}
                        {task.completedAt && (
                          <Badge variant="outline" className="text-xs">
                            {new Date(task.completedAt).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleExecute(task._id)}
                          disabled={executing[task._id]}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-3 w-3 mr-1" />
                          {executing[task._id] ? "Executing..." : "Execute"}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {task.result && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      {task.result.price !== null && task.result.price !== undefined && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <div className="text-xs text-gray-600">Price</div>
                            <div className="font-bold text-green-600">
                              ₹{task.result.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                      {task.result.rating !== null && task.result.rating !== undefined && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-600" />
                          <div>
                            <div className="text-xs text-gray-600">Rating</div>
                            <div className="font-bold text-yellow-600">
                              {task.result.rating.toFixed(1)} ⭐
                            </div>
                          </div>
                        </div>
                      )}
                      {task.result.reviews !== null && task.result.reviews !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <div>
                            <div className="text-xs text-gray-600">Reviews</div>
                            <div className="font-bold text-blue-600">
                              {task.result.reviews.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                      {task.result.inStock !== null && task.result.inStock !== undefined && (
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-purple-600" />
                          <div>
                            <div className="text-xs text-gray-600">Stock</div>
                            <div className="font-bold text-purple-600">
                              {task.result.inStock ? "In Stock" : "Out of Stock"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {task.changes && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-sm mb-2">Changes Detected:</div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {task.changes.priceChanged && (
                          <div className="flex items-center gap-2">
                            {task.changes.priceDifference > 0 ? (
                              <TrendingUp className="h-4 w-4 text-red-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-green-600" />
                            )}
                            <span className="font-semibold">
                              Price changed: ₹{Math.abs(task.changes.priceDifference).toFixed(2)}
                            </span>
                          </div>
                        )}
                        {task.changes.reviewChanged && (
                          <Badge className="bg-blue-100 text-blue-700">Reviews Updated</Badge>
                        )}
                        {task.changes.stockChanged && (
                          <Badge className="bg-purple-100 text-purple-700">Stock Changed</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {task.error && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="font-semibold text-sm text-red-700 mb-1">Error:</div>
                    <div className="text-sm text-red-600">{task.error.message}</div>
                  </div>
                  )}

                  <div className="text-xs text-gray-500 mt-2">
                    URL: <span className="truncate block">{task.affiliateUrl}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results Dialog */}
        <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Scraping Results</DialogTitle>
              <DialogDescription>
                {scrapingResults
                  ? `Scraping completed: ${scrapingResults.summary?.updated || 0} products updated, ${scrapingResults.summary?.errors || 0} errors`
                  : "Scraping in progress..."}
              </DialogDescription>
            </DialogHeader>

            {scrapingAll && !scrapingResults && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700">Scraping all products...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
              </div>
            )}

            {scrapingResults && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {scrapingResults.summary?.total || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Total Scraped</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {scrapingResults.summary?.updated || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Products Updated</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {scrapingResults.summary?.unchanged || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Unchanged</div>
                    </CardContent>
                  </Card>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {scrapingResults.summary?.errors || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Errors</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-gray-900">Product Updates</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {scrapingResults.data?.map((result, index) => (
                      <Card
                        key={index}
                        className={`border-2 ${
                          result.updated
                            ? "border-green-300 bg-green-50"
                            : result.error
                            ? "border-red-300 bg-red-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 text-base mb-1">
                                {result.productName}
                              </h4>
                              <div className="flex gap-2 flex-wrap">
                                <Badge className={getPlatformColor(result.platform)}>
                                  {result.platform}
                                </Badge>
                                {result.updated && (
                                  <Badge className="bg-green-100 text-green-700 border-green-300">
                                    Updated
                                  </Badge>
                                )}
                                {result.changed && (
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                                    Changed
                                  </Badge>
                                )}
                                {result.error && (
                                  <Badge className="bg-red-100 text-red-700 border-red-300">
                                    Error
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {result.error ? (
                            <div className="p-3 bg-red-100 rounded-lg border border-red-300">
                              <p className="text-sm text-red-700 font-semibold">
                                Error: {result.error.message}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {/* Comparison Table */}
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                                        Field
                                      </th>
                                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 bg-red-50">
                                        Previous
                                      </th>
                                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 bg-green-50">
                                        Updated
                                      </th>
                                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-700 bg-blue-50">
                                        Change
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {/* Price Row */}
                                    {(result.previous?.price || result.current?.price) && (
                                      <tr className={result.changes?.priceChanged ? "bg-yellow-50" : ""}>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-sm text-gray-700">
                                          Price
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.previous?.price ? (
                                            <span className="font-bold text-gray-900">
                                              ₹{result.previous.price.toLocaleString()}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.current?.price !== null &&
                                          result.current?.price !== undefined ? (
                                            <span
                                              className={`font-bold ${
                                                result.changes?.priceChanged
                                                  ? result.changes.priceDifference > 0
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                                  : "text-gray-900"
                                              }`}
                                            >
                                              ₹{result.current.price.toLocaleString()}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.changes?.priceChanged ? (
                                            <div className="flex items-center justify-center gap-1">
                                              {result.changes.priceDifference > 0 ? (
                                                <>
                                                  <TrendingUp className="h-4 w-4 text-red-600" />
                                                  <span className="font-bold text-red-600">
                                                    +₹{Math.abs(result.changes.priceDifference).toFixed(2)}
                                                  </span>
                                                </>
                                              ) : (
                                                <>
                                                  <TrendingDown className="h-4 w-4 text-green-600" />
                                                  <span className="font-bold text-green-600">
                                                    -₹{Math.abs(result.changes.priceDifference).toFixed(2)}
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-gray-400">No change</span>
                                          )}
                                        </td>
                                      </tr>
                                    )}

                                    {/* Original Price Row */}
                                    {(result.previous?.originalPrice || result.current?.originalPrice) && (
                                      <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-sm text-gray-700">
                                          Original Price (MRP)
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.previous?.originalPrice ? (
                                            <span className="font-bold text-gray-900">
                                              ₹{result.previous.originalPrice.toLocaleString()}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.current?.originalPrice !== null &&
                                          result.current?.originalPrice !== undefined ? (
                                            <span className="font-bold text-gray-900">
                                              ₹{result.current.originalPrice.toLocaleString()}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          <span className="text-gray-400">-</span>
                                        </td>
                                      </tr>
                                    )}

                                    {/* Discount Row */}
                                    {(result.previous?.discount || result.current?.discount) && (
                                      <tr>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-sm text-gray-700">
                                          Discount
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.previous?.discount ? (
                                            <span className="font-bold text-gray-900">
                                              {result.previous.discount}%
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.current?.discount !== null &&
                                          result.current?.discount !== undefined ? (
                                            <span className="font-bold text-gray-900">
                                              {result.current.discount}%
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          <span className="text-gray-400">-</span>
                                        </td>
                                      </tr>
                                    )}

                                    {/* Rating Row */}
                                    {(result.previous?.rating || result.current?.rating) && (
                                      <tr className={result.changes?.ratingChanged ? "bg-yellow-50" : ""}>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-sm text-gray-700">
                                          Rating
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.previous?.rating ? (
                                            <span className="font-bold text-gray-900">
                                              {result.previous.rating.toFixed(1)} ⭐
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.current?.rating !== null &&
                                          result.current?.rating !== undefined ? (
                                            <span
                                              className={`font-bold ${
                                                result.changes?.ratingChanged
                                                  ? "text-blue-600"
                                                  : "text-gray-900"
                                              }`}
                                            >
                                              {result.current.rating.toFixed(1)} ⭐
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.changes?.ratingChanged ? (
                                            <span className="font-bold text-blue-600">
                                              Changed
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">No change</span>
                                          )}
                                        </td>
                                      </tr>
                                    )}

                                    {/* Reviews Row */}
                                    {(result.previous?.reviews || result.current?.reviews) && (
                                      <tr className={result.changes?.reviewChanged ? "bg-yellow-50" : ""}>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-sm text-gray-700">
                                          Reviews
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.previous?.reviews ? (
                                            <span className="font-bold text-gray-900">
                                              {result.previous.reviews.toLocaleString()}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.current?.reviews !== null &&
                                          result.current?.reviews !== undefined ? (
                                            <span
                                              className={`font-bold ${
                                                result.changes?.reviewChanged
                                                  ? "text-blue-600"
                                                  : "text-gray-900"
                                              }`}
                                            >
                                              {result.current.reviews.toLocaleString()}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.changes?.reviewChanged ? (
                                            <div className="flex items-center justify-center gap-1">
                                              {result.current?.reviews > result.previous?.reviews ? (
                                                <>
                                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                                  <span className="font-bold text-green-600">
                                                    +{(result.current.reviews - result.previous.reviews).toLocaleString()}
                                                  </span>
                                                </>
                                              ) : (
                                                <>
                                                  <TrendingDown className="h-4 w-4 text-red-600" />
                                                  <span className="font-bold text-red-600">
                                                    {(result.current.reviews - result.previous.reviews).toLocaleString()}
                                                  </span>
                                                </>
                                              )}
                                            </div>
                                          ) : (
                                            <span className="text-gray-400">No change</span>
                                          )}
                                        </td>
                                      </tr>
                                    )}

                                    {/* Stock Status Row */}
                                    {(result.previous?.inStock !== undefined ||
                                      result.current?.inStock !== undefined) && (
                                      <tr className={result.changes?.stockChanged ? "bg-yellow-50" : ""}>
                                        <td className="border border-gray-300 px-4 py-2 font-medium text-sm text-gray-700">
                                          Stock Status
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.previous?.inStock !== undefined ? (
                                            <span
                                              className={`font-bold ${
                                                result.previous.inStock
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                              }`}
                                            >
                                              {result.previous.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.current?.inStock !== null &&
                                          result.current?.inStock !== undefined ? (
                                            <span
                                              className={`font-bold ${
                                                result.current.inStock
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                              }`}
                                            >
                                              {result.current.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">N/A</span>
                                          )}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center text-sm">
                                          {result.changes?.stockChanged ? (
                                            <span className="font-bold text-orange-600">
                                              Status Changed
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">No change</span>
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Changes Summary */}
                          {result.changes && result.changed && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="text-xs font-semibold text-yellow-700 mb-1">
                                Changes Detected:
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {result.changes.priceChanged && (
                                  <Badge className="bg-yellow-100 text-yellow-700">
                                    Price {result.changes.priceDifference > 0 ? "↑" : "↓"} ₹
                                    {Math.abs(result.changes.priceDifference).toFixed(2)}
                                  </Badge>
                                )}
                                {result.changes.reviewChanged && (
                                  <Badge className="bg-blue-100 text-blue-700">
                                    Reviews Updated
                                  </Badge>
                                )}
                                {result.changes.ratingChanged && (
                                  <Badge className="bg-purple-100 text-purple-700">
                                    Rating Changed
                                  </Badge>
                                )}
                                {result.changes.stockChanged && (
                                  <Badge className="bg-orange-100 text-orange-700">
                                    Stock Changed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WebScraping;

