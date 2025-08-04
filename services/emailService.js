const { senderEmail, senderName, senderPassword, emailTemplateList, adminEmailId, adminName } = require('../config/config.js');

const nodemailer = require('nodemailer');
const xlsx = require('xlsx');
const path = require('path');

const UtilService = require('./utilService.js');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: senderEmail,
                pass: senderPassword
            }
        });
    }

    async sendEmail(toEmailId, toEmailName = false, subject, body, toCc = false, toBcc = false, attachmentFiles = false) {
        try {
            let toEmailDetails = toEmailId;
            if (toEmailName) {
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
            if (UtilService.checkValidArray(toCc) && toCc.length > 0) {
                options.cc = toCc;
            }
            if (UtilService.checkValidArray(toBcc) && toBcc.length > 0) {
                options.bcc = toBcc;
            }
            if (attachmentFiles && UtilService.checkValidArray(attachmentFiles) && attachmentFiles.length > 0) {
                options.attachments = [];
                attachmentFiles.forEach((attachment) => {
                    if (UtilService.checkValidObject(attachment)) {
                        options.attachments.push(attachment);
                    }
                });
            }

            const mailInfo = await this.transporter.sendMail(options);

            console.log("Message sent: ", mailInfo.messageId);
            // console.log("Preview URL: ", nodemailer.getTestMessageUrl(mailInfo));

            return true;
        } catch (error) {
            console.log('Error in EmailService.sendEmail: ', error);
            return false;
        }
    }

    async sendEmailPromise(toEmailId, toEmailName = false, subject, body, toCc = false, toBcc = false, attachmentFiles = false) {
        return new Promise(async (resolve, reject) => {
            try {
                let toEmailDetails = toEmailId;
                if (toEmailName) {
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
                if (UtilService.checkValidArray(toCc) && toCc.length > 0) {
                    options.cc = toCc;
                }
                if (UtilService.checkValidArray(toBcc) && toBcc.length > 0) {
                    options.bcc = toBcc;
                }
                if (attachmentFiles && UtilService.checkValidArray(attachmentFiles) && attachmentFiles.length > 0) {
                    options.attachments = [];
                    attachmentFiles.forEach((attachment) => {
                        if (UtilService.checkValidObject(attachment)) {
                            options.attachments.push(attachment);
                        }
                    });
                }

                const mailInfo = await this.transporter.sendMail(options);

                console.log("Message sent: %s", mailInfo.messageId);
                // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(mailInfo));

                resolve();
            } catch (error) {
                console.log('Error in EmailService.sendEmail: ', error);
                reject();
            }
        });
    }

    async readExcelFileAndSendEmail() {
        try {
            const filePath = path.join(__dirname, '..', 'sample_file_1.xls');
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            if (UtilService.checkValidArray(jsonData) && jsonData.length > 0) {
                let allEmailReq = [];
                let allEmailMeta = [];
                for (let currRecord of jsonData) {
                    if (!UtilService.checkValidEmailId(currRecord['Email'])) {
                        continue;
                    }

                    let currEmail = currRecord['Email'];
                    let currName = UtilService.checkValidString(currRecord['Person Name']) ? UtilService.capitalizeEachWord(currRecord['Person Name']) : false;
                    let currCompany = UtilService.checkValidString(currRecord['Company']) ? UtilService.capitalizeEachWord(currRecord['Company']) : false;
                    let currSerialNo = 'undefined' != typeof currRecord['Sr. No.'] ? currRecord['Sr. No.'] : false;

                    let emailSubject = emailTemplateList['sample_email_template_id'].subject;
                    let emailBody = emailTemplateList['sample_email_template_id'].body;

                    emailSubject = emailSubject.replaceAll(`[[email]]`, currEmail);
                    if (currName) {
                        emailSubject = emailSubject.replaceAll(`[[name]]`, currName);
                    }
                    if (currCompany) {
                        emailSubject = emailSubject.replaceAll(`[[company]]`, currCompany);
                    }

                    emailBody = emailBody.replaceAll(`[[email]]`, currEmail);
                    if (currName) {
                        emailBody = emailBody.replaceAll(`[[name]]`, currName);
                    }
                    if (currCompany) {
                        emailBody = emailBody.replaceAll(`[[company]]`, currCompany);
                    }

                    allEmailReq.push(this.sendEmail(currEmail, currName, emailSubject, emailBody));
                    allEmailMeta.push({
                        SrNo: currSerialNo,
                        Email: currEmail
                    });
                }
                let allEmailResp = await Promise.all(allEmailReq);
                for (let i = 0; i < allEmailResp.length; i++) {
                    console.log("SrlNo: ", allEmailMeta[i].SrNo, " |||| ", "EmailId: ", allEmailMeta[i].Email, " |||| ", "EmailResponse: ", allEmailResp[i]);
                }
            }

            return true;
        } catch (error) {
            console.log('Error in EmailService.readExcelFileAndSendEmail: ', error);
            return false;
        }
    }

    async parseJsonOfArraysAndSendEmailsSequentially(emailSubject, emailBody, userList) {
        let emailSent = [];
        let emailNotSent = [];

        if (!UtilService.checkValidArray(userList.email)) {
            return {
                status: 0,
                msg: 'Invalid email in ReceiverDetails'
            };
        }

        for (let elem of Object.keys(userList)) {
            if (!UtilService.checkValidArray(userList[elem]) || userList[elem].length != userList.email.length) {
                return {
                    status: 0,
                    msg: 'Invalid values in ReceiverDetails'
                };
            }
        }

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
            let emailSentResponse = await this.sendEmail(currEmail, (UtilService.checkValidArray(userList.name) ? userList.name[i] : false), currSubject, currBody);
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

        return {
            status: 1,
            emailSent,
            emailNotSent
        };
    }

    async parseJsonOfArraysAndSendEmailsInBatch(emailSubject, emailBody, userList) {
        let emailSent = [];
        let emailNotSent = [];

        let sendEmailReq = [];
        let sendEmailReqMeta = [];

        if (!UtilService.checkValidArray(userList.email)) {
            return {
                status: 0,
                msg: 'Invalid email in ReceiverDetails'
            };
        }

        for (let elem of Object.keys(userList)) {
            if (!UtilService.checkValidArray(userList[elem]) || userList[elem].length != userList.email.length) {
                return {
                    status: 0,
                    msg: 'Invalid values in ReceiverDetails'
                };
            }
        }

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
            sendEmailReq.push(this.sendEmail(currEmail, (UtilService.checkValidArray(userList.name) ? userList.name[i] : false), currSubject, currBody));
            sendEmailReqMeta.push(currEmail);
        }

        return Promise.allSettled(sendEmailReq).then((responses) => {
            responses.forEach((response, index) => {
                if (response.status == 'rejected') {
                    emailNotSent.push({
                        Index: index,
                        Email: sendEmailReqMeta[index],
                        Reason: 'EmailService error'
                    });
                    return;
                }
                emailSent.push({
                    Index: index,
                    Email: sendEmailReqMeta[index]
                });
            });
            return {
                status: 1,
                emailSent,
                emailNotSent
            };
        });
    }

    async parseArrayOfJsonsAndSendEmailsSequentially(emailSubject, emailBody, userList) {
        let emailSent = [];
        let emailNotSent = [];
        for (let i = 0; i < userList.length; i++) {
            let currObj = userList[i];
            if (!UtilService.checkValidEmailId(currObj.email)) {
                emailNotSent.push({
                    Index: i,
                    Reason: 'Invalid email in ReceiverDetails'
                });
                continue;
            }
            let currEmail = userList[i].email;
            let currSubject = emailSubject;
            let currBody = emailBody;
            let currName = UtilService.checkValidString(userList[i].name) ? userList[i].name : false;
            for (let elem of Object.keys(userList[i])) {
                if (elem != 'email') {
                    currSubject = currSubject.replaceAll(`[[${elem}]]`, userList[i][elem]);
                    currBody = currBody.replaceAll(`[[${elem}]]`, userList[i][elem]);
                }
            }
            let emailSentResponse = await this.sendEmail(currEmail, currName, currSubject, currBody);
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
        return {
            status: 1,
            emailSent,
            emailNotSent
        }
    }

    async parseArrayOfJsonsAndSendEmailsInBatch(emailSubject, emailBody, userList) {
        let emailSent = [];
        let emailNotSent = [];

        let sendEmailReq = [];
        let sendEmailReqMeta = [];

        for (let i = 0; i < userList.length; i++) {
            let currObj = userList[i];
            if (!UtilService.checkValidEmailId(currObj.email)) {
                emailNotSent.push({
                    Index: i,
                    Reason: 'Invalid email in ReceiverDetails'
                });
                continue;
            }
            let currEmail = userList[i].email;
            let currSubject = emailSubject;
            let currBody = emailBody;
            let currName = UtilService.checkValidString(userList[i].name) ? userList[i].name : false;
            for (let elem of Object.keys(userList[i])) {
                if (elem != 'email') {
                    currSubject = currSubject.replaceAll(`[[${elem}]]`, userList[i][elem]);
                    currBody = currBody.replaceAll(`[[${elem}]]`, userList[i][elem]);
                }
            }
            sendEmailReq.push(this.sendEmailPromise(currEmail, currName, currSubject, currBody));
            sendEmailReqMeta.push(currEmail);
        }

        return Promise.allSettled(sendEmailReq).then((responses) => {
            responses.forEach((response, index) => {
                if (response.status == 'rejected') {
                    emailNotSent.push({
                        Index: index,
                        Email: sendEmailReqMeta[index],
                        Reason: 'EmailService error'
                    });
                    return;
                }
                emailSent.push({
                    Index: index,
                    Email: sendEmailReqMeta[index]
                });
            });
            return {
                status: 1,
                emailSent,
                emailNotSent
            }
        });
    }

    async sendEmailThroughKafkaConsumer(reqBody){
        console.log("reqBody: ", reqBody);
        if (!UtilService.checkValidObject(reqBody)) {
            // await this.sendEmail(adminEmailId, adminName, 'Error in EmailService.sendEmailThroughKafkaConsumer', `
            //     ERROR in Bulk Email Sender
            //     <br><br>
            //     Service Name: EmailService.sendEmailThroughKafkaConsumer
            //     <br>
            //     Reason: Invalid Body
            //     <br>
            //     Request Body: ${reqBody}
            // `);
            console.log("Error in EmailService.sendEmailThroughKafkaConsumer: Invalid Body");
            return;
        }
        if (!UtilService.checkValidString(reqBody.TemplateId)) {
            // await this.sendEmail(adminEmailId, adminName, 'Error in EmailService.sendEmailThroughKafkaConsumer', `
            //     ERROR in Bulk Email Sender
            //     <br><br>
            //     Service Name: EmailService.sendEmailThroughKafkaConsumer
            //     <br>
            //     Reason: Invalid TemplateId
            //     <br>
            //     Request Body: ${reqBody}
            // `);
            console.log("Error in EmailService.sendEmailThroughKafkaConsumer: Invalid TemplateId");
            return;
        }
        if (!emailTemplateList[reqBody.TemplateId] || !UtilService.checkValidObject(emailTemplateList[reqBody.TemplateId]) || !UtilService.checkValidString(emailTemplateList[reqBody.TemplateId].subject) || !UtilService.checkValidString(emailTemplateList[reqBody.TemplateId].body)) {
            // await this.sendEmail(adminEmailId, adminName, 'Error in EmailService.sendEmailThroughKafkaConsumer', `
            //     ERROR in Bulk Email Sender
            //     <br><br>
            //     Service Name: EmailService.sendEmailThroughKafkaConsumer
            //     <br>
            //     Reason: TemplateId not found
            //     <br>
            //     Request Body: ${reqBody}
            // `);
            console.log("Error in EmailService.sendEmailThroughKafkaConsumer: TemplateId not found");
            return;
        }
        let emailSubject = emailTemplateList[reqBody.TemplateId].subject;
        let emailBody = emailTemplateList[reqBody.TemplateId].body;
        if(!UtilService.checkValidEmailId(reqBody.email)){
            console.log("Error in EmailService.sendEmailThroughKafkaConsumer: Invalid email");
            return;
        }
        let userEmail = reqBody.email;
        let userName = UtilService.checkValidString(reqBody.name) ? reqBody.name : false;
        Object.keys(reqBody).forEach((elem) => {
            if(!['TemplateId'].includes(elem)){
                emailSubject = emailSubject.replaceAll(`[[${elem}]]`, reqBody[elem]);
                emailBody = emailBody.replaceAll(`[[${elem}]]`, reqBody[elem]);
            }
        });

        let emailSentResponse = await this.sendEmail(userEmail, userName, emailSubject, emailBody);

        if(!emailSentResponse){
            console.log("Error in EmailService.sendEmailThroughKafkaConsumer: Error from sendEmail")
            return;
        }

        console.log("Success in EmailService.sendEmailThroughKafkaConsumer: Email Sent");
        return;
    }
}

module.exports = new EmailService();