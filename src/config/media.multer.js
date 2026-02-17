import multer from "multer";

const storage = multer.memoryStorage(); // store in buffer
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid =
    allowedTypes.test(file.mimetype) &&
    allowedTypes.test(file.originalname.toLowerCase());

  if (isValid) cb(null, true);
  else cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export default upload;
