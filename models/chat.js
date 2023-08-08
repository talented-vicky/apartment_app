const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
    message: {
        type: String
    },
    sender: {
        type: String
        // this should the user email
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
    
})

module.exports = mongoose.model('Chat', chatSchema)