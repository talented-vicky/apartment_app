const mongoose = require("mongoose")
const Schema = mongoose.Schema

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Like'
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Comment', commentSchema)