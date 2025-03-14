import { Document, Types } from "mongoose";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  bio: string;
  isVerified: boolean;
  friends: Types.ObjectId[];
  pendingFriendRequests: Types.ObjectId[];
  createdAt: Date;
}

export interface RequestWithUser extends Request {
  userId?: string;
  cookies: {
    token?: string;
    [key: string]: string | undefined;
  };
}
