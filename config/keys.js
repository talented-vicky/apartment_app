require('dotenv').config();

module.exports = {
    PORT: process.env.port || 5000,
    mongoDB_URL: process.env.mongoDB_URL,
    json_secret: process.env.json_secret,
    sendgrid_api_key: process.env.sendgrid_api_key,
    client_id: process.env.client_id,
    client_secret: process.env.client_secret,
    redirect_url: process.env.redirect_url,
    cloudinary_api_key: process.env.cloudinary_api_key,
    cloudinary_api_secret: process.env.cloudinary_api_secret,
    cloudinary_name: process.env.cloudinary_name
}