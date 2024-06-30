# BulkEmailSender

## Overview

BulkEmailSender is a Node.js application designed to send bulk emails using predefined templates. The application leverages the Nodemailer module to handle email sending via Gmail's SMTP server.

## Features

- Send bulk emails to multiple recipients.
- Use predefined email templates with placeholders for dynamic content.
- Validate email addresses and receiver details.
- Log sent and failed email attempts.

## Prerequisites

- Node.js
- npm (Node Package Manager)
- A Gmail account for sending emails

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/sanyamgoel10/BulkEmailSender.git
    cd BulkEmailSender
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Configure the application:

    - Add `config.js` file in root folder.
    - Fill in your Gmail credentials and any other configuration details in `config.js`.

    ```javascript
    const config = {
        port: 3003,
        senderEmail : "your-email@gmail.com",
        senderPassword : "app-password-for-your-gmail-account",
    
        emailTemplate : {
            'sample email template': {
                subject: `Sample email subject for [[name]]`,
                body: `This is a test email sent to [[name]] who works at [[company]] company`
            }
        }
    };
    
    module.exports = config;
    ```

## Usage

1. Start the server:

    ```sh
    npm start
    ```

2. Send a POST request to `http://localhost:3003/sendemail` with the following JSON body:

    ```json
    {
        "TemplateId": "sample email template",
        "ReceiverDetails": {
            "email": ["example1@example.com", "example2@example.com"],
            "name": ["Name1", "Name2"],
            "company": ["Company1", "Company2"]
        }
    }
    ```

## API

### POST /sendemail

Send bulk emails using the specified template and receiver details.

#### Request Body

- `TemplateId` (string): The ID of the email template to use.
- `ReceiverDetails` (object): An object containing arrays of recipient details. Each key should map to an array of values, all arrays must be of the same length. Also, each of the key in ReceiverDetails object would be replace in [[key]] in the template which has been selected from the config

Example:

```json
{
    "TemplateId": "referral request",
    "ReceiverDetails": {
        "email": ["example1@example.com", "example2@example.com"],
        "name": ["Name1", "Name2"],
        "company": ["Company1", "Company2"]
    }
}
