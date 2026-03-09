const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.post('/', invoiceController.create);
router.put('/:id/status', invoiceController.updateStatus);
router.post('/:id/resend-email', invoiceController.resendEmail);
router.post('/cleanup-orphaned', invoiceController.cleanupOrphaned);
router.delete('/:id', invoiceController.remove);

module.exports = router;
