import { asyncHandler } from "../utils/asyncHandler.js"; // might be js
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
// import { error, log } from "console";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async(userId) => {
  try {
    const user = await User.findById(userId); // this User is came from Mongoose user. 
    //so all the mongoose property came automatically to user
    const accessToken = user.generateAccessToken(); // we get access of genrate token from user
    const refreshToken = user.generateRefreshToken();

    // now we store refresh token in our database, because their has
    //two refresh token one has user and other has store in database
    user.refreshToken = refreshToken;

    // now we save user. BUT the password required true in user.model
    //so we user validateBeforSave: false. so it's not throw error
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}


    
  } catch (error) {
     throw new ApiError(500, "Something went wrong while genrating  refresh and access token")
  }
}


const registerUser = asyncHandler(async (req, res) => {
     
    const {fullName, email, username, password} = req.body;
    console.log("email", email)


    //where ever we want to use multer we have to import their upload function

    // now we validate our user's input it's empty or not
    // if(fullName === "") {
    //     throw new ApiError(400, "FullName is required")
    // } // you can check manually each case or i will tell you other way

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, "All the fields are required");
    }



    // case 3 => check weather user exists or not
      //question=> how can we check user exists or not
      //ans => we have models user.model there has User model that can directly communicate with database

      // * now we asked database find me user how can match with our email
      const existedUser = await User.findOne({
        $or: [{ username }, { email }] // now it will give us the user how match our username or email

      })

      if(existedUser) {
        throw  new ApiError(409, "User with email or username already exists");
      }


       // case 4 => check for images, check for avatar
       // note=> here we use req.file instead of req.body
       // as req.body give us additional features same 
       // multer give us req.file from user.routes.js
      
      
      const avatarLocalPath = req.files?.avatar[0]?.path

      
      // const coverImagesLocalPath =  req.files?.coverImage[0]?.path;

      let coverImagesLocalPath  = null;
      if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagesLocalPath = req.files.coverImage[0].path
      }
      
       
      if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImagesLocalPath)

    if(!avatar) {
      throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
      fullName, 
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password, 
      username: username.toLowerCase()  
    })

    //if we have user then mongodb automatically create (_id)
    // and their is filed .select() where we pass the things which we don't want

    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )

  if(!createdUser) {
    throw new ApiError(500, "something went wrong while creating user")
  } // we pass 500 because it's not user mistake

  return res.status(201).json(
    new ApiResponse(200, createdUser)
  )

})  

const loginUser = asyncHandler(async (req, res) => {
  // req.body = data fetch;
  // username or email validation
  // find the user
  // password check
  // access and refresh token
  // send cookie


  const {email, username, password} = req.body;

  if(!(username || email)) {
    throw new ApiError(400, "username or password is required")
  }

  //we find username or email
    
  // here we find either email or password, whatever come first 
  const user = await User.findOne({
    $or: [{username}, {email}]
  })

  if(!user) {
    throw new ApiError(404, "user does not exists")
  }

  const isPasswordValid = await user.isPasswordcorrect(password)

  if(!isPasswordValid){
    throw new ApiError(404, "password  is in-correct")

  }

  const {accessToken, refreshToken} =
  await generateAccessTokenAndRefreshToken(user._id)


  const loggedInUser = await
   User.findById(user._id).select("-password -refreshToken");

   const options = {  //by default the cookies can modifiyed by frontend
    //but when we do httpOnly: true, then it's only modified by server
    httpOnly : true,
    secure: true
   }

   return res
   .status(200).cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(
     200,{
      user: loggedInUser, refreshToken, accessToken
     },
     "User Logged In Successfully"
    )
   )



})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {  // update as undefined
        refreshToken: 1
      }
    },
    {
      new: true
    }
  )
  const options = {  //by default the cookies can modifiyed by frontend
    //but when we do httpOnly: true, then it's only modified by server
    httpOnly : true,
    secure: true
   }

   return res.status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged Out Successfully"))

})

const refreshAccessToken = asyncHandler(async(req, res) => {
   
  // now we get AccessToken from cookies
  const incomingRefreshToken = req.cookies.refreshToken 
   || req.body.refreshToken
   // req.body.refreshToken is for the mobile application where data came from req.body


  if(!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request")
  }

 try {

   // Note=> here we use jwt.vefity, Because we have two type of token
   // 1st which store in database and 2nd one user have, but this is encrypted
   // so when we have to compare it is same then we have to convert user Accesstoken into raw data
   //  that's why we use jwt.verfity
 
   const decodedToken = jwt.verify(
     incomingRefreshToken, // here incomingRefreshToken convert into decoded token
     process.env.REFRESH_TOKEN_SECRET
   )
     
   const user = await User.findById(decodedToken?._id)
 
   if(!user) {
     throw new ApiError(401, "Invalid refresh Token")
   }
 
   if(incomingRefreshToken !== user?.refreshToken) {
     throw new ApiError(401, "refresh Token is expired of used")
   }
 
   const options = {
     httpOnly : true,
     secure: true
   }
 
   const {accessToken, refreshToken} = await
   generateAccessTokenAndRefreshToken(user._id)
 
   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
     new ApiResponse(
       200,
       {accessToken, refreshToken: newRefreshToken},
       "Access token refreshed"
     )
   )
 } catch (error) {
  
 }
        
})

const changeCurrentPassword  = asyncHandler(async(req,
   res) => {
     // we get old and new password from user
     const {oldPassword, newPassword, conformPassword} = req.body

     if(!(newPassword === conformPassword)){
        throw new ApiError(401, "Password is not same")
     }

     //note=> if user are able to change password, it means it is login
     // in auth middleware req.user = we have user data

      // req.user?.id // it means if req.user inside has user id

    const user = await User.findById(req.user?._id)

    //isPasswordcorrect this method inside model and it's async
    // so we have to make it await, it's go do database call
    const isPasswordCorrect =  await user.isPasswordcorrect(oldPassword)

    if(!isPasswordCorrect) {
      throw  new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false}) // validateBeforeSave: false because we don't want to run  other validations

    return res.status(200)
    .json(new ApiResponse(200, {}, "Password Change Successfully"))

     
   })

   const getCurrentUser = asyncHandler(async(req, res) => {
     return res
    .status(200)
    .json(new ApiResponse(
      200,
      req.user, 
      "current user fetched successfully"
    ))
   })

   const updateAccountDetails  = asyncHandler(async(req,
     res) => {
        
      const {fullName, email} = req.body // accestract from req.body

      if(!fullName || !email) {
        throw new ApiError(400, "All fields are required") // then validate exist or not
      }

      const user = await User.findByIdAndUpdate(  // apply methos
        req.user?._id,
        {
           $set: {   // then set
              fullName,
              email: email // we can right this above as well as this way
           }
        },
        {new: true} // doing this we get the updated infromation when we return
      ).select("-password")  

      return res
      .status(200)
      .json(new ApiResponse(200, user, "Account details updated successfully"))

     });

     const updateUserAvatar = asyncHandler(async(req, res) => {
        
      //extract avatar local path
      const avatarLocalPaht = req.file?.path

      if(!avatarLocalPaht) {
        throw new ApiError(400, "Avatar file is missing")
      }

      //upload in cloudinary
      const avatar = await uploadOnCloudinary(avatarLocalPaht)

      if(!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")

      }

      const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set:{
            avatar: avatar.url
          },
        },
        {new: true}
      ).select("-password")
      return res.status(200)
      .json(
       new ApiResponse(200, user, "Avatar Image updated successfully")
       )


    })

    const updateUserCoverImage = asyncHandler(async(req, res) => {

     const CoverImgLocalPath =  req.file?.path

     if(!CoverImgLocalPath) {
      throw new ApiError(400, "CoverImage file is missing")
    }

    const coverImage = await uploadOnCloudinary(CoverImgLocalPath)

    if(!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")
    }

    const user =  await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          coverImage: coverImage.url
        }
      },
      {new: true}
    ).select("-password")

    return res.status(200)
    .json(
      new ApiResponse(200, user, "Conver Image updated successfully")
    )

    })

    const getUserChannelProfile = asyncHandler(async(req, 
      res) => {
        const {username} = req.params

        if(!username?.trim()){
          throw new ApiError(400, "Username is missing")
        }

        const channel = await User.aggregate([
          {
            $match:{
              username: username?.toLowerCase()
            }
          },
          {
            $lookup: {
              from: "subsciptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers"
            }
          },
          {
            $lookup: {
              from: "subsciptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo"
            }
          },
          {
            $addFields: {
              subscribersCount: {
                $size: "$subscribers" // here we use $ because it's now filed
              },
              channelsSubscribedCount: {
                $size: "$subscribedTo"
              },
              isSubscribed: {
                $cond:{ // cond == codition
                  if:{$in: [req.user?._id, "$subscribers.subscriber"]}, // $subscribers.subscriber this subscriber came from subscriptionModel
                 //$in =>  check if a value exists in an array or not;
                  then: true, //if condition satisfied then true
                  else: false
                }
              }
            }
          },
          {
            $project: {  // here we true all the flag values of project usng 1;
              fullName: 1, 
              username: 1,
              subscribersCount: 1,
              channelsSubscribedCount: 1,
              isSubscribed: 1,
              avatar: 1,
              coverImage: 1,
              email: 1,

            }
          }

        ])

        if(!channel.length) {
          throw new ApiError(404, "Channel does not exists")
        }

        return res.status(200)
        .json(new ApiResponse(200, channel[0], "user channel fetched successfully"))
      })

      const getWatchHistory = asyncHandler(async(req, res) => {
        
        //we write aggregate pipeline
        const user = await User.aggregate([
           {
             $match: {
              // here we match _id, or compare match history _id
              //2nd here we not find id using req.user._id. because it's aggregrgation pipeline code directly go for match

              // now here we create mongoose object id
              _id: new mongoose.Types.ObjectId(req.user._id)
             }
           },

           {
            $lookup: {
              from: "videos ", //check from videos
              localField: "watchHistory",
              foreignField: "_id",
              as: "watchHistory",
              pipeline: [ // here we create another pipeline for lookup users
                {
                   $lookup: {
                     from: "users",
                     localField: "owner",
                     foreignField: "_id",
                     as: "owner", // in this lookup we get to many things in user's object
                     //but we want only limited, so here we add further additional pipeline
                     pipeline: [  // so we add pipeline in owner field so everythings weill came in owner field

                        {
                          $project: { // we we try to write this code outside the $lookup filed
                             fullName: 1,
                             username: 1,
                             avatar: 1,

                          }
                        }
                     ]
                   }
                },
                {
                  $addFields: {
                    //using this user get directly owner filed or object, so he can get all values form it
                    owner: {
                      $first: "$owner" // we get the filed from owner that's why $owner
                    }
                  }
                }
              ]

            }
           }
        ])
        return res.status(200)
         .json(
           new ApiResponse(
              200,
              user[0].watchHistory,
              "watch history fetched successfully"

           )
         )

      })

      



export { 
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
 };
