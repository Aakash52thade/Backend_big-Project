import {v2 as cloudinary} from "cloudinary"
import fs from "fs";  // fs is file system;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try{
       if(!localFilePath) return null;

       //upload file on Cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
         resource_type: "auto"
       })

       // file has been uploaded successfully,
       console.log("file is uploaded on Cloudinary", response.url);
       return response;
    }catch(error) {
       // we use fs [file system] and use unlineSync means unlink the file synchronusly
        // because some file is store in our local system
    // but it's not been uploaded is our cloudinary so it will also remove form our local
     // system for optimization
     fs.unlinkSync(localFilePath) 
     return null;
    }
}

export {uploadOnCloudinary}