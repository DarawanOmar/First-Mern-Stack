import express from "express";
import {
  addPost,
  deletePost,
  getPost,
  updatedPost,
  getOnePost,
  addFavoraite,
  getFavoraite,
  likePost,
} from "../controller/post.controller.js";
import protectRoute from "../middleware/protectedRoute.js";
import multer from "multer";
// import test from "../upload";
const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

// --------------------------------------------------------------
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      "D:\\Visual Code FIle\\Special\\smart hand\\mern-stack\\backend\\upload"
    );
  },
  filename: (req, file, cb) => {
    // const uniquePrefix = crypto.randomBytes(18).toString("hex");
    cb(null, "ahdkwahkd" + "-" + file.originalname);
  },
});
const uploader = multer({ storage: fileStorageEngine });
// --------------------------------------------------------------

router.get("/", protectRoute, getPost);
router.get("/:id", protectRoute, getOnePost);
router.post("/", protectRoute, upload.single("image"), addPost);
router.put("/:id", protectRoute, upload.single("image"), updatedPost);
router.delete("/:id", protectRoute, deletePost);
router.get("/favoraite", protectRoute, getFavoraite);
router.post("/likePost/:id", protectRoute, likePost);
router.post("/addFavoraite/:id", protectRoute, addFavoraite);
router.post("/upload", uploader.single("image"), (req, res) => {
  // console.log(req.file);
  res.send("Upload Single Image Successfully");
});

export default router;
