

import dotenv from "dotenv";
import connectDB from "./db/index.js";

import  app  from './app.js';
// Ensure this file exists

dotenv.config({
    path: "/.env"  // Make sure the filename is correct
});


connectDB()  // Call the function to establish a DB connection


.then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`o Server is running at port : $
        {process.env.PORT}`);
    
  })
})

.catch((errr) => {
    console.log("MONGO db connection failed !!", errr);
    
})





















// import express from "express";
// const app = express(); // our app is build using express; 
                      // and database build using mongoDB
// (async () => {
//   try{
//     await mongoose.connect(`${process.env.MONGODB_URI}/$
//         {DB_NAME}`)
//         app.on("error", (error) => {
//             console.log("ERRR ", error);
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`App is listening on port ${process.env.PORT}}`);
//         })

//   }catch(error) {
//     console.error("Error", error);
//     throw err
//   }
// })()