const emailSendGrid = require('@sendgrid/mail');

require('dotenv').config('../config.env')

emailSendGrid.setApiKey(process.env.SENDGRID_API_KEY)

const emailConfig = async (link, email, subject, text) => {
    const emailContent = {
        to: email,
        from: 'vitorvpio60@gmail.com',
        subject: subject,
        text: link,
        html: text
    }
    await emailSendGrid
        .send(emailContent)
        .then(() => {
            console.log(`Email sent for ${email}`)
        })
        .catch((error) => {
            console.log(error)
        })

}

module.exports = emailConfig;