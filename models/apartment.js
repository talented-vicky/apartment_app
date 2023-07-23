const mongoose = require('mongoose')
const Schema = mongoose.Schema

const apartmentSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String, 
        required: true
    },
    image: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true,
    },
    categories: {
        type: String,
        required: true
    },
    rooms: {
        type: Number,
        required: true
    },
    lowestPrice: {
        type: Number,
        required: true
    },
    highestPrice: {
        type: Number,
        required: true
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'Owner',
        required: true
    },
})

module.exports = mongoose.model('Apartment', apartmentSchema)