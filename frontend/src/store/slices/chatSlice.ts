// store/chatSlice.ts
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Message {
  id: string;
  sender: string;
  content: string;
  // status: "sent" | "seen";
  // timestamp: string;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  typingUser: string | null;
}

const initialState: ChatState = {
  messages: [],
  typingUser: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      // state.messages.push(action.payload);
      state.messages = [...state.messages, action.payload];
    },
    updateMessageStatus(
      state,
      action: PayloadAction<{ id: string; status: "seen" | "sent" }>
    ) {
      const message = state.messages.find(
        (msg) => msg.id === action.payload.id
      );
      if (message) {
        message.status = action.payload.status;
      }
    },

    setTypingUser(state, action: PayloadAction<string | null>) {
      state.typingUser = action.payload;
    },

    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
  },
});

export const { addMessage, updateMessageStatus, setTypingUser, setMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
