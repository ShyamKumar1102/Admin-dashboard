const express = require('express');
const router = express.Router();
const engineerController = require('../controllers/engineer.controller');

router.get('/', engineerController.getAll);
router.get('/:id', engineerController.getById);
router.post('/', engineerController.create);
router.put('/:id', engineerController.update);
router.delete('/:id', engineerController.remove);

module.exports = router;
