const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

const {
  getSummary,
  getCharts,
  getHabitStats,
  getGoalStats
} = require('../controllers/dashboard.controller');

// protect all routes
router.use(protect);

// ─── Dashboard Routes ─────────────────────────────
router.get('/summary', getSummary);
router.get('/charts', getCharts);
router.get('/habits', getHabitStats);
router.get('/goals', getGoalStats);

module.exports = router;