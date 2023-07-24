const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema(
    {
        message: {
            type: String
        },
        sender: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Chat', chatSchema)