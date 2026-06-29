const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const {
  createGoalValidator,
  updateGoalValidator,
  addContributionValidator,
} = require('../validators/goal.validator');

const {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
  getContributions,
} = require('../controllers/goal.controller');


router.use(protect);


router.post('/', createGoalValidator, validate, createGoal);

router.get('/', getAllGoals);

router.get('/:id', getGoalById);

router.put('/:id', updateGoalValidator, validate, updateGoal);

router.delete('/:id', deleteGoal);


router.post(
  '/:id/contribute',
  addContributionValidator,
  validate,
  addContribution
);

router.get('/:id/contributions', getContributions);

module.exports = router;