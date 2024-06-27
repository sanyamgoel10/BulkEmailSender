const nodemailer = require('nodemailer');
const config = require('../config');

if (typeof config.senderEmail != 'string' || typeof config.senderPassword != 'string') {
    console.error("Config variables not found");
    process.exit(1);
}

exports.sendEmails = async (req, res) => {
    try {
        if (typeof req.body.TemplateId == 'undefined') {
            return res.status(400).send("Invalid TemplateId");
        }
        if (typeof req.body.ReceiverDetails != 'object') {
            return res.status(400).send("Invalid ReceiverDetails");
        }
        const userList = req.body.ReceiverDetails;
        if('undefined' == typeof userList.name || 'undefined' == typeof userList.email || !Array.isArray(userList.name) || !Array.isArray(userList.email)){
            return res.status(400).send("Invalid name, email in ReceiverDetails");
        }
        if(userList.name.length != userList.email.length){
            return res.status(400).send("Arrays length do not match");
        }
        
        let emailSent = [], emailNotSent = [];

        for(let i=0; i<userList.name.length; i++){
            let currName = userList.name[i];
            let currEmail = userList.email[i];

            if('string' == typeof currEmail){
                let reqObjArr = {
                    name: currName,
                    email: currEmail
                };
                Object.keys(userList).forEach((elem) => {
                    if(elem != 'name' && elem != 'email'){
                        if(!Array.isArray(userList[elem]) || userList[elem].length != userList.name.length){
                            return res.status(400).send("Arrays length do not match");
                        }
                        reqObjArr[elem] = userList[elem][i];
                    }
                });
                if(!(await sendEmail(reqObjArr, req.body.TemplateId))){
                    emailNotSent.push({Email: currEmail, Name: currName});
                }else{
                    console.log('Email sent to:', currName, 'on EmailId:', currEmail);
                    emailSent.push({Email: currEmail, Name: currName});
                }                
            }else{
                emailNotSent.push({Email: currEmail, Name: currName});
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
const sendEmail = async (receiverDetails, templateId) => {
    if(config.emailTemplate[templateId] && config.emailTemplate[templateId].subject && config.emailTemplate[templateId].body){
        let emailSubject = config.emailTemplate[templateId].subject;
        let emailBody = config.emailTemplate[templateId].body;
        Object.keys(receiverDetails).forEach((elem) => {
            emailSubject.replaceAll('[['+elem+']]', receiverDetails.elem);
            emailBody.replaceAll('[['+elem+']]', receiverDetails.elem);
        })
        const mailOptions = {
            from: config.senderEmail,
            to: receiverDetails.email,
            subject: emailSubject,
            text: emailBody
        };
        return await transporter.sendMail(mailOptions);
    }
    console.log('TemplateId not found');
    return false; 
};