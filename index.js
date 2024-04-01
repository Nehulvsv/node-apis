const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Post = require("./models/Post");
const usersAuth = require("./routes/auth");
const usersUpdate = require("./routes/user");
const userComment = require("./routes/comment.route");
const eventRoute = require("./routes/event.route");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const verifyToken = require("./utils/verifyUser");
const path = require("path");

// MIDDLLWARE
dotenv.config();
app.use(express.json());
app.use(cookieParser());

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use("/uploads", express.static(__dirname + "/uploads"));

//DB CONNECTION
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("mongodb connected successfully!");
  } catch (err) {
    console.error("unable to connect mongodb!", err);
  }
}

connectDB();

// all the middlewarss

app.use(morgan("common"));
app.use(helmet());

//userlogin , register and admin

app.use("/api/auth", usersAuth);
app.use("/api/user", usersUpdate);
app.use("/api/comment", userComment);
app.use("/api/events", eventRoute);
// app.use("/api/news", news);

//API FOR CREATING POST
app.post("/post", verifyToken, async (req, res, next) => {
  // if (!req.user.isAdmin && !req.user.isContributor) {
  //   return next(errorHandler(403, "You are not allowed to create a post"));
  // }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "Please provide all required fields"));
  }
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
});

//api for getting the post

app.get("/getposts", async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.readingType && { readingType: req.query.readingType }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
});

//API FOR LISTING POST
app.get("/post", async (req, res) => {
  res.json(await Post.find().sort({ createdAt: -1 }).limit(20));
});

//API FOR SHOW THE POST

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id);
  res.json(postDoc);
});

//API FOR DELETING POST

app.delete(
  "/deletepost/:postId/:userId",
  verifyToken,
  async (req, res, next) => {
    if (
      !req.user.isAdmin &&
      req.user.id !== req.params.userId &&
      req.user.id !== req.params.postId
    ) {
      return next(errorHandler(403, "You are not allowed to delete this post"));
    }
    try {
      await Post.findByIdAndDelete(req.params.postId);
      res.status(200).json("The post has been deleted");
    } catch (error) {
      next(error);
    }
  }
);

// API FOR update THE POST

app.put("/updatepost/:postId/:userId", verifyToken, async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    req.user.id !== req.params.userId &&
    req.user.id !== req.params.postId
  ) {
    return next(errorHandler(403, "You are not allowed to update this post"));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
});

// Route to fetch all bookmarks of a user
app.get("/bookmarks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all posts where the user's ID is in the bookmarks array
    const bookmarks = await Post.find({ bookmarks: userId });

    res.status(200).json(bookmarks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to bookmark a post
app.post("/bookmark/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already bookmarked the post
    if (post.bookmarks.includes(userId)) {
      return res.status(400).json({ message: "Post already bookmarked" });
    }

    // Add the user ID to the bookmarks array
    post.bookmarks.push(userId);
    await post.save();

    res.status(200).json({ message: "Post bookmarked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to unbookmark a post
app.post("/unbookmark/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    // Find the post by ID
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already bookmarked the post
    if (!post.bookmarks.includes(userId)) {
      return res.status(400).json({ message: "Post is not bookmarked" });
    }

    // Remove the user ID from the bookmarks array
    post.bookmarks = post.bookmarks.filter((bookmark) => bookmark !== userId);
    await post.save();

    res.status(200).json({ message: "Post unbookmarked successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.use(express.static(path.join(__dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 6600;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
