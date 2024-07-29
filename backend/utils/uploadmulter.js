import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ["jpg", "jpeg", "png"];
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, JPEG, and PNG allowed."));
    }
  },
});
