const { senderEmail, senderName, senderPassword } = require('../config/config.js');

const nodemailer = require('nodemailer');
const UtilService = require('./utilService.js');

class EmailService {
    async sendEmail(toEmailId, toEmailName = false, subject, body, toCc = false, toBcc = false, attachmentFiles = false) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: senderEmail,
                    pass: senderPassword
                }
            });

            let toEmailDetails = toEmailId;
            if(toEmailName){
                toEmailDetails = {
                    address: toEmailId,
                    name: toEmailName
                }
            }
            let options = {
                from: `"${senderName}" <${senderEmail}>`,
                to: toEmailDetails,
                subject: subject,
                html: body,
            };
            if(UtilService.checkValidArray(toCc) && toCc.length > 0){
                options.cc = toCc;
            }
            if(UtilService.checkValidArray(toBcc) && toBcc.length > 0){
                options.bcc = toBcc;
            }
            if(attachmentFiles && UtilService.checkValidArray(attachmentFiles) && attachmentFiles.length > 0){
                options.attachments = [];
                attachmentFiles.forEach((attachment) => {
                    if(UtilService.checkValidObject(attachment)){
                        options.attachments.push(attachment);
                    }
                });
            }

            const mailInfo = await transporter.sendMail(options);

            console.log("Message sent: %s", mailInfo.messageId);
            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(mailInfo));

            return true;
        } catch (error) {
            console.log('Error in EmailService.sendEmail: ', error);
            return false;
        }
    }
}

module.exports = new EmailService();