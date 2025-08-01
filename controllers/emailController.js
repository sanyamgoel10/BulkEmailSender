const { emailTemplateList } = require('../config/config.js');
const UtilService = require('../services/utilService.js');
const EmailService = require('../services/emailService.js');
const KafkaService = require('../services/kafkaService.js');

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
                let respJson;
                if (UtilService.checkValidString(req.body.Method) && (req.body.Method).toLowerCase() == 'batch') {
                    respJson = await EmailService.parseJsonOfArraysAndSendEmailsInBatch(emailSubject, emailBody, req.body.ReceiverDetails);
                } else {
                    respJson = await EmailService.parseJsonOfArraysAndSendEmailsSequentially(emailSubject, emailBody, req.body.ReceiverDetails);
                }
                if (!respJson.status) {
                    return res.status(400).json(respJson);
                }
                emailSent = respJson.emailSent;
                emailNotSent = respJson.emailNotSent;
            } else if (UtilService.checkValidArray(req.body.ReceiverDetails) && req.body.ReceiverDetails.length > 0) {
                let respJson;
                if (UtilService.checkValidString(req.body.Method) && (req.body.Method).toLowerCase() == 'batch') {
                    respJson = await EmailService.parseArrayOfJsonsAndSendEmailsInBatch(emailSubject, emailBody, req.body.ReceiverDetails)
                } else {
                    respJson = await EmailService.parseArrayOfJsonsAndSendEmailsSequentially(emailSubject, emailBody, req.body.ReceiverDetails)
                }
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

    async sendMultipleEmailsKafka(req, res) {
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

            let finalKafkaEvents = [];
            if (UtilService.checkValidArray(req.body.ReceiverDetails) && (req.body.ReceiverDetails).length > 0) {
                for (let i = 0; i < (req.body.ReceiverDetails).length; i++) {
                    if (!UtilService.checkValidObject(req.body.ReceiverDetails[i])) {
                        return res.status(400).json({
                            status: 0,
                            msg: `Invalid ReceiverDetails json at index ${i}`
                        });
                    }
                    if (!UtilService.checkValidEmailId(req.body.ReceiverDetails[i].email)) {
                        return res.status(400).json({
                            status: 0,
                            msg: `Invalid email in ReceiverDetails at index ${i}`
                        });
                    }
                    let currEvent = {
                        TemplateId: req.body.TemplateId
                    };
                    for (let elem of Object.keys(req.body.ReceiverDetails[i])) {
                        currEvent[elem] = req.body.ReceiverDetails[i][elem];
                    }
                    finalKafkaEvents.push(currEvent);
                }
            } else {
                return res.status(400).json({
                    status: 0,
                    msg: 'Invalid ReceiverDetails'
                });
            }
            let finalKafkaEventsPromise = [];
            for (let i = 0; i < finalKafkaEvents.length; i++) {
                finalKafkaEventsPromise.push(KafkaService.sendMessage('send-email-topic', JSON.stringify(finalKafkaEvents[i])));
            }
            let totalCnt = finalKafkaEventsPromise.length;
            let rejectCnt = 0;
            return Promise.allSettled(finalKafkaEventsPromise).then((responses) => {
                responses.forEach((response, index) => {
                    if (response.status == 'rejected') {
                        rejectCnt++;
                        return;
                    }
                });
                return res.status(200).json({
                    status: 1,
                    msg: `${totalCnt - rejectCnt} out of ${totalCnt} events sent to kafka`
                });
            });
        } catch (error) {
            console.log('Error in EmailController.sendMultipleEmailsKafka: ', error);
            return res.status(500).json({
                status: 0,
                msg: 'Server Error'
            });
        }
    }
}

module.exports = new EmailController();