import express, { Request, Response } from "express";
import { auth } from "../middleware/auth";
import User from "../models/User";
import mongoose from "mongoose";
import Post from "../models/Post";
import { uploadImg } from "../middleware/uploadImg";
import { uploadImage } from "../config/uploadImg";
import bcrypt from "bcrypt";

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

router.get(
  "/:userId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Find user and populate posts
      const user = await User.findById(userId)
        .select(
          "username email bio profilePicture coverPicture followers following posts connectionRequests"
        )
        .populate({
          path: "posts",
          select: "content image likes comments createdAt author",
          populate: [
            {
              path: "author",
              select: "username profilePicture",
            },
            {
              path: "likes",
              select: "username profilePicture",
            },
            {
              path: "comments.user",
              select: "username profilePicture",
            },
          ],
        });

      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Find all posts related to the user
      const allPosts = await Post.find({
        $or: [{ author: userId }, { likes: userId }],
      })
        .select("content image likes comments createdAt author")
        .populate("author", "username profilePicture")
        .populate("likes", "username profilePicture")
        .populate("comments.user", "username profilePicture");

      // Filter posts by author
      const userPosts = allPosts.filter(
        (post) => post.author._id.toString() === userId
      );

      // Filter posts by likes
      const likedPosts = allPosts.filter((post) => {
        if (!post.likes) return false;
        return post.likes.some((like) => like._id.toString() === userId);
      });

      // Filter saved posts
      const savedPosts = allPosts.filter((post) => {
        if (!post.savedBy) return false;
        return post.savedBy.some((saved) => saved._id.toString() === userId);
      });

      // Convert user to plain object
      const userObject = user.toObject();

      res.json({
        ...userObject,
        posts: userPosts,
        likedPosts,
        savedPosts,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

router.put(
  "/profile/edit",
  auth,
  uploadImg.single("profilePicture"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req?.userId;
      // const userId = req.body.userId;
      const { username, bio, oldPassword, newPassword } = req.body;

      if (!userId) {
        res.status(400).json({ error: "User ID is required" });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      // 1. Update username if provided and different
      if (username && username !== user.username) {
        const existing = await User.findOne({ username });
        if (existing) {
          res.status(400).json({ error: "Username already taken" });
          return;
        }
        user.username = username;
      }

      // 2. Update bio
      if (bio !== undefined) {
        user.bio = bio;
      }

      // 3. Update profile picture if uploaded
      if (req.file) {
        const imageUrl = await uploadImage(req.file.buffer);
        user.profilePicture = imageUrl;
      }

      // 4. Update password
      if (oldPassword && newPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          res.status(401).json({ error: "Old password is incorrect" });
          return;
        }

        const hashed = await bcrypt.hash(newPassword, 10);
        user.password = hashed;
      }

      await user.save();
      res.json({
        success: true,
        message: "Profile updated successfully",
        user,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  }
);

export default router;
