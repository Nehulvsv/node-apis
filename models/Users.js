const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const UsersSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 16,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      maxlength: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePicture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    },
    number: {
      type: String,
      maxlength: 10,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isContributor: {
      type: Boolean,
      default: false,
    },
    isReq: {
      type: Boolean,
      default: false,
    },

    coins: {
      type: Array,
      default: 5,
    },

    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    firstName: {
      type: String,
      // required: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      // required: true,
      maxlength: 50,
    },
    dob: {
      type: Date,
      // required: true,
    },
    gender: {
      type: String,
    },

    country: {
      type: String,
    },

    city: {
      type: String,
    },

    state: {
      type: String,
    },

    pincode: {
      type: String,
    },

    bio: {
      type: String,
      // required: true,
    },
    facebook: {
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    showEducationWork: {
      type: Boolean,
      default: false,
    },

    instituteName: {
      type: String,
    },
    degree: {
      type: String,
    },
    fieldOfStudy: {
      type: String,
    },
    grade: {
      type: String,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },

    position: {
      type: String,
    },
    companyName: {
      type: String,
    },
    employmentType: {
      type: String,
    },
    companyCountry: {
      type: String,
    },
    companyCity: {
      type: String,
    },
    companyState: {
      type: String,
    },
    companyPincode: {
      type: String,
    },
    companyJoiningDate: {
      type: String,
    },
    companyEndDate: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UsersSchema);
