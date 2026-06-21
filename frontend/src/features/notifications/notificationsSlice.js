import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

const initialState = {
  list: [],
  status: "idle",
  error: null
};

export const fetchNotifications = createAsyncThunk("notifications/fetch", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/notifications");
    return data.notifications;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const markRead = createAsyncThunk("notifications/read", async (id, thunkAPI) => {
  try {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.notification;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications(state) {
      state.list = [];
      state.status = "idle";
      state.error = null;
    },
    prependNotification(state, action) {
      const notification = action.payload;
      if (!notification?._id) return;

      state.list = [
        notification,
        ...state.list.filter((item) => item._id !== notification._id)
      ].slice(0, 50);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.error = action.payload;
        state.status = "failed";
      })
      .addCase(markRead.fulfilled, (state, action) => {
        state.list = state.list.map((n) => (n._id === action.payload._id ? action.payload : n));
      });
  }
});

export const { clearNotifications, prependNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;

