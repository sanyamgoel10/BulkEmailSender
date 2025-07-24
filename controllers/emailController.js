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

            const templateId = req.body.TemplateId;

            const emailSubject = emailTemplateList[templateId].subject;
            const emailBody = emailTemplateList[templateId].body;

            if (!UtilService.checkValidObject(req.body.ReceiverDetails)) {
                return res.status(400).json({
                    status: 0,
                    msg: 'Invalid ReceiverDetails'
                });
            }
            const userList = req.body.ReceiverDetails;

            if (!UtilService.checkValidArray(userList.email)) {
                return res.status(400).json({
                    status: 0,
                    msg: 'Invalid email in ReceiverDetails'
                });
            }

            for (let elem of Object.keys(userList)) {
                if (!UtilService.checkValidArray(userList[elem]) || userList[elem].length != userList.email.length) {
                    return res.status(400).json({
                        status: 0,
                        msg: 'Invalid values in ReceiverDetails'
                    });
                }
            }

            let emailSent = [], emailNotSent = [];

            for (let i = 0; i < userList.email.length; i++) {
                let currEmail = userList.email[i];
                let currSubject = emailSubject;
                let currBody = emailBody;
                if (!UtilService.checkValidEmailId(currEmail)) {
                    emailNotSent.push({
                        Index: i,
                        Email: currEmail,
                        Reason: 'Invalid EmailId'
                    });
                    continue;
                }
                for (let elem of Object.keys(userList)) {
                    if (elem != 'email') {
                        currSubject = currSubject.replaceAll(`[[${elem}]]`, userList[elem][i]);
                        currBody = currBody.replaceAll(`[[${elem}]]`, userList[elem][i]);
                    }
                }
                let emailSentResponse = await EmailService.sendEmail(currEmail, currSubject, currBody);
                if (!emailSentResponse) {
                    emailNotSent.push({
                        Index: i,
                        Email: currEmail,
                        Reason: 'EmailService error'
                    });
                    continue;
                }
                emailSent.push({
                    Index: i,
                    Email: currEmail
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
}

module.exports = new EmailController();