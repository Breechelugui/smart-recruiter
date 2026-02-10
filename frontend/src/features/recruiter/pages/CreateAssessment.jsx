import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import Button from "../../../components/common/Button";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createAssessment } from "../../assessments/assessmentSlice";
import { QUESTION_TYPES, getQuestionTypeInfo } from "../../../utils/questionTypes";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import CodeWarsBrowser from "../components/CodeWarsBrowser";

export default function CreateAssessment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.assessments);

  const [showCodeWars, setShowCodeWars] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    time_limit: 60,
    is_trial: false,
    status: "draft",
  });

  const [questions, setQuestions] = useState([
    {
      question_text: "",
      question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
      points: 10,
      options: ["", "", "", ""],
    },
  ]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleQuestionChange = (idx, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleOptionChange = (qIdx, oIdx, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIdx].options];
      opts[oIdx] = value;
      updated[qIdx].options = opts;
      return updated;
    });
  };

  const handleImportKata = (kataData) => {
    const newQuestion = {
      question_text: kataData.description,
      title: kataData.title,
      question_type: kataData.type,
      points: kataData.points,
      time_limit: kataData.time_limit,
      options: kataData.options || [],
      codewars_kata_id: kataData.codewars_kata_id,
      languages: kataData.languages,
      difficulty: kataData.difficulty,
    };
    setQuestions([...questions, newQuestion]);
    setShowCodeWars(false);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        question_type: QUESTION_TYPES.MULTIPLE_CHOICE,
        points: 10,
        options: ["", "", "", ""],
      },
    ]);
  };

  const removeQuestion = (idx) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      questions: questions.map((q) => ({
        title: q.title || q.question_text.slice(0, 100),
        question_text: q.question_text,
        question_type: q.question_type,
        points: q.points,
        time_limit: q.time_limit || 30,
        ...(q.question_type === QUESTION_TYPES.MULTIPLE_CHOICE && { options: q.options }),
        ...(q.question_type === QUESTION_TYPES.MULTIPLE_ANSWER && { options: q.options, correct_answers: q.correct_answers || [] }),
        ...(q.codewars_kata_id && { codewars_kata_id: q.codewars_kata_id }),
        ...(q.languages && { languages: q.languages }),
        ...(q.difficulty && { difficulty: q.difficulty }),
      })),
    };
    
    // Debug logging to ensure time_limit is included
    console.log("Creating assessment with payload:", payload);
    console.log("Time limit being sent:", payload.time_limit);
    
    const res = await dispatch(createAssessment(payload));
    if (createAssessment.fulfilled.match(res)) {
      navigate("/recruiter");
    } else {
      console.error("Create assessment error:", res);
      alert("Backend error: " + (res.payload || res.error?.message || "Unknown error"));
    }
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Assessment</h2>
            <p className="text-sm text-slate-500">Build a new assessment from scratch</p>
          </div>
          <BackToDashboardButton />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Assessment Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Assessment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">Time Limit (minutes)</label>
                <input
                  name="time_limit"
                  type="number"
                  min="1"
                  value={form.time_limit}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="is_trial"
                  type="checkbox"
                  checked={form.is_trial}
                  onChange={handleFormChange}
                  className="rounded"
                />
                Trial Assessment
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                + Add Question
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-slate-900">Question {idx + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(idx)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <textarea
                    value={q.question_text}
                    onChange={(e) => handleQuestionChange(idx, "question_text", e.target.value)}
                    placeholder="Enter your question here..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={q.question_type}
                      onChange={(e) => handleQuestionChange(idx, "question_type", e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    >
                      <option value={QUESTION_TYPES.MULTIPLE_CHOICE}>Multiple Choice</option>
                      <option value={QUESTION_TYPES.MULTIPLE_ANSWER}>Multiple Answer</option>
                      <option value={QUESTION_TYPES.CODING}>Coding</option>
                      <option value={QUESTION_TYPES.SUBJECTIVE}>Text Answer</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={q.points}
                      onChange={(e) => handleQuestionChange(idx, "points", Number(e.target.value))}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      placeholder="Points"
                    />
                  </div>
                  {(q.question_type === QUESTION_TYPES.MULTIPLE_CHOICE || q.question_type === QUESTION_TYPES.MULTIPLE_ANSWER) && (
                    <div className="space-y-2">
                      {["A", "B", "C", "D"].map((label, oIdx) => (
                        <input
                          key={label}
                          value={q.options[oIdx]}
                          onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
                          placeholder={`Option ${label}`}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                          required
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setShowCodeWars(!showCodeWars)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold"
            >
              {showCodeWars ? "Hide CodeWars" : "Browse CodeWars Katas"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {loading ? "Creating..." : "Create Assessment"}
            </button>
          </div>
        </form>

        {showCodeWars && (
          <div className="mt-6">
            <CodeWarsBrowser onImportKata={handleImportKata} />
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
