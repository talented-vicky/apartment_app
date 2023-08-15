const sgMail = require('@sendgrid/mail')

const { sendgrid_api_key } = require('./keys')

// setting up email sending funtionality using sendgrid api
const funcSendMail = async (userEmail, url, token) => {
    sgMail.setApiKey(sendgrid_api_key)
    const redirectUrl = `http://localhost:5000/${url}/?token=${token}`
    const msg = {
        to: userEmail,
        from: 'victorotubure7@gmail.com',
        subject: 'Password Reset',
        text: `<p> click on this <a href="${redirectUrl}"> link </a> to continue reset </p>`
        
    };
    
    const result = await sgMail.send(msg)
    if(!result) {
        const error = new Error("Error sending mail")
        error.statusCode = 500
        throw error
    };
    return result
}

module.exports = { funcSendMail }