const nodemailer = require('nodemailer');
const config = require('../config');

if (typeof config.senderEmail != 'string' || typeof config.senderPassword != 'string') {
    console.error("Config variables not found");
    process.exit(1);
}

exports.sendEmails = async (req, res) => {
    try {
        if (typeof req.body.ReceiverDetails !== 'object' || !Array.isArray(req.body.ReceiverDetails)) {
            return res.status(400).send("Invalid ReceiverDetails");
        }
        if (typeof req.body.Subject !== 'string') {
            return res.status(400).send("Invalid Subject");
        }
        
        let emailSent = [], emailNotSent = [];
        for (const receiver of req.body.ReceiverDetails) {
            if('string' == typeof receiver.Email && 'string' == typeof receiver.Name){
                await sendEmail(receiver.Email, receiver.Name, req.body.Subject);
                console.log('Email sent to:', receiver.Name, 'on EmailId:', receiver.Email);
                emailSent.push(receiver);
            }else{
                emailNotSent.push(receiver);
            }            
        }
        res.send({
            Success: emailSent,
            Failed: emailNotSent
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Failed to send email.");
    }
};

// Create a SMTP connection with Google using credentials
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: config.senderEmail,
        pass: config.senderPassword
    }
});

// Function to send an email
const sendEmail = async (rEmail, rName, emailSubject) => {
    const mailOptions = {
        from: config.senderEmail,
        to: rEmail,
        subject: emailSubject,
        html: `<body>Hi ${rName},<br><br> This is to inform you that a test email from cron is sent to you.</body>`
    };

    return await transporter.sendMail(mailOptions);
};