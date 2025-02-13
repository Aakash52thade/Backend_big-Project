import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from './routes/user.routes.js'

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

export default app;