const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
    {
        google: {
            id: {
                type: String
            },
            email: {
                type: String
            },
            name: {
                type: String
            },
        },
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        address: {
            type: String
        },
        token: String,
        tokenExp: Date,
        status: {
            type: String,
            required: true
        },
        reported: {
            type: Number,
            default: 0
        },
        activated: {
            type: Boolean,
            default: true
        },
        apartments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Apartment'
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema)