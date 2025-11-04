const nodemailer = require("nodemailer");

require('dotenv').config('../.config.env')

const emailConfig = async (link, email, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: process.env.PORT_EMAIL_DEV,
        secure: false,
        auth: {
            user: process.env.EMAIL_HOST_DEV,
            pass: process.env.EMAIL_PASSWORD_DEV
        }
    })
    const info = await transporter.sendMail({
        from: `"Vitor Pio Vieira" <${process.env.EMAIL_HOST_DEV}>`,
        to: email,
        subject: subject,
        text: text,
        html: link
    })
    return info
} 

module.exports = emailConfig;