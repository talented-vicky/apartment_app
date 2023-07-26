const { validationResult } = require('express-validator')

const Apartment = require('../models/apartment')
const User = require('../models/user')
const Comment = require('../models/comment')

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

const emptyData = (data, constant) => {
    if(data.length == 0){
        return res.status(200).json({
            message: `No ${constant} found`,
            data: data
        })
    }
}

exports.fetchApartments = async (req, res, next) => {
    try {
        const aparts = await Apartment.find()
        notInDB(aparts, "Apartments")
        emptyData(aparts, "Apartments")
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

    const { name, description, location, categories, rooms, lowestPrice, highestPrice } = req.body
    const image = req.file.path
    const apartment = new Apartment({ name, description, image, location, categories, rooms, lowestPrice, highestPrice })
    
    try {
        const user = await User.findById(req.userId)
        // const user = await User.findById("64bee4a8a59769b0633fd6c4")
        apartment.user = user._id
        user.apartments.push(apartment)

        await user.save()
        await apartment.save()

        res.status(201).json({ message: "Successfully Added Apartment", data: apartment })
        
    } catch (error) {
        next(error)
    }
    // location and type should be the class name for the 
    // select container for all their options
}


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
        emptyData(comment, "Comments")
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
    // const comment = new Comment({ content, user: "64b5092e6e898ce12f9198f5" });
    
    const apartID = req.params.apartId;
    try {
        apart = await Apartment.findById(apartID)
        // apart = await Apartment.findById("64bbfcf3af49850083a4f0d3")
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
        // const comment = await Comment.findById("64bc1b29cb83ff1a60bff173")
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
        // const comment = await Comment.findById("64bcff2be03fc8e42ee0bc68")
        const comment = await Comment.findById(commentID)
        notInDB(comment, "Comment")
        
        await Comment.findByIdAndRemove(commentID)
        res.status(200).json({message: "Successfully Deleted Comment"})
    } catch (error) {
        next(error)
    }
}