import { Router }  from "express";
import {registerUser} from "../controllers/user.controllers.js"


const router = Router();

router.route("/register").post(registerUser); // Correct

export default router