const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postCodeSchema = new Schema({
    postcode: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Postcode', postCodeSchema)