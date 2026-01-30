import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAssessments } from "../../assessments/assessmentSlice";
import { fetchInvitations } from "../../invitations/invitationsSlice";
import { fetchSubmissions } from "../../submissions/submissionsSlice";
import { fetchNotifications } from "../../notifications/notificationsSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";

export default function RecruiterDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items: assessments, loading: assessmentsLoading } = useAppSelector((s) => s.assessments);
  const { items: invitations, loading: invitationsLoading } = useAppSelector((s) => s.invitations);
  const { items: submissions, loading: submissionsLoading } = useAppSelector((s) => s.submissions);

  useEffect(() => {
    dispatch(fetchAssessments());
    dispatch(fetchInvitations());
    dispatch(fetchSubmissions());
    dispatch(fetchNotifications());
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      dispatch(fetchSubmissions());
      dispatch(fetchNotifications());
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  // Debug logging to check time_limit values
  useEffect(() => {
    console.log("Assessments loaded:", assessments);
    assessments.forEach((assessment, index) => {
      console.log(`Assessment ${index + 1} time_limit:`, assessment.time_limit);
    });
  }, [assessments]);

  const stats = useMemo(() => {
    const totalAssessments = assessments.length;
    const activeAssessments = assessments.filter((a) => a.status === "published").length;
    const invitationsSent = invitations.length;
    const totalResponses = submissions.filter((s) => s.status === "submitted" || s.status === "graded").length;
    const responseRate = invitationsSent > 0 ? Math.round((totalResponses / invitationsSent) * 100) : 0;

    // Calculate actual average completion time
    const completedSubmissions = submissions.filter((s) => 
      s.status === "submitted" || s.status === "graded"
    );
    
    let avgCompletionMinutes = 0;
    let avgCompletionDisplay = "0m";
    
    if (completedSubmissions.length > 0) {
      const totalMinutes = completedSubmissions.reduce((total, submission) => {
        // Calculate duration from started_at to submitted_at
        const startTime = new Date(submission.started_at);
        const endTime = new Date(submission.submitted_at);
        const durationMinutes = (endTime - startTime) / (1000 * 60); // Convert to minutes
        
        // Only include reasonable completion times (exclude outliers like negative or extremely long times)
        if (durationMinutes > 0 && durationMinutes < 1000) { // Max 1000 minutes (16+ hours)
          return total + durationMinutes;
        }
        return total;
      }, 0);
      
      avgCompletionMinutes = Math.round(totalMinutes / completedSubmissions.length);
      
      // Format display
      if (avgCompletionMinutes >= 60) {
        const hours = Math.floor(avgCompletionMinutes / 60);
        const minutes = avgCompletionMinutes % 60;
        avgCompletionDisplay = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      } else {
        avgCompletionDisplay = `${avgCompletionMinutes}m`;
      }
    }

    return [
      {
        label: "Total Assessments",
        value: totalAssessments,
        sub: `${activeAssessments} Currently Active`,
      },
      {
        label: "Invitations Sent",
        value: invitationsSent,
        sub: "Across All Assessments",
      },
      {
        label: "Total Responses",
        value: totalResponses,
        sub: `${responseRate}% Response Rate`,
      },
      {
        label: "Avg. Completion",
        value: avgCompletionDisplay,
        sub: completedSubmissions.length > 0 ? `From ${completedSubmissions.length} submissions` : "No data yet",
      },
    ];
  }, [assessments, invitations, submissions]);

  const isLoading = assessmentsLoading || invitationsLoading || submissionsLoading;
  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Recruiter Dashboard</h2>
            <p className="text-gray-300 mt-1">Overview of your assessment activity and performance</p>
          </div>

          <button
            onClick={() => navigate("/recruiter/create")}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Assessment
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const gradients = [
              "from-purple-500 to-purple-600",
              "from-indigo-500 to-indigo-600", 
              "from-green-500 to-green-600",
              "from-orange-500 to-orange-600"
            ];
            const icons = [
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>,
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>,
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>,
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ];
            
            return (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl border border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradients[index]} text-white flex items-center justify-center shadow-lg mb-4`}>
                    {icons[index]}
                  </div>
                  <p className="text-xs font-bold text-gray-400 tracking-wider uppercase">{stat.label}</p>
                  <div className="mt-3">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-gray-300 mt-2 font-medium">{stat.sub}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pending Grading Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Pending Grading</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span>{submissions.filter(s => s.status === "submitted").length} submissions need grading</span>
            </div>
          </div>

          {submissions.filter(s => s.status === "submitted").length === 0 ? (
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-2xl border border-green-600/30 shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">All caught up!</h4>
              <p className="text-gray-300">No submissions are currently pending grading</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions
                .filter(s => s.status === "submitted")
                .map((submission) => {
                  const assessment = assessments.find(a => a.id === submission.assessment_id);
                  const candidateName = submission.candidate?.name || "Unknown Candidate";
                  const submittedTime = new Date(submission.submitted_at).toLocaleString();

                  return (
                    <div
                      key={submission.id}
                      className="bg-gray-800 rounded-2xl border border-orange-600/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                            <h4 className="text-lg font-bold text-white">{assessment?.title || "Unknown Assessment"}</h4>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              Pending Grading
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Candidate</p>
                                <p className="text-sm font-semibold">{candidateName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Submitted</p>
                                <p className="text-sm font-semibold">{submittedTime}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Questions</p>
                                <p className="text-sm font-semibold">{assessment?.questions?.length || 0} questions</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                          <button
                            onClick={() => navigate(`/recruiter/grade/${submission.id}`)}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          >
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Grade Now
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Assessment Portfolio */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Assessment Portfolio</h3>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{assessments.length} assessments</span>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-gray-800 rounded-2xl border border-gray-600 shadow-lg p-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-300">Loading assessments...</span>
                </div>
              </div>
            ) : assessments.length === 0 ? (
              <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl border border-purple-600/30 shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-white mb-2">No assessments yet</h4>
                <p className="text-gray-300 mb-6">Create your first assessment to start evaluating candidates</p>
                <button
                  onClick={() => navigate("/recruiter/create")}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  Create Your First Assessment
                </button>
              </div>
            ) : (
              assessments.map((a) => {
                const invites = invitations.filter((i) => i.assessment_id === a.id).length;
                const responses = submissions.filter((s) => s.assessment_id === a.id && (s.status === "submitted" || s.status === "graded")).length;
                const completionRate = invites > 0 ? Math.round((responses / invites) * 100) : 0;

                return (
                  <div
                    key={a.id}
                    className="bg-gray-800 rounded-2xl border border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-3 h-3 rounded-full ${
                            a.status === "published" ? "bg-green-500" : "bg-yellow-500"
                          }`}></div>
                          <h4 className="text-xl font-bold text-white">{a.title}</h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                              a.status === "published"
                                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>

                        <p className="text-gray-300 mb-4 leading-relaxed">{a.description}</p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Duration</p>
                              <p className="text-sm font-semibold">{a.time_limit ? `${a.time_limit} min` : "No limit"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Invitations</p>
                              <p className="text-sm font-semibold">{invites} sent</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Responses</p>
                              <p className="text-sm font-semibold">{responses} completed</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Completion</p>
                              <p className="text-sm font-semibold">{completionRate}%</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                        <button
                          onClick={() => navigate(`/recruiter/results?assessment=${a.id}`)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            View Results
                          </div>
                        </button>
                        <button
                          onClick={() => navigate(`/recruiter/invitations?assessment=${a.id}`)}
                          className="border border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-3 rounded-xl font-semibold shadow hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Invite
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
