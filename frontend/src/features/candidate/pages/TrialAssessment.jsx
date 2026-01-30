import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { startSubmission } from "../../submissions/submissionsSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import { Editor } from "@monaco-editor/react";

export default function TrialAssessment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((s) => s.submissions);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    bdd: "",
    pseudocode: "",
    code: ""
  });

  const trialSteps = [
    {
      title: "Behavior Driven Development (BDD)",
      description: "Write test scenarios in Given-When-Then format",
      placeholder: `Given: A user is logged in
When: The user clicks the logout button
Then: The user should be redirected to the login page
And: The session should be terminated`
    },
    {
      title: "Pseudocode",
      description: "Write high-level algorithm in plain English",
      placeholder: `FUNCTION logoutUser(user)
  IF user is authenticated
    CLEAR user session
    REDIRECT to login page
    RETURN success
  ELSE
    RETURN error
  END IF`
    },
    {
      title: "Implementation Code",
      description: "Write the actual implementation in your preferred language",
      placeholder: "Write your implementation code here..."
    }
  ];

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const handleAnswerChange = (field, value) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitTrial = () => {
    // This is just for practice - no actual submission
    alert("Trial assessment completed! This was for practice purposes only.");
    navigate("/interviewee");
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <BackToDashboardButton />
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Trial Assessment
          </h1>
          <p className="text-gray-300">
            Practice with our platform before taking the actual assessment
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Progress</h3>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {trialSteps.length}
            </span>
          </div>
          <div className="flex space-x-2">
            {trialSteps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="flex flex-wrap gap-3">
            {trialSteps.map((step, index) => (
              <button
                key={index}
                onClick={() => handleStepChange(index)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentStep === index
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {index + 1}. {step.title}
              </button>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-2">
              {trialSteps[currentStep].title}
            </h2>
            <p className="text-gray-300">
              {trialSteps[currentStep].description}
            </p>
          </div>

          <div className="p-6">
            {currentStep === 0 && (
              <div>
                <label className="block text-sm font-semibold text-purple-400 mb-3">
                  BDD Scenarios
                </label>
                <textarea
                  value={answers.bdd}
                  onChange={(e) => handleAnswerChange("bdd", e.target.value)}
                  placeholder={trialSteps[currentStep].placeholder}
                  className="w-full h-64 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <label className="block text-sm font-semibold text-purple-400 mb-3">
                  Pseudocode
                </label>
                <textarea
                  value={answers.pseudocode}
                  onChange={(e) => handleAnswerChange("pseudocode", e.target.value)}
                  placeholder={trialSteps[currentStep].placeholder}
                  className="w-full h-64 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <label className="block text-sm font-semibold text-purple-400 mb-3">
                  Implementation Code
                </label>
                <div className="border border-gray-600 rounded-xl overflow-hidden">
                  <Editor
                    height="400px"
                    defaultLanguage="javascript"
                    value={answers.code}
                    onChange={(value) => handleAnswerChange("code", value || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
              >
                Previous
              </button>

              {currentStep < trialSteps.length - 1 ? (
                <button
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmitTrial}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Complete Trial
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Trial Assessment Tips</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>This is a practice assessment - your responses won't be graded</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Take your time to understand each step of the process</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Use this opportunity to familiarize yourself with the interface</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-1">•</span>
              <span>Try the code editor features like syntax highlighting and auto-completion</span>
            </li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
