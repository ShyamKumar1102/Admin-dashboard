const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');

router.get('/', subscriptionController.getAll);
router.get('/:subscriptionId', subscriptionController.getById);
router.post('/', subscriptionController.create);
router.put('/:subscriptionId', subscriptionController.update);
router.delete('/:subscriptionId', subscriptionController.remove);

module.exports = router;
