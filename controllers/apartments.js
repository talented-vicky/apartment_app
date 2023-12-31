const { validationResult } = require('express-validator')
const cloudinary = require('cloudinary').v2

const Apartment = require('../models/apartment')
const User = require('../models/user')
const Comment = require('../models/comment')
const Like = require('../models/like')

const { cloudinary_api_key, cloudinary_api_secret, cloudinary_name } = require('../config/keys')

cloudinary.config({
    cloud_name: cloudinary_name,
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret
})

const validateFunc = (request) => {
    const errors = validationResult(request)
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed")
        error.statusCode = 401
        throw error
    }
}

const notInDB = (constant, name) => {
    if(!constant){
        const error = new Error(`${name} Not Found`)
        error.statusCode = 401
        throw error
    }
}

// APARTMENTS
exports.fetchApartments = async (req, res, next) => {
    try {
        const aparts = await Apartment.find()
        notInDB(aparts, "Apartments")

        res.status(200).json({message: "Successfully Fetched Apartments", data: aparts})
        
    } catch (error) {
        next(error)
    }
}

exports.fetchApartment = async (req, res, next) => {
    const apartID = req.params.apartId
    try {
        const apart = await Apartment.findById(apartID)
        notInDB(apart, "Apartment")

        res.status(200).json({message: "Successfully Fetched Apartment", data: apart})
    } catch (error) {
        next(error)
    }
}

exports.createApartment = async (req, res, next) => {
    validateFunc(req);
    if(!req.file){
        const error = new Error("No File Uploaded")
        error.statusCode = 422
        throw error
    }

    const { name, description, location, postCode, categories, rooms, lowestPrice, highestPrice } = req.body
    let image
    const initImage = req.file.path
    
    try {
        await cloudinary.uploader.upload(
            initImage,
            async (err, result) => {
                if(err){
                    const error = new Error("Error Uploading image to cloudinary")
                    error.statusCode = 402
                    throw error
                }
                image = result.secure_url
            }
        )
        const apartment = new Apartment({ name, description, image, postCode, categories, location, rooms, lowestPrice, highestPrice, owner: req.userId})
        const user = await User.findById(req.userId)
        apartment.user = user._id
        user.apartments.push(apartment)

        await user.save()
        await apartment.save()        
        res.status(201).json({ message: "Successfully Added Apartment", data: apartment })

    } catch (error) {
        next(error)
    }
}

// URGENT URGENT URGENT *******
exports.updateApartment = async (req, res, next) => {
    validateFunc(req);
    let image;
    if(req.file){
        image = req.file.path
    }

    const { name, description, location, categories, rooms, lowestPrice, highestPrice } = req.body;
    const apart = Apartment.findById(req.params.apartId);
    notInDB(apart, "Apartment")
    if(apart.owner.toString() !== req.userId){
        const error = new Error("Not Authorized")
        error.statusCode = 422
        throw error
    }

    apart.name = name; apart.description = description; 
    apart.location = location; apart.categories = categories; apart.rooms = rooms; 
    apart.lowestPrice = lowestPrice; apart.highestPrice = highestPrice

    await apart.save()
    res.status(200).json({message: "Successfully Updated Apartment", data: apart})
}

exports.deleteApartment = async (req, res, next) => {
    const apartID = req.params.apartId;
    try {
        const apart = await Apartment.findById(apartID)
        notInDB(apart, "Apartment")

        if(apart.owner.toString() !== req.userId){
            const error = new Error("Unauthorized Access")
            error.statusCode = 403
            throw error
        }

        await Apartment.findByIdAndRemove(apartID)
        await apart.save()

        const user = await User.findById(req.userId)
        user.apartments.pull(apartID)
        await user.save()
        res.status(200).json({message: "Successfully Deleted Apartment"})

    } catch (error) {
        next(error)
    }

}


// COMMENTS
exports.fetchComments = async (req, res, next) => {
    try {
        const comment = await Comment.find()
        notInDB(comment, "Comments")
        res.status(200).json({message: "Successfully Fetched Comments", data: comment})
    
    } catch (error) {
        next(error)
    }
}

exports.fetchComment = async (req, res, next) => {
    const commentID = req.params.commentId;
    try {
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")
        res.status(200).json({message: "Successfully Fetched Comment!", data: comment})
    } catch (error) {
        next(error)
    }
}

exports.addComment = async (req, res, next) => {
    validateFunc(req);
    const { content } = req.body;
    const comment = new Comment({ content, user: req.userId });
    
    const apartID = req.params.apartId;
    try {
        const apart = await Apartment.findById(apartID)
        notInDB(apart, "Apartment")

        apart.comments.push(comment)
        await apart.save()
        await comment.save()
        res.status(200).json({message: "Successfully Added Comment", data: comment})

    } catch (error) {
        next(error)
    }
}

exports.editComment = async (req, res, next) => {
    validateFunc(req);
    const { content } = req.body

    try {
        const comment = await Comment.findById(req.params.commentId)
        notInDB(comment, "Comment")

        comment.content = content
        await comment.save()
        res.status(200).json({message: "Successfully Edited Comment", data: comment})
    } catch (error) {
        next(error)
    }
}

exports.removeComment = async (req, res, next) => {
    const commentID = req.params.commentId
    try {
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")
        
        await Comment.findByIdAndRemove(commentID)
        res.status(200).json({message: "Successfully Deleted Comment"})
    } catch (error) {
        next(error)
    }
}

exports.getLikes = async (req, res, next) => {
    const commentID = req.params.commentId;
    try {
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")

        const likes = comment.likes
        res.status(200).json({
            message: "Successfully fetched all likes",
            data: likes
        })
    } catch (error) {
        next(error)
    }
}

exports.likeComment = async (req, res, next) => {
    const commentID = req.params.commentId;
    try {
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")
    
        const oldLike = await Like.findOne({user: req.userId})
        if(oldLike){
            return res.status(200).json({
                message: "Post already liked by you"
            })
        }

        const like = new Like({action: "like", user: req.userId})
        comment.likes.push(like)

        await like.save()
        await comment.save()

    } catch (error) {
        next(error)
    }
}

exports.unlikeComment = async (req, res, next) => {
    const commentID = req.params.commentId;
    try {
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")

        const oldLike = await Like.findOne({user: req.userId})

        if(!oldLike){
            return res.status(200).json({
                message: "Success, Was Never liked btw"
            })
        }
        comment.likes.pull(oldLike)
        await comment.save()
        
    } catch (error) {
        next(error)
    }
}