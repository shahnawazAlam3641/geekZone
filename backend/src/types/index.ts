import { Document, Types } from "mongoose";

export interface UserDocument extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  profilePicture: string;
  posts: Types.ObjectId[];
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
  savedBy: Types.ObjectId[];
  comments: Types.DocumentArray<CommentDocument>;
  createdAt: Date;
}

export interface CommentDocument extends Document {
  user: Types.ObjectId | UserDocument;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDocument extends Document {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId | UserDocument;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface ConversationDocument extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[] | UserDocument[];
  isGroup: boolean;
  groupName?: string;
  groupAdmin?: Types.ObjectId | UserDocument;
  lastMessage?: Types.ObjectId | MessageDocument;
  createdAt: Date;
  updatedAt: Date;
}
