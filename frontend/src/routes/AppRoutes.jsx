import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import { useAppDispatch } from "../app/hooks";
import useAuth from "../hooks/useAuth";
import { loadMe } from "../features/auth/authSlice";

/* Public Pages */
import About from "../components/pages/About";
import Contact from "../components/pages/Contact";
import Terms from "../components/pages/Terms";
import Privacy from "../components/pages/Privacy";

/* Recruiter pages */
import RecruiterDashboard from "../features/recruiter/pages/Dashboard";
import RecruiterAssessments from "../features/recruiter/pages/Assessments";
import CreateAssessment from "../features/recruiter/pages/CreateAssessment";
import RecruiterSubmissionDetail from "../features/recruiter/pages/SubmissionDetail";
import RecruiterInvitations from "../features/recruiter/pages/Invitations";
import RecruiterResults from "../features/recruiter/pages/Results";

/* Candidate pages */
import CandidateDashboard from "../features/candidate/pages/Dashboard";
import CandidateInvitations from "../features/candidate/pages/Invitations";
import CandidatePracticeTest from "../features/candidate/pages/PracticeTest";
import CandidateActiveTest from "../features/candidate/pages/ActiveTest";
import ActiveTestDemo from "../features/candidate/pages/ActiveTestDemo";

/* Profile Management */
import ProfileManagement from "../components/common/ProfileManagement";

export default function AppRoutes() {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !auth.user) {
      dispatch(loadMe());
    }
  }, [auth.user, dispatch]);

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          auth.isAuthenticated ? (
            <Navigate to={auth.role === "recruiter" ? "/recruiter" : "/interviewee"} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route path="/login" element={<Login />} />
      
      {/* Public Pages */}
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />

      {/* Legacy candidate routes (redirect) */}
      <Route path="/candidate" element={<Navigate to="/interviewee" replace />} />
      <Route
        path="/candidate/invitations"
        element={<Navigate to="/interviewee/invitations" replace />}
      />
      <Route
        path="/candidate/practice"
        element={<Navigate to="/interviewee/practice" replace />}
      />

      {/* Recruiter Routes */}
      <Route
        path="/recruiter"
        element={
          <PrivateRoute>
            <RoleRoute role="recruiter">
              <RecruiterDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/recruiter/assessments"
        element={
          <PrivateRoute>
            <RoleRoute role="recruiter">
              <RecruiterAssessments />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/recruiter/create"
        element={
          <PrivateRoute>
            <RoleRoute role="recruiter">
              <CreateAssessment />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/recruiter/invitations"
        element={
          <PrivateRoute>
            <RoleRoute role="recruiter">
              <RecruiterInvitations />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/recruiter/submissions/:id"
        element={
          <PrivateRoute>
            <RoleRoute role="recruiter">
              <RecruiterSubmissionDetail />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/recruiter/results"
        element={
          <PrivateRoute>
            <RoleRoute role="recruiter">
              <RecruiterResults />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/recruiter/profile"
        element={
          <PrivateRoute>
            <RoleRoute role="recruiter">
              <ProfileManagement />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      {/* Candidate Routes */}
      <Route
        path="/interviewee"
        element={
          <PrivateRoute>
            <RoleRoute role="interviewee">
              <CandidateDashboard />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/interviewee/invitations"
        element={
          <PrivateRoute>
            <RoleRoute role="interviewee">
              <CandidateInvitations />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/interviewee/practice"
        element={
          <PrivateRoute>
            <RoleRoute role="interviewee">
              <CandidatePracticeTest />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/interviewee/profile"
        element={
          <PrivateRoute>
            <RoleRoute role="interviewee">
              <ProfileManagement />
            </RoleRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/interviewee/active-test/:id"
        element={
          <PrivateRoute>
            <RoleRoute role="interviewee">
              <CandidateActiveTest />
            </RoleRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/interviewee/active-test-demo/:id"
        element={
          <PrivateRoute>
            <RoleRoute role="interviewee">
              <ActiveTestDemo />
            </RoleRoute>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
