import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // user who subscribe the channel
        ref: "User"
    },

    channel: {
        type: Schema.Types.ObjectId, //the owner of channel the user subscribe their channel
        ref: User
    }
}, {timestamps: true})

export const Subsciption = mongoose.model("Subsciption", subscriptionSchema)