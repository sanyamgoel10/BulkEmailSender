const nodemailer = require('nodemailer');
const config = require('../config');

if (typeof config.senderEmail != 'string' || typeof config.senderPassword != 'string') {
    console.error("Config variables not found");
    process.exit(1);
}

exports.sendMultipleEmails = async (req, res) => {
    try {
        if (typeof req.body.TemplateId == 'undefined') {
            return res.status(400).send("Invalid TemplateId");
        } 
        if (typeof req.body.ReceiverDetails != 'object') {
            return res.status(400).send("Invalid ReceiverDetails");
        }

        const templateId = req.body.TemplateId;
        const userList = req.body.ReceiverDetails;

        if('undefined' == typeof userList.email || !Array.isArray(userList.email)){
            return res.status(400).send("Invalid email in ReceiverDetails");
        }

        for(let elem of Object.keys(userList)){
            if(!Array.isArray(userList[elem]) || userList[elem].length != userList['email'].length){
                return res.status(400).send("Arrays length do not match in ReceiverDetails");
            }
        }
        
        let emailSent = [], emailNotSent = [];

        if(config.emailTemplate[templateId] && config.emailTemplate[templateId].subject && config.emailTemplate[templateId].body){
            const emailSubject = config.emailTemplate[templateId].subject;
            const emailBody = config.emailTemplate[templateId].body;
            for(let i=0; i<userList.email.length; i++){
                const currEmail = userList.email[i];
                if('string' == typeof currEmail && (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(currEmail)){
                    let currSubject = emailSubject, currBody = emailBody;
                    for(let elem of Object.keys(userList)){
                        currSubject = currSubject.replaceAll('[['+elem+']]', userList[elem][i]);
                        currBody = currBody.replaceAll('[['+elem+']]', userList[elem][i]);
                    }
                    if(await sendEmail(currEmail, currSubject, currBody)){
                        console.log("Email sent to : ", currEmail);
                        emailSent.push(currEmail);
                    }else{
                        emailNotSent.push(currEmail);
                    }
                }else{
                    emailNotSent.push(currEmail);
                }
            }
            return res.send({Success: emailSent, Failed: emailNotSent});
        }else{
            return res.status(400).send("TemplateId not found.");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to send email.");
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
const sendEmail = async (receiverEmail, emailSubject, emailBody) => {
    const mailOptions = {
        from: config.senderEmail,
        to: receiverEmail,
        subject: emailSubject,
        text: emailBody
    };
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};
