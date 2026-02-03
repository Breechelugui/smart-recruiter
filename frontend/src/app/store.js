import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import assessmentsReducer from "../features/assessments/assessmentSlice";
import invitationsReducer from "../features/invitations/invitationsSlice";
import submissionsReducer from "../features/submissions/submissionsSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    assessments: assessmentsReducer,
    invitations: invitationsReducer,
    submissions: submissionsReducer,
    notifications: notificationsReducer,
  },
});
