import mongoose, { mongo } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";



const getVideoComments = asyncHandler(async(req, res) => {
      
    // 1. Extract videoId from req.params.
    const {videoId} = req.params

    const {page = 1, limit = 10} = req.query;

    //get all comment's for video
    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        populate:{path: "owner", select: "username email"},
        sort: {createdAt: -1},
    };

    //using mongoose aggregation pipelint the. perform complex data processing opration on a collection of
    //document by changing togather multiple stages "pipeline" allowing you to filter, group, calculate, and
    //manipulate the data within the database, 
    //rather than retrieving all data to the application layer first

    const comment = await Comment.aggregatePaginate(
        Comment.aggregate( // here we use aggregtion pipeline of filter videoId
            [
                {$match: {video: new mongoose.Types.ObjectId(videoId)}}
            ]
        ), 
                options
    );

    res.status(200).
    json(new ApiResponse(200, comment, "Comments fetched successfully"));
    
})

// TODO: 
    // 1. Extract videoId from req.params.
    // 2. Extract the comment content from req.body.
    // 3. Get the authenticated user ID from req.user.
    // 4. Validate that the content is not empty.
    // 5. Create a new comment document with content, videoId, and owner.
    // 6. Save the new comment to the database.
    // 7. Return the newly created comment in the response.

const addComment = asyncHandler(async(req, res) => {
    // 1. Extract videoId from req.params.
    const {videoId}  = req.params;

    //2nd.  Extract the comment content from req.body. 
    const {content} = req.body;

    // 3. Get the authenticated user ID from req.user.
    const userId = req.user._id

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "InValid Video id")
    }

    // 4. Validate that the content is not empty.
    if(!content?.trim()){
        throw new ApiError(400, "the comment content can't be empty")
    }

    const newComment = await Comment.create({content, video:videoId, owner: userId})

    res.status(200).
    json(
        new ApiResponse(201, newComment, "comment added successfully")
    )
}) 

const updateComment = asyncHandler(async(req, res) => {

    // 1. Extract commentId from req.params.
    const {commentId} = req.params;

    // 2. Extract updated content from req.body.
    const {content} = req.body;

    //
    const userId = req.user._id;

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment Id")
    }

    if(!content?.trim()) {
        throw new ApiError(400, "Updated contnet can't be empty")
    }

    // 3. Find the comment by ID in the database.
    const comment = await Comment.findById(commentId);

    // 4. Ensure the comment exists and belongs to the authenticated user.
    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(!comment.owner.equals(userId)){
        throw new ApiError(403, "you can only edit your own comments")
    }

    comment.content = content;

    await comment.save();

    res.status(200).
    json(new ApiResponse(200, comment, "Comment updated successfully"))
  
})

const deleteComment = asyncHandler(async(req, res) => {
 
    // 1. Extract commentId from req.params.
    const {commentId} = req.params;

    const userId = req.user._id;

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new ApiError(400, "Comment not found")
    }
    

    // 4. Delete the comment from the database.

     await Comment.deleteOne(comment)

    if(!comment.owner.equals(userId)) {
        throw new ApiError(403, "you can only delete your own comments")
    }

    await comment.deleteOne();

    // 5. Return a success response confirming deletion.
    res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
}