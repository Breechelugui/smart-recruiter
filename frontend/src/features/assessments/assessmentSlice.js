import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { fetchNotifications } from "../notifications/notificationsSlice";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchAssessments = createAsyncThunk(
  "assessments/fetchAssessments",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log("=== FETCHING ASSESSMENTS ===");
      const { data } = await apiClient.get("/api/assessments");
      console.log("Assessments fetched:", data.length);
      console.log("Assessments data:", data);
      
      // Check for newly published assessments and refresh notifications
      const publishedAssessments = data.filter(a => a.status === 'published');
      if (publishedAssessments.length > 0) {
        console.log("Published assessments found, refreshing notifications...");
        dispatch(fetchNotifications());
      }
      
      console.log("=== END FETCH ASSESSMENTS ===");
      return data;
    } catch (err) {
      console.error("Error fetching assessments:", err);
      const message = err?.response?.data?.detail || "Failed to load assessments";
      return rejectWithValue(message);
    }
  }
);

export const createAssessment = createAsyncThunk(
  "assessments/createAssessment",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/api/assessments", payload);
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail);
      return rejectWithValue(message);
    }
  }
);

export const deleteAssessment = createAsyncThunk(
  "assessments/deleteAssessment",
  async (assessmentId, { rejectWithValue }) => {
    console.log('Delete thunk called with assessmentId:', assessmentId);
    try {
      const response = await apiClient.delete(`/api/assessments/${assessmentId}`);
      console.log('Delete API response:', response);
      return assessmentId;
    } catch (err) {
      console.error('Delete assessment error in slice:', err);
      const detail = err?.response?.data?.detail || err?.message;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail || err);
      return rejectWithValue(message);
    }
  }
);

const assessmentSlice = createSlice({
  name: "assessments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load assessments";
      })
      .addCase(createAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(createAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create assessment";
      })
      .addCase(deleteAssessment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(assessment => assessment.id !== action.payload);
      })
      .addCase(deleteAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete assessment";
      });
  },
});

export default assessmentSlice.reducer;
