const express = require("express");
const {
  registerUser,
  loginUser,
  allUsers,
  getAllUsers,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/", loginUser);
router.get("/", protect, allUsers);
router.get("/all-users", protect, getAllUsers);

module.exports = router;
