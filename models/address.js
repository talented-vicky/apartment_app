const mongoose = require('mongoose')
const Schema = mongoose.Schema

const addressSchema = new Schema({
    location: {
        type: String,
        required: true
    },
})

module.exports = mongoose.model('Address', addressSchema)