const express = require('express')

const userRoute = require('./controllers/users')
const apartmentRoute = require('./controllers/apartments')

const { PORT } = require('./config/keys')
const { connectDB } = require('./config/db')
const { logger } = require('./config/logger')

const app = express()

app.use(userRoute)

app.use((err, req, res, next) => {
    const status = err.statusCode || 500
    const msg = err.message
    res.status(status).json({message: msg})
})

connectDB()
app.listen(PORT, "0.0.0.0", () => logger.info(`Connection live on port: ${PORT}`))