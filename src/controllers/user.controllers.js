import { asyncHandler } from "../utils/asyncHandler.js"; // might be js

const registerUser = asyncHandler(async (req, res) => {
      res.status(200).json({
        message: "ok now this file can run without error"
    })
})

export { registerUser };
