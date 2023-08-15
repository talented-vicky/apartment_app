const mongoose = require('mongoose');

const { mongoDB_URL} = require('./keys');
const { logger } = require('./logger');

// connecting to the mongodb database
const connectDB = () => {
    mongoose.connect(mongoDB_URL);
    const mongdb = mongoose.connection;
    mongdb.on('connection', () => logger.info('Database connected successfully'));
    mongdb.on('error', () => logger.info(`Error occured while connecting to database, check connection or try again later, ${err}`));
};

module.exports = { connectDB };