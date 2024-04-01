const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PostSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default:
        "https://www.hostinger.com/tutorials/wp-content/uploads/sites/2/2021/09/how-to-write-a-blog-post.png",
    },
    category: {
      type: String,
      default: "uncategorized",
    },
    readingType: {
      type: String,
      default: "Blog",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    bookmarks: [
      {
        type: String,
      },
    ],
    quizQuestion: {
      type: String,
    },
    quizOptions: {
      type: [String],
    },
    correctAnswer: {
      type: String,
    },
  },
  { timestamps: true }
);

const PostModel = model("Post", PostSchema);

module.exports = PostModel;
