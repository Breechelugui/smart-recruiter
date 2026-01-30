import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";

const tokenFromStorage = localStorage.getItem("access_token");

const initialState = {
  user: null,
  role: null,
  isAuthenticated: Boolean(tokenFromStorage),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const body = new URLSearchParams();
      body.set("username", username);
      body.set("password", password);

      const { data } = await apiClient.post("/api/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("access_token", data.access_token);
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d?.msg || JSON.stringify(d)).join("\n")
          : detail
          ? JSON.stringify(detail)
          : "Login failed";
      return rejectWithValue(message);
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ email, username, full_name, password, role }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post("/api/auth/register", {
        email,
        username,
        full_name,
        password,
        role,
      });
      return data;
    } catch (err) {
      const detail = err?.response?.data?.detail;
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d?.msg || JSON.stringify(d)).join("\n")
          : detail
          ? JSON.stringify(detail)
          : "Registration failed";
      return rejectWithValue(message);
    }
  }
);

export const loadMe = createAsyncThunk(
  "auth/loadMe",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get("/api/auth/me");
      return data;
    } catch (err) {
      const message = err?.response?.data?.detail || "Failed to load user";
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      localStorage.removeItem("access_token");
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
      })
      .addCase(loadMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        localStorage.removeItem("access_token");
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
