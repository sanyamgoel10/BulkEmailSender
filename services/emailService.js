const { senderEmail, senderPassword } = require('../config/config.js');

const nodemailer = require('nodemailer');

class EmailService {
    async sendEmail(emailId, subject, body) {
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
            const mailOptions = {
                from: senderEmail,
                to: emailId,
                subject: subject,
                text: body,
            };
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            console.log('Error in EmailService.sendEmail: ', error);
            return false;
        }
    }
}

module.exports = new EmailService();