// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export default {
  BASE_URL: API_BASE_URL,
  API_URL: API_BASE_URL,
  PRICE_COMPARISON: `${API_BASE_URL}/api/price-comparison`,
  ADMIN_AUTH: `${API_BASE_URL}/api/auth/admin`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  COMMON: `${API_BASE_URL}/api/common`,
  SHOP: `${API_BASE_URL}/api/shop`,
  API_MANAGEMENT: `${API_BASE_URL}/api/admin/api-configs`,
  WEB_SCRAPING: `${API_BASE_URL}/api/admin/scraping-tasks`,
};








