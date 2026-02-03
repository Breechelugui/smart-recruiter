import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchSubmissions } from "../../submissions/submissionsSlice";
import { fetchAssessments } from "../../assessments/assessmentSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-slate-500 tracking-wider">{label}</p>
      <div className="mt-3">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-600 mt-2">{sub}</p>
      </div>
    </div>
  );
}

function ScoreBar({ label, count, total, color = "bg-purple-600" }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-700 w-20">{label}</span>
      <div className="flex-1 bg-slate-200 rounded-full h-6 relative">
        <div
          className={`h-6 rounded-full flex items-center justify-center text-xs text-white font-semibold ${color}`}
          style={{ width: `${pct}%` }}
        >
          {pct > 0 && `${count}`}
        </div>
      </div>
      <span className="text-xs text-slate-500 w-12 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}

export default function Results() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedAssessmentId = searchParams.get("assessment");

  const { items: submissions, loading: submissionsLoading } = useAppSelector((s) => s.submissions);
  const { items: assessments, loading: assessmentsLoading } = useAppSelector((s) => s.assessments);

  const [filterAssessment, setFilterAssessment] = useState(selectedAssessmentId || "");
  const [showAnalytics, setShowAnalytics] = useState(true); // Default to analytics view

  // Extract all questions from assessments
  const allQuestions = useMemo(() => {
    return assessments.flatMap(assessment => assessment.questions || []);
  }, [assessments]);

  useEffect(() => {
    dispatch(fetchSubmissions());
    dispatch(fetchAssessments());
  }, [dispatch]);

  const filteredSubmissions = useMemo(() => {
    if (!filterAssessment) return submissions;
    return submissions.filter((s) => s.assessment_id === Number(filterAssessment));
  }, [submissions, filterAssessment]);

  const averageScore = useMemo(() => {
    const graded = filteredSubmissions.filter(
      (s) => typeof s.score === "number" && typeof s.max_score === "number" && s.max_score > 0
    );
    if (graded.length === 0) return 0;
    const avgPct = graded.reduce((sum, s) => sum + (s.score / s.max_score) * 100, 0) / graded.length;
    return Math.round(avgPct);
  }, [filteredSubmissions]);

  const stats = useMemo(() => {
    const total = filteredSubmissions.length;
    const submitted = filteredSubmissions.filter((s) => s.status === "submitted" || s.status === "graded").length;
    const graded = filteredSubmissions.filter((s) => s.status === "graded").length;
    const passed = filteredSubmissions.filter(
      (s) => typeof s.score === "number" && typeof s.max_score === "number" && s.max_score > 0 && (s.score / s.max_score) >= 0.7
    ).length;
    const failed = graded - passed;
    return { total, submitted, graded, passed, failed, averageScore };
  }, [filteredSubmissions, averageScore]);

  const scoreDistribution = useMemo(() => {
    const graded = filteredSubmissions.filter(
      (s) => typeof s.score === "number" && typeof s.max_score === "number" && s.max_score > 0
    );
    const ranges = [
      { label: "90-100%", min: 0.9, max: 1, color: "bg-green-600" },
      { label: "80-89%", min: 0.8, max: 0.899, color: "bg-blue-600" },
      { label: "70-79%", min: 0.7, max: 0.799, color: "bg-purple-600" },
      { label: "<70%", min: 0, max: 0.699, color: "bg-red-600" },
    ];
    return ranges.map((range) => ({
      ...range,
      count: graded.filter((s) => {
        const pct = s.score / s.max_score;
        return pct >= range.min && pct <= range.max;
      }).length,
    }));
  }, [filteredSubmissions]);

  const topPerformers = useMemo(() => {
    const graded = filteredSubmissions
      .filter(
        (s) => typeof s.score === "number" && typeof s.max_score === "number" && s.max_score > 0 && s.status === "graded"
      )
      .map((s) => ({
        ...s,
        pct: (s.score / s.max_score) * 100,
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
    return graded;
  }, [filteredSubmissions]);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Results</h2>
            <p className="text-sm text-slate-500">Review assessment submissions and scores</p>
          </div>
          <BackToDashboardButton />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-sm font-semibold text-slate-700">Filter by Assessment:</label>
              <select
                value={filterAssessment}
                onChange={(e) => setFilterAssessment(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="">All Assessments</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnalytics(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAnalytics 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setShowAnalytics(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !showAnalytics 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Table View
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard or Traditional View */}
        {showAnalytics ? (
          <AnalyticsDashboard 
            submissions={filteredSubmissions} 
            assessments={assessments}
            questions={allQuestions}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard label="TOTAL SUBMISSIONS" value={stats.total} sub="All Time" />
              <StatCard label="SUBMITTED" value={stats.submitted} sub="Ready for grading" />
              <StatCard label="GRADED" value={stats.graded} sub="Completed" />
              <StatCard label="AVERAGE SCORE" value={`${stats.averageScore}%`} sub="From Graded Tests" />
            </div>

            {/* Pass/Fail & Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pass/Fail */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Pass/Fail Rate</h3>
                {stats.graded > 0 ? (
                  <div className="space-y-3">
                    <ScoreBar label="Passed" count={stats.passed} total={stats.graded} color="bg-green-600" />
                    <ScoreBar label="Failed" count={stats.failed} total={stats.graded} color="bg-red-600" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No graded submissions yet.</p>
                )}
                <p className="text-xs text-slate-500 mt-4">Pass threshold: 70%</p>
              </div>

              {/* Score Distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Score Distribution</h3>
                {scoreDistribution.some((d) => d.count > 0) ? (
                  <div className="space-y-3">
                    {scoreDistribution.map((range) => (
                      <ScoreBar
                        key={range.label}
                        label={range.label}
                        count={range.count}
                        total={filteredSubmissions.filter(
                          (s) => typeof s.score === "number" && typeof s.max_score === "number" && s.max_score > 0
                        ).length}
                        color={range.color}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No scored submissions yet.</p>
                )}
              </div>
            </div>

            {/* Top Performers */}
            {topPerformers.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                <h3 className="font-semibold text-slate-900 mb-4">Top Performers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-4 py-2 font-semibold text-slate-700">Candidate</th>
                        <th className="text-left px-4 py-2 font-semibold text-slate-700">Assessment</th>
                        <th className="text-left px-4 py-2 font-semibold text-slate-700">Score</th>
                        <th className="text-left px-4 py-2 font-semibold text-slate-700">Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topPerformers.map((s) => {
                        const assessment = assessments.find((a) => a.id === s.assessment_id);
                        return (
                          <tr key={s.id} className="border-b border-slate-100">
                            <td className="px-4 py-2">
                              <p className="font-medium text-slate-900">{s.interviewee?.full_name || "-"}</p>
                              <p className="text-xs text-slate-500">{s.interviewee?.email || "-"}</p>
                            </td>
                            <td className="px-4 py-2">
                              <p className="font-medium text-slate-900">{assessment?.title || "-"}</p>
                            </td>
                            <td className="px-4 py-2">
                              <span className="font-semibold text-green-600">{s.pct.toFixed(1)}%</span>
                            </td>
                            <td className="px-4 py-2">
                              <p className="text-xs text-slate-600">
                                {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "-"}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
                <h3 className="font-semibold text-slate-900 mb-4">Top Performers</h3>
                <p className="text-sm text-slate-500">No graded submissions yet.</p>
              </div>
            )}

            {/* Submissions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">All Submissions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Candidate</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Assessment</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Score</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Status</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Submitted</th>
                      <th className="text-left px-6 py-3 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((s) => {
                      const assessment = assessments.find((a) => a.id === s.assessment_id);
                      return (
                        <tr key={s.id} className="border-b border-slate-100">
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">
                              {s.interviewee?.full_name || s.interviewee?.email}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-slate-900">{assessment?.title}</p>
                          </td>
                          <td className="px-6 py-4">
                            {typeof s.score === "number" && typeof s.max_score === "number" ? (
                              <span className="font-semibold text-green-600">
                                {Math.round((s.score / s.max_score) * 100)}%
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${
                                s.status === "graded"
                                  ? "bg-green-100 text-green-700"
                                  : s.status === "submitted"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs text-slate-600">
                              {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : "-"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate(`/recruiter/submissions/${s.id}`)}
                              className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
