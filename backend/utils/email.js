const nodemailer = require("nodemailer");
const AppError = require("./appError");

const emailConfig = async (link, email, subject, text, next) => {
    if (process.env.NODE_ENV === "development") {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: process.env.PORT_EMAIL_DEV,
                secure: false,
                auth: {
                    user: process.env.EMAIL_HOST_DEV,
                    pass: process.env.EMAIL_PASSWORD_DEV
                }
            })

            const htmlBody = ` 
               <h1>${subject}</h1>
               <p>${text}</p>
               ${link ? `<p>Please, click on the link bellow to continue:</p>
               <a href:"${link}" target="_blank" >Confirm the action</a>
               <br>
               <p>If you cant click, copy and past this URL in the browser:</p>
               <p>${link}</p>
               `: ``}
            `
            const info = await transporter.sendMail({
                from: `"Vitor Pio Vieira" < ${process.env.EMAIL_HOST_DEV}> `,
                to: email,
                subject: subject,
                text: text,
                html: htmlBody
            })
            console.log('--- [email.js] Email enviado! ID:', info.messageId);

            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            return info
        } catch (error) {
            return next(new AppError(error, 500))
        }
    } else {
        return 1
    }
}

module.exports = emailConfig;