const multer = require("multer");
const path = require("path");

// Configure the storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //  console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm")
        // Specify the directory to save files
        cb(null, path.join(__dirname, "../public/uploads/re-image"));
    },
    filename: function (req, file, cb) {
        // Generate a unique filename based on the timestamp and the original name
        cb(null, Date.now() + "-" + file.originalname);
    }
});

// Initialize Multer
const upload = multer({ storage: storage });

// Export the multer instance for use in your routes
module.exports = upload;
