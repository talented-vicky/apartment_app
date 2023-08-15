const { validationResult } = require('express-validator')
const cloudinary = require('cloudinary').v2

// importing files I saved in other folders
const Apartment = require('../models/apartment')
const User = require('../models/user')
const Comment = require('../models/comment')
const Like = require('../models/like')

// getting cloudinary details from the .env file
const { cloudinary_api_key, cloudinary_api_secret, cloudinary_name } = require('../config/keys')

// configuring cloudinary for usage
cloudinary.config({
    cloud_name: cloudinary_name,
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret
})


// predefining validation function for each controller function
const validateFunc = (request) => {
    const errors = validationResult(request)
    if(!errors.isEmpty()){
        const error = new Error("Validation Failed")
        error.statusCode = 401
        throw error
    }
}

// predefining function in case error occuss when looking into database
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
        // const apart = await Apartment.findById("64d6c91d78f68b064e1d9599")
        notInDB(apart, "Apartment")

        res.status(200).json({message: "Successfully Fetched Apartment", data: apart})
    } catch (error) {
        next(error)
    }
}

exports.createApartment = async (req, res, next) => {
    validateFunc(req);
    // check if a file is uploaded or not and return an error
    if(!req.file){
        const error = new Error("No File Uploaded")
        error.statusCode = 422
        throw error
    }

    // if file was uploaded, get file and all other input fields entered by user
    const { name, description, location, postCode, categories, rooms, lowestPrice, highestPrice } = req.body
    let image
    const initImage = req.file.path
    
    try {
        // get image loaded by user and save to cloudinary
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
        // now save all input fields and image uploaded into the database
        const apartment = new Apartment({ name, description, image, postCode, categories, location, rooms, lowestPrice, highestPrice, owner: req.userId})
        // const apartment = new Apartment({ name, description, image, location, postCode, categories, rooms, lowestPrice, highestPrice, owner: "64d596c41965fbfd4b382918"})

        const user = await User.findById(req.userId)
        // const user = await User.findById("64d596c41965fbfd4b382918")
        apartment.user = user._id
        user.apartments.push(apartment)

        await user.save()
        await apartment.save()

        // save user and apartment database
        res.status(201).json({ message: "Successfully Added Apartment", data: apartment })
        
    } catch (error) {
        next(error)
    }
}

// URGENT URGENT URGENT *******
// fix this
// this is similar as the code above
exports.updateApartment = async (req, res, next) => {
    validateFunc(req);
    let image;
    if(req.file){
        image = req.file.path
    }

    const { name, description, location, categories, rooms, lowestPrice, highestPrice } = req.body;
    const apart = Apartment.findById(req.params.apartId);
    // const apart = await Apartment.findById("64bbfcf3af49850083a4f0d3");
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
    // get apartment id from url sent by frontend
    const apartID = req.params.apartId;
    try {
        // check database if any apartment matches thid id and return error if
        // request fails
        const apart = await Apartment.findById(apartID)
        notInDB(apart, "Apartment")

        // check if currently logged in user is the creator of the apartment
        // throw an unauthorization error if not
        if(apart.owner.toString() !== req.userId){
            const error = new Error("Unauthorized Access")
            error.statusCode = 403
            throw error
        }

        // if authorization check passes, let logged in user delete the apartment
        await Apartment.findByIdAndRemove(apartID)
        await apart.save()

        const user = await User.findById(req.userId)
        user.apartments.pull(apartID)

        // save updated user database and send success message to user
        await user.save()
        res.status(200).json({message: "Successfully Deleted Apartment"})

    } catch (error) {
        next(error)
    }

}


// COMMENTS
exports.fetchComments = async (req, res, next) => {
    try {
        // check for all comments and send to users
        const comment = await Comment.find()
        // throw error if request fails
        notInDB(comment, "Comments")

        // send a success message upon completion
        res.status(200).json({message: "Successfully Fetched Comments", data: comment})
    
    } catch (error) {
        next(error)
    }
}

exports.fetchComment = async (req, res, next) => {
    // same as the controller above, but for only one comment via its id
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
    // get comment information from user and save to database
    const comment = new Comment({ content, user: req.userId });
    // const comment = new Comment({ content, user: "64d0e4f561527ea6fece8c67" });
    
    const apartID = req.params.apartId;
    try {
        apart = await Apartment.findById(apartID)
        // apart = await Apartment.findById("64d18ce6899e1b972993b574")
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

    // get a comment that matches the id passed in the url from the frontend
    // and edit the comment body
    const { content } = req.body

    try {
        const comment = await Comment.findById(req.params.commentId)
        // const comment = await Comment.findById("64bc1b29cb83ff1a60bff173")
        notInDB(comment, "Comment")

        comment.content = content
        await comment.save()
        // save to databse and send a success message upon completion
        res.status(200).json({message: "Successfully Edited Comment", data: comment})
    } catch (error) {
        next(error)
    }
}

exports.removeComment = async (req, res, next) => {
    // get comment id from frontend url
    const commentID = req.params.commentId
    try {
        // check database if it exists and remove it, throw error if proces fails
        // const comment = await Comment.findById("64bcff2be03fc8e42ee0bc68")
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")
        
        await Comment.findByIdAndRemove(commentID)
        // send a success message if operation was carried out without errors
        res.status(200).json({message: "Successfully Deleted Comment"})
    } catch (error) {
        next(error)
    }
}

exports.getLikes = async (req, res, next) => {
    // get comment id from url sent by frontend
    const commentID = req.params.commentId;
    try {
        // find and send back all the liked that belongs to this comment
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")

        // send back all the likes that belong to this comment
        const likes = comment.likes
        // send success message and return all likes belonging to this comment
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
    // check for comment id in url from frontend
    try {
        // look for it in database
        const comment = await Comment.findById(commentID)
        // throw error if process fails
        notInDB(comment, "Comment")
    
        // ensuring users can't like twice
        const oldLike = await Like.findOne({user: req.userId})
        if(oldLike){
            return res.status(200).json({
                message: "Post already liked by you"
            })
        }

        // check if any like was done by currently logged in user
        const like = new Like({action: "like", user: req.userId})
        comment.likes.push(like)

        // update both like and comment model in database
        await like.save()
        await comment.save()

    } catch (error) {
        next(error)
    }
}

exports.unlikeComment = async (req, res, next) => {
    // get a comment from the frontend url by its id
    const commentID = req.params.commentId;
    try {
        // check if it exists in the database and throw error process fails
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")

        // check if comment is already liked by logged in user, if yes unlike
        const oldLike = await Like.findOne({user: req.userId})

        // send "reject" message if not already liked by currently logged in user
        if(!oldLike){
            return res.status(200).json({
                message: "Success, Was Never liked btw"
            })
        }
        // remove like by user and save to the database
        comment.likes.pull(oldLike)
        await comment.save()
        
    } catch (error) {
        next(error)
    }
}