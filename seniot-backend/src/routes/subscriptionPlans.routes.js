const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlan.controller');

router.get('/', subscriptionPlanController.getAll);
router.post('/', subscriptionPlanController.create);
router.put('/:planId', subscriptionPlanController.update);

module.exports = router;
