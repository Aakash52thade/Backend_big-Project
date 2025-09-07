import {v2 as cloudinary} from "cloudinary"
import fs from "fs";  // fs is file system;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath, fileType = "auto") => {
    try{
       if(!localFilePath) return null;

       let response;

       if(fileType === "video") {

        response = await cloudinary.uploader.upload_large(localFilePath, {
            resource_type: "video",
            
        })
       }else {
        response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "image",
        })
       }

       // file has been uploaded successfully,
       console.log("file is uploaded on Cloudinary", response.secure_url);
       fs.unlinkSync(localFilePath) // here we can say unlink from multor file
       console.log("response of cloudinary", response)
       return response;
    }catch(error) {
       // we use fs [file system] and use unlineSync means unlink the file synchronusly
        // because some file is store in our local system
    // but it's not been uploaded is our cloudinary so it will also remove form our local
     // system for optimization
     console.error("Cloudinary Upload Error:", error);

     fs.unlinkSync(localFilePath) 
     return null;
    }
}

export {uploadOnCloudinary}