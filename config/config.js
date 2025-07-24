require('dotenv').config();

module.exports = {
    port: process.env.PORT,

    senderEmail: process.env.SENDER_EMAIL,
    senderPassword: process.env.SENDER_PASSWORD,

    emailTemplateList: {
        'sample_email_template_id': {
            subject: `Sample email subject for [[name]]`,
            body: `This is a test email sent to [[name]] who works at [[company]] company`
        }
    }
};