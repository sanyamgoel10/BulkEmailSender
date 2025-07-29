const express = require('express');
const router = express.Router();

const EmailController = require('../controllers/emailController.js');

router.post('/sendMultipleEmails', EmailController.sendMultipleEmails);
router.post('/readExcelFile', EmailController.readExcelFileAndSendEmail);
router.post('/sendMultipleEmailsKafka', EmailController.sendMultipleEmailsKafka);

module.exports = router;