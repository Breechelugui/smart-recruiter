import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAssessments } from "../../assessments/assessmentSlice";
import { fetchSubmissions, startSubmission } from "../../submissions/submissionsSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import ConfirmModal from "../../../components/common/ConfirmModal";
import useAuth from "../../../hooks/useAuth";

export default function PracticeTest() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAuth();
  const { items: assessments, loading: assessmentsLoading, error: assessmentsError } = useAppSelector((s) => s.assessments);
  const { items: submissions, loading: submissionsLoading } = useAppSelector((s) => s.submissions);

  useEffect(() => {
    if (auth.user) {
      dispatch(fetchAssessments());
      dispatch(fetchSubmissions());
    }
  }, [dispatch, auth.user]);

  const trialAssessments = useMemo(
    () => assessments || [],
    [assessments]
  );

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, assessmentId: null, title: "" });

  const handleStart = async (assessmentId) => {
    // Check if a submission already exists for this assessment
    const existing = submissions.find(
      (s) => s.assessment_id === assessmentId && s.interviewee_id === auth.user?.id
    );
    if (existing) {
      navigate(`/interviewee/active-test/${existing.id}`);
      return;
    }

    const assessment = assessments.find((a) => a.id === assessmentId);
    setConfirmModal({ isOpen: true, assessmentId, title: assessment?.title || "Assessment" });
  };

  const confirmStart = async () => {
    const { assessmentId } = confirmModal;
    console.log("Starting assessment with ID:", assessmentId);
    // Check if a submission already exists for this assessment
    const existing = submissions.find(
      (s) => s.assessment_id === assessmentId && s.interviewee_id === auth.user?.id
    );
    if (existing) {
      console.log("Submission already exists, navigating to:", existing.id);
      setConfirmModal({ isOpen: false, assessmentId: null, title: "" });
      navigate(`/interviewee/active-test/${existing.id}`);
      return;
    }

    const res = await dispatch(startSubmission({ assessment_id: assessmentId }));
    console.log("Start submission response:", res);
    if (startSubmission.fulfilled.match(res)) {
      console.log("Submission created, navigating to:", `/interviewee/active-test/${res.payload.id}`);
      setConfirmModal({ isOpen: false, assessmentId: null, title: "" });
      navigate(`/interviewee/active-test/${res.payload.id}`);
    } else {
      console.error("Start submission error:", res);
      alert("Backend error: " + (res.payload || res.error?.message || "Unknown error"));
    }
  };

  const cancelStart = () => {
    setConfirmModal({ isOpen: false, assessmentId: null, title: "" });
  };

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Practice Test</h2>
            <p className="text-sm text-slate-500">Choose a trial assessment to practice</p>
          </div>
          <BackToDashboardButton />
        </div>

        {assessmentsError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {assessmentsError}
          </div>
        )}

        <div className="space-y-4">
          {assessmentsLoading || submissionsLoading ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-sm text-slate-600">
              Loading practice assessments...
            </div>
          ) : trialAssessments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <div className="text-slate-500">
                <p className="text-lg font-semibold mb-2">No Trial Assessments Available</p>
                <p>Please check back later or contact your recruiter.</p>
              </div>
            </div>
          ) : (
            trialAssessments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-purple-300 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">{a.title}</h4>
                  <p className="text-sm text-slate-500">{a.description}</p>
                  <div className="flex gap-6 text-xs text-slate-600 mt-4">
                    <span>Time limit: {a.time_limit ? `${a.time_limit} min` : "-"}</span>
                    <span>Questions: {a.questions?.length ?? "-"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStart(a.id)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm self-start sm:self-auto"
                >
                  Start Practice Test
                </button>
              </div>
            ))
          )}

          {!(assessmentsLoading || submissionsLoading) && trialAssessments.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-sm text-slate-600">
              No trial assessments available.
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={cancelStart}
        onConfirm={confirmStart}
        title="Start Assessment"
        message={`Are you ready to start "${confirmModal.title}"? Make sure you have a stable internet connection.`}
      />
    </PageWrapper>
  );
}

