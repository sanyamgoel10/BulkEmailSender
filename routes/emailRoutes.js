const express = require('express');
const emailController = require('../controllers/emailController');

const router = express.Router();

router.post('/sendemail', emailController.sendEmails);

module.exports = router;
