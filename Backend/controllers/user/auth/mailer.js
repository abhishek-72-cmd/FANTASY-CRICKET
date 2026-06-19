require('dotenv').config();
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
      connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000
})



transporter.verify((error, success) => {
    if (error) {
        console.error("MAIL VERIFY ERROR:", error);
    } else {
        console.log("MAIL SERVER READY");
    }
});

module.exports = transporter;