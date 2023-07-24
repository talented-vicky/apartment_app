exports.getChat = (req, res, next) => {
    res.setHeader("Content-Type", "application/json")
    res.statusCode = 200

}

exports.getUser = (req, res, next) => {
    username = localStorage.setItem("user", req.body.username)
}