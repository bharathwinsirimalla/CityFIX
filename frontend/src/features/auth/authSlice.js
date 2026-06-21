import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";
import { getApiOrigin } from "../../lib/config";
import { connectSocket, disconnectSocket } from "../../lib/socket";

const tokenKey = "cityfix_token";

const getConnectivityErrorMessage = () =>
  `Cannot reach server at ${getApiOrigin()}. Check that the backend is running and try again.`;

const getAuthErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.code === "ECONNABORTED") return "Request timed out. Please try again.";
  if (err.message === "Network Error" || !err.response) return getConnectivityErrorMessage();
  return err.message || "Something went wrong. Please try again.";
};

const initialState = {
  token: localStorage.getItem(tokenKey),
  user: null,
  status: "idle",
  error: null
};

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user._id
  };
};

export const registerUser = createAsyncThunk("auth/register", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/register", payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getAuthErrorMessage(err));
  }
});

export const loginUser = createAsyncThunk("auth/login", async (payload, thunkAPI) => {
  try {
    const { data } = await api.post("/auth/login", payload);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getAuthErrorMessage(err));
  }
});

export const loadMe = createAsyncThunk("auth/me", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/auth/me");
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getAuthErrorMessage(err));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(tokenKey);
      disconnectSocket();
    }
  },
  extraReducers: (builder) => {
    const fulfilledAuth = (state, action) => {
      state.status = "succeeded";
      state.error = null;
      state.token = action.payload.token;
      state.user = normalizeUser(action.payload.user);
      localStorage.setItem(tokenKey, action.payload.token);
      connectSocket(action.payload.token);
    };

    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, fulfilledAuth)
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Registration failed";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, fulfilledAuth)
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      })
      .addCase(loadMe.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = normalizeUser(action.payload.user);
        state.error = null;
      })
      .addCase(loadMe.rejected, (state) => {
        state.token = null;
        state.user = null;
        state.status = "idle";
        localStorage.removeItem(tokenKey);
        disconnectSocket();
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

