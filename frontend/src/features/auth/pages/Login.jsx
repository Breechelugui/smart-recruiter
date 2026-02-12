import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { clearAuthError, login, register } from "../authSlice";

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("login");
  const [userType, setUserType] = useState("interviewee");

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    email: "",
    username: "",
    full_name: "",
    password: "",
  });

  const onLoginFieldChange = (e) => {
    const { name, value } = e.target;
    if (error) dispatch(clearAuthError());
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSignupFieldChange = (e) => {
    const { name, value } = e.target;
    if (error) dispatch(clearAuthError());
    setSignupForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    const result = await dispatch(login(loginForm));
    if (login.fulfilled.match(result)) {
      const role = result.payload?.user?.role;
      if (role === "RECRUITER") {
        navigate("/recruiter");
        return;
      }
      if (role === "INTERVIEWEE") {
        navigate("/interviewee");
        return;
      }
    }
  };

  const handleSignup = async () => {
    const result = await dispatch(
      register({
        ...signupForm,
        role: userType.toUpperCase(),
      })
    );

    if (register.fulfilled.match(result)) {
      setActiveTab("login");
      setLoginForm((prev) => ({
        ...prev,
        username: signupForm.username,
        password: "",
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-6 py-10 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-pulse"></div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left side - Hero content */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                Smart Recruiter
              </h1>
              <p className="text-sm font-semibold text-purple-300 uppercase tracking-wider mt-1">Technical Assessment Platform</p>
            </div>
          </div>

          <p className="text-gray-300 text-xl leading-relaxed max-w-xl">
            Revolutionize your hiring process with AI-powered technical assessments. 
            Evaluate candidates efficiently, gain deep insights, and make data-driven decisions.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-purple-500/30 shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-100 text-lg mb-2">For Recruiters</h3>
              <p className="text-gray-400 leading-relaxed">
                Create comprehensive assessments, automate evaluation, and analyze performance with advanced analytics.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30">Smart Analytics</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full border border-purple-500/30">AI Evaluation</span>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-indigo-500/30 shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-lg mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-100 text-lg mb-2">For Candidates</h3>
              <p className="text-gray-400 leading-relaxed">
                Showcase your skills, receive detailed feedback, and advance your career with comprehensive assessments.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">Real Feedback</span>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-500/30">Skill Showcase</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">10K+</div>
              <div className="text-sm text-gray-400">Assessments Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-400">95%</div>
              <div className="text-sm text-gray-400">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">50K+</div>
              <div className="text-sm text-gray-400">Candidates Evaluated</div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
              <h2 className="text-2xl font-bold text-gray-100">Welcome Back</h2>
              <p className="text-sm text-gray-400 mt-1">Sign in to access your dashboard</p>
            </div>

            <div className="p-8">
              <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-1 flex mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                    activeTab === "login" 
                      ? "bg-gray-700 shadow-lg text-purple-300 transform scale-105" 
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                    activeTab === "signup" 
                      ? "bg-gray-700 shadow-lg text-purple-300 transform scale-105" 
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              <div className="mb-6">
                <p className="text-xs font-bold text-purple-400 mb-3 tracking-wider">I AM A</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType("interviewee")}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 transform hover:scale-105 ${
                      userType === "interviewee"
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 shadow-lg"
                        : "bg-gray-700 text-gray-300 border-gray-600 hover:border-purple-500 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Candidate
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("recruiter")}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 transform hover:scale-105 ${
                      userType === "recruiter"
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-600 shadow-lg"
                        : "bg-gray-700 text-gray-300 border-gray-600 hover:border-indigo-500 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Recruiter
                    </div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {activeTab === "login" ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-2 tracking-wider">USERNAME</p>
                    <input
                      name="username"
                      type="text"
                      value={loginForm.username}
                      onChange={onLoginFieldChange}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your username"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-2 tracking-wider">PASSWORD</p>
                    <input
                      name="password"
                      type="password"
                      value={loginForm.password}
                      onChange={onLoginFieldChange}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </div>
                    ) : (
                      "Sign In to Portal"
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-2 tracking-wider">EMAIL ADDRESS</p>
                    <input
                      name="email"
                      type="email"
                      value={signupForm.email}
                      onChange={onSignupFieldChange}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="your.email@company.com"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-2 tracking-wider">USERNAME</p>
                    <input
                      name="username"
                      type="text"
                      value={signupForm.username}
                      onChange={onSignupFieldChange}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Choose a username"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-2 tracking-wider">FULL NAME</p>
                    <input
                      name="full_name"
                      type="text"
                      value={signupForm.full_name}
                      onChange={onSignupFieldChange}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-purple-600 mb-2 tracking-wider">PASSWORD</p>
                    <input
                      name="password"
                      type="password"
                      value={signupForm.password}
                      onChange={onSignupFieldChange}
                      className="w-full rounded-xl border border-purple-200 bg-purple-50/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
