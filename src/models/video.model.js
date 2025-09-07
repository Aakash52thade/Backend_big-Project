import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//we use mongoose-aggregate-paginate, we use this because we can't give all the videos to user
//that's why we use paginate, means the other videos lie on other page,
//same pagitnate we can use this in commnet model as well.., becasue we also not show all the comment at once  
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: false,
            default: 0
        },
        views: {
            type: Number,
            default: 0,
            
        }, 
        isPublished: {
            type: Boolean,
            default: true,
        }, 
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema)