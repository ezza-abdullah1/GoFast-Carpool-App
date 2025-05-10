const express = require('express');
const stopController = require('../controllers/stopController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, stopController.createStop);
router.delete('/:id', authMiddleware, stopController.deleteStopById);

module.exports = router;
