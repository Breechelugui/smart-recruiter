import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import Button from "../../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAssessments } from "../../assessments/assessmentSlice";
import { fetchSubmissions } from "../../submissions/submissionsSlice";
import { detectQuestionType, isCodingQuestion, isMultipleChoiceQuestion, isMultipleAnswerQuestion } from "../../../utils/questionTypes";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import { Editor } from "@monaco-editor/react";

export default function SubmissionDetail() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items: submissions, loading: submissionsLoading } = useAppSelector((s) => s.submissions);
  const { items: assessments, loading: assessmentsLoading } = useAppSelector((s) => s.assessments);

  const [submission, setSubmission] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchSubmissions());
    dispatch(fetchAssessments());
  }, [dispatch]);

  useEffect(() => {
    const sub = submissions.find((s) => s.id === Number(id));
    if (sub) {
      setSubmission(sub);
      // Convert answers array to object for easier access
      const answersObj = {};
      if (sub.answers && Array.isArray(sub.answers)) {
        sub.answers.forEach(answer => {
          // For coding questions, use code_solution, otherwise use answer_text
          const question = assessments.find(a => a.id === sub.assessment_id)?.questions?.find(q => q.id === answer.question_id);
          if (isCodingQuestion(question)) {
            // Try code_solution first, then answer_text as fallback
            answersObj[answer.question_id] = answer.code_solution || answer.answer_text || '';
          } else {
            answersObj[answer.question_id] = answer.answer_text || '';
          }
        });
      }
      setAnswers(answersObj);
      
      const ass = assessments.find((a) => a.id === sub.assessment_id);
      setAssessment(ass);
      // Initialize scores from existing data if any
      const initScores = {};
      if (ass && sub.answers) {
        ass.questions.forEach((q) => {
          const answer = sub.answers.find(a => a.question_id === q.id);
          initScores[q.id] = answer?.points_earned || 0;
        });
      }
      setScores(initScores);
    }
  }, [submissions, assessments, id]);

  useEffect(() => {
    const total = Object.values(scores).reduce((sum, s) => sum + (Number(s) || 0), 0);
    setTotalScore(total);
  }, [scores]);

  const handleScoreChange = (questionId, value) => {
    setScores((prev) => ({ ...prev, [questionId]: Number(value) || 0 }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First update individual answer scores
      for (const [questionId, score] of Object.entries(scores)) {
        const answer = submission.answers.find(a => a.question_id === parseInt(questionId));
        if (answer) {
          await fetch(`http://127.0.0.1:8000/api/submissions/answers/${answer.id}/grade?points_earned=${score}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      // Then grade the overall submission
      await fetch(`http://127.0.0.1:8000/api/submissions/${submission.id}/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh the data
      dispatch(fetchSubmissions());
    } catch (error) {
      console.error('Save error:', error);
    }
    setIsSaving(false);
  };

  const handleSubmitGrade = async () => {
    setIsSaving(true);
    await handleSave();
    // Don't call submitSubmission - that's for interviewees only
    setIsSaving(false);
    navigate("/recruiter/results");
  };

  if (submissionsLoading || assessmentsLoading) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-sm text-slate-600">Loading submission...</p>
        </div>
      </PageWrapper>
    );
  }

  if (!submission) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-sm text-slate-600">Submission not found.</p>
          <p className="text-xs text-slate-500 mt-2">Debug: ID={id}, Submissions={submissions.length}</p>
        </div>
      </PageWrapper>
    );
  }

  if (!assessment) {
    return (
      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <p className="text-sm text-slate-600">Assessment not found.</p>
          <p className="text-xs text-slate-500 mt-2">Debug: Assessment ID={submission?.assessment_id}, Assessments={assessments.length}</p>
        </div>
      </PageWrapper>
    );
  }

  const questions = assessment.questions || [];

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Submission Details</h2>
            <p className="text-sm text-slate-500">
              {submission.interviewee?.full_name || submission.interviewee?.email} – {assessment.title}
            </p>
          </div>
          <BackToDashboardButton />
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Candidate</p>
              <p className="font-semibold text-slate-900">
                {submission.interviewee?.full_name || submission.interviewee?.email}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Assessment</p>
              <p className="font-semibold text-slate-900">{assessment.title}</p>
            </div>
            <div>
              <p className="text-slate-500">Status</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-semibold rounded capitalize ${
                  submission.status === "graded"
                    ? "bg-green-100 text-green-700"
                    : submission.status === "submitted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {submission.status}
              </span>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Question {idx + 1}
                    <span className="ml-2 text-xs text-slate-500">({q.points || 10} points)</span>
                  </h4>
                  <p className="text-slate-700 whitespace-pre-wrap">{q.description || q.title}</p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max={q.points || 10}
                    value={scores[q.id] || 0}
                    onChange={(e) => handleScoreChange(q.id, e.target.value)}
                    className="w-16 px-2 py-1 border border-slate-200 rounded text-sm text-center"
                  />
                  <span className="text-sm text-slate-600">/ {q.points || 10}</span>
                </div>
              </div>

              {/* Answer display */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Candidate Answer:</p>
                {isMultipleChoiceQuestion(q) ? (
                  <p className="text-sm text-slate-700">
                    Selected: <span className="font-semibold">{answers[q.id] || "Not answered"}</span>
                  </p>
                ) : isCodingQuestion(q) ? (
                  <Editor
                    height="200px"
                    defaultLanguage="javascript"
                    value={answers[q.id] || "// No code submitted"}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 12,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                ) : (
                  <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                    {answers[q.id] || "Not answered"}
                  </div>
                )}
              </div>

              {/* Feedback section */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Feedback:</p>
                <textarea
                  placeholder="Leave feedback for this answer..."
                  className="w-full h-20 p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      const answer = submission.answers?.find(a => a.question_id === q.id);
                      if (answer) {
                        fetch(`http://127.0.0.1:8000/api/submissions/${submission.id}/feedback`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            submission_id: submission.id,
                            answer_id: answer.id,
                            feedback_text: e.target.value
                          })
                        });
                      }
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Score & Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Total Score</p>
              <p className="text-2xl font-bold text-slate-900">
                {totalScore} / {questions.reduce((sum, q) => sum + (q.points || 10), 0)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-lg border border-purple-600 bg-purple-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Progress"}
              </button>
              <button
                onClick={handleSubmitGrade}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-lg border border-green-600 bg-green-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {isSaving ? "Submitting..." : "Submit Grade"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
