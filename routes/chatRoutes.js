const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
  updateGroupChat,
} = require("../controllers/chatController");
const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/group/rename", protect, renameGroupChat);
router.put("/group/remove", protect, removeFromGroupChat);
router.put("/group/add", protect, addToGroupChat);
router.post("/group/update", protect, updateGroupChat);

module.exports = router;
