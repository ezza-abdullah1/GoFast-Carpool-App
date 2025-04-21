const express = require('express');
const carpoolController = require('../controllers/carpoolController');

const router = express.Router();

// Get all carpools
router.get('/', carpoolController.getAllCarpools);

// Get a single carpool
router.get('/:id', carpoolController.getCarpoolById);

// Create a new carpool
router.post('/', carpoolController.createCarpool);

// Update a carpool
router.put('/:id', carpoolController.updateCarpool);

// Delete a carpool
router.delete('/:id', carpoolController.deleteCarpool);

// Search carpools with filters
router.post('/search', carpoolController.searchCarpools);

module.exports = router;
