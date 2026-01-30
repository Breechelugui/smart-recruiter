import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAssessments } from "../../assessments/assessmentSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import { Editor } from "@monaco-editor/react";

export default function ActiveTestDemo() {
  const { id: assessmentId } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: assessments, loading } = useAppSelector((s) => s.assessments);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const assessment = assessments.find((a) => a.id === Number(assessmentId));
  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    dispatch(fetchAssessments());
  }, [dispatch]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    alert("Demo: Test submitted. This is a preview only.");
    navigate("/interviewee");
  };

  const handlePrev = () => setCurrentQuestionIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1));

  const completedCount = useMemo(() => {
    return questions.filter((q) => answers[q.id] && answers[q.id] !== "").length;
  }, [questions, answers]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto">
          <BackToDashboardButton />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-4 text-sm text-slate-600">
            Loading test…
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!assessment) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto">
          <BackToDashboardButton />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-4 text-sm text-slate-600">
            Assessment not found.
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <BackToDashboardButton />

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mt-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{assessment.title}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Points</p>
              <p className="text-sm font-semibold text-slate-900">{currentQuestion?.points || 0}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">{currentQuestion?.title || "Untitled Question"}</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{currentQuestion?.description || ""}</p>
          </div>

          <div className="mb-6">
            {currentQuestion?.type === "multiple_choice" ? (
              <div className="space-y-3">
                {(currentQuestion.options || []).map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={opt}
                      checked={answers[currentQuestion.id] === opt}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-700">{opt}</span>
                  </label>
                ))}
              </div>
            ) : currentQuestion?.type === "coding" ? (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 mb-2">Your Code</label>
                <Editor
                  height="300px"
                  defaultLanguage="javascript"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(value) => handleAnswerChange(currentQuestion.id, value || "")}
                  theme="vs-light"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            ) : (
              <textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full h-32 p-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={handlePrev}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 text-sm font-semibold text-slate-700"
            >
              Previous Question
            </button>

            <div className="text-center text-xs text-slate-600">
              <p className="font-semibold">Progress Status</p>
              <p>{completedCount} of {questions.length} Questions Completed</p>
            </div>

            <div className="flex gap-3">
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
