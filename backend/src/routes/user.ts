import express, { Request, Response } from "express";
import { auth } from "../middleware/auth";
import User from "../models/User";
import mongoose from "mongoose";

const router = express.Router();

router.get(
  "/search",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.query;
      if (!query) {
        res.json({ users: [] });
        return;
      }

      const users = await User.find({
        $and: [
          { _id: { $ne: req.userId } },
          {
            $or: [
              { username: { $regex: query, $options: "i" } },
              { email: { $regex: query, $options: "i" } },
            ],
          },
        ],
      }).select("username email profilePicture isVerified");

      res.json({ users });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error searching users" });
      console.log(error);
    }
  }
);

router.post(
  "/friends/request/:userId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const receiver = await User.findById(userId);
      const sender = await User.findById(req.userId);

      if (!receiver || !sender) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      if (
        receiver.pendingFriendRequests.includes(
          new mongoose.Types.ObjectId(req.userId)
        )
      ) {
        res
          .status(400)
          .json({ success: false, message: "Friend request already sent" });
        return;
      }

      if (receiver.friends.includes(new mongoose.Types.ObjectId(req.userId))) {
        res.status(400).json({ success: false, message: "Already friends" });
        return;
      }

      receiver.pendingFriendRequests.push(
        new mongoose.Types.ObjectId(req.userId)
      );
      await receiver.save();

      res.json({ message: "Friend request sent" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error sending friend request" });
      console.log(error);
    }
  }
);

router.post(
  "/friends/accept/:userId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const receiver = await User.findById(req.userId);
      const sender = await User.findById(userId);

      if (!receiver || !sender) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      if (
        !receiver.pendingFriendRequests.includes(
          new mongoose.Types.ObjectId(userId)
        )
      ) {
        res
          .status(400)
          .json({ success: false, message: "No friend request found" });
        return;
      }

      receiver.pendingFriendRequests = receiver.pendingFriendRequests.filter(
        (id) => id.toString() !== userId
      );
      receiver.friends.push(new mongoose.Types.ObjectId(userId));
      sender.friends.push(new mongoose.Types.ObjectId(req.userId));

      await receiver.save();
      await sender.save();

      res.json({ message: "Friend request accepted" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error accepting friend request" });
    }
  }
);

router.post(
  "/friends/reject/:userId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      user.pendingFriendRequests = user.pendingFriendRequests.filter(
        (id) => id.toString() !== userId
      );
      await user.save();

      res.json({ message: "Friend request rejected" });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error rejecting friend request" });
    }
  }
);

router.get(
  "/friends",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId)
        .populate("friends", "username email profilePicture isVerified")
        .populate(
          "pendingFriendRequests",
          "username email profilePicture isVerified"
        );

      res.json({
        friends: user?.friends || [],
        pendingRequests: user?.pendingFriendRequests || [],
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching friends" });
      console.log(error);
    }
  }
);

export default router;
