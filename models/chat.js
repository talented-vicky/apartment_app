const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },   
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }   
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Chat', chatSchema)