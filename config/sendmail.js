const sgMail = require('@sendgrid/mail')
const { sendgrid_api_key } = require('./keys')

sgMail.setApiKey(sendgrid_api_key)

const sendMail = async (userEmail, url, token) => {
    const msg = {
        to: userEmail,
        from: 'victorotubure7@gmail.com',
        subject: 'Password Reset',
        text: 'You are receiving this email because you requested to reset your password',
        html: `
            <h1> Hello ${userEmail} </h1>
            <h2> A request has been received to change your password </h2>
            <p> click on this <a href="http://localhost:5000/${url}/${token}"> link </a> to continue reset </p>
        `
        // frontend should display a page with this info
        // this link should be what displays the form to enter
        // new password credentials
    },
    
    const sendMail = await sgMail.send(msg)
    if(!sendMail) {
        const error = new Error("unable to send mail")
        error.statusCode = 550
        throw error
    }
    res.status(200).json({message: "Sent code successfully"})
}

module.exports = { sendMail }