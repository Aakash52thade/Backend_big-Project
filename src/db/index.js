import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";  // ✅ Ensure correct import

const connectDB = async () => {
    try {
        // ✅ Fix: Ensure the function call is properly formatted
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DB_NAME}`
        );

        console.log(`\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`);
      
    } catch (error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDB;
