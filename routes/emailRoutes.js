const express = require('express');
const emailController = require('../controllers/emailController');

const router = express.Router();

router.post('/sendemail', emailController.sendMultipleEmails);

module.exports = router;
