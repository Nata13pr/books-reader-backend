const nodemailer = require('nodemailer');

require('dotenv').config();

const {GMAIL_PASSWORD} = process.env;

const nodemailerConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'nata13pr@gmail.com',
        pass: GMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
}

const transport = nodemailer.createTransport(nodemailerConfig);


const sendEmail=async (data)=>{
    const email={...data,from:'nata13pr@gmail.com'};
    await transport.sendMail(email)
    return true;
}
module.exports = sendEmail;