import express, { Request, Response } from "express";
import { auth } from "../middleware/auth";
import Conversation from "../models/Conversation";
import Message from "../models/Message";

const router = express.Router();

router.post(
  "/create-conversation",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { participantId } = req.body;

      const existingConversation = await Conversation.findOne({
        participants: { $all: [req.userId, participantId], $size: 2 },
        isGroup: false,
      });

      if (existingConversation) {
        res.json(existingConversation);
        return;
      }

      const conversation = new Conversation({
        participants: [req.userId, participantId],
        isGroup: false,
      });

      await conversation.save();
      await conversation.populate("participants", "username profilePicture");

      res.status(201).json(conversation);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error creating conversation" });
    }
  }
);

router.get(
  "/get-all",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const conversations = await Conversation.find({
        participants: req.userId,
      })
        .populate("participants", "username profilePicture")
        .populate("lastMessage")
        .sort({ updatedAt: -1 });

      res.json(conversations);
      return;
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching conversations" });
    }
  }
);

router.post(
  "/create-group",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, participants } = req.body;

      if (!participants.includes(req.userId)) {
        participants.push(req.userId);
      }

      const conversation = new Conversation({
        participants,
        isGroup: true,
        groupName: name,
        groupAdmin: req.userId,
      });

      await conversation.save();
      await conversation.populate("participants", "username profilePicture");

      res.status(201).json(conversation);
      return;
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error creating group conversation" });
    }
  }
);

router.get(
  "/get/:id",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        participants: req.userId,
      }).populate("participants", "username profilePicture");

      if (!conversation) {
        res.status(404).json({ message: "Conversation not found" });
        return;
      }

      const messages = await Message.find({ conversation: conversation._id })
        .populate("sender", "username profilePicture")
        .sort({ createdAt: 1 });

      res.json({ conversation, messages });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching conversation" });
    }
  }
);

export default router;
