const { emailTemplateList } = require('../config/config.js');
const UtilService = require('../services/utilService.js');
const EmailService = require('../services/emailService.js');

class EmailController {
    async sendMultipleEmails(req, res) {
        try {
            if (!UtilService.checkValidObject(req.body)) {
                return res.status(400).json({
                    status: 0,
                    msg: 'Invalid body'
                });
            }

            if (!UtilService.checkValidString(req.body.TemplateId)) {
                return res.status(400).json({
                    status: 0,
                    msg: 'Invalid TemplateId'
                });
            }

            if (!emailTemplateList[req.body.TemplateId] || !UtilService.checkValidObject(emailTemplateList[req.body.TemplateId]) || !UtilService.checkValidString(emailTemplateList[req.body.TemplateId].subject) || !UtilService.checkValidString(emailTemplateList[req.body.TemplateId].body)) {
                return res.status(400).json({
                    status: 0,
                    msg: 'TemplateId not found'
                });
            }

            const emailSubject = emailTemplateList[req.body.TemplateId].subject;
            const emailBody = emailTemplateList[req.body.TemplateId].body;

            let emailSent = [], emailNotSent = [];

            if (UtilService.checkValidObject(req.body.ReceiverDetails)) {
                let respJson = await EmailService.parseJsonOfArraysAndSendEmailsSync(emailSubject, emailBody, req.body.ReceiverDetails);
                if (!respJson.status) {
                    return res.status(400).json(respJson);
                }
                emailSent = respJson.emailSent;
                emailNotSent = respJson.emailNotSent;
            } else if (UtilService.checkValidArray(req.body.ReceiverDetails) && req.body.ReceiverDetails.length > 0) {
                let respJson = await EmailService.parseArrayOfJsonsAndSendEmailsSync(emailSubject, emailBody, req.body.ReceiverDetails);
                if (!respJson.status) {
                    return res.status(400).json(respJson);
                }
                emailSent = respJson.emailSent;
                emailNotSent = respJson.emailNotSent;
            } else {
                return res.status(400).json({
                    status: 0,
                    msg: 'Invalid ReceiverDetails'
                });
            }

            return res.status(200).json({
                status: 1,
                msg: {
                    SuccessCount: emailSent.length,
                    FailureCount: emailNotSent.length,
                    SuccessEmail: emailSent,
                    FailedEmails: emailNotSent,
                }
            });
        } catch (error) {
            console.log('Error in EmailController.sendMultipleEmails: ', error);
            return res.status(500).json({
                status: 0,
                msg: 'Server Error'
            });
        }
    }

    async readExcelFileAndSendEmail(req, res) {
        try {
            await EmailService.readExcelFileAndSendEmail();

            return res.status(200).json({
                status: 1,
                msg: 'Success read excel file'
            })
        } catch (error) {
            console.log('Error in EmailController.readExcelFile: ', error);
            return res.status(500).json({
                status: 0,
                msg: 'Server Error'
            });
        }
    }
}

module.exports = new EmailController();