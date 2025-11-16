import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Edit,
  TestTube,
  Settings,
  LogOut,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Key,
  Link as LinkIcon,
  AlertCircle
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

const ApiManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    platform: "",
    apiKey: "",
    secretKey: "",
    accessToken: "",
    associateTag: "",
    endpoint: "",
    isActive: true
  });

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${apiConfig.API_MANAGEMENT}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setConfigs(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching API configs:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch API configurations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const url = editingConfig
        ? `${apiConfig.API_MANAGEMENT}/${editingConfig._id}`
        : `${apiConfig.API_MANAGEMENT}`;

      const method = editingConfig ? "put" : "post";

      const response = await axios[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: editingConfig
            ? "API configuration updated successfully!"
            : "API configuration created successfully!"
        });
        setDialogOpen(false);
        resetForm();
        fetchConfigs();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save API configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this API configuration?")) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(`${apiConfig.API_MANAGEMENT}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "API configuration deleted successfully!"
        });
        fetchConfigs();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete API configuration",
        variant: "destructive"
      });
    }
  };

  const handleTest = async (id) => {
    setTesting({ ...testing, [id]: true });

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        `${apiConfig.API_MANAGEMENT}/${id}/test`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Test Result",
          description: response.data.message,
          variant: response.data.data.testStatus === "success" ? "default" : "destructive"
        });
        fetchConfigs();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Test failed",
        variant: "destructive"
      });
    } finally {
      setTesting({ ...testing, [id]: false });
    }
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setFormData({
      name: config.name || "",
      platform: config.platform || "",
      apiKey: config.apiKey || "",
      secretKey: config.secretKey || "",
      accessToken: config.accessToken || "",
      associateTag: config.associateTag || "",
      endpoint: config.endpoint || "",
      isActive: config.isActive !== false
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      platform: "",
      apiKey: "",
      secretKey: "",
      accessToken: "",
      associateTag: "",
      endpoint: "",
      isActive: true
    });
    setEditingConfig(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    navigate("/");
  };

  const getPlatformColor = (platform) => {
    const colors = {
      amazon: "bg-orange-100 text-orange-700 border-orange-300",
      flipkart: "bg-blue-100 text-blue-700 border-blue-300",
      myntra: "bg-pink-100 text-pink-700 border-pink-300",
      ajio: "bg-purple-100 text-purple-700 border-purple-300",
      nykaa: "bg-rose-100 text-rose-700 border-rose-300",
      meesho: "bg-green-100 text-green-700 border-green-300",
      other: "bg-gray-100 text-gray-700 border-gray-300"
    };
    return colors[platform] || colors.other;
  };

  const getStatusIcon = (testStatus) => {
    switch (testStatus) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
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
                  API Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                  Manage affiliate API configurations
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
        {/* Add New Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">API Configurations</h2>
            <p className="text-gray-600 mt-1">Manage affiliate API credentials and settings</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New API
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingConfig ? "Edit API Configuration" : "Add New API Configuration"}
                </DialogTitle>
                <DialogDescription>
                  Configure affiliate API credentials for e-commerce platforms
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Configuration Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Amazon India API"
                    required
                  />
                </div>

                <div>
                  <Label>Platform *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
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
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Enter API key"
                  />
                </div>

                <div>
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    value={formData.secretKey}
                    onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                    placeholder="Enter secret key"
                  />
                </div>

                <div>
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="Enter access token"
                  />
                </div>

                <div>
                  <Label>Associate Tag</Label>
                  <Input
                    value={formData.associateTag}
                    onChange={(e) => setFormData({ ...formData, associateTag: e.target.value })}
                    placeholder="Enter associate tag"
                  />
                </div>

                <div>
                  <Label>API Endpoint</Label>
                  <Input
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="https://api.example.com/v1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive">Active</Label>
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
                    {editingConfig ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Configs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 font-semibold">Loading API configurations...</p>
          </div>
        ) : configs.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No API Configurations</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first API configuration</p>
              <Button
                onClick={() => {
                  resetForm();
                  setDialogOpen(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New API
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configs.map((config) => (
              <Card key={config._id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold">{config.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getPlatformColor(config.platform)}>
                          {config.platform}
                        </Badge>
                        {config.isActive ? (
                          <Badge className="bg-green-100 text-green-700 border-green-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {config.lastTested && getStatusIcon(config.testStatus)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {config.endpoint && (
                      <div className="flex items-start gap-2 text-sm">
                        <LinkIcon className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span className="text-gray-600 truncate">{config.endpoint}</span>
                      </div>
                    )}
                    {config.lastTested && (
                      <div className="text-xs text-gray-500">
                        Last tested: {new Date(config.lastTested).toLocaleDateString()}
                      </div>
                    )}
                    {config.testMessage && (
                      <div className="text-xs p-2 rounded bg-gray-50">
                        {config.testMessage}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTest(config._id)}
                      disabled={testing[config._id]}
                      className="flex-1"
                    >
                      <TestTube className="h-3 w-3 mr-1" />
                      {testing[config._id] ? "Testing..." : "Test"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(config)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(config._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiManagement;

