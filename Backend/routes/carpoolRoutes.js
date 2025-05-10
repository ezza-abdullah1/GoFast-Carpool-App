const express = require("express");
const carpoolController = require("../controllers/carpoolController");
const rideOfferController = require("../controllers/offerRideController");
const authMiddleware = require("../middleware/authMiddleware");
const pendingRequests = require("../controllers/pendingRequests");
const router = express.Router();

// Get all carpools
router.get("/", authMiddleware, carpoolController.getAllCarpools);

// Get a single carpool
router.get("/:id", authMiddleware, carpoolController.getCarpoolById);

// Create a new carpool
router.post("/", authMiddleware, carpoolController.createCarpool);

// Update a carpool
router.put("/:id", authMiddleware, carpoolController.updateCarpool);

// Delete a carpool
router.delete("/:id", authMiddleware, carpoolController.deleteCarpool);

// Search carpools with filters
router.post("/search", authMiddleware, carpoolController.searchCarpools);
router.post("/rides", authMiddleware, rideOfferController.createRideOffer);

router.get(
  "/upcomingRides/:id",
  authMiddleware,
  carpoolController.getUpcomingRides
);

router.get(
  "/pendingRequests/:id",
 
  pendingRequests.getPendingRequests
);
router.patch(
  "/pendingRequests/:id",
  authMiddleware,
  pendingRequests.updateRideStatus
);
module.exports = router;
