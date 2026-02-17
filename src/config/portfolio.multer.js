import multer from "multer";

// Use memory storage for buffer uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images and PDFs
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;

  const isValid =
    allowedTypes.test(file.mimetype) &&
    allowedTypes.test(file.originalname.toLowerCase());

  if (!isValid) {
    return cb(new Error("Only images and PDFs are allowed"));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for images/PDFs
  fileFilter,
});

export default upload;
