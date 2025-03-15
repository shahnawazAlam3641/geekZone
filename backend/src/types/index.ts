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

// export interface RequestWithUser extends Request {
//   userId?: string;
//   cookies: {
//     token?: string;
//     [key: string]: string | undefined;
//   };
// }

export type RequestWithUserId = Request & {
  userId?: string;
  cookies: {
    token?: string;
    [key: string]: string | undefined;
  };
};

export interface PostDocument extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId | UserDocument;
  content: string;
  image: string;
  likes: Types.ObjectId[];
  comments: Types.DocumentArray<CommentDocument>;
  createdAt: Date;
}

export interface CommentDocument extends Document {
  user: Types.ObjectId | UserDocument;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
