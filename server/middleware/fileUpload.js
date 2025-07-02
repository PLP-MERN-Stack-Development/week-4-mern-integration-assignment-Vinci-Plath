import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import ErrorResponse from '../utils/errorResponse.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png, gif)!'), false);
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('image');

// Middleware to handle file upload
const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      return next(new ErrorResponse(`File upload error: ${err.message}`, 400));
    } else if (err) {
      // An unknown error occurred
      return next(new ErrorResponse(err.message, 500));
    }
    
    // If no file was uploaded, continue to next middleware
    if (!req.file) {
      return next();
    }
    
    // Set the file path in the request body for the controller to use
    req.body.image = `/uploads/${req.file.filename}`;
    next();
  });
};

export default handleFileUpload;
