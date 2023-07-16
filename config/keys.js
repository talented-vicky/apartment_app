require('dotenv').config();

module.exports = {
    PORT: process.env.port || 5000,
    mongoDB_URL: process.env.mongoDB_URL,
    json_secret: process.env.json_secret,
    sendgrid_api_key: process.env.sendgrid_api_key
}