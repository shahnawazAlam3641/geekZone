import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Notification } from "../../components/layout/NotificationPage";

interface NotificationState {
  unreadCount: number;
  notifications: Notification[];
}

const initialState: NotificationState = {
  unreadCount: 0,
  notifications: [],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    markAllAsRead(state) {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        isRead: true,
      }));
      state.unreadCount = 0;
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
});

export const { setNotifications, markAllAsRead, addNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
