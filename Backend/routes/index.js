const express = require('express');
const router  = express.Router();

const contactsController = require('../controllers/contactsController');
const messageController  = require('../controllers/messageController');


router.get('/contacts', contactsController.getContacts);

router.get('/messages/:conversationId', messageController.getMessages);
router.post('/messages',              messageController.postMessage);

module.exports = router;
