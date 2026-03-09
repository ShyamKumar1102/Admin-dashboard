const express = require('express');
const router = express.Router();
const deviceDataController = require('../controllers/deviceData.controller');

router.get('/:deviceId', deviceDataController.getByDeviceId);
router.post('/', deviceDataController.create);

module.exports = router;
