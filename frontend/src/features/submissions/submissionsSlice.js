import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import { fetchNotifications } from "../notifications/notificationsSlice";
import { fetchInvitations } from "../invitations/invitationsSlice";

const initialState = {
  items: [],
  submission: null,
  loading: false,
  error: null,
};

export const fetchSubmissions = createAsyncThunk(
  "submissions/fetchSubmissions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/api/submissions");
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail);
      return rejectWithValue(message);
    }
  }
);

export const fetchSubmissionById = createAsyncThunk(
  "submissions/fetchSubmissionById",
  async (submissionId, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get(`/api/submissions/${submissionId}`);
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail);
      return rejectWithValue(message);
    }
  }
);

export const startSubmission = createAsyncThunk(
  "submissions/startSubmission",
  async ({ assessment_id }, { rejectWithValue, dispatch }) => {
    try {
      console.log("=== STARTING SUBMISSION ===");
      console.log("Assessment ID:", assessment_id);
      const { data } = await apiClient.post("/api/submissions", { assessment_id });
      console.log("Submission started:", JSON.stringify(data, null, 2));
      
      // Refresh invitations to update status from pending to accepted
      console.log("Refreshing invitations after starting submission...");
      dispatch(fetchInvitations());
      
      // Refresh notifications
      dispatch(fetchNotifications());
      
      console.log("=== END START SUBMISSION ===");
      return data;
    } catch (err) {
      console.error("Start submission error:", err);
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail);
      return rejectWithValue(message);
    }
  }
);

export const saveAnswer = createAsyncThunk(
  "submissions/saveAnswer",
  async (answerData, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post(`/api/submissions/${answerData.submission_id}/answers`, answerData);
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail);
      return rejectWithValue(message);
    }
  }
);

export const submitSubmission = createAsyncThunk(
  "submissions/submitSubmission",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await apiClient.post(`/api/submissions/${id}/submit`);
      // Refresh notifications after submission to notify recruiters
      dispatch(fetchNotifications());
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail);
      console.error("Submit submission error:", err);
      console.error("Backend detail:", detail);
      return rejectWithValue(message);
    }
  }
);

const submissionsSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load submissions";
      })
      .addCase(fetchSubmissionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionById.fulfilled, (state, action) => {
        state.loading = false;
        state.submission = action.payload;
      })
      .addCase(fetchSubmissionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load submission";
      })
      .addCase(startSubmission.fulfilled, (state, action) => {
        state.items = [action.payload, ...state.items];
      })
      .addCase(submitSubmission.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        // Update the submission with the new answer
        const submissionIdx = state.items.findIndex((s) => s.id === action.payload.submission_id);
        if (submissionIdx !== -1) {
          if (!state.items[submissionIdx].answers) {
            state.items[submissionIdx].answers = [];
          }
          // Update or add the answer
          const answerIdx = state.items[submissionIdx].answers.findIndex(
            (a) => a.question_id === action.payload.question_id
          );
          if (answerIdx !== -1) {
            state.items[submissionIdx].answers[answerIdx] = action.payload;
          } else {
            state.items[submissionIdx].answers.push(action.payload);
          }
        }
      });
  },
});

export default submissionsSlice.reducer;
