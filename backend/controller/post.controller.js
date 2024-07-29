import { PostValidates } from "../validations/PostValidations.js";
import { changeToErrorObject } from "../functions/joiError.js";
import prisma from "../db/prisma.js";
import fs from "fs";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getPost = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        favorite: {
          where: {
            userId: req.userId,
          },
        },
        like: {
          where: {
            userId: req.userId,
          },
        },
        author: true,
      },
    });
    const baseUrl = `${req.protocol}://${req.get("host")}/`;

    const postsWithImageUrl = posts.map((post) => ({
      ...post,
      image: post.image ? `${baseUrl}${post.image}` : null,
    }));

    res.status(200).json(postsWithImageUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve Post's." });
  }
};
export const getOnePost = async (req, res) => {
  try {
    const posts = await prisma.post.findUnique({
      where: {
        id: req.params.id,
      },
    });
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads`;

    res.status(200).json({
      ...posts,
      image: posts.image ? `${baseUrl}/${posts.image}` : "none image",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve Post's." });
  }
};

export const addPost = async (req, res) => {
  try {
    const { error, value } = PostValidates.addPost(
      req.file == undefined
        ? req.body
        : {
            ...req.body,
            image: req.file,
          }
    );
    if (error) {
      return res.status(400).send(changeToErrorObject(error));
    }
    const { image } = value;
    let hashedFile;
    if (image != undefined) {
      let hash = crypto
        .createHash("md5")
        .update(image.originalname)
        .digest("hex");
      hashedFile = hash + path.extname(image.originalname);
      let filePath = path.join(
        "D:\\Visual Code FIle\\Special\\smart hand\\mern-stack\\backend\\upload",
        hashedFile
      );
      await fs.promises.writeFile(filePath, image.buffer);
    }

    const response = await prisma.post.create({
      data: {
        title: value.title,
        content: value.content,
        image: hashedFile,
        authorId: req.userId,
      },
    });

    if (!response) {
      return res.status(400).json({ message: "Post not created" });
    }

    res
      .status(201)
      .json({ message: "Post Created Successfully", post: response });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatedPost = async (req, res) => {
  try {
    const { error, value } = PostValidates.updatePost(req.body);
    if (error) {
      return res.status(400).send(changeToErrorObject(error));
    }
    console.log("Values =>", value);
    const image = req.file;
    let hashedFile;
    if (image) {
      const hash = crypto
        .createHash("md5")
        .update(image.originalname + req.userId)
        .digest("hex");
      hashedFile = hash + path.extname(image.originalname);
      const filePath = path.join(__dirname, "../uploads", hashedFile);
      await fs.promises.writeFile(filePath, image.buffer);
    }

    const response = await prisma.post.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: value.title,
        content: value.content,
        image: hashedFile,
        authorId: req.userId,
      },
    });

    if (!response) {
      return res.status(400).json({ message: "Post not Updated" });
    }

    res
      .status(201)
      .json({ message: "Post Updated Successfully", post: response });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: "Post id is required" });
  }
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  const response = await prisma.post.delete({
    where: {
      id: id,
    },
  });
  if (!response) {
    return res.status(400).json({ message: "Post not deleted" });
  }

  res.status(200).json({ message: "Post Deleted Successfully" });
};
export const getFavoraite = async (req, res) => {
  try {
    const posts = await prisma.favorite.findMany({
      where: {
        userId: req.userId,
      },
    });

    res.status(200).json({ message: "Post Favoraite Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve Post's." });
  }
};

export const addFavoraite = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Post id is required" });
  }
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  const like = await prisma.favorite.findFirst({
    where: {
      userId: req.userId,
      postId: id,
    },
  });
  if (!like) {
    await prisma.favorite.create({
      data: {
        postId: id,
        userId: req.userId,
      },
    });
    return res.status(404).json({ message: "Your Like Successfully" });
  } else {
    await prisma.favorite.delete({
      where: {
        id: like.id,
      },
    });
    res.status(200).json({ message: "Post Unlike Successfully" });
  }
};

export const likePost = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "Post id is required" });
  }
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  const like = await prisma.like.findFirst({
    where: {
      userId: req.userId,
      postId: id,
    },
  });
  if (!like) {
    await prisma.like.create({
      data: {
        postId: id,
        userId: req.userId,
      },
    });
    return res.status(404).json({ message: "Your Like Successfully" });
  } else {
    await prisma.like.delete({
      where: {
        id: like.id,
      },
    });
    res.status(200).json({ message: "Post Unlike Successfully" });
  }
};
