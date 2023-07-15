const mongoose = require('mongoose')
const Schema = mongoose.Schema

const apartmentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
})

module.exports = mongoose.model('Apartment', apartmentSchema)