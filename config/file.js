const multer = require('multer')

const fileStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
        // callback(null, '../images')
        // check two code lines
    },
    filename: (req, file, callback) => {
        const pre = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
        callback(null, `${pre}-${file.originalname}`)
    }
})

const filter = (req, file, callback) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        callback(null, true)
    } else {
        callback(null, false)
    }
}

module.exports = { fileStorage, filter}