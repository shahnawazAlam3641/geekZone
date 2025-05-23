import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface Message {
  id: string;
  sender: string;
  content: string;
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
      state.messages = [...state.messages, action.payload];
    },
    // updateMessageStatus(
    //   state,
    //   action: PayloadAction<{ id: string; status: "seen" | "sent" }>
    // ) {
    //   const message = state.messages.find(
    //     (msg) => msg.id === action.payload.id
    //   );
    //   if (message) {
    //     message.status = action.payload.status;
    //   }
    // },

    setTypingUser(state, action: PayloadAction<string | null>) {
      state.typingUser = action.payload;
    },

    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
  },
});

export const { addMessage, setTypingUser, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
