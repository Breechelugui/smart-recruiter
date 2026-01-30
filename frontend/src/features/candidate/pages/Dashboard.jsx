import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchInvitations } from "../../invitations/invitationsSlice";
import { fetchSubmissions, startSubmission } from "../../submissions/submissionsSlice";
import { fetchAssessments } from "../../assessments/assessmentSlice";
import useAuth from "../../../hooks/useAuth";

export default function CandidateDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAuth();

  const invitationsState = useAppSelector((s) => s.invitations);
  const submissionsState = useAppSelector((s) => s.submissions);
  const assessmentsState = useAppSelector((s) => s.assessments);

  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    dispatch(fetchInvitations());
    dispatch(fetchSubmissions());
    dispatch(fetchAssessments());
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      dispatch(fetchInvitations());
      dispatch(fetchSubmissions());
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const invitations = invitationsState.items || [];
  const submissions = submissionsState.items || [];

  const pendingInvitations = useMemo(() => {
    console.log("=== PENDING INVITATIONS DEBUG ===");
    console.log("Total invitations:", invitations.length);
    console.log("Total submissions:", submissions.length);
    console.log("Invitations details:", JSON.stringify(invitations, null, 2));
    console.log("Submissions details:", JSON.stringify(submissions, null, 2));
    
    // Get assessment IDs that already have submissions
    const submittedAssessmentIds = submissions.map(s => s.assessment_id);
    console.log("Submitted assessment IDs:", submittedAssessmentIds);
    
    const pending = invitations.filter((i, index) => {
      console.log(`Invitation ${index + 1}:`, {
        id: i.id,
        status: i.status,
        status_type: typeof i.status,
        assessment_id: i.assessment_id,
        interviewee_id: i.interviewee_id,
        hasSubmission: submittedAssessmentIds.includes(i.assessment_id)
      });
      
      // Filter out invitations that already have submissions
      const hasSubmission = submittedAssessmentIds.includes(i.assessment_id);
      const isPending = i.status === "pending" && !hasSubmission;
      
      console.log(`  - Status: "${i.status}"`);
      console.log(`  - Has submission: ${hasSubmission}`);
      console.log(`  - Is pending (no submission): ${isPending}`);
      
      return isPending;
    });
    
    console.log("Filtered pending invitations:", pending.length);
    console.log("Pending details:", JSON.stringify(pending, null, 2));
    console.log("=== END PENDING DEBUG ===");
    
    return pending;
  }, [invitations, submissions]);

  const completedSubmissions = useMemo(
    () => submissions.filter((s) => s.status === "submitted" || s.status === "graded"),
    [submissions]
  );

  const inProgressSubmissions = useMemo(
    () => submissions.filter((s) => s.status === "in_progress"),
    [submissions]
  );

  // New logic for published assessments that can be taken
  const publishedAssessments = useMemo(() => {
    console.log("=== PUBLISHED ASSESSMENTS DEBUG ===");
    console.log("All invitations:", invitations);
    console.log("All submissions:", submissions);
    
    // Get accepted invitations for published assessments only
    const acceptedInvitations = invitations.filter((i) => {
      const isAccepted = i.status === "accepted";
      const isPublished = i.assessment?.status === "published";
      console.log(`Invitation ${i.id}: accepted=${isAccepted}, published=${isPublished}`);
      return isAccepted && isPublished;
    });
    console.log("Accepted invitations for published assessments:", acceptedInvitations);
    
    const submittedAssessmentIds = submissions.map(s => s.assessment_id);
    console.log("Submitted assessment IDs:", submittedAssessmentIds);
    
    // Filter out published assessments that already have submissions
    const availablePublishedTests = acceptedInvitations.filter(inv => 
      !submittedAssessmentIds.includes(inv.assessment_id)
    );
    console.log("Available published tests:", availablePublishedTests);
    console.log("=== END PUBLISHED DEBUG ===");
    
    return availablePublishedTests;
  }, [invitations, submissions]);

  const averageScore = useMemo(() => {
    const graded = submissions.filter((s) => typeof s.score === "number" && typeof s.max_score === "number" && s.max_score > 0);
    if (graded.length === 0) return 0;
    const avgPct = graded.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) / graded.length;
    return Math.round(avgPct);
  }, [submissions]);

  const upcoming = useMemo(() => {
    console.log("=== UPCOMING TESTS DEBUG ===");
    console.log("All invitations:", invitations);
    console.log("All submissions:", submissions);
    
    // Get all invitations (pending and accepted) that don't have submissions yet
    const allInvitations = invitations.filter((i) => 
      i.status === "pending" || i.status === "accepted"
    );
    console.log("All invitations (pending + accepted):", allInvitations);
    
    const submittedAssessmentIds = submissions.map(s => s.assessment_id);
    console.log("Submitted assessment IDs:", submittedAssessmentIds);
    
    // Filter out invitations that already have submissions
    const availableTests = allInvitations.filter(inv => 
      !submittedAssessmentIds.includes(inv.assessment_id)
    );
    console.log("Available tests (invited, no submission):", availableTests);
    console.log("=== END UPCOMING DEBUG ===");
    
    return availableTests;
  }, [invitations, submissions]);

  console.log("All invitations:", invitations);
  console.log("Pending invitations:", pendingInvitations);
  console.log("All submissions:", submissions);
  console.log("In progress submissions:", inProgressSubmissions);
  console.log("Completed submissions:", completedSubmissions);
  console.log("Upcoming:", upcoming);
  console.log("Active tab:", activeTab);

  const list =
    activeTab === "invitations"
      ? pendingInvitations
      : activeTab === "in_progress"
      ? publishedAssessments  // Use published assessments instead of in-progress submissions
      : activeTab === "completed"
      ? completedSubmissions
      : activeTab === "results"
      ? completedSubmissions.filter(s => s.status === 'graded')
      : upcoming;
      
  console.log("Current list being displayed:", list);

  // Auto-switch logic based on available content
  useEffect(() => {
    console.log("=== TAB SWITCHING DEBUG ===");
    console.log("Current active tab:", activeTab);
    console.log("Pending invitations count:", pendingInvitations.length);
    console.log("Published assessments count:", publishedAssessments.length);
    console.log("Upcoming tests count:", upcoming.length);
    
    // If no pending invitations, check for published assessments
    if (activeTab === "invitations" && pendingInvitations.length === 0) {
      if (publishedAssessments.length > 0) {
        console.log("Switching to in_progress tab (published assessments available)...");
        setActiveTab("in_progress");
      } else {
        console.log("Switching to upcoming tab (no published assessments)...");
        setActiveTab("upcoming");
      }
    }
    console.log("=== END TAB DEBUG ===");
  }, [activeTab, pendingInvitations.length, publishedAssessments.length, upcoming.length]);

  const handleStart = async (assessmentId) => {
    // Check if a submission already exists for this assessment
    const existing = submissions.find(
      (s) => s.assessment_id === assessmentId && s.interviewee_id === auth.user?.id
    );
    if (existing) {
      navigate(`/interviewee/active-test/${existing.id}`);
      return;
    }

    const res = await dispatch(startSubmission({ assessment_id: assessmentId }));
    if (startSubmission.fulfilled.match(res)) {
      navigate(`/interviewee/active-test/${res.payload.id}`);
    } else {
      console.error("Start submission error:", res);
      alert("Backend error: " + (res.payload || res.error?.message || "Unknown error"));
    }
  };

  const isLoading = invitationsState.loading || submissionsState.loading || assessmentsState.loading;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Candidate Dashboard</h2>
          <p className="text-gray-300 mt-2">Track your assessments and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pending Invitations Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-purple-100 uppercase tracking-wide">Pending</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{pendingInvitations.length}</h3>
            <p className="text-sm text-purple-100 font-medium">Invitations</p>
            <div className="mt-4 flex items-center text-purple-200">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Requires Action</span>
            </div>
          </div>

          {/* In Progress Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-indigo-100 uppercase tracking-wide">Available</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{publishedAssessments.length}</h3>
            <p className="text-sm text-indigo-100 font-medium">Published Tests</p>
            <div className="mt-4 flex items-center text-indigo-200">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 001 1h4a1 1 0 100-2H9V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Ready to Start</span>
            </div>
          </div>

          {/* Completed Card */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-green-100 uppercase tracking-wide">Completed</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{completedSubmissions.length}</h3>
            <p className="text-sm text-green-100 font-medium">Assessments</p>
            <div className="mt-4 flex items-center text-green-200">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 00-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 00-2.812-2.812 3.066 3.066 0 00.723-1.745 3.066 3.066 0 013.976 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">All Done</span>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-purple-100 uppercase tracking-wide">Average</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">{averageScore}%</h3>
            <p className="text-sm text-purple-100 font-medium">Score</p>
            <div className="mt-4 flex items-center text-purple-200">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-1.418 1.418l-2.8-2.034a1 1 0 00-1.418 0l-2.8 2.034a1 1 0 01-1.418-1.418l2.8-2.034a1 1 0 00.588-1.81H9.049z" />
              </svg>
              <span className="text-xs">Performance</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
              ▶
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Try a Practice Assessment</h3>
              <p className="text-sm text-slate-600">
                Familiarize yourself with the platform interface and question types before taking actual assessments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/interviewee/practice")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
          >
            Start Practice Test
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeTab === "upcoming"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Upcoming
            </div>
          </button>
          {publishedAssessments.length > 0 && (
            <button
              onClick={() => setActiveTab("in_progress")}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "in_progress"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Available
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-bold">
                  {publishedAssessments.length}
                </span>
              </div>
            </button>
          )}
          {pendingInvitations.length > 0 && (
            <button
              onClick={() => setActiveTab("invitations")}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === "invitations"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Invitations
                <span className="bg-yellow-100 text-yellow-600 text-xs px-2 py-1 rounded-full font-bold">
                  {pendingInvitations.length}
                </span>
              </div>
            </button>
          )}
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Completed
            </div>
          </button>
        </div>

        <div className="space-y-4">
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-sm text-slate-600">
              Loading...
            </div>
          )}

          {!isLoading && list.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-sm text-slate-600">
              No items to show.
            </div>
          )}

          {!isLoading &&
            list.map((item) => {
              const assessment = item.assessment || item.assessment_detail || item.assessment_data || item.assessment;
              const title = assessment?.title || item?.title || "Assessment";
              const description = assessment?.description || "";
              const timeLimit = assessment?.time_limit ? `${assessment.time_limit} min` : "";
              const questions = assessment?.questions?.length;
              const due = item?.scheduled_end || item?.scheduled_start;
              const dueLabel = due ? new Date(due).toLocaleDateString() : "";

              // Debug logging to understand the data structure
              console.log("Item data:", item);
              console.log("Item status:", item.status);
              console.log("Item assessment_id:", item.assessment_id);
              console.log("Item submitted_at:", item.submitted_at);
              console.log("Item graded_at:", item.graded_at);
              
              // Determine if this is an invitation or submission
              // A submission should have assessment_id and/or submitted_at
              const isSubmission = item.assessment_id || item.submitted_at || item.graded_at;
              const isInvitation = !isSubmission;
              
              console.log("Is submission:", isSubmission);
              console.log("Is invitation:", isInvitation);
              
              // Get the correct status based on item type
              let displayStatus = '';
              let statusColor = '';
              
              if (isInvitation) {
                // This is an invitation
                displayStatus = item.status || 'pending';
                statusColor = displayStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                             displayStatus === 'accepted' ? 'bg-green-100 text-green-800' : 
                             'bg-gray-100 text-gray-800';
              } else {
                // This is a submission - use submission status
                displayStatus = item.status || 'unknown';
                statusColor = displayStatus === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                             displayStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                             displayStatus === 'graded' ? 'bg-green-100 text-green-800' :
                             'bg-gray-100 text-gray-800';
              }
              
              console.log("Final display status:", displayStatus);

              const assessmentId = assessment?.id || item?.assessment_id;

              // For in-progress submissions, show continue button
              if (activeTab === "in_progress") {
                const startedDate = item.started_at ? new Date(item.started_at).toLocaleDateString() : "";
                
                return (
                <div key={`${activeTab}-${item.id}`} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${statusColor}`}>
                          {displayStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Started: {startedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{timeLimit || "Not set"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>{questions || "0"} questions</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/interviewee/active-test/${item.id}`)}
                      className="ml-6 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Continue
                      </div>
                    </button>
                  </div>
                </div>
              );
              }

              // For completed tab, show results format
              if (activeTab === "completed" && item.status === 'graded') {
                const percentage = item.max_score ? Math.round((item.score / item.max_score) * 100) : 0;
                const completedDate = item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "";
                
                return (
                  <div key={`${activeTab}-${item.id}`} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${statusColor}`}>
                            {displayStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Completed: {completedDate}</span>
                          </div>
                        </div>
                        
                        {/* Score Display */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 mb-6 shadow-inner">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-green-600 mb-2">Your Score</div>
                              <div className="text-3xl font-bold text-green-700 mb-1">{percentage}%</div>
                              <div className="text-sm text-green-600">{item.score || 0}/{item.max_score || 0} points</div>
                            </div>
                            <div className="text-5xl">🏆</div>
                          </div>
                          <div className="mt-4">
                            <div className="w-full bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Feedback Display - Below the score */}
                        {item.feedbacks && item.feedbacks.length > 0 ? (
                          <div className="border-t border-gray-200 pt-6">
                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                              </div>
                              <span className="font-bold text-blue-800 text-lg">Recruiter Feedback</span>
                            </div>
                            {item.feedbacks.map((feedback, idx) => (
                              <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 mb-3 last:mb-0 hover:shadow-md transition-all duration-200">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <span className="text-white text-sm font-bold">
                                      {(feedback.recruiter?.full_name || feedback.recruiter?.username || 'R')[0].toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="font-bold text-gray-900">
                                        {feedback.recruiter?.full_name || feedback.recruiter?.username || 'Recruiter'}
                                      </span>
                                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                                        {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : ''}
                                      </span>
                                    </div>
                                    <div className="text-gray-700 leading-relaxed">{feedback.feedback_text}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="border-t border-gray-200 pt-6">
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                              </div>
                              <div className="text-gray-500 text-sm font-medium">No feedback available yet</div>
                              <div className="text-gray-400 text-xs mt-1">Feedback will appear here once recruiters review your assessment</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // For results tab, show detailed feedback
              if (activeTab === "results") {
                const percentage = item.max_score ? Math.round((item.score / item.max_score) * 100) : 0;
                const completedDate = item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "";
                const gradedDate = item.graded_at ? new Date(item.graded_at).toLocaleDateString() : "";
                
                return (
                  <div key={`${activeTab}-${item.id}`} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColor}`}>
                            {displayStatus.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <span>Completed: {completedDate}</span>
                          <span>Graded: {gradedDate}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-sm text-green-600 mb-1">Final Score</div>
                            <div className="text-2xl font-bold text-green-700">{percentage}%</div>
                            <div className="text-sm text-green-600">{item.score || 0}/{item.max_score || 0} points</div>
                          </div>
                          
                          {item.feedbacks && item.feedbacks.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="text-sm text-blue-600 mb-1">Feedback Received</div>
                              <div className="text-lg font-bold text-blue-700">{item.feedbacks.length}</div>
                              <div className="text-sm text-blue-600">Recruiter Comments</div>
                            </div>
                          )}
                        </div>

                        {item.feedbacks && item.feedbacks.length > 0 && (
                          <div className="border-t pt-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-blue-600">💬</span>
                              <span className="font-semibold text-blue-800">Detailed Feedback</span>
                            </div>
                            {item.feedbacks.map((feedback, idx) => (
                              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 last:mb-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <span className="text-blue-600 text-sm font-semibold">
                                        {(feedback.recruiter?.full_name || feedback.recruiter?.username || 'R')[0].toUpperCase()}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {feedback.recruiter?.full_name || feedback.recruiter?.username || 'Recruiter'}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : ''}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-gray-700">{feedback.feedback_text}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={`${activeTab}-${item.id}`} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColor}`}>
                          {displayStatus.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Time Limit: {timeLimit || "Not set"}</span>
                        <span>Questions: {questions || "0"}</span>
                        {dueLabel && <span>Due: {dueLabel}</span>}
                      </div>
                    </div>
                    {assessmentId && activeTab !== "results" && activeTab !== "completed" && (
                      <button
                        onClick={() => handleStart(assessmentId)}
                        className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
                      >
                        Start Test
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </PageWrapper>
  );
}
