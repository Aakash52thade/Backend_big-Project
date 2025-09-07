

import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        // Ensure there's no double slash in the connection string
        const mongoURI = process.env.MONGODB_URI.endsWith("/")
            ? `${process.env.MONGODB_URI}${DB_NAME}`
            : `${process.env.MONGODB_URI}/${DB_NAME}`;

        // const connectionInstance = await mongoose.connect(mongoURI, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // });
        

        const connectionInstance = await mongoose.connect(mongoURI);


        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED", error);
        process.exit(1);
    }
};

export default connectDB;
