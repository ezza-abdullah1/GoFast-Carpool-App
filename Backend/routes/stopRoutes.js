const express = require('express');
const stopController = require('../controllers/stopController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware,stopController.createStop);
module.exports = router;