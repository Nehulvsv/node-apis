const router = require("express").Router();
// const { verify } = require("jsonwebtoken");
const Event = require("../models/Event.model");
const verifyToken = require("../utils/verifyUser");

//create event

router.post("/", verifyToken, async (req, res) => {
  if (!req.body.eventTitle) {
    return res.status(500).json("Please provide all required fields");
  }
  const newEvent = new Event({
    ...req.body,
    userId: req.user.id,
  });
  try {
    const saveEvent = await newEvent.save();

    res.status(200).json(saveEvent);
  } catch (error) {
    return res.status(500).json(error);
  }
});

//update

router.put("updateEvent/:EventId/:userId", async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(500).json("you are not not allowed to update this event");
  }
  try {
    const updateEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(2000).status(updateEvent);
  } catch (err) {
    res.status(500).json(err);
  }
});

//api for list event

router.get("/Events", async (req, res) => {
  res.json(await Event.find().sort({ createdAt: -1 }).limit(20));
});

//api for event page
router.get("Events/:id", async (req, res) => {
  const { id } = req.params;
  const eventDoc = await Event.findById(id);
  res.json(eventDoc);
});

//delete

router.delete(
  "./deleteEvent/:eventId/:userId",
  verifyToken,
  async (req, res) => {
    if (
      !req.user.isAdmin &&
      req.user.id !== req.params.userId &&
      req.user.id !== req.params.postId
    ) {
      return res.status(403).json("you are not allowed to delete this event");
    }

    try {
      await Event.findByIdAndDelete(req.params.eventId);
      res.status(200).json("The Event has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

module.exports = router;
