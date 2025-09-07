import multer from "multer";

const storage = multer.diskStorage({
    destination: function(req, res, cb) { //cb is diskStorage where we can give the path of directory
        cb(null, './public/temp');  // first para is null if in case null; and second one is directory of file

    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})