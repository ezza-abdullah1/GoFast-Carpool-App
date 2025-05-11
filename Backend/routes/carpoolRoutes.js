const pendingRequests = require("../controllers/pendingRequests");
const express = require('express');
const carpoolController = require('../controllers/carpoolController');
const authMiddleware = require('../middleware/authMiddleware');
const rideOfferController = require ('../controllers/offerRideController')
const rideDetailsController = require ('../controllers/rideDetailsController')
const router = express.Router();

router.get("/", authMiddleware, carpoolController.getAllCarpools);
router.get("/:id", authMiddleware, carpoolController.getCarpoolById);
router.post("/", authMiddleware, carpoolController.createCarpool);
router.put("/:id", authMiddleware, carpoolController.updateCarpool);
router.delete("/:id", authMiddleware, carpoolController.deleteCarpool);
router.post("/search", authMiddleware, carpoolController.searchCarpools);
router.get(
  "/upcomingRides/:id",
  authMiddleware,
  carpoolController.getUpcomingRides
);
router.get(
  "/pendingRequests/:id",
 authMiddleware,
  pendingRequests.getPendingRequests
);
router.patch(
  "/pendingRequests/:id",
  authMiddleware,
  pendingRequests.updateRideStatus
);
router.post('/rides', authMiddleware, rideOfferController.createRideOffer); 
router.get('/rides/:rideId/details', authMiddleware, rideDetailsController.getRideDetails);

module.exports = router;
