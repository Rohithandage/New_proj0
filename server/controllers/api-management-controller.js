const ApiConfig = require('../models/ApiConfig');
const axios = require('axios');

// Get all API configurations
const getAllApiConfigs = async (req, res) => {
  try {
    const configs = await ApiConfig.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: configs,
      count: configs.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API configurations',
      error: error.message
    });
  }
};

// Get API configuration by ID
const getApiConfigById = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await ApiConfig.findById(id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'API configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API configuration',
      error: error.message
    });
  }
};

// Get API configuration by platform
const getApiConfigByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const config = await ApiConfig.findOne({ 
      platform: platform.toLowerCase(),
      isActive: true 
    });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: `No active API configuration found for ${platform}`
      });
    }
    
    // Don't send sensitive data in response
    const safeConfig = {
      ...config.toObject(),
      apiKey: config.apiKey ? '***' : null,
      secretKey: config.secretKey ? '***' : null,
      accessToken: config.accessToken ? '***' : null
    };
    
    res.json({
      success: true,
      data: safeConfig
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching API configuration',
      error: error.message
    });
  }
};

// Create new API configuration
const createApiConfig = async (req, res) => {
  try {
    const {
      name,
      platform,
      apiKey,
      secretKey,
      accessToken,
      associateTag,
      endpoint,
      additionalConfig,
      isActive
    } = req.body;
    
    // Validate required fields
    if (!name || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Name and platform are required'
      });
    }
    
    // Check if platform already has an active config
    const existingConfig = await ApiConfig.findOne({
      platform: platform.toLowerCase(),
      isActive: true
    });
    
    if (existingConfig && isActive !== false) {
      return res.status(400).json({
        success: false,
        message: `An active API configuration already exists for ${platform}. Please deactivate it first or update the existing one.`
      });
    }
    
    const config = new ApiConfig({
      name,
      platform: platform.toLowerCase(),
      apiKey,
      secretKey,
      accessToken,
      associateTag,
      endpoint,
      additionalConfig: additionalConfig || {},
      isActive: isActive !== false
    });
    
    await config.save();
    
    res.status(201).json({
      success: true,
      data: config,
      message: 'API configuration created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating API configuration',
      error: error.message
    });
  }
};

// Update API configuration
const updateApiConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Don't allow updating _id
    delete updateData._id;
    
    // If setting isActive to true, check for conflicts
    if (updateData.isActive === true) {
      const config = await ApiConfig.findById(id);
      if (config) {
        const existingActive = await ApiConfig.findOne({
          platform: config.platform,
          isActive: true,
          _id: { $ne: id }
        });
        
        if (existingActive) {
          return res.status(400).json({
            success: false,
            message: `An active API configuration already exists for ${config.platform}. Please deactivate it first.`
          });
        }
      }
    }
    
    updateData.updatedAt = new Date();
    
    const config = await ApiConfig.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'API configuration not found'
      });
    }
    
    res.json({
      success: true,
      data: config,
      message: 'API configuration updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating API configuration',
      error: error.message
    });
  }
};

// Delete API configuration
const deleteApiConfig = async (req, res) => {
  try {
    const { id } = req.params;
    
    const config = await ApiConfig.findByIdAndDelete(id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'API configuration not found'
      });
    }
    
    res.json({
      success: true,
      message: 'API configuration deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting API configuration',
      error: error.message
    });
  }
};

// Test API configuration
const testApiConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const config = await ApiConfig.findById(id);
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'API configuration not found'
      });
    }
    
    // Update test status to pending
    config.testStatus = 'pending';
    config.lastTested = new Date();
    await config.save();
    
    // Perform test based on platform
    let testResult = { success: false, message: 'Test not implemented for this platform' };
    
    try {
      // Basic connectivity test
      if (config.endpoint) {
        const response = await axios.get(config.endpoint, {
          timeout: 10000,
          headers: {
            ...(config.apiKey && { 'X-API-Key': config.apiKey }),
            ...(config.accessToken && { 'Authorization': `Bearer ${config.accessToken}` })
          },
          validateStatus: () => true // Accept any status code
        });
        
        if (response.status < 500) {
          testResult = {
            success: true,
            message: `API endpoint is reachable (Status: ${response.status})`
          };
        } else {
          testResult = {
            success: false,
            message: `API endpoint returned error (Status: ${response.status})`
          };
        }
      } else {
        testResult = {
          success: false,
          message: 'No endpoint configured for testing'
        };
      }
    } catch (error) {
      testResult = {
        success: false,
        message: `Test failed: ${error.message}`
      };
    }
    
    // Update config with test results
    config.testStatus = testResult.success ? 'success' : 'failed';
    config.testMessage = testResult.message;
    await config.save();
    
    res.json({
      success: true,
      data: {
        testStatus: config.testStatus,
        testMessage: config.testMessage,
        lastTested: config.lastTested
      },
      message: testResult.message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error testing API configuration',
      error: error.message
    });
  }
};

module.exports = {
  getAllApiConfigs,
  getApiConfigById,
  getApiConfigByPlatform,
  createApiConfig,
  updateApiConfig,
  deleteApiConfig,
  testApiConfig
};















