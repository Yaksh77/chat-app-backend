const express = require("express");
const groupRouter = express.Router();
const Group = require("../models/GroupModel");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Creating a group by admin only
groupRouter.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    // console.log(req.user);

    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username email")
      .populate("members", "username email");
    res.status(201).json({ populatedGroup });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Getting all groups
groupRouter.get("/", protect, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("admin", "username email")
      .populate("members", "username email"); // Use to specify which fields to be included
    res.status(200).json(groups);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Joining a group
groupRouter.post("/:groupId/join", protect, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }
    group.members.push(req.user.id);
    res.json({ message: "Successfully joined group" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Leaving a group
groupRouter.post("/:groupId/leave", protect, async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.members.includes(req.user._id)) {
      group.members.pop(req.user._id);
      res.json({ message: "Successfully left group" });
      console.log(group);
    } else {
      res.status(400).json({ message: "You are not a member of this group" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = groupRouter;
