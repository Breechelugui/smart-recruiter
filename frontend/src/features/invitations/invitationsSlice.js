import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchInvitations = createAsyncThunk(
  "invitations/fetchInvitations",
  async (_, { rejectWithValue }) => {
    try {
      console.log("=== FETCHING INVITATIONS ===");
      const { data } = await apiClient.get("/api/invitations");
      console.log("API Response - invitations data:", JSON.stringify(data, null, 2));
      console.log("Number of invitations received:", data.length);
      data.forEach((inv, index) => {
        console.log(`Invitation ${index + 1}:`, {
          id: inv.id,
          status: inv.status,
          assessment_id: inv.assessment_id,
          interviewee_id: inv.interviewee_id
        });
      });
      console.log("=== END FETCH DEBUG ===");
      return data;
    } catch (err) {
      console.error("Error fetching invitations:", err);
      const message = err?.response?.data?.detail || "Failed to load invitations";
      return rejectWithValue(message);
    }
  }
);

export const sendInvitation = createAsyncThunk(
  "invitations/sendInvitation",
  async ({ assessment_id, interviewee_id }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/api/invitations", {
        assessment_id,
        interviewee_id,
      });
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail);
      return rejectWithValue(message);
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  "invitations/acceptInvitation",
  async (invitationId, { rejectWithValue }) => {
    try {
      console.log("=== ACCEPTING INVITATION ===");
      console.log("Invitation ID to accept:", invitationId);
      const { data } = await apiClient.post(
        `/api/invitations/${invitationId}/accept`,
        null
      );
      console.log("Accept response:", JSON.stringify(data, null, 2));
      console.log("=== END ACCEPT DEBUG ===");
      return data;
    } catch (err) {
      console.error("Error accepting invitation:", err);
      const message = err?.response?.data?.detail || "Failed to accept invitation";
      return rejectWithValue(message);
    }
  }
);

export const declineInvitation = createAsyncThunk(
  "invitations/declineInvitation",
  async (invitationId, { rejectWithValue }) => {
    try {
      console.log("=== DECLINING INVITATION ===");
      console.log("Invitation ID to decline:", invitationId);
      const { data } = await apiClient.post(
        `/api/invitations/${invitationId}/decline`,
        null
      );
      console.log("Decline response:", JSON.stringify(data, null, 2));
      console.log("=== END DECLINE DEBUG ===");
      return data;
    } catch (err) {
      console.error("Error declining invitation:", err);
      const message = err?.response?.data?.detail || "Failed to decline invitation";
      return rejectWithValue(message);
    }
  }
);

const invitationsSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load invitations";
      })
      .addCase(sendInvitation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInvitation.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(sendInvitation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send invitation";
      })
      .addCase(acceptInvitation.fulfilled, (state, action) => {
        console.log("=== ACCEPT FULFILLED ===");
        console.log("Updating invitation in state:", action.payload);
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
          console.log("Updated invitation at index", idx, ":", state.items[idx]);
        } else {
          console.log("Invitation not found in state for update");
        }
        console.log("=== END ACCEPT FULFILLED ===");
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        console.error("Accept invitation rejected:", action);
        state.error = action.payload || "Failed to accept invitation";
      })
      .addCase(declineInvitation.fulfilled, (state, action) => {
        console.log("=== DECLINE FULFILLED ===");
        console.log("Updating invitation in state:", action.payload);
        const idx = state.items.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
          console.log("Updated invitation at index", idx, ":", state.items[idx]);
        } else {
          console.log("Invitation not found in state for update");
        }
        console.log("=== END DECLINE FULFILLED ===");
      })
      .addCase(declineInvitation.rejected, (state, action) => {
        console.error("Decline invitation rejected:", action);
        state.error = action.payload || "Failed to decline invitation";
      });
  },
});

export default invitationsSlice.reducer;
