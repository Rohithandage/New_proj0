const express = require('express');
const router = express.Router();
const {
  getAllScrapingTasks,
  getScrapingTaskById,
  createScrapingTask,
  executeScrapingTask,
  deleteScrapingTask,
  bulkCreateScrapingTasks,
  bulkExecuteScraping
} = require('../controllers/web-scraping-controller');
const { authenticate } = require('../middleware/auth-middleware');

// All routes require admin authentication
router.use(authenticate);

// Get all scraping tasks
router.get('/', getAllScrapingTasks);

// Get scraping task by ID
router.get('/:id', getScrapingTaskById);

// Create scraping task
router.post('/', createScrapingTask);

// Execute scraping task immediately
router.post('/:id/execute', executeScrapingTask);

// Delete scraping task
router.delete('/:id', deleteScrapingTask);

// Bulk create scraping tasks
router.post('/bulk/create', bulkCreateScrapingTasks);

// Bulk execute scraping for all products (one-click scrape all)
router.post('/bulk/execute', bulkExecuteScraping);

module.exports = router;

