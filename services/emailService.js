const { senderEmail, senderName, senderPassword, emailTemplateList } = require('../config/config.js');

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

            console.log("Message sent: %s", mailInfo.messageId);
            // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(mailInfo));

            return true;
        } catch (error) {
            console.log('Error in EmailService.sendEmail: ', error);
            return false;
        }
    }

    async readExcelFileAndSendEmail(){
        try{
            const filePath = path.join(__dirname, '..', 'sample_file.xls');
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            if(UtilService.checkValidArray(jsonData) && jsonData.length > 0){
                let allEmailReq = [];
                let allEmailMeta = [];
                for(let currRecord of jsonData){
                    if(!UtilService.checkValidEmailId(currRecord['Email'])){
                        continue;
                    }

                    let currEmail = currRecord['Email'];
                    let currName = UtilService.checkValidString(currRecord['Person Name']) ? UtilService.capitalizeEachWord(currRecord['Person Name']) : false;
                    let currCompany = UtilService.checkValidString(currRecord['Company']) ? currRecord['Company'] : false;
                    let currSerialNo = UtilService.checkValidString(currRecord['Sr. No.']) ? currRecord['Sr. No.'] : false;

                    let emailSubject = emailTemplateList['sample_email_template_id'].subject;
                    let emailBody = emailTemplateList['sample_email_template_id'].body;

                    emailSubject = emailSubject.replaceAll(`[[email]]`, currEmail);
                    if(currName){
                        emailSubject = emailSubject.replaceAll(`[[name]]`, currName);
                    }
                    if(currCompany){
                        emailSubject = emailSubject.replaceAll(`[[company]]`, currCompany);
                    }

                    emailBody = emailBody.replaceAll(`[[email]]`, currEmail);
                    if(currName){
                        emailBody = emailBody.replaceAll(`[[name]]`, currName);
                    }
                    if(currCompany){
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
                    console.log("SrlNo: ", allEmailMeta[i].SrNo, " | ", "Email: ", allEmailMeta[i].Email, " | ", "Email Response: ", allEmailResp[i]);
                }
            }

            return true;
        }catch(e){
            console.log('Error in EmailService.readExcelFileAndSendEmail: ', error);
            return false;
        }
    }
}

module.exports = new EmailService();