const asyncHandler = require("express-async-handler");
const Chat = require("../Models/chatModel");
const User = require("../Models/userModel");

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("userId param not available");
    res.sendStatus(404);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email picture",
  });

  if (isChat.length > 0) {
    res.status(200).send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "name email picture",
        });

        res.status(200).send(result);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { chatName, users } = req.body;
  if (!users || !chatName) {
    return res
      .status(400)
      .send({ message: "Please provide Chat Name & Users" });
  }

  //   let users = JSON.parse(req.body.users);
  //   let users = req.body.users;
  if (users.length < 2) {
    return res
      .status(400)
      .send({ message: "More than 2 users are required to form a group!" });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName,
      isGroupChat: true,
      users,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!updatedChat) {
      res.status(404);
      throw new Error("No Group Chat found!");
    } else {
      res
        .status(200)
        .json({ message: "Group Chat name Updated!", data: updatedChat });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const addToGroupChat = asyncHandler(async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const userAdded = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!userAdded) {
      res.status(404);
      throw new Error("No Group Chat found!");
    } else {
      res
        .status(200)
        .json({ message: "User added in Group Chat", data: userAdded });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const removeFromGroupChat = asyncHandler(async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const userRemoved = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    if (!userRemoved) {
      res.status(404);
      throw new Error("No Group Chat found!");
    } else {
      res
        .status(200)
        .json({ message: "User removed from Group Chat", data: userRemoved });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const updateGroupChat = asyncHandler(async (req, res) => {
  try {
    const { chatId, users, chatName, groupAdmin } = req.body;
    if (!chatId) {
      return res.status(400).send({ message: "Please provide Chat Id" });
    }
    if (!users || users.length < 2) {
      return res
        .status(400)
        .send({ message: "Please add minimum 2 members in the Group Chat!" });
    }
    if (!chatName.trim()) {
      return res
        .status(400)
        .send({ message: "Please provide Group Chat Name!" });
    }
    if (!groupAdmin) {
      return res
        .status(400)
        .send({ message: "Please provide Group Chat Admin!" });
    }

    const groupChatUpdated = await Chat.findByIdAndUpdate(
      chatId,
      {
        users,
        chatName,
        groupAdmin,
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!groupChatUpdated) {
      res.status(404);
      throw new Error("No Group Chat found!");
    } else {
      res.status(200).json({
        message: "Group Chat Updated Successfully!",
        data: groupChatUpdated,
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroupChat,
  removeFromGroupChat,
  updateGroupChat,
};
