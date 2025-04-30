const express = require("express");
const router = express.Router();
const mapController = require("../controllers/mapController");

router.post("/directions", mapController.getDirections);

module.exports = router;
