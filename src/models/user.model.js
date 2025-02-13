import mongoose, { Schema } from "mongoose";
import { JsonWebTokenError } from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
       username: {
        type: String,
        required: true,
        unique: true,
        lowercasse: true,
        trim: true,
        index: true,
       },
       email: {
         type: String,
         required: true,
         unique: true,
         lowercasse: true,
         trim: true,
       },
       fullName: {
         type: String,
         required: true,
         trim: true,
       },
       avatar: {
        type: String, // cloudinary url
        required: true,
       },
       coverImage: {
        type: String,
       },
       watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
       ],
       password: {
        type: String,
        required: [true, 'Password is required']
       },
       refreshToken: {
          type: String,
       }
    },{
        timestamps: true
    }
)

// mongoose.pre // this method is called before the save 
// any document in the database  we can perform any opration before it

userSchema.pre('save', async function (next) {

  //but whenever the filed our thumbnail change the password agian modified
  // so we put condition here
  if(!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
   // here we becrypt our this.password and pass paramenter first paramerter is the password
   // 2nd is how much round we want to hash the password
  next();
})

//now we compare password
userSchema.methods.isPasswordcorrect = async function(password){
  return await bcrypt.compare(password, this.password);

}

userSchema.methods.generateAccessToken = function() {
   return jwt.sign(  // sign method is use to gerate generateAccessToken
    {
       _id: this._id,
       email: this.email,
       username: this.username,
       fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
   )
}


// generateAccessToken and generateRefreshToken both write like same but generateRefreshToken
 // not take additional parameter
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(  // sign method is use to gerate generateAccessToken
    {
       _id: this._id,
       
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
   )
  
}

export const User = mongoose.model("User", userSchema)


