import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageWrapper from "../../../components/layout/PageWrapper";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchSubmissions, fetchSubmissionById, submitSubmission } from "../../submissions/submissionsSlice";
import { saveAnswer } from "../../submissions/submissionsSlice";
import BackToDashboardButton from "../../../components/common/BackToDashboardButton";
import CountdownTimer from "../../../components/common/CountdownTimer";
import { Editor } from "@monaco-editor/react";

export default function ActiveTest() {
  const { id: submissionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { submission, loading, error } = useAppSelector((state) => state.submissions);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [timeLimit, setTimeLimit] = useState(30); // Default 30 minutes
  const [currentStep, setCurrentStep] = useState(0); // Whiteboard step (0: BDD, 1: Pseudocode, 2: Code)
  const [consoleOutput, setConsoleOutput] = useState([]);
  const intervalRef = useRef(null);

  const assessment = submission?.assessment;
  const questions = assessment?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  // Whiteboard steps
  const whiteboardSteps = [
    { id: 'bdd', title: 'BDD (Behavior Driven Development)', description: 'Write test scenarios in Given-When-Then format' },
    { id: 'pseudocode', title: 'Pseudocode', description: 'Write high-level algorithm in plain English' },
    { id: 'code', title: 'Implementation', description: 'Write the actual code solution' }
  ];

  useEffect(() => {
    if (submissionId) {
      dispatch(fetchSubmissionById(submissionId));
    }
  }, [dispatch, submissionId]);

  // Check if assessment is already submitted and redirect
  useEffect(() => {
    if (submission && (submission.status === 'submitted' || submission.status === 'graded')) {
      alert("This assessment has already been submitted.");
      navigate("/interviewee");
      return;
    }
  }, [submission, navigate]);

  console.log("ActiveTest submissionId:", submissionId);
  console.log("Submissions:", submission);
  console.log("Found submission:", submission);
  console.log("Full submission structure:", JSON.stringify(submission, null, 2));
  console.log("Assessment:", assessment);
  console.log("Full assessment structure:", JSON.stringify(assessment, null, 2));
  console.log("Assessment time_limit:", assessment?.time_limit);

  useEffect(() => {
    // Check multiple possible locations for time_limit
    const foundTimeLimit = assessment?.time_limit || 
                          assessment?.assessment_detail?.time_limit || 
                          assessment?.assessment_data?.time_limit ||
                          submission?.assessment?.time_limit;
    
    if (foundTimeLimit) {
      setTimeLimit(foundTimeLimit);
      console.log("Setting time limit to:", foundTimeLimit, "minutes");
    } else {
      console.log("No time_limit found in any location, using default 30 minutes");
    }
  }, [assessment, submission]);

  // Get answer key for current question and step
  const getAnswerKey = () => {
    const questionId = currentQuestion?.id;
    const stepId = whiteboardSteps[currentStep].id;
    return `${questionId}_${stepId}`;
  };

  const handleAnswerChange = (value) => {
    const answerKey = getAnswerKey();
    setAnswers((prev) => ({ ...prev, [answerKey]: value }));
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentStep(2); // Go to code step of previous question
    }
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentStep(0); // Go to BDD step of next question
    }
  };

  const handleSubmit = async () => {
    // Check if submission already exists and is submitted FIRST
    if (submission && (submission.status === 'submitted' || submission.status === 'graded')) {
      alert("This assessment has already been submitted.");
      navigate("/interviewee");
      return;
    }

    // Only save answers if submission is still in progress
    if (submission.status === 'in_progress') {
      // Save each answer individually using the proper API
      for (const [answerKey, answerValue] of Object.entries(answers)) {
        if (answerValue && answerValue.trim()) {
          const [questionId, stepId] = answerKey.split('_');
          const question = questions.find(q => q.id === parseInt(questionId));
          
          // Combine all steps into a structured answer
          const bddAnswer = answers[`${questionId}_bdd`] || '';
          const pseudocodeAnswer = answers[`${questionId}_pseudocode`] || '';
          const codeAnswer = answers[`${questionId}_code`] || '';
          
          const structuredAnswer = {
            bdd: bddAnswer,
            pseudocode: pseudocodeAnswer,
            code: codeAnswer
          };

          const answerData = {
            submission_id: parseInt(submissionId),
            question_id: parseInt(questionId),
            answer_text: JSON.stringify(structuredAnswer), // Store structured answer
            code_solution: codeAnswer // Keep code solution for backward compatibility
          };

          try {
            await dispatch(saveAnswer(answerData)).unwrap();
          } catch (error) {
            console.error("Failed to save answer:", error);
          }
        }
      }
    }

    // Submit the assessment
    try {
      await dispatch(submitSubmission(parseInt(submissionId))).unwrap();
      navigate("/interviewee");
    } catch (error) {
      console.error("Failed to submit:", error);
      const errorMessage = error.message || "Unknown error";
      if (errorMessage.includes("already submitted")) {
        alert("This assessment has already been submitted.");
        navigate("/interviewee");
      } else {
        alert("Failed to submit assessment: " + errorMessage);
      }
    }
  };

  const getCurrentAnswer = () => {
    const answerKey = getAnswerKey();
    return answers[answerKey] || '';
  };

  const getPlaceholder = () => {
    switch (currentStep) {
      case 0: // BDD
        return `Given: A user is logged in
When: The user clicks the logout button
Then: The user should be redirected to the login page
And: The session should be terminated

Given: A user enters invalid credentials
When: The user clicks the login button
Then: An error message should be displayed
And: The user should remain on the login page`;
      
      case 1: // Pseudocode
        return `FUNCTION logoutUser(user)
  IF user is authenticated
    CLEAR user session
    REDIRECT to login page
    RETURN success
  ELSE
    RETURN error
  END IF

FUNCTION validateLogin(credentials)
  IF credentials.email and credentials.password are valid
    FIND user in database
    IF user exists and password matches
      CREATE user session
      RETURN user object
    ELSE
      RETURN error "Invalid credentials"
    END IF
  ELSE
    RETURN error "Missing credentials"
  END IF`;
      
      case 2: // Code
        return `// Write your implementation here
function logoutUser(user) {
  // Your code here
}

function validateLogin(credentials) {
  // Your code here
}`;
      
      default:
        return "Enter your answer here...";
    }
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

  if (error) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-400">Error loading assessment: {error}</div>
        </div>
      </PageWrapper>
    );
  }

  if (!submission || !assessment) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-400">Assessment not found</div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <BackToDashboardButton />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{assessment.title}</h1>
              <p className="text-gray-300">Question {currentQuestionIndex + 1} of {questions.length}</p>
            </div>
            <CountdownTimer
              timeLimit={timeLimit}
              submissionId={submissionId}
              onTimeExpire={handleSubmit}
              className="bg-gray-800/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Question Progress */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Question Progress</h3>
            <div className="space-y-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    index === currentQuestionIndex ? 'bg-purple-600/20 border border-purple-500' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < currentQuestionIndex 
                      ? 'bg-green-600 text-white' 
                      : index === currentQuestionIndex 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index < currentQuestionIndex ? '✓' : index + 1}
                  </div>
                  <span className="text-white">Question {index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Whiteboard Steps Progress */}
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Whiteboard Process</h3>
            <div className="space-y-2">
              {whiteboardSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    index === currentStep ? 'bg-purple-600/20 border border-purple-500' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index < currentStep 
                      ? 'bg-green-600 text-white' 
                      : index === currentStep 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{step.title}</div>
                    <div className="text-gray-400 text-sm">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 mb-6">
          <div className="mb-4">
            <span className="text-sm font-semibold text-purple-400">Question {currentQuestionIndex + 1}</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-4">
            {currentQuestion?.question_text || currentQuestion?.title || `Question ${currentQuestionIndex + 1}`}
          </h2>
          {currentQuestion?.points && (
            <p className="text-gray-400 mb-4">Points: {currentQuestion.points}</p>
          )}
          {currentQuestion?.description && (
            <p className="text-gray-300 mb-4">{currentQuestion.description}</p>
          )}
        </div>

        {/* Whiteboard Editor */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {whiteboardSteps[currentStep].title}
              </h3>
              <span className="text-sm text-gray-400">
                {whiteboardSteps[currentStep].description}
              </span>
            </div>
          </div>

          <div className="p-6">
            {currentStep === 0 || currentStep === 1 ? (
              // BDD and Pseudocode - Textarea
              <textarea
                value={getCurrentAnswer()}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={getPlaceholder()}
                className="w-full h-96 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
            ) : (
              // Code - Monaco Editor
              <div className="border border-gray-600 rounded-xl overflow-hidden">
                {/* Language Selector */}
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Language:</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-gray-600 text-white text-sm px-3 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="typescript">TypeScript</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                <Editor
                  height="400px"
                  language={selectedLanguage}
                  value={getCurrentAnswer()}
                  onChange={(value) => handleAnswerChange(value || "")}
                  theme="vs-dark"
                  placeholder={getPlaceholder()}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    automaticLayout: true,
                  }}
                />
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0 && currentStep === 0}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {currentStep < 2 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-200"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Submit Assessment' : 'Next Question'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">💡 Whiteboard Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
            <div>
              <strong className="text-purple-400">BDD:</strong> Write clear test scenarios using Given-When-Then format
            </div>
            <div>
              <strong className="text-purple-400">Pseudocode:</strong> Focus on logic and algorithm structure
            </div>
            <div>
              <strong className="text-purple-400">Code:</strong> Implement clean, readable solution
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
