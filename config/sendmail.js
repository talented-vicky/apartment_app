// const sgMail = require('@sendgrid/mail')

const noMail = require('nodemailer')
const sendGrid = require('nodemailer-sendgrid')

const { sendgrid_api_key } = require('./keys')

const funcSendMail = async (userEmail) => {
    const transport = noMail.createTransport(sendGrid({
        auth: {
            api_key: sendgrid_api_key
        }
    }))
    transport.sendMail({
        to: userEmail,
        from: 'victorotubure7@gmail.com',
        subject: 'Password Reset',
        text: 'You are receiving this email because you requested to reset your password',
        html: "<h1> Yo, I think it works now </h1>"
    })

    // contine here
    if(!result) {
        const error = new Error("unable to send mail")
        error.statusCode = 550
        throw error
    };
}
// const funcSendMail = async (userEmail, url, token) => {
//     sgMail.setApiKey(sendgrid_api_key)
//     const msg = {
//         to: userEmail,
//         from: 'victorotubure7@gmail.com',
//         subject: 'Password Reset',
//         text: 'You are receiving this email because you requested to reset your password',
//         html: `
//             <h1> Hello ${userEmail} </h1>
//             <h2> A request has been received to change your password </h2>
//             <p> click on this <a href="http://localhost:5000/${url}/${token}"> link </a> to continue reset </p>
//         `
//         // frontend should display a page with this info
//         // this link should be what displays the form to enter
//         // new password credentials
//     };
    
//     const result = await sgMail.send(msg)
//     if(!result) {
//         const error = new Error("unable to send mail")
//         error.statusCode = 550
//         throw error
//     };
// }

module.exports = { funcSendMail }