const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ownerSchema = new Schema(
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
        address: {
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
        token: String,
        tokenExp: Date,
        status: {
            type: String,
            default: "owner"
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

module.exports = mongoose.model('Owner', ownerSchema)