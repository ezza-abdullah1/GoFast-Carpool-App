const express = require("express");
const router = express.Router();
const mapController = require("../controllers/mapController");
const authMiddleware = require('../middleWare/authMiddleware');
router.post("/directions", authMiddleware , mapController.getDirections);

module.exports = router;
