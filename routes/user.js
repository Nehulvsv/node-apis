const routes = require("express").Router();
const Users = require("../models/Users");
const bcrypt = require("bcrypt");
const { errorHandler } = require("./../utils/error");
const verifyToken = require("../utils/verifyUser");

// routes.put("/update/:userId", verifyToken, async (req, res, next) => {
//   if (req.user.id !== req.params.userId) {
//     return next(errorHandler(403, "You are not allowed to update this user"));
//   }
//   if (req.body.password) {
//     if (req.body.password.length < 6) {
//       return next(errorHandler(400, "Password must be at least 6 characters"));
//     }
//     req.body.password = bcrypt.hashSync(req.body.password, 10);
//   }
//   if (req.body.username) {
//     if (req.body.username.length < 7 || req.body.username.length > 20) {
//       return next(
//         errorHandler(400, "Username must be between 7 and 20 characters")
//       );
//     }
//     if (req.body.username.includes(" ")) {
//       return next(errorHandler(400, "Username cannot contain spaces"));
//     }
//     if (req.body.username !== req.body.username.toLowerCase()) {
//       return next(errorHandler(400, "Username must be lowercase"));
//     }
//     if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
//       return next(
//         errorHandler(400, "Username can only contain letters and numbers")
//       );
//     }
//   }
//   try {
//     const updatedUser = await Users.findByIdAndUpdate(
//       req.params.userId,
//       {
//         $set: {
//           username: req.body.username,
//           email: req.body.email,
//           profilePicture: req.body.profilePicture,
//           password: req.body.password,
//           firstName: req.body.firstName,
//           lastName: req.body.lastName,
//           number: req.body.number,
//           dob: req.body.dob,
//           gender: req.body.gender,
//           country: req.body.country,
//           state: req.body.state,
//           city: req.body.city,
//           pincode: req.body.pincode,
//           dob: req.body.dob,
//           bio: req.body.bio,
//           facebook: req.body.facebook,
//           twitter: req.body.twitter,
//           instagram: req.body.instagram,
//           linkedin: req.body.linkedin,
//           instituteName: req.body.instituteName,
//           degree: req.body.degree,
//           fieldOfStudy: req.body.fieldOfStudy,
//           grade: req.body.grade,
//           startDate: req.body.startDate,
//           endDate: req.body.endDate,
//           position: req.body.position,
//           companyName: req.body.companyName,
//           employmentType: req.body.employmentType,
//           companyCountry: req.body.companyCountry,
//           companyCity: req.body.companyCity,
//           companyState: req.body.companyState,
//           companyPincode: req.body.companyPincode,
//           companyJoiningDate: req.body.companyJoiningDate,
//           companyEndDate: req.body.companyEndDate,
//         },
//       },
//       { new: true }
//     );
//     const { password, ...rest } = updatedUser._doc;
//     res.status(200).json(rest);
//   } catch (error) {
//     next(error);
//   }
// });

routes.put("/update/:userId", verifyToken, async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return res
      .status(403)
      .json({ error: "You are not allowed to update this user" });
  }

  try {
    let updateFields = {};
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }
      updateFields.password = bcrypt.hashSync(req.body.password, 10);
    }
    if (req.body.username) {
      if (req.body.username.length < 7 || req.body.username.length > 20) {
        return res
          .status(400)
          .json({ error: "Username must be between 7 and 20 characters" });
      }
      if (req.body.username.includes(" ")) {
        return res
          .status(400)
          .json({ error: "Username cannot contain spaces" });
      }
      if (req.body.username !== req.body.username.toLowerCase()) {
        return res.status(400).json({ error: "Username must be lowercase" });
      }
      if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
        return res
          .status(400)
          .json({ error: "Username can only contain letters and numbers" });
      }
      updateFields.username = req.body.username;
    }
    // Add other fields to updateFields as needed

    const updatedUser = await Users.findByIdAndUpdate(
      req.params.userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...rest } = updatedUser._doc;
    return res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
});

routes.post("/signout", (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
});

routes.get("/getusers", verifyToken, async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "You are not allowed to see all users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;

    const users = await Users.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await Users.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await Users.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
});

routes.get("/:userId", async (req, res, next) => {
  try {
    const user = await Users.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
});

//admin

//
routes.put("/toggleContributor/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle the isContributor value
    user.isContributor = !user.isContributor;

    // Save the updated user
    await user.save();

    res.json({ message: "isContributor value updated successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Define the PUT route to toggle isReq
routes.put("/toggleReq/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle the isContributor value
    user.isReq = !user.isReq;

    // Save the updated user
    await user.save();

    res.json({ message: "isReq value updated successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});
//bookmark

routes.post("/bookmark/:postId", async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.bookmarks.includes(postId)) {
      user.bookmarks.push(postId);
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to remove a bookmark
routes.post("/unbookmark/:postId", async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bookmarks = user.bookmarks.filter((id) => id !== postId);
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = routes;
