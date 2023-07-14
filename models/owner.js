const mongoose = require('mongoose')
const Schema = mongoose.Schema()

const ownerSchema = new Schema(
    {
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