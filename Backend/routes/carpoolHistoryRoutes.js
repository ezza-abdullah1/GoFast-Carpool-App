const express = require('express');
const carpoolHistory = require('../controllers/carpoolHistory');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:id', authMiddleware, carpoolHistory.getCarpoolHistory);

router.post("/rateRide/:rideId", carpoolHistory.rateRideAndUpdateDriverRating);

module.exports = router;