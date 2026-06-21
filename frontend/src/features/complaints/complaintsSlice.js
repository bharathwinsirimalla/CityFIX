import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../lib/api";

const initialState = {
  list: [],
  selected: null,
  workflow: null,
  status: "idle",
  error: null,
  updateError: null,
  updateSuccess: null
};

export const fetchMyComplaints = createAsyncThunk("complaints/fetchMine", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/complaints/mine");
    return data.complaints;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchAssignedComplaints = createAsyncThunk("complaints/fetchAssigned", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/complaints/assigned");
    return data.complaints;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchComplaintById = createAsyncThunk("complaints/fetchById", async (id, thunkAPI) => {
  try {
    const { data } = await api.get(`/complaints/${id}`);
    return { complaint: data.complaint, workflow: data.workflow };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createComplaint = createAsyncThunk("complaints/create", async (payload, thunkAPI) => {
  try {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v);
    });
    const { data } = await api.post("/complaints", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.complaint;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateComplaintStatus = createAsyncThunk(
  "complaints/updateStatus",
  async ({ id, status, resolutionNotes }, thunkAPI) => {
    try {
      const { data } = await api.patch(`/complaints/${id}/status`, { status, resolutionNotes });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const complaintsSlice = createSlice({
  name: "complaints",
  initialState,
  reducers: {
    setSelected(state, action) {
      state.selected = action.payload;
    },
    clearUpdateFeedback(state) {
      state.updateError = null;
      state.updateSuccess = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyComplaints.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyComplaints.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchMyComplaints.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchAssignedComplaints.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAssignedComplaints.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchAssignedComplaints.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchComplaintById.pending, (state) => {
        state.selected = null;
        state.workflow = null;
        state.error = null;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(fetchComplaintById.fulfilled, (state, action) => {
        state.selected = action.payload.complaint;
        state.workflow = action.payload.workflow;
        state.error = null;
      })
      .addCase(fetchComplaintById.rejected, (state, action) => {
        state.selected = null;
        state.error = action.payload;
      })
      .addCase(createComplaint.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = [action.payload, ...state.list];
      })
      .addCase(createComplaint.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateComplaintStatus.pending, (state) => {
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        state.selected = action.payload.complaint;
        state.workflow = action.payload.workflow;
        state.list = state.list.map((c) => (c._id === action.payload.complaint._id ? action.payload.complaint : c));
        state.updateSuccess = `Status updated to ${action.payload.complaint.status}`;
      })
      .addCase(updateComplaintStatus.rejected, (state, action) => {
        state.updateError = action.payload;
      });
  }
});

export const { setSelected, clearUpdateFeedback } = complaintsSlice.actions;
export default complaintsSlice.reducer;

