const nodemailer = require('nodemailer')

module.exports.sendEmail = (email, subject, html) => {

    const mailTransporter = nodemailer.createTransport({
        //service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    const mailDetails = {
        from: `Albastini<${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
    }
    mailTransporter.sendMail(mailDetails, (err, data) => {
        if (err) console.log('Mail ERROR=>', err)
        else console.log('Mail Sent successfully.=>', data)

    })
}


