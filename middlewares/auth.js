const jwt = require("jsonwebtoken")

const { json_secret } = require("../config/keys")

module.exports = async (req, res, next) => {
    const header = req.get("Authorization")
    // const header = req.headers.authorization.split(" ")[1]
    if(!header){
        const error = new Error("No headers found")
        error.statusCode = 401
        throw error
    }

    const token = header.split(" ")[1]
    let decodedtoken;
    try {
        decodedtoken = await jwt.verify(token, json_secret)
        // decoding token which is an encryption of studentemail, studentid
        // and json_secret, and verifying this with the json_secret
    } catch (error) {
        error.statusCode = 500
        throw error
    }

    if(!decodedtoken){
        const error = new Error("Unauthorized Access")
        error.statusCode = 401
        throw error
    }
    req.userId = decodedtoken.userId
    next() //to reach the next middleware (controller)
}