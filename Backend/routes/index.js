const express = require('express');
const router  = express.Router();

const contactsController = require('../controllers/contactsController');
const messageController  = require('../controllers/messageController');


// GET  /api/contacts
router.get('/contacts', contactsController.getContacts);

// GET  /api/messages/:conversationId
// POST /api/messages
router.get('/messages/:conversationId', messageController.getMessages);
router.post('/messages',              messageController.postMessage);
// Signup Route

module.exports = router;
