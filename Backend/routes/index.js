const express = require('express');
const router  = express.Router();

const contactsController = require('../controllers/contactsController');
const messageController  = require('../controllers/messageController');
const authController = require("../controllers/authController");
const forgotPasswordRoutes = require("../controllers/forgotPasswordController");
const resetPasswordController=require("../controllers/resetPasswordController");
// GET  /api/contacts
router.get('/contacts', contactsController.getContacts);

// GET  /api/messages/:conversationId
// POST /api/messages
router.get('/messages/:conversationId', messageController.getMessages);
router.post('/messages',              messageController.postMessage);
router.post("/auth/reset-password/:token", resetPasswordController);

// Signup Route
router.use("/auth", authController);
router.use("/auth", forgotPasswordRoutes);



module.exports = router;
