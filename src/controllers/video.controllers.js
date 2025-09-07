// import mongoose, {isValidObjectId} from "mongoose"
// import { Video } from "../models/video.model.js"
// import { User } from "../models/user.model.js"
// import { ApiError } from "../utils/ApiError.js"
// import { ApiResponse } from "../utils/ApiResponse.js"
// import { asyncHandler } from "../utils/asyncHandler.js"
// import { uploadOnCloudinary } from "../utils/cloudinary.js"


// const getAllVideos = asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

//     //1. convert page and limit number
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit)

//     //2 define filter criteria
//     let filter = {};
//     if(query) {
//         filter.title = {$regex: query, $options: "i"}; // Case-insensitive search

//     }
//     if(userId) {
//         filter.owner = userId;
//     }

//     //3 define sorting criteria
//     const sortCriteria = {}
//     sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;

//     //4 user aggregation with pagination
//     const videos = await Video.aggregate([
//         {
//             $match: filter
//         },
//         {
//             $sort: sortCriteria
//         },
//         {
//             $skip: (pageNum - 1) * limitNum
//         },
//         {
//            $limit: limitNum
//         },
        
//     ])

//     const totalVideos = await Video.countDocuments(filter);

//     return res.status(200).json(
//         new ApiResponse(200, {videos, totalVideos, page: pageNum},

//         )
//     )
// })

// const publishAVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params
//     //TODO: get video by id

//     const {title, description} = req.body;

//     //1 validate request body
//     if(!title || !description || !req.files?.videoFile || !req.files?.thumbnail){
//         throw new ApiError(400, "All fields are required including video and thumbnail");

//     }

//     //upload video and thumbnail to cloudinary
//     const videoUpload = await uploadOnCloudinary(req.files.videoFile[0].path, "video");
//     const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path, "image");
    
//     if(!videoUpload || !thumbnailUpload) {
//         throw new ApiError(500, "Error uploading media files")
//     }

//     //create new video document
//     const newVideo = await Video.create({
//         videoFile: videoUpload.secure_url,
//         thumbnail: thumbnailUpload.secure_url,
//         title,
//         description,
//         duration: 0,
//         owner: req.user._id
//     });

//     return res.status(201).json(new ApiResponse(201, newVideo, "video published successfully"));
// })



// export {
//     getAllVideos,
//     publishAVideo
// };


import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" };
    }
    if (userId) {
        filter.owner = userId;
    }

    const sortCriteria = {};
    sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;

    const videos = await Video.aggregate([
        { $match: filter },
        { $sort: sortCriteria },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
    ]);

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, { videos, totalVideos, page: pageNum })
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description || !req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "All fields are required including video and thumbnail");
    }

    const videoUpload = await uploadOnCloudinary(req.files.videoFile[0].path, "video");
    const thumbnailUpload = await uploadOnCloudinary(req.files.thumbnail[0].path, "image");

    if (!videoUpload || !thumbnailUpload) {
        throw new ApiError(500, "Error uploading media files");
    }

   //create new video document
const newVideo = await Video.create({
    videoFile: videoUpload.secure_url,
    thumbnail: thumbnailUpload.secure_url,
    title,
    description,
    duration: 0, // Calculate the real duration if possible
    views: 0, // Default value to satisfy schema requirement
    isPublished: true, // Default value
    owner: req.user._id
});


    return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

export { getAllVideos, publishAVideo };
