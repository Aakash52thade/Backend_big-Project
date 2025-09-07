import { Router }  from "express";
import {loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"; // here we use multer middleware means [file upload hone se pahele mil ke jana]

import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), // filed accept array
    registerUser
); // Correct


//
router.route("/login").post(loginUser)


//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/avater").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover_image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile) ///c/:username because we get this from req.params so we have to get this from that way
//router.route("/c/:username") when we test this route in postmen then we
// don't need to write : or clone when we right routes, remember it.


router.route("/history").get(verifyJWT, getWatchHistory)







export default router