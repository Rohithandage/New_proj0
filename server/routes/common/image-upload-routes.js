const express = require("express");
const router = express.Router();
const { uploadImage } = require("../../controllers/common/image-upload-controller");
const { upload } = require("../../helpers/cloudinary");

// Single image upload route
router.post("/upload", upload.single("image"), uploadImage);

module.exports = router;








