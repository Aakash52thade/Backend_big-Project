import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from './routes/user.routes.js'
import videoRoute from "./routes/video.routes.js";

// => cookieParser => from our server to access the 
// cookies form user browser, and modified it as well

const app = express();



app.use(cors())// we use cors when we have to connect with middleware or configuration

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// WE CONFIGURE json that we allow json file
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended : true, limit: "16kb"})) //extended use for we write object inside object 

app.use(express.static("public"))
app.use(cookieParser())
// static => used to store file and folder 


//import route


//  rotues declaration
app.use("/api/v1/users", userRoute)

//http://localhost:8000/users/register

//
//  app.use("/api/v1/videos", videoRoute)
app.use("/api/v1/videos", videoRoute);


export default app;











// import { Router } from 'express';
// import {
//     deleteVideo,
//     getAllVideos,
//     getVideoById,
//     publishAVideo,
//     togglePublishStatus,
//     updateVideo,
// } from "../controllers/video.controllers.js"
// import {verifyJWT} from "../middlewares/auth.middleware.js"
// import {upload} from "../middlewares/multer.middleware.js"

// const router = Router();
// router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// router
//     .route("/")
//     .get(getAllVideos)
//     .post(
//         upload.fields([
//             {
//                 name: "videoFile",
//                 maxCount: 1,
//             },
//             {
//                 name: "thumbnail",
//                 maxCount: 1,
//             },
            
//         ]),
//         publishAVideo
//     );

// router
//     .route("/:videoId")
//     .get(getVideoById)
//     .delete(deleteVideo)
//     .patch(upload.single("thumbnail"), updateVideo);

// router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

// export default router
