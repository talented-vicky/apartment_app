const express = require('express')
const bodyparser = require('body-parser')

const userRoute = require('./routes/users')
const apartmentRoute = require('./routes/apartments')

const { PORT } = require('./config/keys')
const { connectDB } = require('./config/db')
const { logger } = require('./config/logger')

const app = express()

app.use(bodyparser.json())
// helps server understand client data


app.use(userRoute)

app.use((err, req, res, next) => {
    const status = err.statusCode || 500
    const msg = err.message
    const data = err.data
    res.status(status).json({message: msg, data: data})
})

connectDB()
app.listen(PORT, "0.0.0.0", () => logger.info(`Connection live on port: ${PORT}`))