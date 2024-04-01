const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    eventImage: {
      type: String,
    },
    eventDescription: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("event", eventSchema);
