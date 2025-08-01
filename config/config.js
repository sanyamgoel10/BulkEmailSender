require('dotenv').config();

module.exports = {
    port: process.env.PORT,

    senderEmail: process.env.SENDER_EMAIL,
    senderName: process.env.SENDER_NAME,
    senderPassword: process.env.SENDER_PASSWORD,

    adminEmailId: process.env.ADMIN_EMAIL,
    adminName: process.env.ADMIN_NAME,

    kafkaBroker: 'localhost:9092',
    kafkaClientId: 'bulk-email-sender-service',
    kafkaConsumerGroupId: 'test-consumer-group-sg',
    kafkaConsumerTopicsToRead: ['send-bulk-email-topic', 'send-email-topic'],

    emailTemplateList: {
        'sample_email_template_id': {
            subject: `Sample email subject for [[name]]`,
            body: `This is a test email sent to [[name]] who works at [[company]] company`
        }
    }
};