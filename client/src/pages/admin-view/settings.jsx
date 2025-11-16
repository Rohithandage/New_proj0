import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Save,
  User,
  Mail,
  Lock,
  Globe,
  Database,
  Shield,
  Bell,
  Palette,
  DollarSign,
  Plus,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import apiConfig from "@/config/api";
import { getAvailableCountries, getAvailableCurrencies } from "@/lib/currency-utils";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [settings, setSettings] = useState({
    // Admin Account Settings
    adminName: "",
    adminEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    
    // Application Settings
    siteName: "Price Compare",
    siteDescription: "Compare prices across multiple platforms",
    maintenanceMode: false,
    
    // Notification Settings
    emailNotifications: true,
    productAlerts: true,
    priceUpdateNotifications: true,
    
    // Display Settings
    productsPerPage: 20,
    enableFeaturedProducts: true,
    enableAlerts: true,
    
    // Security Settings
    requirePasswordReset: false,
    sessionTimeout: 30, // minutes
    
    // Currency Settings
    countryCurrencySettings: {}, // { countryCode: { currency: 'USD', exchangeRate: 0.012 } }
  });
  
  const [availableCountries, setAvailableCountries] = useState([]);
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  useEffect(() => {
    loadSettings();
    // Load available countries and currencies
    setAvailableCountries(getAvailableCountries());
    setAvailableCurrencies(getAvailableCurrencies());
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const userData = localStorage.getItem('adminUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }

      // Load settings from backend
      const response = await axios.get(`${apiConfig.BASE_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        const loadedSettings = response.data.data;
        const parsedUser = userData ? JSON.parse(userData) : null;
        setSettings(prev => ({
          ...prev,
          adminName: loadedSettings.adminName || parsedUser?.name || "",
          adminEmail: loadedSettings.adminEmail || parsedUser?.email || "",
          siteName: loadedSettings.siteName || "Price Compare",
          siteDescription: loadedSettings.siteDescription || "Compare prices across multiple platforms",
          maintenanceMode: loadedSettings.maintenanceMode || false,
          productsPerPage: loadedSettings.productsPerPage || 20,
          enableFeaturedProducts: loadedSettings.enableFeaturedProducts !== undefined ? loadedSettings.enableFeaturedProducts : true,
          enableAlerts: loadedSettings.enableAlerts !== undefined ? loadedSettings.enableAlerts : true,
          emailNotifications: loadedSettings.emailNotifications !== undefined ? loadedSettings.emailNotifications : true,
          productAlerts: loadedSettings.productAlerts !== undefined ? loadedSettings.productAlerts : true,
          priceUpdateNotifications: loadedSettings.priceUpdateNotifications !== undefined ? loadedSettings.priceUpdateNotifications : true,
          requirePasswordReset: loadedSettings.requirePasswordReset || false,
          sessionTimeout: loadedSettings.sessionTimeout || 30,
          countryCurrencySettings: loadedSettings.countryCurrencySettings || {},
        }));
        
        // Load currency settings
        if (loadedSettings.countryCurrencySettings) {
          const currencySettings = loadedSettings.countryCurrencySettings;
          setSelectedCountries(Object.keys(currencySettings).map(countryCode => ({
            countryCode,
            currency: currencySettings[countryCode].currency,
            exchangeRate: currencySettings[countryCode].exchangeRate || 1,
            exchangeRateManuallySet: true
          })));
        }
      }
      
      // Also load currency settings separately
      try {
        const currencyResponse = await axios.get(`${apiConfig.BASE_URL}/api/settings/currency`);
        if (currencyResponse.data.success && currencyResponse.data.data) {
          const currencySettings = currencyResponse.data.data;
          setSettings(prev => ({
            ...prev,
            countryCurrencySettings: currencySettings
          }));
          setSelectedCountries(Object.keys(currencySettings).map(countryCode => ({
            countryCode,
            currency: currencySettings[countryCode].currency,
            exchangeRate: currencySettings[countryCode].exchangeRate || 1,
            exchangeRateManuallySet: true
          })));
        }
      } catch (error) {
        console.log('Currency settings not loaded yet:', error);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      // If settings don't exist, use defaults from user data
      const userData = localStorage.getItem('adminUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setSettings(prev => ({
          ...prev,
          adminName: parsedUser.name || "",
          adminEmail: parsedUser.email || "",
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAccountSettings = async () => {
    // Validate password fields if password change is requested
    if (settings.newPassword) {
      if (settings.newPassword.length < 6) {
        toast({
          title: "Error",
          description: "New password must be at least 6 characters long",
          variant: "destructive",
        });
        return;
      }
      if (settings.newPassword !== settings.confirmPassword) {
        toast({
          title: "Error",
          description: "New password and confirm password do not match",
          variant: "destructive",
        });
        return;
      }
    }

    setSaving(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(
        `${apiConfig.BASE_URL}/api/settings/account`,
        {
          adminName: settings.adminName,
          adminEmail: settings.adminEmail,
          currentPassword: settings.currentPassword || undefined,
          newPassword: settings.newPassword || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      if (response.data.success) {
        // Update localStorage with new user data
        if (response.data.data.user) {
          localStorage.setItem('adminUser', JSON.stringify(response.data.data.user));
          setUser(response.data.data.user);
        }

        // Clear password fields
        setSettings(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));

        toast({
          title: "Success",
          description: "Account settings saved successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save account settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveApplicationSettings = async () => {
    setSaving(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(
        `${apiConfig.BASE_URL}/api/settings/application`,
        {
          siteName: settings.siteName,
          siteDescription: settings.siteDescription,
          maintenanceMode: settings.maintenanceMode,
          productsPerPage: settings.productsPerPage,
          enableFeaturedProducts: settings.enableFeaturedProducts,
          enableAlerts: settings.enableAlerts,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Application settings saved successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save application settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationSettings = async () => {
    setSaving(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(
        `${apiConfig.BASE_URL}/api/settings/notifications`,
        {
          emailNotifications: settings.emailNotifications,
          productAlerts: settings.productAlerts,
          priceUpdateNotifications: settings.priceUpdateNotifications,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Notification settings saved successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    setSaving(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.put(
        `${apiConfig.BASE_URL}/api/settings/security`,
        {
          requirePasswordReset: settings.requirePasswordReset,
          sessionTimeout: settings.sessionTimeout,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Security settings saved successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save security settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCountry = () => {
    const newCountry = {
      countryCode: '',
      currency: '',
      exchangeRate: null,
      exchangeRateManuallySet: false
    };
    setSelectedCountries([...selectedCountries, newCountry]);
  };

  const handleRemoveCountry = (index) => {
    setSelectedCountries(selectedCountries.filter((_, i) => i !== index));
  };

  const handleCountryChange = (index, field, value) => {
    const updated = [...selectedCountries];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedCountries(updated);
  };

  const handleSaveCurrencySettings = async () => {
    // Validate all selected countries have country and currency
    const invalid = selectedCountries.some(
      country => !country.countryCode || !country.currency
    );
    
    if (invalid) {
      toast({
        title: "Error",
        description: "Please select country and currency for all entries",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      // Convert selected countries to settings format
      const countryCurrencySettings = {};
      selectedCountries.forEach(country => {
        if (country.countryCode && country.currency) {
          countryCurrencySettings[country.countryCode] = {
            currency: country.currency,
            exchangeRate: country.exchangeRate && country.exchangeRate !== '' 
              ? parseFloat(country.exchangeRate) 
              : null // null means auto-fetch
          };
        }
      });

      const response = await axios.put(
        `${apiConfig.BASE_URL}/api/settings/currency`,
        {
          countryCurrencySettings
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );

      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          countryCurrencySettings: response.data.data
        }));
        toast({
          title: "Success",
          description: "Currency settings saved successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save currency settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/dashboard")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-600">Configure admin and application settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Admin Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your admin account information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adminName">Name</Label>
                  <Input
                    id="adminName"
                    value={settings.adminName}
                    onChange={(e) => handleInputChange("adminName", e.target.value)}
                    placeholder="Admin Name"
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Change Password</h3>
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={settings.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={settings.newPassword}
                      onChange={(e) => handleInputChange("newPassword", e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={settings.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveAccountSettings}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Account Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Application Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>Application Settings</CardTitle>
                  <CardDescription>Configure general application settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange("siteName", e.target.value)}
                    placeholder="Site Name"
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                    placeholder="Site Description"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="productsPerPage">Products Per Page</Label>
                <Input
                  id="productsPerPage"
                  type="number"
                  value={settings.productsPerPage}
                  onChange={(e) => handleInputChange("productsPerPage", parseInt(e.target.value))}
                  min="10"
                  max="100"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-gray-500">
                    Enable maintenance mode to temporarily disable the site
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableFeaturedProducts">Enable Featured Products</Label>
                  <p className="text-sm text-gray-500">
                    Show featured products on the home page
                  </p>
                </div>
                <Switch
                  id="enableFeaturedProducts"
                  checked={settings.enableFeaturedProducts}
                  onCheckedChange={(checked) => handleInputChange("enableFeaturedProducts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableAlerts">Alert On</Label>
                  <p className="text-sm text-gray-500">
                    Enable price drop alerts for users. When off, users cannot create price alerts.
                  </p>
                </div>
                <Switch
                  id="enableAlerts"
                  checked={settings.enableAlerts}
                  onCheckedChange={(checked) => handleInputChange("enableAlerts", checked)}
                />
              </div>

              <Button
                onClick={handleSaveApplicationSettings}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Application Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>Configure email and notification preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="productAlerts">Product Alerts</Label>
                  <p className="text-sm text-gray-500">
                    Get notified when new products are added
                  </p>
                </div>
                <Switch
                  id="productAlerts"
                  checked={settings.productAlerts}
                  onCheckedChange={(checked) => handleInputChange("productAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="priceUpdateNotifications">Price Update Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive alerts when product prices are updated
                  </p>
                </div>
                <Switch
                  id="priceUpdateNotifications"
                  checked={settings.priceUpdateNotifications}
                  onCheckedChange={(checked) => handleInputChange("priceUpdateNotifications", checked)}
                />
              </div>

              <Button
                onClick={handleSaveNotificationSettings}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security and session settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requirePasswordReset">Require Password Reset</Label>
                  <p className="text-sm text-gray-500">
                    Force password reset on next login
                  </p>
                </div>
                <Switch
                  id="requirePasswordReset"
                  checked={settings.requirePasswordReset}
                  onCheckedChange={(checked) => handleInputChange("requirePasswordReset", checked)}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
                  min="5"
                  max="120"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Automatically log out after inactivity
                </p>
              </div>

              <Button
                onClick={handleSaveSecuritySettings}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Security Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle>Currency Settings</CardTitle>
                  <CardDescription>Configure currency conversion for different countries</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Set custom currency and exchange rates for different countries. Users from these countries will see prices converted to their local currency.
                </p>
                <p className="text-xs text-gray-500">
                  Leave exchange rate empty to use automatic exchange rate. You can select multiple countries and configure each one.
                </p>
              </div>

              <div className="space-y-4">
                {selectedCountries.map((country, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Country {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCountry(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`country-${index}`}>Country</Label>
                        <Select
                          value={country.countryCode}
                          onValueChange={(value) => handleCountryChange(index, 'countryCode', value)}
                        >
                          <SelectTrigger id={`country-${index}`}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCountries.map((c) => (
                              <SelectItem key={c.code} value={c.code}>
                                {c.name} ({c.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`currency-${index}`}>Currency</Label>
                        <Select
                          value={country.currency}
                          onValueChange={(value) => handleCountryChange(index, 'currency', value)}
                        >
                          <SelectTrigger id={`currency-${index}`}>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableCurrencies.map((curr) => (
                              <SelectItem key={curr.code} value={curr.code}>
                                {curr.symbol} - {curr.name} ({curr.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`rate-${index}`}>Exchange Rate (INR to {country.currency || 'Currency'})</Label>
                        <Input
                          id={`rate-${index}`}
                          type="number"
                          step="0.0001"
                          value={country.exchangeRate === 1 && !country.exchangeRateManuallySet ? '' : country.exchangeRate}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleCountryChange(index, 'exchangeRate', value === '' ? null : parseFloat(value) || 1);
                            handleCountryChange(index, 'exchangeRateManuallySet', value !== '');
                          }}
                          placeholder="Auto (leave empty)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to use automatic rate
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCountry}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Country
                </Button>
              </div>

              <Button
                onClick={handleSaveCurrencySettings}
                disabled={saving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Currency Settings"}
              </Button>
            </CardContent>
          </Card>

          {/* Database Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-600" />
                <div>
                  <CardTitle>Database Information</CardTitle>
                  <CardDescription>View database connection details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection Status:</span>
                  <span className="text-sm font-semibold text-green-600">Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database Type:</span>
                  <span className="text-sm font-semibold">MongoDB</span>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Database connection details are managed via environment variables
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;

