require('dotenv').config();

module.exports = {
    PORT: process.env.port || 5000,
    mongoDB_URL: process.env.mongoDB_URL
}