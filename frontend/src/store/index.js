import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import complaintsReducer from "../features/complaints/complaintsSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    complaints: complaintsReducer,
    notifications: notificationsReducer
  }
});

